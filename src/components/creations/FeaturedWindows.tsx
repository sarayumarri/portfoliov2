"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { ALL_BY_ID, FEATURED_IDS } from "@/data/creations";
import StoneWindow from "./StoneWindow";
import MediaView from "./MediaView";

type Props = { onOpen: (id: string) => void };

const IMG = "/images/creations";

// ivy + flower on each window, kept on the outer stone so it never covers the glass
const WIN_DECO: [string, React.CSSProperties, string, React.CSSProperties][] = [
  ["ivy-a", { left: "-30%", top: "-6%", width: "62%", transform: "rotate(-20deg)" }, "flower-cream", { right: "-6%", top: "44%", width: "22%" }],
  ["ivy-b", { right: "-34%", top: "-8%", width: "62%", transform: "scaleX(-1) rotate(-20deg)" }, "flower-pansy", { left: "-8%", top: "58%", width: "20%" }],
  ["ivy-a", { right: "-30%", top: "-6%", width: "62%", transform: "scaleX(-1) rotate(-20deg)" }, "flower-cream", { left: "-6%", top: "50%", width: "20%", transform: "rotate(40deg)" }],
];

// plants down both sides of the wall. depth = parallax strength (bigger moves more).
// back layers sit behind the front ones so they overlap into a thicket.
type Plant = { src: string; side: "left" | "right"; top: string; x: number; w: string; rot: number; flip?: boolean; depth: number; front?: boolean; sway?: boolean };
const PLANTS: Plant[] = [
  // left
  { src: "ivy-b", side: "left", top: "-6%", x: -70, w: "clamp(220px,26vw,360px)", rot: 70, depth: -0.08 },
  { src: "ivy-a", side: "left", top: "-4%", x: -40, w: "clamp(200px,24vw,330px)", rot: 8, depth: 0.12, front: true, sway: true },
  { src: "ivy-a", side: "left", top: "28%", x: -90, w: "clamp(200px,24vw,320px)", rot: 62, depth: -0.14 },
  { src: "flower-trio", side: "left", top: "30%", x: 40, w: "clamp(48px,4.5vw,66px)", rot: -12, depth: 0.2, front: true },
  { src: "ivy-b", side: "left", top: "46%", x: -60, w: "clamp(190px,22vw,300px)", rot: -30, depth: 0.1, front: true, sway: true },
  { src: "flower-pansy", side: "left", top: "58%", x: 70, w: "clamp(40px,3.6vw,54px)", rot: 14, depth: 0.28, front: true },
  { src: "ivy-a", side: "left", top: "70%", x: -50, w: "clamp(180px,20vw,280px)", rot: -58, depth: -0.06 },
  { src: "flower-cream", side: "left", top: "74%", x: 90, w: "clamp(50px,4.6vw,68px)", rot: -6, depth: 0.22, front: true },
  { src: "flower-larkspur", side: "left", top: "78%", x: 20, w: "clamp(56px,5.4vw,80px)", rot: -8, depth: 0.16, front: true },
  // right
  { src: "ivy-a", side: "right", top: "-8%", x: -80, w: "clamp(220px,26vw,360px)", rot: 60, flip: true, depth: -0.1 },
  { src: "ivy-b", side: "right", top: "-4%", x: -40, w: "clamp(200px,24vw,330px)", rot: 10, flip: true, depth: 0.12, front: true, sway: true },
  { src: "flower-trio", side: "right", top: "8%", x: 150, w: "clamp(56px,5vw,74px)", rot: 8, depth: 0.24, front: true },
  { src: "ivy-b", side: "right", top: "34%", x: -90, w: "clamp(200px,23vw,320px)", rot: 64, flip: true, depth: -0.16 },
  { src: "ivy-a", side: "right", top: "48%", x: -50, w: "clamp(190px,22vw,300px)", rot: -26, flip: true, depth: 0.1, front: true, sway: true },
  { src: "flower-cream", side: "right", top: "56%", x: 80, w: "clamp(46px,4.2vw,62px)", rot: 20, depth: 0.3, front: true },
  { src: "ivy-b", side: "right", top: "72%", x: -60, w: "clamp(180px,20vw,280px)", rot: -60, flip: true, depth: -0.06 },
  { src: "flower-buttercup", side: "right", top: "74%", x: 30, w: "clamp(56px,5.5vw,80px)", rot: 6, depth: 0.18, front: true },
  { src: "flower-pansy", side: "right", top: "86%", x: 110, w: "clamp(40px,3.6vw,54px)", rot: -18, depth: 0.26, front: true },
];

