"use client";

import { useEffect, useRef, useState } from "react";

const EXPERIENCES = [
  {
    org: "Meynde Centro M\u00e9dico",
    role: "Tech and Business Intern",
    dates: "May 2026 - June 2026",
    desc: "I worked on redesigning Meynde's online presence while I was in Barcelona. I mapped out their services, audiences, and site structure in Figma, with a focus on making information easier to navigate for an international, multilingual audience. I then turned the designs into a working React and JavaScript prototype. Since I was working with a healthcare organization, the project also required designing around strict data-security limitations.",
    frame: "frame-ornate1.png",
    frameAspect: 1.26,
    inset: { top: 20.7, bottom: 25.4, left: 15.6, right: 15.3 },
    photos: ["meynde1.jpg", "meynde2.jpg", "meynde3.jpg"],
    side: "right",
    dash: "dash4.png",
  },
  {
    org: "Bank of New York",
    role: "Software Engineering Intern",
    dates: "January 2026 - Present",
    desc: "I built the frontend for Peggy, an internal system that detects and automatically responds to infrastructure issues. Using React and backend APIs, I created a visualization layer for monitoring observability data and tracking system activity in real time. The interface sits on top of a containerized pipeline that can detect and remediate issues in under a minute.",
    frame: "frame-plain-border.png",
    frameAspect: 1.25,
    inset: { top: 8.7, bottom: 21.2, left: 13.6, right: 14.3 },
    photos: ["bny1.jpg"],
    side: "left",
    dash: "dash2.png",
  },
  {
    org: "ReEnvisioning Reality Lab",
    role: "Undergraduate Researcher",
    dates: "January 2026 - September 2026",
    desc: "I helped build a large-scale Unity environment for research on navigation and human-agent interaction. I worked on the city itself, including roads, vehicles, pedestrians, weather, and environmental layouts using EasyRoads3D. I also worked with HDRI rendering and environment systems to make the simulation more realistic.",
    frame: "frame-oval.png",
    frameAspect: 0.73,
    inset: { top: 10.6, bottom: 20.5, left: 11.5, right: 21.6 },
    photos: ["vr1.jpg"],
    side: "right",
    dash: "dash3.png",
  },
  {
    org: "Knight Hacks",
    role: "Hackathon Organizer",
    dates: "January 2026 - Present",
    desc: "I help organize KnightHacks IX, working on event logistics, planning, and attendee experience. For KnightHacks VIII, I led decoration planning and setup for 1,000+ attendees, including purchasing materials and coordinating physical spaces. I supported logistics and day-of operations for BloomHacks, KnightHacks' summer hackathon. I also attended MLH HackCon in New York to connect with organizers and learn from other hackathon communities.",
    frame: "frame-filigree.png",
    frameAspect: 1.23,
    inset: { top: 16.2, bottom: 26.6, left: 18.6, right: 14.5 },
    photos: ["knighthacks-photo.jpg", "kh2.jpg", "kh3.jpg", "kh4.jpg"],
    side: "left",
    dash: "dash1.png",
  },
  {
    org: "Burnett Honors College",
    role: "Hackathon Organizer",
    dates: "May 2025 - December 2025",
    desc: "I served as a Symposium Team Leader and Orientation Ambassador for UCF's Burnett Honors College. I led weekly discussions for 15-20 students and advised 20+ incoming students on academics and course planning. I also supported orientation programming for 200+ students, helping new students transition into the UCF community.",
    frame: "frame-simple.png",
    frameAspect: 1.49,
    inset: { top: 11.1, bottom: 27.5, left: 11.1, right: 27.3 },
    photos: ["bhc1.jpg", "bhc2.jpg"],
    side: "right",
    dash: null,
  },
];

const CYCLE_MS = 3500;

const BLOOM_IMAGES = [
  "flower-pansy.png",
  "flower-buttercup.png",
  "flower-stars.png",
  "flower-spray.png",
];

type Bloom = {
  img: string;
  top: number; // percent down the vine
  inset: number; // px from the side edge
  width: number;
  rotate: number;
  scale: number;
  z: number;
  speed: number;
};

// deterministic seeded RNG so server and client render the exact same
// "random" layout -- Math.random() here would cause hydration mismatches
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeBlooms(seed: number, count: number): Bloom[] {
  const rand = mulberry32(seed);
  const step = 100 / count;
  const blooms: Bloom[] = [];
  for (let i = 0; i < count; i++) {
    const jitter = (rand() - 0.5) * step * 2.2; // wide jitter so neighbors overlap often
    blooms.push({
      img: BLOOM_IMAGES[Math.floor(rand() * BLOOM_IMAGES.length)],
      top: Math.min(99, Math.max(0, i * step + jitter)),
      inset: -22 + rand() * 78,
      width: 66 + rand() * 52,
      rotate: -30 + rand() * 60,
      scale: 0.62 + rand() * 0.48,
      z: 1 + Math.floor(rand() * 5),
      speed: 0.18 + rand() * 0.42,
    });
  }
  return blooms;
}

const BLOOM_COUNT = 36;
const LEFT_BLOOMS = makeBlooms(1337, BLOOM_COUNT);
const RIGHT_BLOOMS = makeBlooms(7331, BLOOM_COUNT);

