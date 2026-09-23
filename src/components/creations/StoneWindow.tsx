// Hand built stone lancet window. With a cover image the glass is replaced
// by the image; without one it shows diamond leaded panes.

const STONES = ["#C3B79E", "#B8AB91", "#AEA186", "#BFB297", "#A99B80", "#B4A78C"];

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}
const pt = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const f = (n: number) => n.toFixed(1);

// glass spans x 40..190 (150 wide, was 120) so more of each video shows
const RI = 150, RO = 174, SPRING = 156, BASE = 306;
const LC: [number, number] = [190, SPRING]; // arc centre for the left half
const RC: [number, number] = [40, SPRING];  // arc centre for the right half
const GLASS = `M40 ${BASE}V${SPRING}A${RI} ${RI} 0 0 1 115 26A${RI} ${RI} 0 0 1 190 ${SPRING}V${BASE}Z`;

function band(c: [number, number], t0: number, t1: number) {
  const a = pt(c[0], c[1], RI, t0), b = pt(c[0], c[1], RO, t0);
  const d = pt(c[0], c[1], RO, t1), e = pt(c[0], c[1], RI, t1);
  return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}A${RO} ${RO} 0 0 1 ${f(d[0])} ${f(d[1])}L${f(e[0])} ${f(e[1])}A${RI} ${RI} 0 0 0 ${f(a[0])} ${f(a[1])}Z`;
}

type Stone = { d?: string; x?: number; y?: number; w?: number; h?: number; fill: string };

function buildStones(seed: number) {
  const R = rng(seed);
  const tone = () => STONES[Math.floor(R() * STONES.length)];
  const out: Stone[] = [];
  const cutsL = [180, 191, 203, 214, 225, 235];
  for (let k = 0; k < cutsL.length - 1; k++)
    out.push({ d: band(LC, cutsL[k] + (k > 0 ? (R() - 0.5) * 1.5 : 0), cutsL[k + 1]), fill: tone() });
  const cutsR = [305, 315, 326, 337, 349, 360];
  for (let k = 0; k < cutsR.length - 1; k++)
    out.push({ d: band(RC, cutsR[k], cutsR[k + 1] + (k < cutsR.length - 2 ? (R() - 0.5) * 1.5 : 0)), fill: tone() });
  // keystone
  const k1 = pt(LC[0], LC[1], RI, 235), k2 = pt(LC[0], LC[1], RO + 8, 235);
  const k3 = pt(RC[0], RC[1], RO + 8, 305), k4 = pt(RC[0], RC[1], RI, 305);
  out.push({ d: `M${f(k1[0])} ${f(k1[1])}L${f(k2[0])} ${f(k2[1])}L${f(k3[0])} ${f(k3[1])}L${f(k4[0])} ${f(k4[1])}L115 26Z`, fill: "#CFC4AB" });
  // jamb quoins, alternating long and short
  const rows = 6, rh = (BASE - SPRING) / rows;
  for (let r = 0; r < rows; r++) {
    const y = SPRING + r * rh, long = r % 2 === 0, h = rh + (R() - 0.5) * 2;
    out.push({ x: long ? 10 : 17, y, w: long ? 30 : 23, h, fill: tone() });
    out.push({ x: 190, y, w: long ? 23 : 30, h, fill: tone() });
  }
  return out;
}

export default function StoneWindow({ id, seed, cover }: { id: string; seed: number; cover?: string }) {
  const stones = buildStones(seed);
  const clip = `cr-gl-${id}`;
  return (
    <svg viewBox="0 0 230 340" aria-hidden="true">
      <defs>
        <clipPath id={clip}><path d={GLASS} /></clipPath>
      </defs>
      <ellipse cx="115" cy="336" rx="111" ry="5" fill="rgba(0,0,0,.35)" />
      <g filter="url(#cr-grain)" stroke="#4E4337" strokeWidth="1.3" strokeLinejoin="round">
        {stones.map((s, i) =>
          s.d ? <path key={i} d={s.d} fill={s.fill} /> : <rect key={i} x={s.x} y={f(s.y!)} width={s.w} height={f(s.h!)} fill={s.fill} />
        )}
        <rect x="4" y={BASE} width="222" height="14" fill="#C9BDA3" />
        <rect x="4" y={BASE} width="222" height="3" fill="#DDD3BC" stroke="none" />
        <rect x="30" y={BASE + 14} width="18" height="9" fill="#A99B80" />
        <rect x="182" y={BASE + 14} width="18" height="9" fill="#A99B80" />
      </g>
      <g clipPath={`url(#${clip})`}>
        {cover ? (
          <>
            <image href={cover} x="38" y="20" width="156" height={BASE - 18} preserveAspectRatio="xMidYMid slice" />
            <path d={GLASS} fill="none" stroke="rgba(10,6,3,.55)" strokeWidth="7" />
          </>
        ) : (
          <>
            <rect x="38" y="20" width="156" height="290" fill="url(#cr-interior)" />
            <text x="115" y="210" textAnchor="middle" fontSize="7" letterSpacing="1.4" fill="rgba(239,231,216,.45)" fontFamily="Aileron,Helvetica,Arial,sans-serif">
              PROJECT IMAGE
            </text>
            <rect x="38" y="20" width="156" height="290" fill="url(#cr-quarry)" />
            <path d={`M40 ${SPRING + 22}H190M40 ${SPRING + 92}H190`} stroke="#1A120C" strokeWidth="2.4" />
            <path d={GLASS} fill="none" stroke="rgba(10,6,3,.75)" strokeWidth="16" />
            <path d={`M140 40L74 ${BASE}`} stroke="rgba(255,248,230,.07)" strokeWidth="14" />
          </>
        )}
      </g>
      <path d={GLASS} fill="none" stroke="#3E352B" strokeWidth="1.2" />
    </svg>
  );
}

// shared filter + patterns, rendered once on the page
export function StoneWindowDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="cr-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={4} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 .2  0 0 0 0 .15  0 0 0 0 .1  0 0 0 .55 0" result="g" />
          <feComposite in="g" in2="SourceGraphic" operator="in" result="gc" />
          <feBlend in="gc" in2="SourceGraphic" mode="multiply" />
        </filter>
        <linearGradient id="cr-interior" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E7A45" />
          <stop offset=".55" stopColor="#34401F" />
          <stop offset="1" stopColor="#1B2210" />
        </linearGradient>
        <pattern id="cr-quarry" width="18" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 0L18 26M18 0L0 26" stroke="#1E1610" strokeWidth="1.1" fill="none" opacity=".8" />
        </pattern>
      </defs>
    </svg>
  );
}