export default function FeaturedWindows({ onOpen }: Props) {
  const [center, setCenterRaw] = useState(1);
  const n = FEATURED_IDS.length;
  const setCenter = (i: number) => setCenterRaw(((i % n) + n) % n);

  // swipe / trackpad
  const startX = useRef<number | null>(null);
  const dragged = useRef(false);
  const wheelLock = useRef(0);

  // parallax on the side plants
  const wallRef = useRef<HTMLDivElement>(null);
  const plxRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wall = wallRef.current!;
    let raf = 0, queued = false, visible = false;
    const update = () => {
      queued = false;
      const r = wall.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const off = r.top + r.height / 2 - window.innerHeight / 2; // 0 when the wall is centered on screen
      plxRefs.current.forEach((el, i) => {
        if (el) el.style.transform = `translate3d(0,${(off * PLANTS[i].depth).toFixed(1)}px,0)`;
      });
    };
    const onScroll = () => {
      if (!visible || document.visibilityState !== "visible" || queued) return;
      queued = true;
      raf = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) onScroll();
    });
    const onVisibility = () => { if (document.visibilityState === "visible" && visible) onScroll(); };
    io.observe(wall);
    document.addEventListener("visibilitychange", onVisibility);
    const guardedScroll = () => { if (visible && document.visibilityState === "visible") onScroll(); };
    guardedScroll();
    window.addEventListener("scroll", guardedScroll, { passive: true });
    window.addEventListener("resize", guardedScroll);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", guardedScroll);
      window.removeEventListener("resize", guardedScroll);
    };
  }, []);

  const posOf = (k: number) => {
    const rel = (k - center + n) % n;
    return rel === 0 ? "center" : rel === 1 ? "right" : "left";
  };

  return (
    <div className="cr-wall-band" ref={wallRef}>
      <div className="cr-lace" aria-hidden="true" />

      {/* plants sit in two clipped layers so nothing grows above the lace */}
      {[false, true].map((front) => (
        <div key={String(front)} className={`cr-plants${front ? " front" : ""}`} aria-hidden="true">
          {PLANTS.map((p, i) => !!p.front === front ? (
            <div
              key={i}
              ref={(el) => { plxRefs.current[i] = el; }}
              className={`cr-plx${p.src.startsWith("flower") ? " flower" : ""}`}
              style={{ top: p.top, [p.side]: p.x, width: p.w }}
            >
              <img
                className={p.sway ? "cr-sway" : undefined}
                src={`${IMG}/${p.src}.webp`}
                alt=""
                style={{ transform: `${p.flip ? "scaleX(-1) " : ""}rotate(${p.rot}deg)`, animationDelay: `${-i * 1.3}s` }}
              />
            </div>
          ) : null)}
        </div>
      ))}

      <h2 id="cr-feat-h" className="cr-h2 cr-featured-label">featured</h2>

      <div className="cr-arcade-wrap">
        <button type="button" className="cr-round-btn cr-side-btn prev" aria-label="Previous featured project" onClick={() => setCenter(center - 1)}>&#8249;</button>
        <div
          className="cr-arcade"
          tabIndex={0}
          aria-roledescription="carousel"
          aria-label="Featured projects, use arrow keys to browse"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setCenter(center - 1);
            if (e.key === "ArrowRight") setCenter(center + 1);
          }}
          onPointerDown={(e) => { startX.current = e.clientX; dragged.current = false; }}
          onPointerMove={(e) => {
            if (startX.current !== null && Math.abs(e.clientX - startX.current) > 12) dragged.current = true;
          }}
          onPointerUp={(e) => {
            if (startX.current === null) return;
            const dx = e.clientX - startX.current;
            startX.current = null;
            if (Math.abs(dx) > 40) setCenter(center + (dx < 0 ? 1 : -1));
            setTimeout(() => { dragged.current = false; }, 0);
          }}
          onWheel={(e) => {
            if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 18) return;
            const now = Date.now();
            if (now < wheelLock.current) return;
            wheelLock.current = now + 550;
            setCenter(center + (e.deltaX > 0 ? 1 : -1));
          }}
        >
          {FEATURED_IDS.map((id, k) => {
            const p = ALL_BY_ID[id];
            const pos = posOf(k);
            return (
              <button
                key={id}
                type="button"
                className="cr-arch"
                data-pos={pos}
                aria-label={`${p.name}${pos === "center" ? ", open details" : ", bring to center"}`}
                onClick={() => {
                  if (dragged.current) return;
                  if (pos === "center") onOpen(id);
                  else setCenter(k);
                }}
              >
                <span className="cr-win">
                  <StoneWindow id={id} seed={97 + k * 131} />
                  {p.media[0] && (
                    /* first media item, clipped to the pointed glass; all three windows play */
                    <span className="cr-glass">
                      <MediaView src={p.media[0]} alt={p.name} small />
                      <svg className="cr-glass-rim" viewBox="0 0 150 280" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M0 280V130A150 150 0 0 1 75 0A150 150 0 0 1 150 130V280Z" />
                      </svg>
                    </span>
                  )}
                  <img className="cr-win-deco" src={`${IMG}/${WIN_DECO[k][0]}.webp`} alt="" style={WIN_DECO[k][1]} />
                  <img className="cr-win-deco" src={`${IMG}/${WIN_DECO[k][2]}.webp`} alt="" style={WIN_DECO[k][3]} />
                </span>
                <span className="cr-plaque">
                  <span className="cr-plaque-aw">{p.award}</span>
                  <b>{p.name}</b>
                  <span className="cr-plaque-ev">{p.event || p.date}</span>
                </span>
              </button>
            );
          })}
        </div>
        <button type="button" className="cr-round-btn cr-side-btn next" aria-label="Next featured project" onClick={() => setCenter(center + 1)}>&#8250;</button>
      </div>

      <div className="cr-dots">
        {FEATURED_IDS.map((id, k) => (
          <button key={id} type="button" className={k === center ? "on" : ""} aria-label={`Show ${ALL_BY_ID[id].name}`} onClick={() => setCenter(k)} />
        ))}
      </div>
    </div>
  );
}
