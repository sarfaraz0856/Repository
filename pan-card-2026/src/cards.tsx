import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { FONT, Icon } from "./ui";
import TL from "./full_timeline.json";

/* Explainer cards for the full video (intro, steps after the token, outro). Clean, original style. */

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const O = "#F27A12";
const INK = "#16202E";
const FPS = 30;

type Seg = { dur: number; lines: { start: number; end: number }[] };
const seg = (k: string) => (TL as unknown as { segments: Record<string, Seg> }).segments[k];
export const segFrames = (k: string) => Math.round(seg(k).dur * FPS);
const beat = (k: string, i: number, off = 0) => Math.round((seg(k).lines[i].start + off) * FPS);

const In: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 14], [0, 1], { ...clamp, easing: ease });
  return <div style={{ opacity: p, translate: `0px ${(1 - p) * 22}px`, ...style }}>{children}</div>;
};
const useOn = (a: number, z: number) => {
  const f = useCurrentFrame();
  return interpolate(f, [a, a + 8, z - 8, z], [0, 1, 1, 0], clamp);
};

const Frame: React.FC<{ kicker: string; title: string; children: React.ReactNode; dur: number }> = ({ kicker, title, children, dur }) => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, 10, dur - 10, dur], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#FFF8F0", fontFamily: FONT, color: INK }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 22, background: O }} />
      <AbsoluteFill style={{ opacity: fade, padding: "70px 110px 70px 120px" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: O, letterSpacing: 2 }}>{kicker}</div>
        <div style={{ fontSize: 66, fontWeight: 900, marginTop: 8, letterSpacing: -1 }}>{title}</div>
        <div style={{ marginTop: 44, flex: 1, position: "relative" }}>{children}</div>
        <div style={{ position: "absolute", right: 60, bottom: 40, fontSize: 24, fontWeight: 800, color: "#9A6A3A" }}>Learn Vexa</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Tile: React.FC<{ on?: number; icon: React.ReactNode; title: string; text?: string; tag?: string; style?: React.CSSProperties }> = ({ on = 0, icon, title, text, tag, style }) => (
  <div style={{ background: "#fff", borderRadius: 24, padding: "40px 40px", border: `3px solid ${on > 0 ? `rgba(242,122,18,${0.3 + on * 0.7})` : "#F0E2D2"}`, boxShadow: on > 0 ? `0 14px 40px rgba(242,122,18,${0.25 * on})` : "0 6px 18px rgba(0,0,0,0.06)", scale: `${1 + on * 0.03}`, ...style }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {icon}
      {tag ? <span style={{ background: O, color: "#fff", fontWeight: 800, fontSize: 20, padding: "5px 14px", borderRadius: 999 }}>{tag}</span> : null}
    </div>
    <div style={{ fontSize: 46, fontWeight: 900, marginTop: 20 }}>{title}</div>
    {text ? <div style={{ fontSize: 32, color: "#5B6676", marginTop: 10, lineHeight: 1.35 }}>{text}</div> : null}
  </div>
);

/* ---------------- Intro ---------------- */
export const CardA: React.FC = () => {
  const f = useCurrentFrame();
  const dur = segFrames("A");
  const a = (at: number) => interpolate(f, [at, at + 16], [0, 1], { ...clamp, easing: ease });
  const fade = interpolate(f, [dur - 10, dur], [1, 0], clamp);
  const chips = ["Form No. 93", "Documents", "Fees", "Status Track"];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg,#FF9A1F 0%,#F26B0F 100%)", fontFamily: FONT, color: "#fff", justifyContent: "center", paddingLeft: 140, opacity: fade }}>
      <div style={{ opacity: a(4), fontSize: 32, fontWeight: 800, letterSpacing: 3, background: "rgba(0,0,0,0.18)", alignSelf: "flex-start", padding: "8px 20px", borderRadius: 10 }}>PROTEAN (NSDL) OFFICIAL WEBSITE</div>
      <div style={{ opacity: a(10), translate: `0px ${(1 - a(10)) * 24}px`, fontSize: 124, fontWeight: 900, lineHeight: 1.02, marginTop: 28, letterSpacing: -2 }}>
        PAN Card Online
        <br />
        Apply 2026
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 40 }}>
        {chips.map((c, i) => (
          <div key={c} style={{ opacity: a(beat("A", 1, 0.2) + i * 8), translate: `0px ${(1 - a(beat("A", 1, 0.2) + i * 8)) * 18}px`, background: "#fff", color: INK, fontWeight: 800, fontSize: 34, padding: "12px 26px", borderRadius: 14 }}>{c}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 140, bottom: 80, opacity: a(30), fontSize: 32, fontWeight: 800 }}>Learn Vexa • @learn_vexa</div>
    </AbsoluteFill>
  );
};

