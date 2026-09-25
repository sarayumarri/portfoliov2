"use client";

import { useEffect, useRef, useState } from "react";

type PlaybackUpdate = {
  data?: {
    isPaused?: boolean;
  };
};

type SpotifyController = {
  addListener: (event: "playback_update", callback: (event: PlaybackUpdate) => void) => void;
};

type SpotifyIframeApi = {
  createController: (
    element: HTMLElement,
    options: { url: string; width: string; height: string },
    callback: (controller: SpotifyController) => void
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

/* Shared Spotify player */
export default function SpotifyPlayer() {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!started) return;
    const embed = embedRef.current;
    if (!embed) return;

    const onReady = (api: SpotifyIframeApi) => {
      api.createController(
        embed,
        {
          url: "https://open.spotify.com/playlist/6pGBEY0KD60vOA68el8miV?theme=0",
          width: "320",
          height: "152",
        },
        (controller) => {
          controller.addListener("playback_update", (event) => {
            setPlaying(event.data?.isPaused === false);
          });
          const iframe = embed.querySelector("iframe");
          if (iframe) {
            iframe.height = "152";
            iframe.loading = "lazy";
            iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
            iframe.title = "Spotify playlist";
          }
        }
      );
    };

    window.onSpotifyIframeApiReady = onReady;
    const existing = document.querySelector<HTMLScriptElement>("script[data-spotify-iframe-api]");
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.dataset.spotifyIframeApi = "true";
      document.head.appendChild(script);
    }

    return () => {
      if (window.onSpotifyIframeApiReady === onReady) delete window.onSpotifyIframeApiReady;
    };
  }, [started]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (open && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={`spotify-player${open ? " is-open" : ""}`} ref={panelRef}>
      {started && (
        <div className="spotify-player-panel" aria-hidden={!open}>
          <div ref={embedRef} className="spotify-player-embed" />
        </div>
      )}
      <button
        type="button"
        className={`spotify-player-toggle${playing ? " is-playing" : ""}`}
        aria-label="Open music player"
        aria-expanded={open}
        onClick={() => {
          setStarted(true);
          setOpen((value) => !value);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18.5a3.5 3.5 0 1 1-2-3.17V5.5l11-2v11a3.5 3.5 0 1 1-2-3.17V7.1L9 8.37z" />
        </svg>
      </button>
    </div>
  );
}
