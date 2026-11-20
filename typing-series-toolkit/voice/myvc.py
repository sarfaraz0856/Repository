"""Voice conversion (kNN-VC method), written from scratch for this project.

WavLM-Large (via the `transformers` library) turns speech into features; every feature frame of the
source is replaced by the mean of its 4 nearest frames from the target speaker's recording; a
HiFi-GAN vocoder (implemented below) turns the matched features back into audio.
Checkpoints are loaded as plain tensors (torch.load(weights_only=True)); no third-party repo code runs.

Usage: python3 myvc.py <reference.wav> <out_dir> <src.wav> [src.wav ...]
       python3 myvc.py --selftest <some.wav>      (resynthesis check, no conversion)
"""
import json, os, sys, time
from math import gcd
from pathlib import Path

import numpy as np, soundfile as sf, torch
import torch.nn as nn
import torch.nn.functional as F
from scipy.signal import resample_poly
from transformers import WavLMConfig, WavLMModel

HERE = Path(__file__).parent
MODELS = HERE / 'models'
LAYER = 6          # WavLM layer that kNN-VC matches on
TOPK = 4
torch.set_num_threads(os.cpu_count() or 4)


# ---------------- WavLM (original checkpoint -> transformers model) ----------------
def load_wavlm():
    ck = torch.load(MODELS / 'WavLM-Large.pt', map_location='cpu', weights_only=True)
    c = ck['cfg']
    cfg = WavLMConfig(
        hidden_size=c['encoder_embed_dim'], num_hidden_layers=c['encoder_layers'],
        num_attention_heads=c['encoder_attention_heads'], intermediate_size=c['encoder_ffn_embed_dim'],
        hidden_act='gelu', feat_extract_norm='layer', conv_bias=c['conv_bias'],
        conv_dim=[512] * 7, conv_kernel=[10, 3, 3, 3, 3, 2, 2], conv_stride=[5, 2, 2, 2, 2, 2, 2],
        num_conv_pos_embeddings=c['conv_pos'], num_conv_pos_embedding_groups=c['conv_pos_groups'],
        do_stable_layer_norm=True, num_buckets=c['num_buckets'], max_bucket_distance=c['max_distance'],
        apply_spec_augment=False, hidden_dropout=0.0, attention_dropout=0.0, activation_dropout=0.0,
        feat_proj_dropout=0.0, layerdrop=0.0,
    )
    model = WavLMModel(cfg).eval()
    target = model.state_dict()
    pos = [k for k in target if k.startswith('encoder.pos_conv_embed.conv.')]
    g_key = next(k for k in pos if k.endswith('original0') or k.endswith('weight_g'))
    v_key = next(k for k in pos if k.endswith('original1') or k.endswith('weight_v'))
    sd = {}
    for k, v in ck['model'].items():
        if k == 'mask_emb': n = 'masked_spec_embed'
        elif k.startswith('feature_extractor.conv_layers.'):
            i = k.split('.')[2]
            n = f'feature_extractor.conv_layers.{i}.conv.weight' if '.0.weight' in k[len(f'feature_extractor.conv_layers.{i}'):] \
                else f'feature_extractor.conv_layers.{i}.layer_norm.' + k.split('.')[-1]
        elif k.startswith('post_extract_proj.'): n = 'feature_projection.projection.' + k.split('.')[-1]
        elif k.startswith('layer_norm.'): n = 'feature_projection.layer_norm.' + k.split('.')[-1]
        elif k == 'encoder.pos_conv.0.weight_g': n = g_key
        elif k == 'encoder.pos_conv.0.weight_v': n = v_key
        elif k == 'encoder.pos_conv.0.bias': n = 'encoder.pos_conv_embed.conv.bias'
        elif k.startswith('encoder.layer_norm.'): n = k
        elif k.startswith('encoder.layers.'):
            p = k.split('.'); i, rest = p[2], '.'.join(p[3:])
            for a, b in [('self_attn.grep_linear', 'attention.gru_rel_pos_linear'), ('self_attn.grep_a', 'attention.gru_rel_pos_const'),
                         ('self_attn.relative_attention_bias', 'attention.rel_attn_embed'), ('self_attn.', 'attention.'),
                         ('self_attn_layer_norm', 'layer_norm'), ('fc1', 'feed_forward.intermediate_dense'),
                         ('fc2', 'feed_forward.output_dense'), ('final_layer_norm', 'final_layer_norm')]:
                if rest.startswith(a):
                    rest = b + rest[len(a):]; break
            n = f'encoder.layers.{i}.{rest}'
        else:
            raise KeyError(k)
        if target[n].shape != v.shape:
            v = v.reshape(target[n].shape)
        sd[n] = v
    missing = [k for k in target if k not in sd]
    unexpected = [k for k in sd if k not in target]
    assert not missing and not unexpected, (missing[:5], unexpected[:5])
    model.load_state_dict(sd, strict=True)
    return model


@torch.inference_mode()
def features(wavlm, wav16):
    out = wavlm(wav16[None], output_hidden_states=True)
    return out.hidden_states[LAYER][0]          # (frames, 1024), output of layer 6, before the final norm


# ---------------- HiFi-GAN generator (kNN-VC variant: linear 1024->512 in front) ----------------
def wn(w_g, w_v):
    dims = tuple(range(1, w_v.dim()))
    return w_g * w_v / w_v.norm(dim=dims, keepdim=True)

