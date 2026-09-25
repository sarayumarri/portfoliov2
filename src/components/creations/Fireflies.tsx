"use client";

import { useEffect, useRef } from "react";

/* Creations — firefly canvas */
// soft gold fireflies that wander and gather near the centered window
// gather: drift toward the centered featured window (Creations). false = just wander.
export default function Fireflies({ gather = true }: { gather?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = ref.current!, ctx = cvs.getContext("2d")!, host = cvs.parentElement!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, raf = 0, visible = false, ready = false, targetDirty = true;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let tx = 0, ty = 0;

    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = host.clientWidth; H = host.clientHeight;
      cvs.width = W * dpr; cvs.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      targetDirty = true;
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(host);

    const flies = Array.from({ length: (reduce ? 12 : 24) * (gather ? 1 : 2) }, () => ({
      x: Math.random() * W, y: Math.random() * H, a: Math.random() * 6.28,
      s: 0.2 + Math.random() * 0.4, p: Math.random() * 6.28, r: 1.1 + Math.random() * 1.4,
    }));

    const findTarget = () => {
      const win = host.querySelector('.cr-arch[data-pos="center"] svg');
      if (!win) { tx = W / 2; ty = H / 2; targetDirty = false; return; }
      const a = win.getBoundingClientRect(), h = host.getBoundingClientRect();
      tx = a.left - h.left + a.width / 2; ty = a.top - h.top + a.height * 0.45;
      targetDirty = false;
    };

    const draw = (time: number) => {
      if (!visible || document.visibilityState !== "visible") return;
      if (targetDirty) findTarget();
      ctx.clearRect(0, 0, W, H);
      for (const f of flies) {
        if (!reduce) {
          f.a += (Math.random() - 0.5) * 0.35;
          const dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx, dy) || 1;
          const pull = !gather ? 0 : d > 260 ? 0.012 : -0.004; // drift in, then hover around instead of landing
          f.x += Math.cos(f.a) * f.s + dx * pull * 0.02;
          f.y += Math.sin(f.a) * f.s + dy * pull * 0.02;
          if (f.x < -20) f.x = W + 20; if (f.x > W + 20) f.x = -20;
          if (f.y < -20) f.y = H + 20; if (f.y > H + 20) f.y = -20;
        }
        const glow = 0.3 + 0.7 * Math.max(0, Math.sin(time * 0.002 + f.p));
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 7);
        g.addColorStop(0, `rgba(255,238,170,${0.9 * glow})`);
        g.addColorStop(0.25, `rgba(240,210,110,${0.4 * glow})`);
        g.addColorStop(1, "rgba(240,210,110,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 7, 0, 6.28); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    // pause when scrolled out of view
    const io = new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
      cancelAnimationFrame(raf);
      if (ready && visible && document.visibilityState === "visible") raf = requestAnimationFrame(draw);
    });
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (ready && visible && document.visibilityState === "visible") raf = requestAnimationFrame(draw);
    };
    const mo = new MutationObserver(() => { targetDirty = true; });
    mo.observe(host, { subtree: true, attributes: true, attributeFilter: ["data-pos"] });
    const start = () => {
      ready = true;
      if (visible && document.visibilityState === "visible") raf = requestAnimationFrame(draw);
    };
    const idle = (window as Window & { requestIdleCallback?: (callback: () => void) => number }).requestIdleCallback;
    const idleId = idle ? idle(start) : undefined;
    if (!idle) idleTimer = setTimeout(start, 1500);
    io.observe(host);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (idleId !== undefined) (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idleId);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [gather]);

  return <canvas ref={ref} className="cr-fireflies" aria-hidden="true" />;
}
