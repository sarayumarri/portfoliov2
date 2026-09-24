"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Fireflies from "@/components/creations/Fireflies";

const RUMORS = [
  "Electric guitar player, occasionally joined by my violinist brother for covers.",
  "Musical theatre has a special place in my heart, seeing Hadestown on Broadway changed my life.",
  "Reptile enthusiast and former turtle owner.",
  "Horror is my favorite genre, despite being completely defenseless against jumpscares.",
  "Fantasy has always been my favorite escape, especially stories about knights and sorcerers.",
  "Somehow, everything becomes a side quest.",
];

const POSTCARDS = [
  {
    key: "wander",
    title: "Wander",
    img: "/images/wander.webp",
    desc: "Interning in Barcelona was what really sparked my love for travel. Since then, I've become especially drawn to solo travel and the freedom of finding my own way through unfamiliar places. Alaska and France are two of my favorite places I've visited, and Iceland is my dream trip.",
  },
  {
    key: "feel",
    title: "Feel",
    img: "/images/feel.webp",
    desc: "I've loved Conan Gray since middle school, so seeing him live on the Wishbone World Tour felt like a dream come true. I've always adored live music, the feeling of being surrounded by thousands of people who are all experiencing the same song together is something I never want to take for granted.",
  },
  {
    key: "create",
    title: "Create",
    img: "/images/create.webp",
    desc: "I've always been an artist, building multiple portfolios throughout high school and experimenting with everything from digital art and photography to sculpture and painting. I'm just as fascinated by the art that already exists, and I love traveling to see pieces I admire in person, Van Gogh is my favorite artist.",
  },
  {
    key: "connect",
    title: "Connect",
    img: "/images/connect.webp",
    desc: "I believe the people you meet and the communities you build can shape your entire experience. From mentoring students as they found their place in college to now helping build the hacker community as a hackathon organizer, I want to create the kind of spaces where people can find their people and, when representation is hard to find, be that representation for someone else.",
  },
  {
    key: "discover",
    title: "Discover",
    img: null,
    desc: "This one's still being written, check back soon.",
  },
];

// Each column drifts up/down at its own speed as the section scrolls
// through the viewport (see the scroll-linked effect below), so the two
// columns on each side criss-cross rather than moving together.
const ARTIST_COLUMNS = [
  {
    key: "col-1",
    side: "left" as const,
    speed: -0.55,
    offsetClass: "",
    photos: ["artist-1", "artist-2", "artist-3"],
  },
  {
    key: "col-2",
    side: "left" as const,
    speed: 0.7,
    offsetClass: "col-offset-down",
    photos: ["artist-4", "artist-5", "artist-6"],
  },
  {
    key: "col-3",
    side: "right" as const,
    speed: 0.5,
    offsetClass: "col-offset-up",
    photos: ["artist-7", "artist-8", "artist-9"],
  },
  {
    key: "col-4",
    side: "right" as const,
    speed: -0.8,
    offsetClass: "",
    photos: ["artist-10", "artist-11", "artist-12"],
  },
];

// homepage photos, in desktop order. w/h keep each photo's real proportions.
const ARTIST_PHOTOS: Record<string, { src: string; w: number; h: number; alt: string }> = {
  "artist-1": { src: "/images/about/profile1.webp", w: 1200, h: 900, alt: "Iced matcha and chai lattes on silver saucers" },
  "artist-2": { src: "/images/about/profile2.webp", w: 900, h: 1200, alt: "Selfie on a cruise deck in Alaska with snowy mountains behind" },
  "artist-3": { src: "/images/about/profile3.webp", w: 900, h: 1200, alt: "Selfie with two friends holding iced drinks" },
  "artist-4": { src: "/images/about/profile4.webp", w: 1199, h: 1199, alt: "The Orangerie gardens at Versailles" },
  "artist-5": { src: "/images/about/profile5.webp", w: 945, h: 1200, alt: "Digital self portrait" },
  "artist-6": { src: "/images/about/profile6.webp", w: 770, h: 592, alt: "Humpback whale statue fountain in Juneau" },
  "artist-7": { src: "/images/about/profile7.webp", w: 1189, h: 1200, alt: "Glacier moulin and meltwater stream" },
  "artist-8": { src: "/images/about/profile8.webp", w: 791, h: 1200, alt: "Posing with someone in an inflatable koala costume" },
  "artist-9": { src: "/images/about/profile9.webp", w: 900, h: 1200, alt: "On a cruise ship deck at dusk in a green floral dress" },
  "artist-10": { src: "/images/about/profile10.webp", w: 738, h: 1200, alt: "Selfie in a helicopter with a headset on" },
  "artist-11": { src: "/images/about/profile11.webp", w: 1200, h: 1130, alt: "With a friend at Park Güell, Barcelona" },
  "artist-12": { src: "/images/about/profile12.webp", w: 738, h: 1200, alt: "Walking through a museum gallery" },
};