/* ---------------- After token: options, card type, details, AO code ---------------- */
export const CardF: React.FC = () => {
  const dur = segFrames("F");
  const b = (i: number, o = 0) => beat("F", i, o);
  const end = dur;
  const modes = [
    { t: "e-KYC & e-Sign", s: "Paperless – koi kaagaz nahi bhejna", tag: "SABSE AASAAN" },
    { t: "e-Sign (scanned)", s: "Scanned documents + e-Sign" },
    { t: "DSC (scanned)", s: "Digital Signature Certificate se" },
    { t: "Physical mode", s: "Signed form + documents Protean ko bhejein" },
  ];
  const on2 = useOn(b(2), b(3));
  const on3a = useOn(b(3), b(4));
  const on3b = useOn(b(3, 0.8), b(4));
  const showModes = useOn(b(1), b(3));
  const showType = useOn(b(3), b(4));
  const showDet = useOn(b(4), b(5));
  const showAO = useOn(b(5), end);
  return (
    <Frame kicker="TOKEN KE BAAD" title="Aage ka form – aasaan bhasha mein" dur={dur}>
      <In at={b(0, 0.3)} style={{ opacity: 1 }}>
        <div style={{ fontSize: 30, color: "#5B6676", fontWeight: 600 }}>Token number milne ke baad, form ke ye hisse bharne hote hain:</div>
      </In>
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, opacity: showModes }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 34 }}>
          {modes.map((m, i) => (
            <In key={m.t} at={b(1, 0.3) + i * 8}>
              <Tile on={i === 0 ? on2 : 0} icon={[<Icon.phone key="a" size={56} color={O} />, <Icon.sign key="b" size={56} color={O} />, <Icon.lock key="c" size={56} color={O} />, <Icon.mailbox key="d" size={56} color={O} />][i]} title={m.t} text={m.s} tag={m.tag} />
            </In>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, opacity: showType, display: "flex", gap: 30 }}>
        <Tile on={on3a} icon={<Icon.card size={64} color={O} />} title="Physical PAN Card" text="Card ghar ke pate par aata hai, e-PAN bhi email par milta hai" style={{ flex: 1 }} />
        <Tile on={on3b} icon={<Icon.mail size={64} color={O} />} title="Sirf e-PAN" text="PDF PAN card sirf email par – email ID zaroori" style={{ flex: 1 }} />
      </div>
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, opacity: showDet, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {["Personal details", "Name as per Aadhaar", "Address (pata)", "Contact details"].map((x, i) => (
          <In key={x} at={b(4, 0.2) + i * 9}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#fff", borderRadius: 18, padding: "44px 36px", fontSize: 46, fontWeight: 800, border: "3px solid #F0E2D2" }}>
              <Icon.check size={46} color="#0B7A3E" /> {x}
            </div>
          </In>
        ))}
      </div>
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, opacity: showAO }}>
        <div style={{ fontSize: 54, fontWeight: 900 }}>AO Code = 4 hisse</div>
        <div style={{ display: "flex", gap: 22, marginTop: 26 }}>
          {["Area Code", "AO Type", "Range Code", "AO Number"].map((x, i) => (
            <In key={x} at={b(5, 0.2) + i * 8} style={{ flex: 1 }}>
              <div style={{ background: "#fff", border: `3px solid ${O}`, borderRadius: 18, padding: "56px 10px", textAlign: "center", fontSize: 42, fontWeight: 900 }}>{x}</div>
            </In>
          ))}
        </div>
        <div style={{ fontSize: 30, color: "#5B6676", marginTop: 26, fontWeight: 600 }}>Apne shehar / jurisdiction ke hisaab se – agla screen dekhiye</div>
      </div>
    </Frame>
  );
};

