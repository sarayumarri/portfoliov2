"use client";

import { useEffect, useRef, useState } from "react";
import AboutSection from "@/components/AboutSection";

/* Home — hero and player */
const ROLES = ["Developer", "Designer", "Student", "Software Engineer", "Artist", "Researcher"];

export default function Home() {
  const [role, setRole] = useState(ROLES[0]);
  const [roleOpacity, setRoleOpacity] = useState(1);
  const heroRef = useRef<HTMLElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroNameRef = useRef<HTMLHeadingElement>(null);
  const heroRightRef = useRef<HTMLDivElement>(null);

  // Role cycling
  useEffect(() => {
    const id = setInterval(() => {
      setRoleOpacity(0);
      setTimeout(() => {
        setRole((prev) => {
          const idx = ROLES.indexOf(prev);
          return ROLES[(idx + 1) % ROLES.length];
        });
        setRoleOpacity(1);
      }, 400);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  // Cursor star trail
  useEffect(() => {
    const shell = heroRef.current;
    if (!shell) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let lastTrail = 0;

    function spawnTrailStar(x: number, y: number) {
      const star = document.createElement("div");
      star.className = "star-trail";
      const size = 9 + Math.random() * 9;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${x + (Math.random() - 0.5) * 18}px`;
      star.style.top = `${y + (Math.random() - 0.5) * 18}px`;
      shell!.appendChild(star);
      setTimeout(() => star.remove(), 1900);
    }

    function onMove(e: MouseEvent) {
      if (document.visibilityState !== "visible") return;
      const r = shell!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const now = performance.now();
      if (now - lastTrail > 65) {
        lastTrail = now;
        spawnTrailStar(x, y);
      }
    }
    shell.addEventListener("mousemove", onMove);
    return () => {
      shell.removeEventListener("mousemove", onMove);
    };
  }, []);

  // Hero parallax loop
  useEffect(() => {
    const BG_SPEED = 0.32;
    const RIGHT_SPEED = 0.14;
    const NAME_STALL = 170;
    let raf = 0;
    let active = false;
    const schedule = () => {
      if (active && document.visibilityState === "visible") raf = requestAnimationFrame(tick);
    };
    function tick() {
      if (!active || document.visibilityState !== "visible") return;
      const y = window.scrollY;
      if (heroBgRef.current) {
        heroBgRef.current.style.transform = `translate3d(0, ${-y * BG_SPEED}px, 0)`;
      }
      if (heroRightRef.current) {
        heroRightRef.current.style.transform = `translate3d(0, ${-y * RIGHT_SPEED}px, 0)`;
      }
      if (heroNameRef.current) {
        const held = Math.min(y, NAME_STALL);
        heroNameRef.current.style.transform = `translate3d(0, ${held}px, 0)`;
      }
      schedule();
    }
    const io = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      cancelAnimationFrame(raf);
      schedule();
    });
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      schedule();
    };
    if (heroRef.current) io.observe(heroRef.current);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <section className="hero" ref={heroRef}>
      <div className="hero-bg" ref={heroBgRef} />
      <div className="hero-overlay" />
      <div className="corner-deco tr" />
      <div className="corner-deco bl" />
      <div className="hero-top">
        <h1 className="hero-name" ref={heroNameRef}>
          SARAYU
          <br />
          MARRI
        </h1>
        <div className="hero-right" ref={heroRightRef}>
          <div className="hero-role" style={{ opacity: roleOpacity }}>
            {role}
          </div>
        </div>
      </div>
      </section>
      <AboutSection />
    </>
  );
}
