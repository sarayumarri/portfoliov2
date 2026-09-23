"use client";

import { useEffect, useState } from "react";

const PHOTOS = [
  { key: "alaska", src: "/images/summon-photo1.jpg", full: "/images/summon-photo1-full.jpg", label: "Alaska" },
  { key: "trevi", src: "/images/summon-photo2.jpg", full: "/images/summon-photo2-full.jpg", label: "Trevi Fountain, Rome" },
  { key: "eiffel", src: "/images/summon-photo3.jpg", full: "/images/summon-photo3-full.jpg", label: "Eiffel Tower, Paris" },
  { key: "harbor", src: "/images/summon-photo4.jpg", full: "/images/summon-photo4-full.jpg", label: "St. Thomas" },
];

export default function Summons() {
  const [filmOpen, setFilmOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    document.body.classList.add("no-scroll-page");
    return () => document.body.classList.remove("no-scroll-page");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="summon-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="summon-bg" src="/images/summon-bg.jpg" alt="" />
      <div className="summon-overlay" />

      <div className="summon-content">
        <div className="summon-left-col">
          <div className="summon-title-block">
            <div>
              <h1 className="summon-title">SUMMON</h1>
              <div className="summon-subtitle">(Contact me)</div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="summon-flower shell-item-spin" src="/images/summon-flower.png" alt="" />
          </div>

          <form className="summon-form" onSubmit={handleSubmit}>
          <label className="summon-field-label">NAME</label>
          <input
            className="summon-field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Who should I reply to?"
            required
          />

          <label className="summon-field-label">RESPONSE EMAIL / REPLY-TO</label>
          <input
            className="summon-field-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />

          <label className="summon-field-label">NOTE / MESSAGE</label>
          <textarea
            className="summon-field-input summon-field-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a note, question, collaboration idea, or anything worth following up on."
            required
          />

          <div className="summon-form-footer">
            <button className="summon-send-btn" type="submit" disabled={status === "sending"}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4Z" />
              </svg>
              {status === "sending" ? "SENDING..." : "SEND NOTE"}
            </button>
            <div className="summon-form-note">
              {status === "sent" && "Sent. I'll get back to you soon."}
              {status === "error" && "Something went wrong, try again in a moment."}
            </div>
          </div>
        </form>
        </div>

        <div className="summon-camera-wrap">
          <div
            className="summon-camera"
            onClick={() => setFilmOpen((o) => !o)}
            role="button"
            tabIndex={0}
            aria-label="Toggle travel photos"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={filmOpen ? "/images/summon-camera-open.png" : "/images/summon-camera.png"}
              alt="Click to see pictures from my travels"
            />
            {filmOpen &&
              PHOTOS.map((p, i) => (
                <button
                  key={p.key}
                  className={`summon-photo-hotspot photo-${i}`}
                  aria-label={`View full photo: ${p.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(i);
                  }}
                />
              ))}
          </div>
        </div>
      </div>

      {expanded !== null && (
        <div className="summon-lightbox" onClick={() => setExpanded(null)}>
          <button
            className="summon-lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(null);
            }}
            aria-label="Close photo"
          >
            &times;
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PHOTOS[expanded].full}
            alt={PHOTOS[expanded].label}
            className="summon-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