/* ---------------- Payment, acknowledgement, physical mode, dispatch ---------------- */
export const CardF2: React.FC = () => {
  const dur = segFrames("F2");
  const b = (i: number, o = 0) => beat("F2", i, o);
  const sPay = useOn(b(0), b(2));
  const sAck = useOn(b(2), b(4));
  const sPhy = useOn(b(4), b(5));
  const sDis = useOn(b(5), dur);
  return (
    <Frame kicker="PAYMENT & ACKNOWLEDGEMENT" title="Form check → Payment → Receipt" dur={dur}>
      <div style={{ position: "absolute", inset: 0, opacity: sPay }}>
        <In at={b(0, 0.2)}>
          <div style={{ fontSize: 42, fontWeight: 800, marginTop: 40 }}>Paperless mode mein payment:</div>
        </In>
        <div style={{ display: "flex", gap: 30, marginTop: 50 }}>
          {[
            { i: <Icon.card size={60} color={O} />, t: "Credit Card" },
            { i: <Icon.card size={60} color={O} />, t: "Debit Card" },
            { i: <Icon.bank size={60} color={O} />, t: "Net Banking" },
          ].map((x, k) => (
            <In key={x.t} at={b(1, 0.2) + k * 8} style={{ flex: 1 }}>
              <Tile icon={x.i} title={x.t} />
            </In>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, top: 60, opacity: sAck, display: "flex", gap: 40, alignItems: "flex-start" }}>
        <In at={b(2, 0.2)} style={{ flex: 1.2 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 56, border: "3px solid #F0E2D2" }}>
            <div style={{ fontSize: 34, fontWeight: 900 }}>Acknowledgement</div>
            <div style={{ fontSize: 26, color: "#5B6676", marginTop: 18 }}>15 ankon ka Acknowledgement Number</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 64, fontWeight: 800, marginTop: 14, letterSpacing: 2 }}>
              881 0 <span style={{ filter: "blur(8px)" }}>3021 9876 543</span>
            </div>
          </div>
        </In>
        <In at={b(3, 0.2)} style={{ flex: 1 }}>
          <Tile icon={<Icon.mail size={60} color={O} />} title="PDF email par" text="Acknowledgement + payment receipt" />
        </In>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: sPhy }}>
        <div style={{ fontSize: 42, fontWeight: 800, marginTop: 40 }}>Physical mode chuna hai to:</div>
        <div style={{ display: "flex", gap: 26, marginTop: 36 }}>
          {["Signed acknowledgement", "Photo", "Documents"].map((x, k) => (
            <In key={x} at={b(4, 0.3) + k * 8} style={{ flex: 1 }}>
              <Tile icon={[<Icon.sign key="a" size={56} color={O} />, <Icon.photo key="b" size={56} color={O} />, <Icon.doc key="c" size={56} color={O} />][k]} title={x} />
            </In>
          ))}
        </div>
        <In at={b(4, 1.6)} style={{ marginTop: 30 }}>
          <div style={{ background: O, color: "#fff", borderRadius: 18, padding: "28px 36px", fontSize: 42, fontWeight: 900, display: "inline-block" }}>15 din ke andar → Protean, Pune office</div>
        </In>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: sDis, display: "flex", alignItems: "center", gap: 40 }}>
        <Icon.mailbox size={150} color={O} />
        <div>
          <div style={{ fontSize: 76, fontWeight: 900 }}>~ 2 hafte</div>
          <div style={{ fontSize: 34, color: "#5B6676", fontWeight: 600, marginTop: 8 }}>mein PAN card dispatch (sab sahi hone par)</div>
        </div>
      </div>
    </Frame>
  );
};

/* ---------------- Outro ---------------- */
export const CardI: React.FC = () => {
  const f = useCurrentFrame();

  const b = (i: number, o = 0) => beat("I", i, o);
  const pop = (at: number) => interpolate(f, [at, at + 8, at + 16], [0.6, 1.1, 1], clamp);
  const steps = ["Form No. 93", "Name & DOB", "Email & Mobile", "Token Number", "e-KYC / e-Sign", "Payment", "Acknowledgement", "Status Track"];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg,#FF9A1F 0%,#F26B0F 100%)", fontFamily: FONT, color: "#fff", padding: "90px 120px", opacity: interpolate(f, [0, 10], [0, 1], clamp) }}>
      <div style={{ fontSize: 70, fontWeight: 900 }}>Quick Recap</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 30 }}>
        {steps.map((s, i) => (
          <In key={s} at={b(0, 0.2) + i * 5}>
            <div style={{ background: "#fff", color: INK, borderRadius: 14, padding: "16px 28px", fontSize: 40, fontWeight: 800 }}>
              <span style={{ color: O, marginRight: 10 }}>{i + 1}</span>
              {s}
            </div>
          </In>
        ))}
      </div>
      <In at={b(1, 0.1)} style={{ marginTop: 40 }}>
        <div style={{ fontSize: 36, fontWeight: 800 }}>Poori checklist description mein ↓</div>
      </In>
      <div style={{ display: "flex", gap: 26, marginTop: 50 }}>
        {[
          { at: b(2, 0.2), i: <Icon.thumb size={56} color="#fff" />, t: "LIKE", c: "#1D4ED8" },
          { at: b(2, 0.9), i: <Icon.share size={56} color="#fff" />, t: "SHARE", c: "#0E7490" },
          { at: b(2, 1.8), i: <Icon.bell size={56} color="#fff" />, t: "SUBSCRIBE", c: "#DC2626" },
        ].map((x) => (
          <div key={x.t} style={{ opacity: f >= x.at ? 1 : 0, scale: `${pop(x.at)}`, display: "flex", alignItems: "center", gap: 16, background: x.c, borderRadius: 18, padding: "20px 34px", fontSize: 40, fontWeight: 900 }}>
            {x.i}
            {x.t}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 120, bottom: 70, fontSize: 36, fontWeight: 900 }}>Learn Vexa • @learn_vexa</div>
    </AbsoluteFill>
  );
};