const BAG_ITEMS = [
  { key: "coffee", img: "/images/bag/coffee.webp", x: -128, y: -81, w: 100, rot: -8 },
  { key: "headphones", img: "/images/bag/headphones.webp", x: 124, y: -72, w: 120, rot: 10 },
  { key: "macbook", img: "/images/bag/macbook.webp", x: -120, y: 102, w: 144, rot: -6 },
  { key: "bunny", img: "/images/bag/bunny.webp", x: 130, y: 98, w: 73, rot: 12 },
];

export default function AboutSection() {
  const [rumorIdx, setRumorIdx] = useState(0);
  const [rumorVisible, setRumorVisible] = useState(true);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [openArtistPhoto, setOpenArtistPhoto] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const artistSecRef = useRef<HTMLElement | null>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);

  function showRumor(idx: number) {
    setRumorVisible(false);
    setTimeout(() => {
      setRumorIdx(idx);
      setRumorVisible(true);
    }, 250);
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRumorIdx((prev) => {
        const next = (prev + 1) % RUMORS.length;
        showRumor(next);
        return prev;
      });
    }, 5000);
  }

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // column ticker: nudge each artist-photo column up/down as the section
  // scrolls through the viewport, each at its own speed/direction so the
  // columns criss-cross instead of moving as one block.
  const updateColumns = useCallback(() => {
    const sec = artistSecRef.current;
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    const vh = window.innerHeight;
    const center = rect.top + rect.height / 2;
    const raw = (vh / 2 - center) / (vh / 2 + rect.height / 2);
    const p = Math.max(-1, Math.min(1, raw));
    const RANGE = 130;
    columnRefs.current.forEach((el, i) => {
      if (!el) return;
      const speed = ARTIST_COLUMNS[i]?.speed ?? 0;
      el.style.transform = `translateY(${p * RANGE * speed}px)`;
    });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    let visible = false;
    function onScroll() {
      if (visible && document.visibilityState === "visible" && !ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          if (visible && document.visibilityState === "visible") updateColumns();
        });
      }
    }
    const section = artistSecRef.current;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) onScroll();
    });
    const onVisibility = () => { if (document.visibilityState === "visible" && visible) onScroll(); };
    if (section) io.observe(section);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateColumns]);

  return (
    <>
      {/* one continuous green backdrop (same drifting light + fireflies as the Creations page top) */}
      <div className="home-green">
        <div className="cr-lights" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => <span key={i} className={`cr-light l${i + 1}`} />)}
        </div>
        <Fireflies gather={false} />
      <section className="about-sec">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image
          className="about-static-img"
          src="/images/about-static.webp"
          width={1366}
          height={1053}
          alt="About Me: Sarayu Marri, Computer Science and Digital Media student at UCF Burnett Honors College, 2x BNY, Meynde, Knight Hacks org, XR researcher. Class Multiclass, Speciality Interactive Experiences, Guild University of Central Florida, Quest Bring ideas to life."
        />
      </section>

      <section className="artist-sec" ref={artistSecRef}>
        <div className="artist-photo-field artist-photo-field-left">
          {ARTIST_COLUMNS.filter((c) => c.side === "left").map((col) => (
            <div
              key={col.key}
              ref={(el) => {
                columnRefs.current[ARTIST_COLUMNS.indexOf(col)] = el;
              }}
              className={`artist-col${col.offsetClass ? ` ${col.offsetClass}` : ""}`}
            >
              {col.photos.map((photoKey) => (
                <button
                  key={photoKey}
                  type="button"
                  className="artist-photo-thumb"
                  onClick={() => setOpenArtistPhoto(photoKey)}
                  aria-label={`Open photo: ${ARTIST_PHOTOS[photoKey].alt}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ARTIST_PHOTOS[photoKey].src}
                    alt=""
                    width={ARTIST_PHOTOS[photoKey].w}
                    height={ARTIST_PHOTOS[photoKey].h}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          ))}
        </div>

        <p className="artist-bio">
          Outside of tech, I&apos;m an{" "}
          <span className="artist-highlight">artist at heart</span> and love
          creating across different mediums, with digital art and sculpture
          being some of my favorites. Lately, I&apos;ve also been getting
          into photography while traveling and finding little details worth
          capturing. I&apos;m a cartoon fanatic, a huge fan of autumn and
          Halloween, and will probably get a little too excited when pumpkin
          spice season rolls around. I&apos;m naturally curious and love
          getting absorbed in whatever catches my interest, whether
          that&apos;s a new place, a creative project, or a random
          conversation.
        </p>

        <div className="artist-photo-field artist-photo-field-right">
          {ARTIST_COLUMNS.filter((c) => c.side === "right").map((col) => (
            <div
              key={col.key}
              ref={(el) => {
                columnRefs.current[ARTIST_COLUMNS.indexOf(col)] = el;
              }}
              className={`artist-col${col.offsetClass ? ` ${col.offsetClass}` : ""}`}
            >
              {col.photos.map((photoKey) => (
                <button
                  key={photoKey}
                  type="button"
                  className="artist-photo-thumb"
                  onClick={() => setOpenArtistPhoto(photoKey)}
                  aria-label={`Open photo: ${ARTIST_PHOTOS[photoKey].alt}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ARTIST_PHOTOS[photoKey].src}
                    alt=""
                    width={ARTIST_PHOTOS[photoKey].w}
                    height={ARTIST_PHOTOS[photoKey].h}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          ))}
        </div>

        {openArtistPhoto && (
          <div className="artist-photo-overlay" onClick={() => setOpenArtistPhoto(null)}>
            <div className="artist-photo-window" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="artist-photo-close"
                onClick={() => setOpenArtistPhoto(null)}
                aria-label="Close photo"
              >
                &times;
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ARTIST_PHOTOS[openArtistPhoto].src}
                alt={ARTIST_PHOTOS[openArtistPhoto].alt}
                width={ARTIST_PHOTOS[openArtistPhoto].w}
                height={ARTIST_PHOTOS[openArtistPhoto].h}
              />
            </div>
          </div>
        )}
      </section>

      <section className="stats-sec">
        <div className="stats-ombre" />
        <div className="stats-grid">
          <div className="rumors-col">
            <h3 className="stats-heading script">Local Rumors</h3>
            <div
              className="rumor-box"
              onClick={() => {
                showRumor((rumorIdx + 1) % RUMORS.length);
                resetTimer();
              }}
            >
              <div className="rumor-quote">&ldquo;</div>
              <p className="rumor-text" style={{ opacity: rumorVisible ? 1 : 0 }}>
                {RUMORS[rumorIdx]}
              </p>
              <div className="rumor-dots">
                {RUMORS.map((_, i) => (
                  <span key={i} className={`rumor-dot${i === rumorIdx ? " on" : ""}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="bag-col">
            <h3 className="stats-heading script">What&apos;s in my bag?</h3>
            <div
              className={`bag-stage${bagOpen ? " open" : ""}`}
              onClick={() => setBagOpen((prev) => !prev)}
              role="button"
              tabIndex={0}
              aria-label="Reveal what's in my bag"
            >
              {BAG_ITEMS.map((item) => (
                <div
                  key={item.key}
                  className="bag-item-pos"
                  style={{
                    width: item.w,
                    transform: bagOpen
                      ? `translate(-50%, -50%) translate(${item.x}px, ${item.y}px) scale(1)`
                      : "translate(-50%, -50%) translate(0px, 0px) scale(0.2)",
                    opacity: bagOpen ? 1 : 0,
                  }}
                >
                  <div className="bag-item-spin">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.img}
                      alt={item.key}
                      loading="lazy"
                      style={{ transform: `rotate(${item.rot}deg)` }}
                    />
                  </div>
                </div>
              ))}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="bag-main" src="/images/bag/bag.webp" alt="My bag" loading="lazy" />
            </div>
            <p className="bag-hint">
              {bagOpen ? "Click to put it all away" : "Click to find out!"}
            </p>
          </div>
        </div>
      </section>
      </div>

      <section className="postcards-sec">
        <div className="quest-divider">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/sword-gold.webp" className="divider-sword" alt="" loading="lazy" />
        </div>
        <h2 className="postcards-heading">POSTCARDS FROM MY JOURNEY</h2>

        <div className="postcard-row">
          {POSTCARDS.map((p) => (
            <div key={p.key} style={{ display: "contents" }}>
              <div
                className={`pcard${p.img ? "" : " locked"}${activeCard === p.key ? " active" : ""}`}
                onClick={() => setActiveCard(activeCard === p.key ? null : p.key)}
              >
                <div className="pcard-img-wrap">
                  {p.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.img} alt={p.title} loading="lazy" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 1.8-2 3.5" />
                      <circle cx="12" cy="16.5" r=".6" fill="currentColor" stroke="none" />
                    </svg>
                  )}
                </div>
                <div className="pcard-label">{p.title}</div>
              </div>
              <div className={`detail-panel${activeCard === p.key ? " active" : ""}`}>
                <div className="detail-inner">
                  <button className="detail-close" onClick={() => setActiveCard(null)}>
                    &times;
                  </button>
                  <div className="detail-title">{p.title}</div>
                  <p className={`detail-desc${p.key === "discover" ? " placeholder" : ""}`}>
                    {p.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
