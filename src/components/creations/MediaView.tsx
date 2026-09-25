"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { isVideo, posterOf, smallOf } from "@/data/creations";

/* Creations — media loader */
type Props = {
  src: string;
  alt?: string;
  play?: boolean;   // videos: false pauses on the current frame (used for off-screen steps/windows)
  thumb?: boolean;  // tiny preview: shows the poster image, never loads the video
  small?: boolean;  // windows + stair cards: play the lighter 640px copy (demo.mp4 -> demo.sm.mp4)
};

// image or looping muted video that fills its parent.
// Speed: every video shows its small poster image right away and only downloads the
// video once it should be playing. Videos also pause while scrolled off screen.
// Until a file is added, its slot shows the file name so you know what goes there.
export default function MediaView({ src, alt = "", play = true, thumb = false, small = false }: Props) {
  const [missing, setMissing] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [wanted, setWanted] = useState(false); // latches true the first time it should play
  const vid = useRef<HTMLVideoElement>(null);
  const video = isVideo(src);
  const portfolioVideo = src === "/videos/portfoliov2.mp4";

  // watch whether the video is anywhere near the screen
  useEffect(() => {
    const v = vid.current;
    if (!v || thumb) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "200px" });
    io.observe(v);
    return () => io.disconnect();
  }, [thumb, missing]);

  const shouldPlay = play && onScreen;
  useEffect(() => { if (shouldPlay) setWanted(true); }, [shouldPlay]);

  useEffect(() => {
    const v = vid.current;
    if (!v || thumb) return;
    if (shouldPlay) v.play().catch(() => {}); // low power mode etc. may refuse; the poster stays up
    else v.pause();
  }, [shouldPlay, wanted, thumb, missing]);

  if (missing) return <span className="cr-ph-tag">{thumb ? "" : src.split("/").slice(-2).join("/")}</span>;

  if (video && thumb) {
    return <img className="cr-media" src={posterOf(src)} alt="" loading="lazy" decoding="async" onError={() => setMissing(true)} />;
  }

  return video ? (
    <video
      ref={vid}
      className="cr-media"
      src={small ? smallOf(src) : src}
      poster={posterOf(src)}
      muted
      loop
      playsInline
      autoPlay={portfolioVideo}
      preload={portfolioVideo ? "metadata" : wanted ? "auto" : "none"}
      onError={() => setMissing(true)}
      aria-label={alt || undefined}
    />
  ) : (
    <img className="cr-media" src={src} alt={alt} loading="lazy" decoding="async" onError={() => setMissing(true)} />
  );
}