function FlowerVine({ side, blooms }: { side: "left" | "right"; blooms: Bloom[] }) {
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;

    function apply() {
      const viewportCenter = window.innerHeight / 2;
      blooms.forEach((b, i) => {
        const el = imgRefs.current[i];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distanceFromCenter = rect.top + rect.height / 2 - viewportCenter;
        const offset = Math.max(-220, Math.min(220, -distanceFromCenter * b.speed));
        el.style.transform = `translateY(${offset.toFixed(1)}px)${
          side === "right" ? " scaleX(-1)" : ""
        } rotate(${b.rotate}deg) scale(${b.scale})`;
      });
      rafId = requestAnimationFrame(apply);
    }

    // driven by a continuous rAF loop rather than the "scroll" event --
    // some layouts scroll a nested container instead of window, which
    // would silently never fire a window scroll listener. rAF is
    // agnostic to whatever element is actually scrolling.
    rafId = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`adv-flower-vine adv-flower-vine-${side}`} aria-hidden="true">
      {blooms.map((b, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          ref={(el) => {
            imgRefs.current[i] = el;
          }}
          className="adv-bloom"
          src={`/images/adventures/${b.img}`}
          alt=""
          style={{
            top: `${b.top}%`,
            [side]: b.inset,
            width: b.width,
            zIndex: b.z,
            transform: `${side === "right" ? "scaleX(-1) " : ""}rotate(${b.rotate}deg) scale(${b.scale})`,
          }}
        />
      ))}
    </div>
  );
}

function usePhotoCycle(length: number) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function restart() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (length > 1) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % length);
      }, CYCLE_MS);
    }
  }

  useEffect(() => {
    restart();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  function goTo(next: number) {
    setIndex(next);
    restart();
  }

  return { index, goTo };
}

function AdventurePhoto({
  photos,
  alt,
  inset,
  onExpand,
}: {
  photos: string[];
  alt: string;
  inset: { top: number; bottom: number; left: number; right: number };
  onExpand: (src: string) => void;
}) {
  const { index, goTo } = usePhotoCycle(photos.length);

  return (
    <div
      className="adv-photo-mask"
      style={{
        top: `${inset.top}%`,
        bottom: `${inset.bottom}%`,
        left: `${inset.left}%`,
        right: `${inset.right}%`,
      }}
      onClick={() => onExpand(`/images/adventures/${photos[index]}`)}
      role="button"
      tabIndex={0}
      aria-label={`Expand photo: ${alt}`}
    >
      {photos.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          className={`adv-photo${i === index ? " active" : ""}`}
          src={`/images/adventures/${src}`}
          alt={alt}
        />
      ))}
      {photos.length > 1 && (
        <>
          <button
            className="adv-nav-btn adv-nav-prev"
            onClick={(e) => {
              e.stopPropagation();
              goTo((index - 1 + photos.length) % photos.length);
            }}
            aria-label="Previous photo"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 4l-8 8 8 8" />
            </svg>
          </button>
          <button
            className="adv-nav-btn adv-nav-next"
            onClick={(e) => {
              e.stopPropagation();
              goTo((index + 1) % photos.length);
            }}
            aria-label="Next photo"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 4l8 8-8 8" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export default function Adventures() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // scroll-triggered zoom + bounce reveal, once per row
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      rowRefs.current.forEach((el) => el?.classList.add("adv-in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("adv-in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    rowRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section className="adv-hero">
        <h1 className="adv-title">ADVENTURES</h1>
        <div className="adv-subtitle">(Experience)</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="adv-daisy" src="/images/adventures/daisy.png" alt="" />
      </section>

      <div className="adv-torn-wrap">
        <img
          className="adv-torn"
          src="/images/adventures/paper-transition.png"
          alt=""
        />
      </div>

      <section className="adv-timeline">
        <FlowerVine side="left" blooms={LEFT_BLOOMS} />
        <FlowerVine side="right" blooms={RIGHT_BLOOMS} />
        <div className="adv-timeline-inner">
        <p className="adv-tagline">
          Every knight has a few adventures worth telling. Here are some of the experiences that have shaped my journey so far.
        </p>
        {EXPERIENCES.map((exp, i) => (
          <div
            className={`adv-row adv-row-${exp.side}`}
            key={exp.org}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
          >
            <div className={`adv-frame-outer${exp.frame === "frame-oval.png" ? " oval" : ""}`}>
              <div
                className="adv-frame-ratio"
                style={{ paddingTop: `${(1 / exp.frameAspect) * 100}%` }}
              >
                {exp.photos.length > 0 && (
                  <AdventurePhoto
                    photos={exp.photos}
                    alt={exp.org}
                    inset={exp.inset}
                    onExpand={setLightboxSrc}
                  />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="adv-frame" src={`/images/adventures/${exp.frame}`} alt="" />
              </div>
            </div>
            <div className="adv-text">
              <div className="adv-org">{exp.org}</div>
              <div className="adv-role">
                {exp.role} | {exp.dates}
              </div>
              <p className="adv-desc">{exp.desc}</p>
            </div>
            {exp.dash && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={`adv-dash adv-dash-${i}`}
                src={`/images/adventures/${exp.dash}`}
                alt=""
              />
            )}
          </div>
        ))}
        <p className="adv-edge">You&apos;ve reached the edge of the map.</p>
        </div>
      </section>

      {lightboxSrc && (
        <div className="summon-lightbox" onClick={() => setLightboxSrc(null)}>
          <button
            className="summon-lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxSrc(null);
            }}
            aria-label="Close photo"
          >
            &times;
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt=""
            className="summon-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
