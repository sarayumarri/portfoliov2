"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import TurnstileField from "../../components/TurnstileField";

/* Summons — contact form */
const PHOTOS = [
  { key: "alaska", src: "/images/summon-photo1.webp", full: "/images/summon-photo1-full.webp", label: "Alaska" },
  { key: "trevi", src: "/images/summon-photo2.webp", full: "/images/summon-photo2-full.webp", label: "Trevi Fountain, Rome" },
  { key: "eiffel", src: "/images/summon-photo3.webp", full: "/images/summon-photo3-full.webp", label: "Eiffel Tower, Paris" },
  { key: "harbor", src: "/images/summon-photo4.webp", full: "/images/summon-photo4-full.webp", label: "St. Thomas" },
];

export default function Summons() {
  const [filmOpen, setFilmOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [company, setCompany] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const turnstileRef = useRef<TurnstileInstance>(null);
  const tokenRef = useRef("");
  const tokenWaiters = useRef<Array<(token: string) => void>>([]);

  function handleToken(nextToken: string) {
    tokenRef.current = nextToken;
    if (nextToken) {
      tokenWaiters.current.splice(0).forEach((resolve) => resolve(nextToken));
    } else if (tokenWaiters.current.length) {
      tokenWaiters.current.splice(0).forEach((resolve) => resolve(""));
    }
  }

  useEffect(() => {
    document.body.classList.add("no-scroll-page");
    return () => document.body.classList.remove("no-scroll-page");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const readyToken = tokenRef.current || await new Promise<string>((resolve) => {
        tokenWaiters.current.push(resolve);
      });
      if (!readyToken) throw new Error("Couldn\'t verify you\'re human. Try again.");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company, turnstileToken: readyToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong, try again in a moment.");
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong, try again in a moment.");
      setStatus("error");
    } finally {
      turnstileRef.current?.reset();
      handleToken("");
    }
  }

  return (
    <section className="summon-hero">
      <Image className="summon-bg" src="/images/summon-bg.webp" alt="" fill sizes="100vw" priority />
      <div className="summon-overlay" />

      <div className="summon-content">
        <div className="summon-left-col">
          <div className="summon-title-block">
            <div>
              <h1 className="summon-title">SUMMON</h1>
              <div className="summon-subtitle">(Contact me)</div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="summon-flower shell-item-spin" src="/images/summon-flower.webp" alt="" />
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

          {/* honeypot */}
          <div className="hp-field" aria-hidden="true">
            <label>
              Company
              <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
            </label>
          </div>

          <TurnstileField ref={turnstileRef} onToken={handleToken} />

          <div className="summon-form-footer">
            <button className="summon-send-btn" type="submit" disabled={status === "sending"}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4Z" />
              </svg>
              {status === "sending" ? "Sending…" : "SEND NOTE"}
            </button>
            <div className="summon-form-note">
              {status === "sent" && "Sent. I'll get back to you soon."}
              {status === "error" && errorMsg}
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
            <Image
              src={filmOpen ? "/images/summon-camera-open.webp" : "/images/summon-camera.webp"}
              alt="Click to see pictures from my travels"
              width={392}
              height={290}
              sizes="(max-width: 560px) 78vw, 18vw"
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