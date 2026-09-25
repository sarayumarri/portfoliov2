"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

/* Spells — skill deck */
const FallingSpells = dynamic(() => import("./FallingSpells"), { ssr: false });
const SpellsScene = dynamic(() => import("./SpellsScene"), { ssr: false });

const ACHIEVEMENTS = [
  { name: "3x award winner", detail: "Best App (Kinexis), Best Non-AI Hack (CappuConnect), Best Artistic Direction (Evangeline)" },
  { name: "Went global", detail: "shipped a multilingual React site for a clinic in Barcelona" },
  { name: "Community builder", detail: "organizer at KnightHacks" },
];

const SUITS = [
  {
    key: "clubs",
    img: "/images/spells-clubs.webp",
    title: "Programming Languages",
    icons: [
      { slug: "c", label: "C" },
      { slug: "java", label: "Java" },
      { slug: "js", label: "JavaScript" },
      { slug: "python", label: "Python" },
      { slug: "cpp", label: "C++" },
      { slug: "html", label: "HTML" },
      { slug: "css", label: "CSS" },
    ],
  },
  {
    key: "spades",
    img: "/images/spells-spades.webp",
    title: "Frameworks & Libraries",
    icons: [
      { slug: "react", label: "React" },
      { slug: "flask", label: "Flask" },
      { slug: "tailwind", label: "Tailwind CSS" },
      { slug: "nodejs", label: "Node.js" },
    ],
  },
  {
    key: "hearts",
    img: "/images/spells-hearts.webp",
    title: "Design & Prototype",
    icons: [
      { slug: "figma", label: "Figma" },
      { slug: "ai", label: "Adobe Creative Cloud" },
      { slug: "canva", label: "Canva" },
    ],
  },
  {
    key: "diamonds",
    img: "/images/spells-diamonds.webp",
    title: "Development Tools",
    icons: [
      { slug: "unity", label: "Unity" },
      { slug: "godot", label: "Godot" },
      { slug: "opencv", label: "OpenCV" },
      { slug: "docker", label: "Docker" },
      { slug: "git", label: "Git" },
      { slug: "github", label: "GitHub" },
      { slug: "vscode", label: "VS Code" },
      { slug: "blender", label: "Blender" },
    ],
  },
];

// Every logo from the four cards, used for the falling background.
// Defined out here (not inside the component) so it isn't rebuilt on every render.
const FALLING_LOGOS = SUITS.flatMap((s) => s.icons);

const CLOSED = [
  { x: -18, y: 6, rot: -10 },
  { x: -6, y: 2, rot: -3 },
  { x: 6, y: 0, rot: 4 },
  { x: 18, y: 4, rot: 11 },
];
const OPEN = [
  { x: -195, y: 0, rot: 0 },
  { x: -65, y: 0, rot: 0 },
  { x: 65, y: 0, rot: 0 },
  { x: 195, y: 0, rot: 0 },
];
const CENTER_LIFT = { x: 0, y: 150, rot: 0 };

function LogoItem({ slug, label }: { slug: string; label: string }) {
  return (
    <div className="spell-logo-item">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://skillicons.dev/icons?i=${slug}`}
        alt={label}
        className="spell-logo-img"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div className="spell-logo-fallback">{label}</div>
    </div>
  );
}

