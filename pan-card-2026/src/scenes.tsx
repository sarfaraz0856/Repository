import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Appear, C, Cursor, Icon, Masked, Panel, Tag, hexA, useActive, useProg } from "./ui";

export type SP = { b: number[]; e: number[]; dur: number };
const W = 1760; // content width
const H = 770; // content height

/* ---------- shared building blocks ---------- */

const Browser: React.FC<{ url: string; typeAt?: number; highlightDomain?: number; children?: React.ReactNode; style?: React.CSSProperties; domain?: string }> = ({
  url, typeAt, highlightDomain, children, style, domain,
}) => {
  const f = useCurrentFrame();
  const n = typeAt === undefined ? url.length : Math.floor(interpolate(f, [typeAt, typeAt + 40], [0, url.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const shown = url.slice(0, n);
  const hl = highlightDomain === undefined ? 0 : interpolate(f, [highlightDomain, highlightDomain + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const d = domain ?? url.split("/")[0];
  const dShown = shown.slice(0, d.length);
  const rest = shown.slice(d.length);
  return (
    <div style={{ background: "#0E1E38", borderRadius: 18, border: `2px solid ${C.line}`, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.4)", ...style }}>
      <div style={{ height: 70, background: "#1C2B45", display: "flex", alignItems: "center", gap: 14, padding: "0 22px" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
        ))}
        <div style={{ marginLeft: 18, flex: 1, height: 44, background: "#0E1A2E", borderRadius: 22, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, fontSize: 22, whiteSpace: "nowrap", overflow: "hidden", color: C.sub, fontFamily: "'JetBrains Mono', monospace" }}>
          <Icon.lock size={22} />
          <span style={{ color: "#fff", background: hexA(C.accent, 0.3 * hl), outline: hl > 0 ? `3px solid ${hexA(C.accent, hl)}` : "none", borderRadius: 6, padding: "2px 6px" }}>https://{dShown}</span>
          <span>{rest}</span>
        </div>
      </div>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};

const FieldRow: React.FC<{ label: string; value: React.ReactNode; active: number; top: number; left: number; width: number; appearAt: number }> = ({ label, value, active, top, left, width, appearAt }) => {
  const p = useProg(appearAt);
  return (
    <div style={{ position: "absolute", top, left, width, opacity: p }}>
      <div style={{ fontSize: 22, color: C.sub, marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ height: 58, borderRadius: 12, background: "#0B1830", border: `2px solid ${active > 0 ? hexA(C.accent, 0.3 + 0.7 * active) : C.line}`, boxShadow: active > 0 ? `0 0 24px ${hexA(C.accent, 0.4 * active)}` : "none", display: "flex", alignItems: "center", padding: "0 20px", fontSize: 26, color: "#E6EEFF" }}>
        {value}
      </div>
    </div>
  );
};

const Callout: React.FC<{ at: number; icon?: React.ReactNode; color?: string; title: string; text?: string; style?: React.CSSProperties }> = ({ at, icon, color = C.accent, title, text, style }) => (
  <Appear at={at} style={style}>
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", background: hexA(color, 0.12), border: `2px solid ${hexA(color, 0.6)}`, borderRadius: 18, padding: "26px 30px" }}>
      <div style={{ flexShrink: 0 }}>{icon ?? <Icon.warn size={46} color={color} />}</div>
      <div>
        <div style={{ fontSize: 33, fontWeight: 800, color }}>{title}</div>
        {text ? <div style={{ fontSize: 27, color: "#E6EEFF", marginTop: 8, lineHeight: 1.35 }}>{text}</div> : null}
      </div>
    </div>
  </Appear>
);

const OptionCard: React.FC<{ at: number; active: number; icon: React.ReactNode; title: string; text: string; color?: string; badge?: string; style?: React.CSSProperties }> = ({ at, active, icon, title, text, color = C.accent, badge, style }) => (
  <Appear at={at} style={{ flex: 1, ...style }}>
    <Panel glow={active} color={color} style={{ height: "100%", display: "flex", flexDirection: "column", gap: 16, scale: `${1 + active * 0.02}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {icon}
        {badge ? <Tag color={color} style={{ fontSize: 20 }}>{badge}</Tag> : null}
      </div>
      <div style={{ fontSize: 36, fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 25, color: C.sub, lineHeight: 1.4 }}>{text}</div>
    </Panel>
  </Appear>
);

const PanCardArt: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ width: 520, height: 320, borderRadius: 24, background: "linear-gradient(135deg, #E9F1FF 0%, #BFD6FF 55%, #9EC1FF 100%)", color: "#0B2550", padding: 30, boxShadow: "0 30px 70px rgba(0,0,0,0.45)", position: "relative", ...style }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: 2 }}>PAN CARD</div>
      <div style={{ fontSize: 16, fontWeight: 800, background: "#0B2550", color: "#fff", padding: "4px 10px", borderRadius: 6 }}>SAMPLE</div>
    </div>
    <div style={{ display: "flex", gap: 24, marginTop: 26 }}>
      <div style={{ width: 110, height: 135, borderRadius: 12, background: "#7FA6E6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon.photo size={70} color="#0B2550" />
      </div>
      <div style={{ fontSize: 20, lineHeight: 1.7, fontWeight: 600 }}>
        <div>Name: XXXXXXXXXX</div>
        <div>Date of Birth: DD/MM/YYYY</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 800, letterSpacing: 3, marginTop: 8 }}>ABCDE1234F</div>
      </div>
    </div>
    <div style={{ position: "absolute", right: 30, bottom: 26, width: 120, borderBottom: "2px solid #0B2550", fontSize: 14, textAlign: "center" }}>Signature</div>
  </div>
);

/* ---------- Scene 1: Intro ---------- */
export const S1: React.FC<SP> = ({ b }) => {
  const f = useCurrentFrame();
  const t1 = useProg(0, 22);
  const t2 = useProg(10, 22);
  const topics = [
    { i: <Icon.doc size={44} />, t: "Documents" },
    { i: <Icon.edit size={44} />, t: "Form Filling" },
    { i: <Icon.rupee size={44} />, t: "Online Payment" },
    { i: <Icon.search size={44} />, t: "Status Tracking" },
  ];
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <div style={{ position: "absolute", left: 0, top: 40, width: 860 }}>
        <div style={{ opacity: t1, translate: `0px ${(1 - t1) * 24}px` }}>
          <Tag>NSDL / PROTEAN • 2026</Tag>
          <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.02, marginTop: 26, letterSpacing: -1.5 }}>
            HOW TO APPLY<br />PAN CARD ONLINE <span style={{ color: C.accent }}>2026</span>
          </div>
        </div>
        <div style={{ opacity: t2, fontSize: 36, fontWeight: 700, color: C.cyan, marginTop: 24 }}>NEW PAN CARD | NSDL / PROTEAN</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 44 }}>
          {topics.map((tp, i) => (
            <Appear key={tp.t} at={b[2] + i * 14}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, background: hexA("#FFFFFF", 0.06), borderRadius: 16, padding: "16px 20px", fontSize: 28, fontWeight: 700 }}>
                {tp.i}
                {tp.t}
              </div>
            </Appear>
          ))}
        </div>
      </div>
      <Appear at={b[1]} style={{ position: "absolute", right: 0, top: 10, width: 820 }}>
        <Browser url="tinpan.proteantech.in/services/pan/pan-index.html" highlightDomain={b[1] + 20}>
          <div style={{ height: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
            <Icon.globe size={84} />
            <div style={{ fontSize: 32, fontWeight: 800 }}>Official Protean PAN Portal</div>
            <div style={{ fontSize: 22, color: C.sub }}>Illustration — open the real website in your browser</div>
          </div>
        </Browser>
      </Appear>
      <div style={{ position: "absolute", right: 120, top: 380, opacity: useProg(6, 24), rotate: "-4deg" }}>
        <PanCardArt />
      </div>
      <Appear at={b[3]} style={{ position: "absolute", left: 0, top: 660 }}>
        <Tag color={C.red} style={{ fontSize: 30, padding: "10px 26px", background: hexA(C.red, 0.85), color: "#fff", border: "none" }}>
          ⚠ 2026 RULES CHANGED
        </Tag>
      </Appear>
      {f < 0 ? null : null}
    </div>
  );
};

/* ---------- Scene 2: Documents ---------- */
export const S2: React.FC<SP> = ({ b }) => {
  const items = [
    { icon: <Icon.id />, t: "Aadhaar Card", s: "Identity & Address Proof", at: b[2] },
    { icon: <Icon.cake />, t: "Date of Birth Proof", s: "Birth Certificate / Passport / other eligible doc", at: b[1] },
    { icon: <Icon.home />, t: "Address Proof", s: "e.g. Aadhaar Card", at: b[1] + 10 },
    { icon: <Icon.phone />, t: "Mobile Number", s: "Active number", at: b[5] },
    { icon: <Icon.mail />, t: "Email ID", s: "For updates & e-PAN", at: b[5] + 10 },
    { icon: <Icon.photo />, t: "Photo & Signature", s: "If required", at: b[5] + 20 },
  ];
  const dobGlow = useActive(b[3], b[5]);
  return (
    <div style={{ display: "flex", gap: 50, width: W }}>
      <div style={{ flex: 1.25, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, alignContent: "start" }}>
        {items.map((it, i) => (
          <Appear key={it.t} at={it.at}>
            <Panel glow={i === 1 ? dobGlow : 0} style={{ display: "flex", gap: 20, alignItems: "center", padding: 24, height: 150 }}>
              {it.icon}
              <div>
                <div style={{ fontSize: 31, fontWeight: 800 }}>{it.t}</div>
                <div style={{ fontSize: 22, color: C.sub, marginTop: 6 }}>{it.s}</div>
              </div>
            </Panel>
          </Appear>
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
        <Callout at={b[3]} color={C.red} title="IMPORTANT UPDATE (April 2026)" text="Aadhaar is NOT accepted as Date of Birth Proof." />
        <Callout at={b[4]} color={C.green} icon={<Icon.check size={46} />} title="Use for Date of Birth" text="Birth Certificate • Passport • Other eligible document (check the current list on the website)" />
        <Callout at={b[6]} color={C.cyan} icon={<Icon.doc size={46} color={C.cyan} />} title="Keep documents ready" text="The application process becomes much easier." />
      </div>
    </div>
  );
};

/* ---------- Scene 3: Open website ---------- */
export const S3: React.FC<SP> = ({ b }) => {
  const tiles = ["New PAN", "Changes / Correction", "Reprint", "Track Status"];
  return (
    <div style={{ display: "flex", gap: 40, width: W }}>
      <div style={{ flex: 1.5 }}>
        <Browser url="tinpan.proteantech.in/services/pan/pan-index.html" typeAt={b[1]} highlightDomain={b[1] + 44}>
          <div style={{ height: 520, padding: 40 }}>
            <Appear at={b[0]}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: C.sub }}>
                <Icon.globe size={44} /> Chrome Browser
              </div>
            </Appear>
            <Appear at={b[3]} style={{ marginTop: 34 }}>
              <div style={{ fontSize: 24, color: C.sub, marginBottom: 18 }}>PAN related services (illustration)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {tiles.map((t, i) => (
                  <Appear key={t} at={b[3] + 8 + i * 8}>
                    <div style={{ background: hexA("#FFFFFF", 0.06), border: `2px solid ${C.line}`, borderRadius: 14, padding: "26px 24px", fontSize: 28, fontWeight: 700 }}>{t}</div>
                  </Appear>
                ))}
              </div>
            </Appear>
          </div>
        </Browser>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
        <Callout at={b[1] + 44} color={C.green} icon={<Icon.lock size={46} />} title="Official domain" text="tinpan.proteantech.in" />
        <Callout at={b[2]} color={C.cyan} icon={<Icon.download size={46} color={C.cyan} />} title="Direct link" text="Given in the video description" />
        <Callout at={b[4]} color={C.red} icon={<Icon.shield size={46} color={C.red} />} title="Apply only on the official website" text="Never enter Aadhaar or personal details on unknown websites." />
      </div>
    </div>
  );
};

/* ---------- Scene 4: Application type / Form 93 ---------- */
export const S4: React.FC<SP> = ({ b }) => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [b[2] + 20, b[2] + 36], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", gap: 44, width: W }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
        <Appear at={b[0]}>
          <Panel glow={useActive(b[0], b[1])} style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Icon.plus size={56} />
            <div>
              <div style={{ fontSize: 34, fontWeight: 800 }}>New PAN Application</div>
              <div style={{ fontSize: 24, color: C.sub }}>For first-time applicants</div>
            </div>
          </Panel>
        </Appear>
        <Appear at={b[1]}>
          <Panel glow={useActive(b[1], b[2])} color={C.green} style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Icon.id size={56} color={C.green} />
            <div>
              <div style={{ fontSize: 34, fontWeight: 800 }}>Form 93</div>
              <div style={{ fontSize: 24, color: C.sub }}>Indian citizen • Individual</div>
            </div>
          </Panel>
        </Appear>
        <Appear at={b[3]}>
          <Panel glow={useActive(b[3], b[4])} color={C.cyan} style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <Icon.photo size={56} />
            <div>
              <div style={{ fontSize: 34, fontWeight: 800 }}>Individual Applicant</div>
              <div style={{ fontSize: 24, color: C.sub }}>Select the correct category</div>
            </div>
          </Panel>
        </Appear>
        <Callout at={b[4]} color={C.red} title="Already have a PAN?" text="Do not apply for a new PAN Card." />
      </div>
      <Appear at={b[2]} style={{ flex: 1.1 }}>
        <div style={{ display: "flex", gap: 30, alignItems: "center", height: 560 }}>
          <Panel style={{ flex: 1, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 28, color: C.sub, fontWeight: 800, letterSpacing: 2 }}>OLD FORM</div>
            <div style={{ position: "relative", display: "inline-block", fontSize: 130, fontWeight: 900, color: "#8EA3C7", marginTop: 10 }}>
              49A
              <div style={{ position: "absolute", left: 0, top: "52%", height: 10, width: `${strike}%`, background: C.red, borderRadius: 5 }} />
            </div>
            <div style={{ fontSize: 24, color: C.sub }}>Not accepted from 1 April 2026</div>
          </Panel>
          <div style={{ fontSize: 70, color: C.accent, fontWeight: 900 }}>→</div>
          <Appear at={b[2] + 30} style={{ flex: 1 }}>
            <Panel glow={1} color={C.green} style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 28, color: C.green, fontWeight: 800, letterSpacing: 2 }}>NEW FORM</div>
              <div style={{ fontSize: 130, fontWeight: 900, marginTop: 10 }}>93</div>
              <div style={{ fontSize: 24, color: C.sub }}>Indian individual citizens</div>
            </Panel>
          </Appear>
        </div>
      </Appear>
    </div>
  );
};

/* ---------- generic illustrative form ---------- */
type Fld = { label: string; value: React.ReactNode; on: number; off: number; appear: number; col?: 0 | 1 };
const FormIllustration: React.FC<{ title: string; fields: Fld[]; extra?: React.ReactNode; width?: number; height?: number }> = ({ title, fields, extra, width = 1000, height = 740 }) => {
  const rows: Record<number, number> = { 0: 0, 1: 0 };
  const placed = fields.map((fl) => {
    const col = fl.col ?? 0;
    const r = rows[col]++;
    return { ...fl, left: 40 + col * 470, top: 100 + r * 112 };
  });
  return (
    <div style={{ position: "relative", width, height, background: "#0E1E38", borderRadius: 20, border: `2px solid ${C.line}` }}>
      <div style={{ position: "absolute", left: 40, top: 30, fontSize: 30, fontWeight: 800 }}>{title}</div>
      <div style={{ position: "absolute", right: 30, top: 34, fontSize: 18, color: C.sub, fontWeight: 700 }}>ILLUSTRATIVE LAYOUT</div>
      {placed.map((p) => (
        <ActiveField key={p.label} p={p} />
      ))}
      {extra}
    </div>
  );
};
const ActiveField: React.FC<{ p: Fld & { left: number; top: number } }> = ({ p }) => {
  const a = useActive(p.on, p.off);
  return <FieldRow label={p.label} value={p.value} active={a} top={p.top} left={p.left} width={430} appearAt={p.appear} />;
};
const fieldPoint = (fields: Fld[], label: string, at: number, ox = 0, oy = 0) => {
  const rows: Record<number, number> = { 0: 0, 1: 0 };
  for (const fl of fields) {
    const col = fl.col ?? 0;
    const r = rows[col]++;
    if (fl.label === label) return { at, x: ox + 40 + col * 470 + 330, y: oy + 100 + r * 112 + 59, click: true };
  }
  return { at, x: 0, y: 0 };
};

/* ---------- Scene 5: Registration ---------- */
export const S5: React.FC<SP> = ({ b, e }) => {
  const fields: Fld[] = [
    { label: "Applicant Name", value: <Masked text="DEMO NAME" />, on: b[1], off: e[1] + 8, appear: b[0] },
    { label: "Date of Birth", value: "DD / MM / YYYY", on: b[2], off: b[3], appear: b[0] + 6 },
    { label: "Email ID", value: <Masked text="demo@example.com" />, on: b[2] + 30, off: b[3], appear: b[0] + 12 },
    { label: "Mobile Number", value: <Masked text="98XXXXXX10" />, on: b[2] + 60, off: b[3], appear: b[0] + 18 },
  ];
  const f = useCurrentFrame();
  const captchaOn = useActive(b[5], e[5] + 8);
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <div style={{ position: "absolute", left: 80, top: 0 }}>
        <FormIllustration
          title="Registration (Form 93)"
          fields={fields}
          extra={
            <Appear at={b[5]} style={{ position: "absolute", left: 40, top: 560, width: 900 }}>
              <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, border: `3px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {f > b[5] + 20 ? <Icon.check size={26} color={C.accent} /> : null}
                  </div>
                  Consent
                </div>
                <div style={{ padding: "12px 22px", borderRadius: 12, border: `2px dashed ${hexA(C.accent, 0.4 + captchaOn * 0.6)}`, fontSize: 22, color: C.sub }}>
                  CAPTCHA — enter it yourself
                </div>
              </div>
            </Appear>
          }
        />
      </div>
      <div style={{ position: "absolute", right: 0, top: 0, width: 600, display: "flex", flexDirection: "column", gap: 24 }}>
        <Callout at={b[3]} title="Details must match documents" text="Name & Date of Birth exactly as in your documents." />
        <Callout at={b[4]} color={C.red} title="Mismatch = problem" text="Differences can cause issues during processing." />
        <Callout at={b[6]} color={C.green} icon={<Icon.check size={46} />} title="Save your Token Number" text={"Token No.: XXXXXXXXXX (demo)\nUse it to continue your application later."} />
      </div>
      <Cursor
        points={[
          { at: b[1], x: 700, y: 650 },
          fieldPoint(fields, "Applicant Name", b[1] + 16, 80, 0),
          fieldPoint(fields, "Date of Birth", b[2] + 4, 80, 0),
          fieldPoint(fields, "Email ID", b[2] + 34, 80, 0),
          fieldPoint(fields, "Mobile Number", b[2] + 64, 80, 0),
          { at: b[5] + 20, x: 80 + 40 + 17, y: 560 + 17, click: true },
        ]}
      />
    </div>
  );
};

/* ---------- Scene 6: Submission method ---------- */
export const S6: React.FC<SP> = ({ b, e }) => (
  <div style={{ width: W, display: "flex", flexDirection: "column", gap: 34 }}>
    <div style={{ display: "flex", gap: 30, height: 420 }}>
      <OptionCard at={b[1]} active={useActive(b[2], e[2] + 10)} color={C.green} icon={<Icon.phone size={62} color={C.green} />} badge="ONLINE" title="Digital Verification" text="Aadhaar based e-KYC (where eligible)" />
      <OptionCard at={b[1] + 10} active={useActive(b[2], e[2] + 10)} color={C.green} icon={<Icon.sign size={62} color={C.green} />} badge="ONLINE" title="e-Sign" text="Sign the application digitally with OTP" />
      <OptionCard at={b[1] + 20} active={useActive(b[4], e[4] + 10)} color={C.cyan} icon={<Icon.mailbox size={62} />} badge="OFFLINE" title="Physical Documents" text="Send signed form & documents as instructed" />
    </div>
    <Callout at={b[3]} title="Check requirements first" text="Each method has its own requirements — read them on the website before selecting." />
  </div>
);

/* ---------- Scene 7: Physical vs e-PAN ---------- */
export const S7: React.FC<SP> = ({ b, e }) => (
  <div style={{ width: W, display: "flex", gap: 40 }}>
    <OptionCard at={b[0]} active={useActive(b[1], e[1] + 10)} icon={<Icon.card size={70} color={C.accent} />} badge="DELIVERED HOME" title="Physical PAN Card" text="Printed card delivered by post to your address." />
    <OptionCard at={b[0] + 12} active={useActive(b[2], e[3] + 10)} color={C.green} icon={<Icon.mail size={70} color={C.green} />} badge="DIGITAL" title="e-PAN" text="Digital PAN sent by email. e-PAN is also a valid PAN document." />
    <Appear at={b[4]} style={{ position: "absolute", left: 0, right: 0, bottom: 10, display: "flex", justifyContent: "center" }}>
      <Tag color={C.cyan} style={{ fontSize: 30, padding: "10px 28px" }}>Choose as per your requirement</Tag>
    </Appear>
  </div>
);

/* ---------- Scene 8: Personal details ---------- */
export const S8: React.FC<SP> = ({ b, e }) => {
  const fields: Fld[] = [
    { label: "Full Name", value: <Masked text="DEMO FULL NAME" />, on: b[1], off: b[1] + 40, appear: b[0] },
    { label: "Date of Birth", value: "DD / MM / YYYY", on: b[1] + 40, off: b[1] + 80, appear: b[0] + 6 },
    { label: "Gender", value: "Select ▾", on: b[1] + 80, off: b[1] + 120, appear: b[0] + 12 },
    { label: "Father's / Mother's Name", value: <Masked text="DEMO PARENT NAME" />, on: b[1] + 120, off: e[1] + 8, appear: b[0] + 18, col: 1 },
    { label: "Aadhaar Number", value: <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>XXXX XXXX <Masked text="1234" /></span>, on: b[2], off: b[2] + 60, appear: b[0] + 24, col: 1 },
    { label: "Name as per Aadhaar", value: <Masked text="DEMO FULL NAME" />, on: b[2] + 60, off: b[3] + 30, appear: b[0] + 30, col: 1 },
  ];
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <FormIllustration title="Personal Details" fields={fields} width={1000} height={560} />
      <div style={{ position: "absolute", right: 0, top: 0, width: 680, display: "flex", flexDirection: "column", gap: 24 }}>
        <Callout at={b[3]} title="Spelling must be exact" text="Same as your documents & Aadhaar." />
        <Callout at={b[4]} color={C.red} title="Small mistakes = correction later" />
        <Callout at={b[5]} color={C.green} icon={<Icon.check size={46} />} title="Check everything before NEXT" />
      </div>
      <Cursor
        points={[
          { at: b[1] - 4, x: 600, y: 600 },
          fieldPoint(fields, "Full Name", b[1] + 10, 0, 0),
          fieldPoint(fields, "Date of Birth", b[1] + 50, 0, 0),
          fieldPoint(fields, "Gender", b[1] + 90, 0, 0),
          fieldPoint(fields, "Father's / Mother's Name", b[1] + 130, 0, 0),
          fieldPoint(fields, "Aadhaar Number", b[2] + 10, 0, 0),
          fieldPoint(fields, "Name as per Aadhaar", b[2] + 70, 0, 0),
        ]}
      />
    </div>
  );
};

/* ---------- Scene 9: Address ---------- */
export const S9: React.FC<SP> = ({ b, e }) => {
  const step = Math.max(14, Math.floor((e[1] - b[1]) / 6));
  const names = ["House No.", "Area / Locality", "City", "District", "State", "PIN Code"];
  const fields: Fld[] = names.map((n, i) => ({
    label: n,
    value: <Masked text={n === "PIN Code" ? "7XXXXX" : "DEMO " + n.toUpperCase()} />,
    on: b[1] + i * step,
    off: b[1] + (i + 1) * step,
    appear: b[0] + i * 5,
    col: (i % 2) as 0 | 1,
  }));
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <FormIllustration title="Address & Contact Details" fields={fields} width={1000} height={470} />
      <div style={{ position: "absolute", left: 0, top: 500, width: 1000, display: "flex", gap: 24 }}>
        <Appear at={b[3]} style={{ flex: 1 }}>
          <Panel glow={useActive(b[3], e[3] + 10)} color={C.cyan} style={{ display: "flex", gap: 16, alignItems: "center", padding: 22 }}>
            <Icon.phone size={44} /> <div style={{ fontSize: 26, fontWeight: 700 }}>Mobile & Email: keep active</div>
          </Panel>
        </Appear>
        <Appear at={b[4]} style={{ flex: 1 }}>
          <Panel glow={useActive(b[4], e[4] + 10)} color={C.cyan} style={{ display: "flex", gap: 16, alignItems: "center", padding: 22 }}>
            <Icon.rupee size={44} /> <div style={{ fontSize: 26, fontWeight: 700 }}>Source of Income: choose correctly</div>
          </Panel>
        </Appear>
      </div>
      <div style={{ position: "absolute", right: 0, top: 0, width: 680 }}>
        <Callout at={b[2]} title="Delivery address must be correct" text="Your physical PAN Card is posted to this address." />
      </div>
      <Cursor points={[{ at: b[1] - 4, x: 500, y: 430 }, ...fields.map((fl, i) => fieldPoint(fields, fl.label, b[1] + i * step + 8, 0, 0))]} />
    </div>
  );
};

/* ---------- Scene 10: AO Code ---------- */
export const S10: React.FC<SP> = ({ b }) => {
  const parts = ["Area Code", "AO Type", "Range Code", "AO Number"];
  const flow = ["State", "City", "Jurisdiction", "AO Code"];
  return (
    <div style={{ width: W, display: "flex", flexDirection: "column", gap: 34 }}>
      <Appear at={b[0]}>
        <div style={{ fontSize: 60, fontWeight: 900 }}>
          AO Code = <span style={{ color: C.accent }}>Assessing Officer</span> Code
        </div>
      </Appear>
      <div style={{ display: "flex", gap: 22 }}>
        {parts.map((p, i) => (
          <Appear key={p} at={b[1] + i * 8} style={{ flex: 1 }}>
            <Panel style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 40, fontWeight: 800, color: C.cyan }}>{["XXX", "X", "XX", "XX"][i]}</div>
              <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{p}</div>
            </Panel>
          </Appear>
        ))}
      </div>
      <Appear at={b[2]}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Icon.search size={56} />
          {flow.map((s, i) => (
            <React.Fragment key={s}>
              <Appear at={b[3] + i * 12}>
                <div style={{ background: i === 3 ? C.accent : hexA("#FFFFFF", 0.08), color: i === 3 ? "#1B1300" : "#fff", borderRadius: 14, padding: "16px 26px", fontSize: 30, fontWeight: 800 }}>{s}</div>
              </Appear>
              {i < 3 ? <div style={{ fontSize: 40, color: C.sub }}>→</div> : null}
            </React.Fragment>
          ))}
          <div style={{ fontSize: 22, color: C.sub, marginLeft: 10 }}>Use the AO Code search on the website</div>
        </div>
      </Appear>
      <div style={{ display: "flex", gap: 24 }}>
        <Callout at={b[4]} color={C.red} title="Don't select a random AO Code" style={{ flex: 1 }} />
        <Callout at={b[5]} color={C.green} icon={<Icon.check size={46} />} title="Verify, then go Next" style={{ flex: 1 }} />
      </div>
    </div>
  );
};

/* ---------- Scene 11: Upload ---------- */
export const S11: React.FC<SP> = ({ b, e }) => {
  const docs = [
    { i: <Icon.id size={60} />, t: "Identity Proof" },
    { i: <Icon.home size={60} />, t: "Address Proof" },
    { i: <Icon.cake size={60} />, t: "Date of Birth Proof" },
  ];
  const up = [
    { i: <Icon.photo size={60} />, t: "Photo" },
    { i: <Icon.sign size={60} />, t: "Signature" },
    { i: <Icon.doc size={60} />, t: "Documents" },
  ];
  return (
    <div style={{ width: W, display: "flex", gap: 40 }}>
      <div style={{ flex: 1.2, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", gap: 20 }}>
          {docs.map((d, i) => (
            <Appear key={d.t} at={b[1] + i * 10} style={{ flex: 1 }}>
              <Panel glow={useActive(b[1] + i * 10, e[1] + 8)} color={C.cyan} style={{ textAlign: "center", padding: 22 }}>
                {d.i}
                <div style={{ fontSize: 25, fontWeight: 700, marginTop: 8 }}>{d.t}</div>
                <div style={{ fontSize: 20, color: C.sub, marginTop: 6 }}>Select ▾</div>
              </Panel>
            </Appear>
          ))}
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {up.map((d, i) => (
            <Appear key={d.t} at={b[2] + i * 10} style={{ flex: 1 }}>
              <Panel glow={useActive(b[2] + i * 10, e[2] + 8)} style={{ textAlign: "center", padding: 22 }}>
                {d.i}
                <div style={{ fontSize: 25, fontWeight: 700, marginTop: 8 }}>{d.t}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 20, color: C.accent, fontWeight: 700 }}>
                  <Icon.upload size={24} color={C.accent} /> Upload
                </div>
              </Panel>
            </Appear>
          ))}
        </div>
        <Callout at={b[2] + 30} color={C.cyan} icon={<Icon.doc size={46} color={C.cyan} />} title="File size & format" text="Upload exactly as specified on the official portal." />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
        <Appear at={b[3]}>
          <div style={{ display: "flex", gap: 22 }}>
            <Panel style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 150, borderRadius: 10, background: "#E8EEF8", padding: 18 }}>
                {[80, 60, 70, 50].map((w, i) => (
                  <div key={i} style={{ height: 14, width: `${w}%`, background: "#5A6B88", borderRadius: 7, marginBottom: 14 }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 14, fontSize: 26, fontWeight: 800, color: C.green }}>
                <Icon.check size={34} /> Clear
              </div>
            </Panel>
            <Appear at={b[4]} style={{ flex: 1 }}>
              <Panel style={{ textAlign: "center" }}>
                <div style={{ height: 150, borderRadius: 10, background: "#E8EEF8", padding: 18, filter: "blur(6px)" }}>
                  {[80, 60, 70, 50].map((w, i) => (
                    <div key={i} style={{ height: 14, width: `${w}%`, background: "#5A6B88", borderRadius: 7, marginBottom: 14 }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 14, fontSize: 26, fontWeight: 800, color: C.red }}>
                  <Icon.cross size={34} /> Blurred
                </div>
              </Panel>
            </Appear>
          </div>
        </Appear>
        <Callout at={b[5]} color={C.green} icon={<Icon.check size={46} />} title="Re-check after uploading" />
      </div>
    </div>
  );
};

/* ---------- Scene 12: Preview ---------- */
export const S12: React.FC<SP> = ({ b, e }) => {
  const items = ["Name", "Date of Birth", "Address", "Mobile Number", "Documents"];
  const span = Math.max(12, Math.floor((e[2] - b[2]) / items.length));
  const f = useCurrentFrame();
  return (
    <div style={{ width: W, display: "flex", gap: 44 }}>
      <Appear at={b[0]} style={{ flex: 1 }}>
        <Panel style={{ padding: 40 }}>
          <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 24 }}>Application Review Checklist</div>
          {items.map((it, i) => {
            const done = f >= b[2] + (i + 1) * span;
            return (
              <div key={it} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 0", borderBottom: `1px solid ${C.line}`, fontSize: 32, fontWeight: 700 }}>
                {done ? <Icon.check size={44} /> : <div style={{ width: 44, height: 44, borderRadius: 22, border: `3px solid ${C.line}` }} />}
                <span style={{ color: done ? "#fff" : C.sub }}>{it}</span>
              </div>
            );
          })}
        </Panel>
      </Appear>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
        <Callout at={b[1]} color={C.cyan} icon={<Icon.search size={46} />} title="Review before final submission" />
        <Callout at={b[3]} title="Found a mistake? Correct it now." />
        <Callout at={b[4]} color={C.red} title="Changes after submission are not easy" />
        <Callout at={b[5]} color={C.green} icon={<Icon.check size={46} />} title="All correct → Proceed" />
      </div>
    </div>
  );
};

/* ---------- Scene 13: Payment ---------- */
export const S13: React.FC<SP> = ({ b }) => (
  <div style={{ width: W, display: "flex", flexDirection: "column", gap: 28 }}>
    <div style={{ display: "flex", gap: 26 }}>
      {[
        { t: "e-PAN only", v: "≈ ₹66 – ₹72", s: "Paperless / physical submission" },
        { t: "Physical PAN (India)", v: "≈ ₹107", s: "Card delivered in India" },
        { t: "Physical PAN (abroad)", v: "≈ ₹1,017", s: "Delivery outside India" },
      ].map((c, i) => (
        <Appear key={c.t} at={b[1] + i * 10} style={{ flex: 1 }}>
          <Panel style={{ textAlign: "center", padding: 30 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.sub }}>{c.t}</div>
            <div style={{ fontSize: 66, fontWeight: 900, color: C.accent, marginTop: 6 }}>{c.v}</div>
            <div style={{ fontSize: 22, color: C.sub }}>{c.s}</div>
          </Panel>
        </Appear>
      ))}
    </div>
    <Callout at={b[2]} title="Indicative fees (incl. GST) — always check the FINAL amount shown on the official website" />
    <Appear at={b[3]}>
      <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
        {[
          { i: <Icon.bank size={46} />, t: "Net Banking" },
          { i: <Icon.card size={46} />, t: "Debit / Credit Card" },
          { i: <Icon.phone size={46} />, t: "Other options shown on portal" },
        ].map((p) => (
          <div key={p.t} style={{ display: "flex", alignItems: "center", gap: 14, background: hexA("#FFFFFF", 0.07), borderRadius: 14, padding: "16px 24px", fontSize: 27, fontWeight: 700 }}>
            {p.i}
            {p.t}
          </div>
        ))}
        <Tag color={C.sub} style={{ fontSize: 20 }}>DEMO • NO PAYMENT MADE</Tag>
      </div>
    </Appear>
    <Callout at={b[4]} color={C.green} icon={<Icon.download size={46} color={C.green} />} title="Save your payment receipt" />
  </div>
);

/* ---------- Scene 14: OTP & e-Sign ---------- */
export const S14: React.FC<SP> = ({ b }) => {
  const f = useCurrentFrame();
  const dots = Math.floor(interpolate(f, [b[1] + 20, b[1] + 70], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <div style={{ width: W, display: "flex", gap: 60, alignItems: "center" }}>
      <Appear at={b[0]} style={{ width: 380 }}>
        <div style={{ width: 360, height: 640, borderRadius: 50, background: "#0B1527", border: "10px solid #26344F", padding: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div style={{ width: 90, height: 8, borderRadius: 4, background: "#26344F" }} />
          <Icon.lock size={70} />
          <div style={{ fontSize: 28, fontWeight: 800, textAlign: "center" }}>Aadhaar OTP Verification</div>
          <div style={{ fontSize: 18, color: C.sub }}>DEMO • NOT A REAL OTP</div>
          <div style={{ display: "flex", gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: 40, height: 52, borderRadius: 8, border: `2px solid ${i < dots ? C.accent : C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                {i < dots ? "•" : ""}
              </div>
            ))}
          </div>
          <Appear at={b[2]}>
            <div style={{ background: C.green, color: "#05210F", fontWeight: 900, fontSize: 26, borderRadius: 12, padding: "14px 30px", display: "flex", gap: 10, alignItems: "center" }}>
              <Icon.sign size={30} color="#05210F" /> e-Sign
            </div>
          </Appear>
        </div>
      </Appear>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
        <Callout at={b[0]} color={C.cyan} icon={<Icon.shield size={46} color={C.cyan} />} title="Aadhaar based verification / e-Sign" text="Complete the verification required for your method." />
        <Callout at={b[1]} color={C.cyan} icon={<Icon.phone size={46} />} title="OTP on Aadhaar-linked mobile" />
        <Callout at={b[3]} color={C.red} title="NEVER share your OTP with anyone" />
        <Callout at={b[4]} icon={<Icon.mailbox size={46} color={C.accent} />} title="Physical submission?" text="Send documents as per the instructions on the website." />
      </div>
    </div>
  );
};

/* ---------- Scene 15: Acknowledgement ---------- */
export const S15: React.FC<SP> = ({ b }) => (
  <div style={{ width: W, display: "flex", gap: 60 }}>
    <Appear at={b[0]} style={{ width: 760 }}>
      <div style={{ background: "#F4F7FC", color: "#13233F", borderRadius: 20, padding: 44, boxShadow: "0 30px 70px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 900 }}>Acknowledgement</div>
          <div style={{ fontSize: 16, fontWeight: 800, background: "#13233F", color: "#fff", padding: "4px 10px", borderRadius: 6 }}>SAMPLE</div>
        </div>
        <div style={{ marginTop: 30, fontSize: 24, color: "#4A5B78" }}>Acknowledgement Number</div>
        <div style={{ marginTop: 8, fontSize: 40, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", background: "#FFF1CF", border: "3px solid #FFB020", borderRadius: 12, padding: "10px 18px", display: "inline-block" }}>
          <Masked text="881234567890123" />
        </div>
        {["Applicant Name", "Date of Birth", "Status"].map((r, i) => (
          <div key={r} style={{ display: "flex", justifyContent: "space-between", marginTop: 22, fontSize: 24, borderBottom: "1px solid #D5DEEC", paddingBottom: 10 }}>
            <span style={{ color: "#4A5B78" }}>{r}</span>
            {i < 2 ? <Masked text="XXXXXXXXXX" /> : <b>Submitted</b>}
          </div>
        ))}
        <Appear at={b[1]} style={{ marginTop: 30 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#1D4ED8", color: "#fff", borderRadius: 12, padding: "14px 26px", fontSize: 26, fontWeight: 800 }}>
            <Icon.download size={30} color="#fff" /> Download Receipt
          </div>
        </Appear>
      </div>
    </Appear>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
      <Callout at={b[1]} color={C.green} icon={<Icon.download size={46} color={C.green} />} title="Download & keep it safe" />
      <Callout at={b[2]} color={C.cyan} icon={<Icon.search size={46} />} title="Use it to track status" />
      <Callout at={b[3]} color={C.cyan} icon={<Icon.check size={46} color={C.cyan} />} title="Confirm successful submission" />
      <Callout at={b[4]} color={C.red} title="Payment ≠ Application complete" text="A successful payment alone is not a guarantee." />
    </div>
    <Cursor points={[{ at: b[1] - 6, x: 700, y: 700 }, { at: b[1] + 12, x: 260, y: 640, click: true }]} />
  </div>
);

/* ---------- Scene 16: Track status ---------- */
export const S16: React.FC<SP> = ({ b, e }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: W, height: H, display: "flex", gap: 40 }}>
      <Appear at={b[1]} style={{ width: 1080 }}>
        <Browser url="tinpan.proteantech.in → PAN Status Tracking" domain="tinpan.proteantech.in">
          <div style={{ padding: 40, height: 560, position: "relative" }}>
            <div style={{ fontSize: 30, fontWeight: 800 }}>Track PAN Application Status</div>
            <div style={{ fontSize: 18, color: C.sub, marginTop: 6, fontWeight: 700 }}>ILLUSTRATIVE LAYOUT</div>
            <FieldRow label="Application Type" value="PAN – New / Change Request ▾" active={useActive(b[2], b[3])} top={110} left={40} width={620} appearAt={b[2]} />
            <FieldRow label="Acknowledgement Number" value={<Masked text="881234567890123" />} active={useActive(b[3], e[3] + 6)} top={222} left={40} width={620} appearAt={b[3]} />
            <Appear at={b[3] + 40} style={{ position: "absolute", left: 40, top: 350 }}>
              <div style={{ background: C.accent, color: "#1B1300", fontWeight: 900, fontSize: 26, padding: "14px 34px", borderRadius: 12 }}>Track Status</div>
            </Appear>
            <Appear at={b[4]} style={{ position: "absolute", left: 40, top: 440, width: 940 }}>
              <div style={{ background: hexA(C.green, 0.14), border: `2px solid ${C.green}`, borderRadius: 14, padding: "18px 24px", fontSize: 26 }}>
                Current Status: <b>{f > b[4] ? "Application under process (example)" : ""}</b>
              </div>
            </Appear>
          </div>
        </Browser>
      </Appear>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
        <Callout at={b[0]} color={C.cyan} icon={<Icon.search size={46} />} title="Track status online" />
        <Callout at={b[5]} icon={<Icon.refresh size={46} color={C.accent} />} title="Delivery time" text="Depends on your application verification." />
      </div>
      <Cursor
        points={[
          { at: b[2] - 6, x: 900, y: 650 },
          { at: b[2] + 10, x: 560, y: 70 + 110 + 59, click: true },
          { at: b[3] + 12, x: 560, y: 70 + 222 + 59, click: true },
          { at: b[3] + 52, x: 200, y: 70 + 350 + 30, click: true },
        ]}
      />
    </div>
  );
};

/* ---------- Scene 17: Warning ---------- */
export const S17: React.FC<SP> = ({ b, e }) => (
  <div style={{ width: W, display: "flex", flexDirection: "column", gap: 30 }}>
    <div style={{ display: "flex", gap: 28, height: 460 }}>
      <OptionCard at={b[0]} active={useActive(b[1], e[1] + 8)} color={C.red} icon={<Icon.plus size={66} color={C.red} />} badge="FIRST TIME ONLY" title="New PAN Application" text="Only if you have never had a PAN." />
      <OptionCard at={b[0] + 10} active={useActive(b[2], e[2] + 8)} color={C.green} icon={<Icon.refresh size={66} color={C.green} />} badge="LOST CARD" title="PAN Card Reprint" text="Lost your card? Use Reprint — same PAN number." />
      <OptionCard at={b[0] + 20} active={useActive(b[3], e[3] + 8)} color={C.cyan} icon={<Icon.edit size={66} />} badge="WRONG DETAILS" title="PAN Card Correction" text="Wrong name or date of birth? Use Correction." />
    </div>
    <Appear at={b[4]} style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ background: C.red, color: "#fff", fontSize: 40, fontWeight: 900, borderRadius: 16, padding: "18px 40px" }}>ONE PERSON = ONE PAN NUMBER</div>
    </Appear>
  </div>
);

/* ---------- Scene 18: Outro ---------- */
export const S18: React.FC<SP> = ({ b }) => {
  const steps = ["Documents", "Official Website", "Form 93", "Registration", "Method", "PAN / e-PAN", "Details", "AO Code", "Upload", "Review", "Payment", "OTP / e-Sign", "Acknowledgement", "Track Status"];
  const f = useCurrentFrame();
  const pop = (at: number) => interpolate(f, [at, at + 8, at + 16], [0.6, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ width: W, display: "flex", flexDirection: "column", gap: 36 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
        {steps.map((s, i) => (
          <Appear key={s} at={b[0] + i * 5}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: hexA("#FFFFFF", 0.07), borderRadius: 12, padding: "12px 18px", fontSize: 26, fontWeight: 700 }}>
              <span style={{ background: C.accent, color: "#1B1300", borderRadius: 8, padding: "2px 10px", fontWeight: 900 }}>{i + 1}</span>
              {s}
            </div>
          </Appear>
        ))}
      </div>
      <div style={{ display: "flex", gap: 30, justifyContent: "center", marginTop: 30 }}>
        {[
          { at: b[2], i: <Icon.thumb size={60} />, t: "LIKE", c: "#2563EB" },
          { at: b[2] + 30, i: <Icon.share size={60} />, t: "SHARE", c: "#0EA5E9" },
          { at: b[3], i: <Icon.comment size={60} />, t: "COMMENT", c: "#8B5CF6" },
          { at: b[4], i: <Icon.bell size={60} />, t: "SUBSCRIBE", c: "#DC2626" },
        ].map((x) => (
          <div key={x.t} style={{ opacity: f >= x.at ? 1 : 0, scale: `${pop(x.at)}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, background: x.c, borderRadius: 18, padding: "22px 36px", fontSize: 38, fontWeight: 900 }}>
              {x.i}
              {x.t}
            </div>
          </div>
        ))}
      </div>
      <Appear at={b[5]} style={{ textAlign: "center", marginTop: 20 }}>
        <div style={{ fontSize: 64, fontWeight: 900 }}>
          Thank you for <span style={{ color: C.accent }}>watching!</span>
        </div>
      </Appear>
    </div>
  );
};

export const SCENES: Record<number, { C: React.FC<SP>; step: string; title: string; demo?: string | false }> = {
  1: { C: S1, step: "", title: "", demo: false },
  2: { C: S2, step: "BEFORE YOU START", title: "Required Documents", demo: false },
  3: { C: S3, step: "STEP 1", title: "Open the Official Website" },
  4: { C: S4, step: "STEP 2", title: "Select Application Type", demo: false },
  5: { C: S5, step: "STEP 3", title: "Online Registration" },
  6: { C: S6, step: "STEP 4", title: "Application Submission Method" },
  7: { C: S7, step: "STEP 5", title: "Physical PAN Card or e-PAN", demo: false },
  8: { C: S8, step: "STEP 6", title: "Personal Details" },
  9: { C: S9, step: "STEP 7", title: "Address & Contact Details" },
  10: { C: S10, step: "STEP 8", title: "AO Code", demo: false },
  11: { C: S11, step: "STEP 9", title: "Document Upload" },
  12: { C: S12, step: "STEP 10", title: "Application Preview", demo: false },
  13: { C: S13, step: "STEP 11", title: "Online Payment" },
  14: { C: S14, step: "STEP 12", title: "OTP Verification & e-Sign" },
  15: { C: S15, step: "STEP 13", title: "Acknowledgement Receipt" },
  16: { C: S16, step: "STEP 14", title: "Track PAN Card Status" },
  17: { C: S17, step: "IMPORTANT", title: "New PAN vs Reprint vs Correction", demo: false },
  18: { C: S18, step: "RECAP", title: "Quick Recap", demo: false },
};