class ResBlock(nn.Module):
    def __init__(self, ch, k, dil):
        super().__init__()
        self.c1 = nn.ModuleList([nn.Conv1d(ch, ch, k, dilation=d, padding=(k * d - d) // 2) for d in dil])
        self.c2 = nn.ModuleList([nn.Conv1d(ch, ch, k, dilation=1, padding=(k - 1) // 2) for _ in dil])
    def forward(self, x):
        for a, b in zip(self.c1, self.c2):
            x = x + b(F.leaky_relu(a(F.leaky_relu(x, 0.1)), 0.1))
        return x

class Generator(nn.Module):
    def __init__(self, h):
        super().__init__()
        self.lin_pre = nn.Linear(h['hubert_dim'], h['hifi_dim'])
        self.conv_pre = nn.Conv1d(h['hifi_dim'], h['upsample_initial_channel'], 7, padding=3)
        self.ups, self.res = nn.ModuleList(), nn.ModuleList()
        ch = h['upsample_initial_channel']
        for i, (u, k) in enumerate(zip(h['upsample_rates'], h['upsample_kernel_sizes'])):
            self.ups.append(nn.ConvTranspose1d(ch // 2 ** i, ch // 2 ** (i + 1), k, u, padding=(k - u) // 2))
            for rk, rd in zip(h['resblock_kernel_sizes'], h['resblock_dilation_sizes']):
                self.res.append(ResBlock(ch // 2 ** (i + 1), rk, rd))
        self.conv_post = nn.Conv1d(ch // 2 ** len(self.ups), 1, 7, padding=3)
        self.nk = len(h['resblock_kernel_sizes'])
    def forward(self, f):                          # f: (1, frames, 1024)
        x = self.conv_pre(self.lin_pre(f).permute(0, 2, 1))
        for i, up in enumerate(self.ups):
            x = up(F.leaky_relu(x, 0.1))
            x = sum(self.res[i * self.nk + j](x) for j in range(self.nk)) / self.nk
        return torch.tanh(self.conv_post(F.leaky_relu(x)))

def load_vocoder():
    h = json.loads((MODELS / 'hifigan_config.json').read_text())
    gen = Generator(h).eval()
    src = torch.load(MODELS / 'prematch_g_02500000.pt', map_location='cpu', weights_only=True)['generator']
    sd, done = {}, set()
    for k in src:
        base = k.rsplit('.', 1)[0]
        if k.endswith('weight_g') or k.endswith('weight_v'):
            if base in done: continue
            sd[base + '.weight'] = wn(src[base + '.weight_g'], src[base + '.weight_v']); done.add(base)
        else:
            sd[k] = src[k]
    # map original names (resblocks.N.convs1.M) to this module's names (res.N.c1.M)
    sd = {k.replace('resblocks.', 'res.').replace('.convs1.', '.c1.').replace('.convs2.', '.c2.'): v for k, v in sd.items()}
    gen.load_state_dict(sd, strict=True)
    return gen


# ---------------- helpers ----------------
def load16(path):
    x, sr = sf.read(path)
    if x.ndim > 1: x = x.mean(1)
    if sr != 16000:
        g = gcd(sr, 16000); x = resample_poly(x, 16000 // g, sr // g)
    return torch.tensor(x, dtype=torch.float32)

def chunked_features(wavlm, wav, sec=8):
    n = 16000 * sec
    parts = [wav[i:i + n] for i in range(0, len(wav), n)]
    return torch.cat([features(wavlm, p) for p in parts if len(p) > 1600], 0)

def ref_features(wavlm, wav, keep=0.7):
    """Reference features without the quiet / noise-only frames (keeps the loudest `keep` share)."""
    f = chunked_features(wavlm, wav)
    n = f.shape[0]; rms = np.array([float(wav[i*320:(i+1)*320].pow(2).mean().sqrt()) for i in range(n)])
    return f[torch.tensor(rms >= np.quantile(rms, 1 - keep))]

@torch.inference_mode()
def convert(q, mset, voc):
    qn, mn = F.normalize(q, dim=-1), F.normalize(mset, dim=-1)
    idx = (qn @ mn.T).topk(TOPK, dim=-1).indices      # cosine similarity, top-k nearest
    return voc(mset[idx].mean(1)[None]).squeeze().numpy()


if __name__ == '__main__':
    t0 = time.time(); wavlm = load_wavlm(); voc = load_vocoder(); print('models loaded %.0fs' % (time.time() - t0), flush=True)
    if sys.argv[1] == '--selftest':
        w = load16(sys.argv[2]); f = chunked_features(wavlm, w)
        with torch.inference_mode(): y = voc(f[None]).squeeze().numpy()
        sf.write(HERE / 'selftest_resynth.wav', y, 16000); print('resynth written', len(y) / 16000, 's'); sys.exit()
    ref, out_dir, srcs = sys.argv[1], Path(sys.argv[2]), sys.argv[3:]
    out_dir.mkdir(parents=True, exist_ok=True)
    t0 = time.time(); mset = ref_features(wavlm, load16(ref)); print('reference frames', mset.shape[0], '%.0fs' % (time.time() - t0), flush=True)
    for s in srcs:
        t0 = time.time(); y = convert(chunked_features(wavlm, load16(s)), mset, voc)
        sf.write(out_dir / (Path(s).stem + '.wav'), y, 16000)
        print('converted', Path(s).name, '%.1fs in %.1fs' % (len(y) / 16000, time.time() - t0), flush=True)
