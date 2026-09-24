"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { ALL_BY_ID, PRESENTATION } from "@/data/creations";
import FeaturedWindows from "./FeaturedWindows";
import SpiralStairs from "./SpiralStairs";
import MediaView from "./MediaView";
import { StoneWindowDefs } from "./StoneWindow";
import Fireflies from "./Fireflies";
import brick from "./brick-wall.jpg"; // bundled, so it never 404s

/* Creations — page composition */
const ProjectOverlay = dynamic(() => import("./ProjectOverlay"));

export default function CreationsClient() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useCallback((id: string) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);
  const pres = PRESENTATION;

  return (
    <div className="cr-page" style={{ "--cr-brick": `url(${brick.src})` } as React.CSSProperties}>
      <StoneWindowDefs />

      <div className="cr-top">
        <div className="cr-lights" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => <span key={i} className={`cr-light l${i + 1}`} />)}
        </div>
        <Fireflies />
      <header className="cr-hero">
        <div className="corner-deco tr" aria-hidden="true" />
        <h1 className="adv-title">CREATIONS</h1>
        <div className="adv-subtitle">(Projects)</div>
        <p className="cr-lede">
          Everything I have built so far, from hackathon weekends to semester long games. Tap any window or step to see more.
        </p>
      </header>

      <section className="cr-featured" aria-labelledby="cr-feat-h">
        <FeaturedWindows onOpen={open} />
      </section>

      </div>

      {/* lace seam where the garden wall meets the tower */}
      <div className="cr-seam" aria-hidden="true"><span className="up" /><span className="down" /></div>

      <SpiralStairs onOpen={open} />

      <section className="postcards-sec cr-postcards" aria-labelledby="cr-show-h">
        <div className="quest-divider">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="divider-sword" src="/images/sword-gold.webp" alt="" />
        </div>
        <h2 id="cr-show-h" className="postcards-heading">PRESENTATIONS / OUTREACH</h2>
        <button type="button" className="cr-pres" onClick={() => open(pres.id)}>
          <span className="cr-pres-media">
            {pres.pdfCover ? <MediaView src={pres.pdfCover} alt={`${pres.name} portfolio cover`} /> : pres.media[0] ? <MediaView src={pres.media[0]} alt={pres.name} /> : <span className="cr-ph-tag">image</span>}
          </span>
          <span className="cr-pres-copy">
            <span className="cr-date">{pres.kind} · {pres.date}</span>
            <span className="cr-pres-title">{pres.name}</span>
            <span className="cr-pres-short">{pres.short}</span>
            <span className="cr-open-hint">Open presentation &#8594;</span>
          </span>
        </button>
      </section>

      {openId && ALL_BY_ID[openId] && <ProjectOverlay key={openId} project={ALL_BY_ID[openId]} onClose={close} />}
    </div>
  );
}
