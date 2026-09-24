"use client";

/*
  FallingSpells
  ─────────────
  Your skill logos rain down the Spells page with real physics (matter-js),
  pile up on the bottom edge (right above the footer), and scatter when tapped.

  How it's layered:
    SpellsScene (sky/moon/waves)  (z auto)   ← behind
    this canvas          (z 1)
    text, attributes, shells, deck (z 2)  ← in front, still clickable

  The canvas ignores the mouse (pointer-events: none). We listen for taps on
  the wrapper instead, so card clicks still work normally.
*/

import { useEffect, useRef } from "react";
import type { Body as MatterBody } from "matter-js";

export type FallingLogo = { slug: string; label: string };

type Props = {
  logos: FallingLogo[];
  /** Logo tint. */
  color?: string;
  /** 0–1 */
  opacity?: number;
  /** Soft shadow baked around each logo so light logos still read on white foam. "" = none */
  shadow?: string;
};

type LogoBody = MatterBody & { sprite?: HTMLCanvasElement };

// Taps on these elements don't shove logos (so opening cards feels clean)
const NO_PUSH =
  ".spell-deck, .shell-item-spin, .spells-attrs-panel, .spells-bottle, .spells-scroll, a, button";

export default function FallingSpells({
  logos,
  color = "#E6DDC6", // cream
  opacity = 0.7,
  shadow = "rgba(26, 12, 4, 0.55)", // --leath3
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    let cancelled = false;
    let raf = 0;
    const cleanups: (() => void)[] = [];

    (async () => {
      const Matter = await import("matter-js");
      if (cancelled) return;
      const { Engine, Bodies, Body, Composite } = Matter;

      const ctx = canvas.getContext("2d")!;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const engine = Engine.create({ gravity: { x: 0, y: 1.1 } });
      const world = engine.world;

      let W = host.clientWidth;
      let H = host.clientHeight;
      // Logo size scales with screen width: 46px on phones, up to 80px on desktop
      const size = () => Math.max(46, Math.min(80, W * 0.056));
      let S = size();

      // ── Canvas sizing (1.5x max keeps Safari's graphics memory happy) ──
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      // Pixel memory is reserved in 256px steps and only rebuilt when the page
      // crosses a step, so dragging the window doesn't exhaust Safari's graphics memory.
      const STEP = 256;
      const up = (v: number) => Math.ceil(v / STEP) * STEP;
      let allocW = 0;
      let allocH = 0;
      const fitCanvas = () => {
        const bw = up(W);
        const bh = up(H);
        const grow = bw > allocW || bh > allocH;
        const shrinkALot = bw < allocW - STEP * 2 || bh < allocH - STEP * 2;
        if (!grow && !shrinkALot) return;
        allocW = bw;
        allocH = bh;
        canvas.width = Math.round(allocW * dpr);
        canvas.height = Math.round(allocH * dpr);
        canvas.style.width = allocW + "px"; // extra is clipped by .spells-page's overflow:hidden
        canvas.style.height = allocH + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      fitCanvas();

      // ── Floor + walls (walls extend high so logos can't escape while falling in) ──
      const wallOpts = { isStatic: true };
      let floor = Bodies.rectangle(W / 2, H + 50, W * 3, 100, wallOpts);
      let left = Bodies.rectangle(-50, 0, 100, H * 6, wallOpts);
      let right = Bodies.rectangle(W + 50, 0, 100, H * 6, wallOpts);
      Composite.add(world, [floor, left, right]);

      // ── Tinted sprites: load each SVG, recolor it, and bake in the shadow once ──
      const PX = 192; // render big once, scale down when drawing
      const PAD = 24; // room around the logo for the shadow
      const makeSprite = (src: string) =>
        new Promise<HTMLCanvasElement | undefined>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const tint = document.createElement("canvas");
            tint.width = tint.height = PX;
            const tg = tint.getContext("2d")!;
            tg.drawImage(img, 0, 0, PX, PX);
            tg.globalCompositeOperation = "source-in";
            tg.fillStyle = color;
            tg.fillRect(0, 0, PX, PX);

            const c = document.createElement("canvas");
            c.width = c.height = PX + PAD * 2;
            const g = c.getContext("2d")!;
            if (shadow) {
              g.shadowColor = shadow;
              g.shadowBlur = 14;
              g.shadowOffsetY = 3;
            }
            g.drawImage(tint, PAD, PAD);
            resolve(c);
          };
          img.onerror = () => resolve(undefined);
          img.src = src;
        });
      const sprites = await Promise.all(logos.map((l) => makeSprite(`/logos/${l.slug}.svg`)));
      if (cancelled) return;

      // ── Create the falling bodies ──
      let bodies: LogoBody[] = [];
      const drop = () => {
        bodies.forEach((b) => Composite.remove(world, b));
        const order = logos.map((_, i) => i).sort(() => Math.random() - 0.5);
        bodies = order.map((idx, k) => {
          const x = S + Math.random() * (W - S * 2);
          // Staggered above the top so they rain in one after another.
          // Reduced motion: start them already resting on the floor.
          const perRow = Math.max(1, Math.floor(W / (S * 1.1)));
          const y = reduceMotion ? H - S / 2 - Math.floor(k / perRow) * S : -S - k * S * 0.8;
          const b = Bodies.rectangle(x, y, S, S, {
            chamfer: { radius: S * 0.24 },
            restitution: 0.35,
            friction: 0.4,
            frictionAir: 0.012,
            density: 0.0016,
          }) as LogoBody;
          b.sprite = sprites[idx];
          Body.setAngle(b, (Math.random() - 0.5) * 1.2);
          Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.08);
          return b;
        });
        Composite.add(world, bodies);
      };
      drop();

      // ── Tap to shove + fast cursor sweeps nudge ──
      const toLocal = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      };
      const push = (p: { x: number; y: number }, radius: number, power: number) => {
        bodies.forEach((b) => {
          const dx = b.position.x - p.x;
          const dy = b.position.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d > radius) return;
          const n = d || 1;
          const f = power * (1 - d / radius) * b.mass;
          Body.applyForce(b, b.position, { x: (dx / n) * f, y: (dy / n - 0.6) * f });
          Body.setAngularVelocity(b, b.angularVelocity + (Math.random() - 0.5) * 0.3);
        });
      };
      const onDown = (e: PointerEvent) => {
        if ((e.target as Element).closest(NO_PUSH)) return;
        push(toLocal(e), S * 3.2, 0.06);
      };
      let last: { x: number; y: number } | null = null;
      const onMove = (e: PointerEvent) => {
        const p = toLocal(e);
        if (last) {
          const v = Math.hypot(p.x - last.x, p.y - last.y);
          if (v > 6) push(p, S * 1.3, Math.min(v, 40) * 0.0006);
        }
        last = p;
      };
      const onLeave = () => (last = null);
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        host.removeEventListener("pointerdown", onDown);
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
      });

      // ── Keep floor/walls glued to the page as it resizes
      //    (e.g. the lower section grows when a card is lifted) ──
      let rz = 0;
      const onResize = () => {
        const nW = host.clientWidth;
        const nH = host.clientHeight;
        if (Math.abs(nW - W) < 2 && Math.abs(nH - H) < 2) return;
        W = nW;
        H = nH;
        S = size();
        fitCanvas();
        Composite.remove(world, [floor, left, right]);
        floor = Bodies.rectangle(W / 2, H + 50, W * 3, 100, wallOpts);
        left = Bodies.rectangle(-50, 0, 100, H * 6, wallOpts);
        right = Bodies.rectangle(W + 50, 0, 100, H * 6, wallOpts);
        Composite.add(world, [floor, left, right]);
        // Pull back anything that ended up outside the new bounds
        bodies.forEach((b) => {
          const x = Math.min(Math.max(b.position.x, S), W - S);
          const y = Math.min(b.position.y, H - S);
          if (x !== b.position.x || y !== b.position.y) Body.setPosition(b, { x, y });
        });
      };
      // debounced so the canvas is never re-created mid-animation
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(rz);
        rz = requestAnimationFrame(onResize);
      });
      ro.observe(host);
      cleanups.push(() => {
        ro.disconnect();
        cancelAnimationFrame(rz);
      });

      // ── Pause the simulation while the page section is offscreen ──
      let visible = false;
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible && document.visibilityState === "visible") raf = requestAnimationFrame(loop);
      });
      io.observe(host);
      cleanups.push(() => io.disconnect());

      // ── Draw ──
      const draw = () => {
        ctx.clearRect(0, 0, allocW, allocH);
        ctx.globalAlpha = opacity;
        for (const b of bodies) {
          if (!b.sprite) continue;
          const d = (S - 6) * ((PX + PAD * 2) / PX); // sprite includes shadow padding
          ctx.save();
          ctx.translate(b.position.x, b.position.y);
          ctx.rotate(b.angle);
          ctx.drawImage(b.sprite, -d / 2, -d / 2, d, d);
          ctx.restore();
        }
      };

      let prev = performance.now();
      const loop = (t: number) => {
        if (!visible || document.visibilityState !== "visible") return;
        const dt = Math.min(t - prev, 33);
        prev = t;
        if (visible) {
          Engine.update(engine, dt / 2); // two half-steps = steadier stacking
          Engine.update(engine, dt / 2);
          draw();
        }
        raf = requestAnimationFrame(loop);
      };
      const onVisibility = () => {
        cancelAnimationFrame(raf);
        if (visible && document.visibilityState === "visible") raf = requestAnimationFrame(loop);
      };
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

      cleanups.push(() => {
        Composite.clear(world, false);
        Engine.clear(engine);
      });
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };
  }, [logos, color, opacity, shadow]);

  return <canvas ref={canvasRef} className="falling-spells-canvas" aria-hidden="true" />;
}
