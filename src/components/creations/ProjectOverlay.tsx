"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TEAM_LINKS, type Creation } from "@/data/creations";
import MediaView from "./MediaView";

/* Creations — project overlay */
export default function ProjectOverlay({ project, onClose }: { project: Creation; onClose: () => void }) {
  const slides = project.media;
  const count = slides.length;
  const [img, setImgRaw] = useState(0);
  const setImg = (i: number) => count && setImgRaw(((i % count) + count) % count);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const startX = useRef<number | null>(null);

  // lock page scroll, focus close, restore focus after
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = prevOverflow; prev?.focus?.(); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (count > 1 && e.key === "ArrowLeft") setImgRaw((i) => (i - 1 + count) % count);
      if (count > 1 && e.key === "ArrowRight") setImgRaw((i) => (i + 1) % count);
      if (e.key === "Tab" && panelRef.current) {
        const f = Array.from(panelRef.current.querySelectorAll<HTMLElement>("button,a[href],iframe"));
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, onClose]);

  const meta = [project.date, project.event, project.kind].filter(Boolean).join(" · ");

  return (
    <div className="cr-ov" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cr-panel" role="dialog" aria-modal="true" aria-labelledby="cr-ov-title" ref={panelRef}>
        <button type="button" className="cr-close" aria-label="Close" onClick={onClose} ref={closeRef}>&times;</button>

        <div className="cr-gallery">
          {project.pdfPages ? (
            /* the portfolio itself, scrollable right here (as page images so it works on every browser and phone) */
            <div className="cr-pdf" tabIndex={0} aria-label={`${project.name} portfolio, ${project.pdfPages.length} pages`}>
              {project.pdfPages.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt={`Portfolio page ${i + 1}`} loading={i < 2 ? "eager" : "lazy"} />
              ))}
            </div>
          ) : (
            <>
              <div
                className="cr-shot"
                onPointerDown={(e) => { startX.current = e.clientX; }}
                onPointerUp={(e) => {
                  if (startX.current === null) return;
                  const dx = e.clientX - startX.current;
                  startX.current = null;
                  if (Math.abs(dx) > 40) setImg(img + (dx < 0 ? 1 : -1));
                }}
              >
                {slides[img] && <MediaView key={slides[img]} src={slides[img]} alt={`${project.name}, ${img + 1} of ${count}`} />}
                {count > 1 && (
                  <>
                    <button type="button" className="cr-g-btn cr-g-prev" aria-label="Previous" onClick={() => setImg(img - 1)}>&#8249;</button>
                    <button type="button" className="cr-g-btn cr-g-next" aria-label="Next" onClick={() => setImg(img + 1)}>&#8250;</button>
                    <span className="cr-g-count">{img + 1} / {count}</span>
                  </>
                )}
              </div>
              {count > 1 && (
                <div className="cr-thumbs" style={{ gridTemplateColumns: `repeat(${Math.max(count, 4)}, minmax(0,1fr))` }}>
                  {slides.map((src, i) => (
                    <button key={src} type="button" className={i === img ? "on" : ""} aria-label={`Show ${i + 1} of ${count}`} onClick={() => setImg(i)}>
                      <MediaView src={src} thumb />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="cr-detail">
          <div className="cr-row">
            <span className="cr-date">{meta}</span>
            {project.award && <span className="cr-ribbon">{project.award}</span>}
          </div>
          <h3 id="cr-ov-title">{project.name}</h3>
          <p className="cr-desc">{project.desc}</p>
          <div>
            <p className="cr-lbl">Team</p>
            <p className="cr-team">
              {project.team
                ? project.team.map((name, i) => (
                    <span key={name}>
                      {TEAM_LINKS[name] ? (
                        <a className="cr-team-link" href={TEAM_LINKS[name]} target="_blank" rel="noopener noreferrer" aria-label={`${name} on LinkedIn (opens in a new tab)`}>{name}</a>
                      ) : name}
                      {i < project.team!.length - 1 && ", "}
                    </span>
                  ))
                : "Solo project"}
            </p>
          </div>
          <div>
            <p className="cr-lbl">Built with</p>
            <div className="cr-tags">{project.tags.map((t) => <span key={t}>{t}</span>)}</div>
          </div>
          {project.link?.url && (
            project.link.url.startsWith("/") ? (
              <Link className="cr-cta" href={project.link.url} target="_blank" rel="noopener">
                {project.link.label} <span aria-hidden="true">&#8599;</span>
              </Link>
            ) : (
              <a className="cr-cta" href={project.link.url} target="_blank" rel="noopener">
                {project.link.label} <span aria-hidden="true">&#8599;</span>
              </a>
            )
          )}
        </div>
      </div>
    </div>
  );
}
