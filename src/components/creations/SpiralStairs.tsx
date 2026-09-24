"use client";

import { useEffect, useRef, useState } from "react";
import { CREATIONS } from "@/data/creations";
import MediaView from "./MediaView";

const THETA = 58;  // degrees between projects
const STEPS = 5;   // stone steps per project
const N = CREATIONS.length;
// pieces of each step: stone block faces + iron railing
const FACES = ["cr-under", "cr-tread", "cr-edge", "cr-riser", "cr-post", "cr-finial", "cr-hand"];
const isLanding = (k: number) => k >= 0 && k <= (N - 1) * STEPS && k % STEPS === 0;
const STEP_KEYS = Array.from({ length: (N - 1) * STEPS + 2 * STEPS + 1 }, (_, i) => i - STEPS);

type Props = { onOpen: (id: string) => void };

export default function SpiralStairs({ onOpen }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const helixRef = useRef<HTMLDivElement>(null);
  const pillarRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const faceRefs = useRef<(HTMLDivElement | null)[]>([]); // FACES.length pieces per step, flat list
  const [active, setActive] = useState(0);
  const [narrow, setNarrow] = useState(false); // phones: only the step you're on plays (saves battery)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const on = () => setNarrow(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const section = sectionRef.current!, helix = helixRef.current!, pillar = pillarRef.current!;
    const geo = { step: 0, small: false };

    // speckled stone texture with chisel marks, drawn once and handed to the CSS
    const tex = (light: boolean, seed: number) => {
      let q = seed; const R = () => (q = (q * 16807) % 2147483647) / 2147483647;
      const c = document.createElement("canvas"); c.width = c.height = 160; const x = c.getContext("2d")!;
      x.fillStyle = light ? "#F2EEE4" : "#E4DDCF"; x.fillRect(0, 0, 160, 160);
      for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${R() < 0.5 ? "70,56,40" : "255,252,244"},${0.05 + R() * 0.12})`; x.fillRect(R() * 160, R() * 160, 1 + R() * 2, 1 + R() * 2); }
      for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(60,46,30,${0.08 + R() * 0.1})`; x.beginPath(); x.arc(R() * 160, R() * 160, 1 + R() * 3, 0, 6.3); x.fill(); }
      x.strokeStyle = "rgba(70,56,40,.16)";
      for (let i = 0; i < 14; i++) { const a = R() * 160, b = R() * 160, l = 8 + R() * 18, t = -0.6 + R() * 0.4; x.beginPath(); x.moveTo(a, b); x.lineTo(a + l * Math.cos(t), b + l * Math.sin(t)); x.stroke(); }
      return `url(${c.toDataURL("image/png")})`;
    };
    section.style.setProperty("--cr-tex-light", tex(true, 7));
    section.style.setProperty("--cr-tex-dark", tex(false, 19));

    // place cards and stone steps around the column
    const layout = () => {
      const w = window.innerWidth, h = window.innerHeight, small = w < 760;
      const cw = small ? Math.min(200, w * 0.5) : Math.min(290, Math.max(220, w * 0.19));
      const ch = cw * 1.42;
      const R = small ? w * 0.56 : Math.min(470, Math.max(300, w * 0.28));
      const step = ch * (small ? 0.9 : 0.64);
      geo.step = step;
      geo.small = small;

      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        c.style.width = cw + "px";
        c.style.height = ch + "px";
        c.style.setProperty("--cr-title", Math.max(18, cw * 0.085) + "px");
        c.style.transform = `translate(-50%,-50%) rotateY(${i * THETA}deg) translateZ(${R * 0.89 + 26}px) translateY(${i * step + 10}px)`;
      });

      const inner = R * 0.17, depth = R * 0.72, outer = inner + depth;
      const seg = THETA / STEPS, dy = step / STEPS, thick = Math.max(dy * 1.6, 22);
      const sw = 2 * outer * Math.tan((seg * Math.PI) / 360) * 1.03;
      const lift = ch / 2 + 30, railH = Math.max(46, dy * 2.4), rO = outer - 5;
      const T = (ang: number, y: number, z: number, extra = "") => `translate(-50%,-50%) rotateY(${ang}deg) translateY(${y}px) translateZ(${z}px) ${extra}`;
      const size = (el: HTMLElement, w: number, h: number) => { el.style.width = w + "px"; el.style.height = h + "px"; };
      STEP_KEYS.forEach((k, idx) => {
        const [under, tread, edge, riser, post, finial, hand] = faceRefs.current.slice(idx * FACES.length, (idx + 1) * FACES.length) as HTMLElement[];
        if (!under) return;
        const fr = k / STEPS, ang = fr * THETA, y = fr * step + lift, land = isLanding(k), wide = land ? sw * 2.1 : sw;
        size(under, wide, depth); under.style.transform = T(ang, y + thick, inner + depth / 2, "rotateX(90deg)");
        size(tread, wide, depth); tread.style.transform = T(ang, y, inner + depth / 2, "rotateX(90deg)");
        size(edge, wide, thick); edge.style.transform = T(ang, y + thick / 2, outer);
        size(riser, depth, dy); riser.style.transform = T(ang + seg / 2, y + dy / 2, inner + depth / 2, "rotateY(90deg)");
        // iron railing: a post on every step, a taller one with a gold finial on each landing
        size(post, land ? 9 : 5, railH); post.style.transform = T(ang, y - railH / 2, rO);
        size(finial, 14, 14); finial.style.transform = T(ang, y - railH - 5, rO);
        if (k < STEP_KEYS[STEP_KEYS.length - 1]) {
          const chord = 2 * rO * Math.sin((seg * Math.PI) / 360), len = Math.hypot(chord, dy) + 2, slope = (Math.atan2(dy, chord) * 180) / Math.PI;
          size(hand, len, 5); hand.style.transform = T(ang + seg / 2, y - railH + dy / 2, rO * Math.cos((seg * Math.PI) / 360), `rotateZ(${slope}deg)`);
        } else hand.style.display = "none";
      });

      pillar.style.width = R * 0.36 + "px";
      pillar.style.height = h * 3 + N * step + "px";
      section.style.height = h + (N - 1) * h * 0.75 + "px";
    };

    const progress = () => {
      const r = section.getBoundingClientRect(), span = section.offsetHeight - window.innerHeight;
      return Math.min(1, Math.max(0, -r.top / span));
    };

    let current = 0, prevT = -1, last = -1, raf = 0;
    const frame = () => {
      const target = progress() * (N - 1);
      current += (target - current) * 0.2;
      if (Math.abs(target - current) < 0.0005) current = target;
      const t = current;
      if (t === prevT) { raf = requestAnimationFrame(frame); return; } // nothing moved, skip the work
      prevT = t;
      helix.style.transform = `translateY(${-t * geo.step}px) rotateY(${-t * THETA}deg)`;
      // only opacity changes per frame (cheap, handled by the GPU)
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        const fall = geo.small ? 0.85 : 0.42, floor = geo.small ? 0.06 : 0.15;
        const o = Math.max(floor, 1 - Math.abs(i - t) * fall).toFixed(2);
        if (c.style.opacity !== o) c.style.opacity = o;
      });
      const a = Math.round(t);
      if (a !== last) { last = a; setActive(a); }
      raf = requestAnimationFrame(frame);
    };

    layout();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", layout);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", layout); };
  }, []);

  const jumpTo = (i: number) => {
    const section = sectionRef.current!;
    const span = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: top + span * (i / (N - 1)), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="cr-spiral" ref={sectionRef} aria-label="All projects, newest first">
      <div className="cr-stage">
        <div className="cr-wall" aria-hidden="true" />
        <div className="cr-stage-head">
          <h2 className="cr-h2">all creations</h2>
          <p>Wind down the tower stairs, newest at the top.</p>
        </div>
        <div className="cr-glow l" aria-hidden="true" />
        <div className="cr-glow r" aria-hidden="true" />
        <div className="cr-tilt">
          <div className="cr-pillar" ref={pillarRef} />
          <div className="cr-helix" ref={helixRef}>
            {CREATIONS.map((p, i) => (
              <article
                key={p.id}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`cr-card${i === active ? " is-active" : ""}`}
                tabIndex={0}
                role="button"
                aria-label={`Open ${p.name}`}
                onClick={() => onOpen(p.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(p.id); } }}
              >
                <div className="cr-card-media">
                  {p.media[0] ? <MediaView src={p.media[0]} alt={p.name} small play={narrow ? i === active : Math.abs(i - active) <= 1} /> : <span className="cr-ph-tag">image or video</span>}
                </div>
                <div className="cr-card-info">
                  <b>{p.name}</b>
                  <div className="cr-row">
                    <span className="cr-date">{p.date}</span>
                    {p.award && <span className="cr-ribbon">{p.award}</span>}
                  </div>
                </div>
              </article>
            ))}
            {STEP_KEYS.flatMap((k, idx) =>
              FACES.map((cls, f) => (cls === "cr-finial" && !isLanding(k)) ? (
                <div key={`${k}-${f}`} ref={(el) => { faceRefs.current[idx * FACES.length + f] = el; }} hidden />
              ) : (
                <div
                  key={`${k}-${f}`}
                  className={`${cls}${cls === "cr-tread" && isLanding(k) ? " landing" : ""}${cls === "cr-post" && isLanding(k) ? " big" : ""}`}
                  ref={(el) => { faceRefs.current[idx * FACES.length + f] = el; }}
                />
              ))
            )}
          </div>
        </div>

        <ol className="cr-rail">
          {CREATIONS.map((p, i) => (
            <li key={p.id}>
              <button type="button" className={i === active ? "on" : ""} onClick={() => jumpTo(i)}>
                {p.name}<small>{p.date}</small>
              </button>
            </li>
          ))}
        </ol>
        <div className="cr-counter" aria-live="polite">
          <span className="cr-counter-n">{String(active + 1).padStart(2, "0")}</span>
          <span className="cr-counter-of"> / {String(N).padStart(2, "0")}</span>
          <span className="cr-counter-hint">scroll to descend</span>
        </div>
      </div>
    </section>
  );
}
