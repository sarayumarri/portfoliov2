"use client";

/*
  SpellsScene
  ───────────
  The moonlit background of the Spells page:
    • night sky + twinkling stars
    • the golden moon (an <img>, so it stays crisp)
    • your watercolor waves, split into 3 layers (back crests, middle swell,
      front foam). Each layer drifts/bobs on its own and repeats across the
      page with a soft blended seam.
    • the front foam runs all the way down to the footer

  Parallax (scroll): the sky and moon move slowest, then the back and middle
  waves; the front foam moves with the page.

  Everything is drawn on ONE canvas at max 1.5x resolution. Safari has a
  fairly low graphics-memory budget, and several full-page 2x canvases were
  what made the background vanish in the preview.
*/

import { useEffect, useRef } from "react";

// ── Tweak here ───────────────────────────────────────────────
const PALE = "#E6DDC6"; // cream, same as .spells-page
const WAVES = [
  // ax/ay = drift/bob in px · sp = speed · off = horizontal start · scroll = parallax
  { src: "/images/spells/wave-back.webp", ax: 12, ay: 3, sp: 0.00035, ph: 0, off: -0.18, scroll: 0.28 },
  { src: "/images/spells/wave-mid.webp", ax: 20, ay: 5, sp: 0.00048, ph: 2.1, off: -0.52, scroll: 0.12 },
  { src: "/images/spells/wave-front.webp", ax: 30, ay: 7, sp: 0.00062, ph: 4.2, off: -0.34, scroll: 0 },
];
// Deep night blue-green (#1B2A2E), sitting between your greens and the sea; a touch lighter at the horizon
const SKY = ["#141F22", "#1B2A2E", "#324649"];
// Wave see-through (back → front)
const WAVE_ALPHA = [0.9, 0.94, 0.97];
// Recolors the watercolor into a deep ocean blue-teal (keeps all the brush detail). "" = off
const WAVE_TINT = "rgba(24, 66, 104, 0.6)";
// Faint cream mist over the waves to calm the contrast
const MIST = "rgba(239, 231, 216, 0.05)";
const SKY_SCROLL = 0.55;
const MOON_SCROLL = 0.5;
const SEAM = 280 / 1554; // width of the soft fade baked into the left edge of each wave image
// ─────────────────────────────────────────────────────────────

type Star = { x: number; y: number; s: number; p: number; v: number };

export default function SpellsScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moonRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

    const layers = WAVES.map((w) => {
      const img = new Image();
      img.src = w.src;
      return { ...w, img };
    });

    let cw = 0;
    let ch = 0;
    let stars: Star[] = [];

    // The canvas's pixel memory is reserved in 256px steps and only rebuilt when the
    // page crosses a step. Rebuilding it on every frame of a window resize is what
    // made Safari run out of graphics memory and blank the scene.
    const STEP = 256;
    const up = (v: number) => Math.ceil(v / STEP) * STEP;
    let allocW = 0;
    let allocH = 0;
    const alloc = () => {
      const bw = up(cw);
      const bh = up(ch);
      const grow = bw > allocW || bh > allocH;
      const shrinkALot = bw < allocW - STEP * 2 || bh < allocH - STEP * 2;
      if (!grow && !shrinkALot) return;
      allocW = bw;
      allocH = bh;
      canvas.width = Math.round(allocW * DPR);
      canvas.height = Math.round(allocH * DPR);
      canvas.style.width = allocW + "px"; // extra is clipped by .spells-page's overflow:hidden
      canvas.style.height = allocH + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (Math.abs(w - cw) < 2 && Math.abs(h - ch) < 2) return; // only when the size really changed
      cw = w;
      ch = h;
      alloc();
      stars = Array.from({ length: Math.round((cw * ch * 0.6) / 5200) }, () => ({
        x: Math.random() * cw,
        y: Math.random() * ch * 0.6,
        s: Math.random() * 1.3 + 0.3,
        p: Math.random() * 6.28,
        v: 0.6 + Math.random() * 1.4,
      }));
    };
    resize();

    // debounce: never re-create the canvas mid-animation
    let rz = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rz);
      rz = requestAnimationFrame(resize);
    });
    ro.observe(host);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);

    const draw = (t: number) => {
      const tt = reduce ? 0 : t;
      const sy = Math.max(0, window.scrollY);

      // sky
      const g = ctx.createLinearGradient(0, 0, 0, ch * 0.62);
      g.addColorStop(0, SKY[0]);
      g.addColorStop(0.55, SKY[1]);
      g.addColorStop(1, SKY[2]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // stars
      ctx.fillStyle = "#f4efdc";
      const oy = sy * SKY_SCROLL;
      for (const s of stars) {
        ctx.globalAlpha = reduce ? 0.7 : 0.45 + 0.45 * Math.sin(tt * 0.001 * s.v + s.p);
        ctx.beginPath();
        ctx.arc(s.x, s.y + oy, s.s, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (moonRef.current) moonRef.current.style.transform = `translate3d(0, ${sy * MOON_SCROLL}px, 0)`;

      // waves: start a third of the way down (a bit higher when the columns stack)
      const top = cw < 1100 ? 0.22 : 0.33;
      const y0 = ch * top;
      // tall enough that the front foam runs past the bottom edge, down to the footer
      const th = ch - y0 + 24;

      layers.forEach((L, i) => {
        if (!L.img.complete || !L.img.naturalWidth) return;
        const tw = th * (L.img.naturalWidth / L.img.naturalHeight);
        const step = tw * (1 - SEAM);
        const dx = Math.sin(tt * L.sp + L.ph) * L.ax;
        const dy = Math.sin(tt * L.sp * 1.3 + L.ph) * L.ay + sy * L.scroll;
        if (i === layers.length - 1) {
          // pale blue sits *behind* the front foam, so no gap ever shows under it
          ctx.fillStyle = PALE;
          ctx.fillRect(0, y0 + th * 0.8 + dy, cw, ch);
        }
        let x = L.off * tw + dx;
        while (x > 0) x -= step;
        ctx.globalAlpha = WAVE_ALPHA[i] ?? 1;
        for (; x < cw; x += step) ctx.drawImage(L.img, x, y0 + dy, tw, th);
        ctx.globalAlpha = 1;
      });

      // shift the waves into the green palette (hue only, the watercolor detail stays)
      if (WAVE_TINT) {
        ctx.globalCompositeOperation = "color";
        const tint = ctx.createLinearGradient(0, y0 - 20, 0, y0 + th * 0.2);
        tint.addColorStop(0, WAVE_TINT.replace(/[\d.]+\)$/, "0)"));
        tint.addColorStop(1, WAVE_TINT);
        ctx.fillStyle = tint;
        ctx.fillRect(0, y0 - 20, cw, ch - y0 + 20);
        ctx.globalCompositeOperation = "source-over";
      }

      // faint mist over the waves, fading in so it has no top edge
      const mist = ctx.createLinearGradient(0, y0, 0, y0 + th * 0.35);
      mist.addColorStop(0, "rgba(239, 231, 216, 0)");
      mist.addColorStop(1, MIST);
      ctx.fillStyle = mist;
      ctx.fillRect(0, y0, cw, ch - y0);

    };

    let raf = 0;
    const loop = (t: number) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(rz);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="spells-scene" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={moonRef} className="spells-moon" src="/images/spells/moon.webp" alt="" />
    </>
  );
}
