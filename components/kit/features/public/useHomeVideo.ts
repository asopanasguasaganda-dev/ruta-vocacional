"use client";

import { useEffect, useRef, useState } from "react";

/** The video is decorative: navigation and content never depend on playback. */
export function useHomeVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const toggleRef = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let wanted = !connection?.saveData;
    let disposed = false;
    try { if (sessionStorage.getItem("rv-background-paused") === "true") wanted = false; } catch { /* Storage is optional. */ }
    const play = () => {
      if (disposed || !wanted || preference.matches || document.hidden) return;
      if (!video.getAttribute("src")) {
        video.src = matchMedia("(max-width: 767px)").matches
          ? "/media/vocational-background-mobile.mp4"
          : "/media/vocational-background.mp4";
      }
      void video.play().catch(() => { if (!disposed) setPlaying(false); });
    };
    const sync = () => {
      setReduced(preference.matches);
      if (preference.matches || document.hidden || !wanted) video.pause();
      else play();
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => { wanted = false; setPlaying(false); setUnavailable(true); };
    const root = video.closest(".site-cinematic");
    const hero = root?.querySelector(".rv-hero");
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([entry]) => {
      root?.setAttribute("data-reading", String(!entry.isIntersecting));
    }) : undefined;
    if (hero) observer?.observe(hero);
    toggleRef.current = () => {
      wanted = video.paused;
      try { sessionStorage.setItem("rv-background-paused", String(!wanted)); } catch { /* Storage is optional. */ }
      sync();
    };
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      disposed = true;
      observer?.disconnect();
      video.pause();
      toggleRef.current = () => {};
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return { videoRef, playing, reduced, unavailable, toggle: () => toggleRef.current() };
}