export default function Spells() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  // ── message-in-a-bottle scroll ──
  const [rolled, setRolled] = useState(true); // starts rolled up; the bottle (or the scroll) opens it
  const [rockKey, setRockKey] = useState(0); // bumps to restart the roller "rock" animation
  const rolledRef = useRef(true);
  const slotRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);

  // Reserve the scroll's fully-open height (even while rolled up) so the attributes
  // card never jumps when the scroll opens or closes
  useEffect(() => {
    const slot = slotRef.current;
    const scroll = scrollRef.current;
    const sheet = sheetRef.current;
    const intro = introRef.current;
    if (!slot || !scroll || !sheet || !intro) return;
    const hold = () => {
      // rollers + margins (scroll minus the visible sheet) + the paper's natural height
      slot.style.minHeight = scroll.offsetHeight - sheet.offsetHeight + intro.offsetHeight + "px";
    };
    hold();
    const ro = new ResizeObserver(hold);
    ro.observe(intro);
    return () => ro.disconnect();
  }, []);

  function toggleScroll(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !rolledRef.current;
    rolledRef.current = next;
    setRolled(next);
    setRockKey((k) => k + 1);
  }

  function handleCardClick(i: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!open) {
      setOpen(true);
      return;
    }
    setSelected((prev) => (prev === i ? null : i));
  }

  function handleBackgroundClick() {
    setOpen(false);
    setSelected(null);
  }

  return (
    // One screen. Back to front: moonlit scene (sky, moon, wave layers) → falling logos → content.
    // Clicking any empty spot closes the deck.
    <div className="spells-page" onClick={handleBackgroundClick}>
      <SpellsScene />
      <FallingSpells logos={FALLING_LOGOS} />
      <div className="corner-deco tr" />
      <div className="corner-deco bl" />

      <div className="spells-layout">
        {/* ── Left column ── */}
        <div className="spells-left">
          <div className="spells-title-row">
            <h1 className="spells-title">SPELLS</h1>
            <div className="spells-bottle-wrap">
              <button
                type="button"
                className="spells-bottle"
                onClick={toggleScroll}
                aria-expanded={!rolled}
                aria-controls="spells-scroll"
                aria-label={rolled ? "Unroll the message in the bottle" : "Roll up the message"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/spells/bottle.webp" alt="" />
              </button>
            </div>
          </div>
          <div className="spells-subtitle">(skills)</div>

          <div ref={slotRef} className={`spells-scroll-slot${rolled ? " closed" : ""}`}>
            <div
              id="spells-scroll"
              ref={scrollRef}
              className={`spells-scroll${rolled ? " rolled" : ""}`}
              onClick={rolled ? toggleScroll : undefined}
            >
              <div className="spells-roller top" />
              <div className="spells-sheet">
                <div ref={sheetRef}>
                  <p className="spells-intro" ref={introRef}>
                    I&apos;ve picked up most of my skills by making things, trying new tools,
                    and figuring things out along the way. My toolkit has grown through
                    classes, internships, and plenty of side quests, covering everything
                    from development and design to interactive work. Here&apos;s what
                    I&apos;ve got in my spellbook so far.
                  </p>
                </div>
              </div>
              <div key={rockKey} className={`spells-roller bot${rockKey ? " rock" : ""}`} />
            </div>
            <p className="spells-scroll-cta" aria-live="polite">
              {rolled && (
                <>
                  <b>psst…</b> click the bottle (or the rolled scroll) to read my message
                </>
              )}
            </p>
          </div>

          <div className="spells-left-bottom">
            <div className="spells-attrs-panel" onClick={(e) => e.stopPropagation()}>
              <div className="spells-attrs-idx tl">A<span>✦</span></div>
              <div className="spells-attrs-idx br">A<span>✦</span></div>
              <h3 className="spells-attrs-heading">achievements unlocked</h3>
              <div className="spells-achievements">
                {ACHIEVEMENTS.map((achievement) => (
                  <div key={achievement.name} className="spells-achievement-row">
                    <span className="spells-achievement-star" aria-hidden="true">✦</span>
                    <span><b>{achievement.name}</b> &mdash; {achievement.detail}</span>
                  </div>
                ))}
                <div className="spells-achievement-divider" />
                <div className="spells-achievement-row is-locked">
                  <svg className="spells-achievement-lock" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  <span><b className="spells-achievement-locked-name">Launch Evangeline</b> &mdash; in beta, coming soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column: the deck, with its instructions underneath. A lifted card
               drops below the spread and covers them while it is open. ── */}
        <div className="spells-right">
          <div className="spell-deck" onClick={(e) => e.stopPropagation()}>
            {SUITS.map((s, i) => {
              const isSelected = open && selected === i;
              const pose = isSelected ? CENTER_LIFT : open ? OPEN[i] : CLOSED[i];
              return (
                <div
                  key={s.key}
                  className={`spell-card${isSelected ? " lifted" : ""}`}
                  style={{
                    transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.rot}deg) scale(${isSelected ? 2.15 : 1})`,
                    zIndex: isSelected ? 10 : i,
                  }}
                  onClick={(e) => handleCardClick(i, e)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="spell-card-crossfade">
                    <div className={`spell-card-side spell-card-front-side${isSelected ? " is-hidden" : ""}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.img} alt={s.title} className="spell-card-face" />
                    </div>
                    <div className={`spell-card-side spell-card-back-side${isSelected ? "" : " is-hidden"}`}>
                      <div className="spell-back-title">{s.title}</div>
                      <div className="spell-logo-grid">
                        {s.icons.map((icon) => (
                          <LogoItem key={icon.slug} slug={icon.slug} label={icon.label} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="spells-instructions">
            Click the deck to open it, then pick a card to learn about that part of my
            skillset.
          </p>
        </div>
      </div>
    </div>
  );
}
