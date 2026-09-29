"use client";

import { useEffect, useRef, useState } from "react";

/** The video is decorative: navigation and content never depend on playback. */
export function useHomeVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let wanted = !connection?.saveData;
    let disposed = false;
    const play = () => {
      if (disposed || !wanted || preference.matches || document.hidden) return;
      if (!video.getAttribute("src")) {
        video.src = matchMedia("(max-width: 767px)").matches
          ? "/media/vocational-background-mobile.mp4"
          : "/media/vocational-background.mp4";
      }
      video.muted = true;
      void video.play().catch(() => {
        // Keep the poster visible if the browser blocks automatic playback.
      });
    };
    const sync = () => {
      if (preference.matches || document.hidden || !wanted) video.pause();
      else play();
    };
    const onError = () => { wanted = false; setUnavailable(true); };
    const root = video.closest(".site-cinematic");
    const hero = root?.querySelector(".rv-hero");
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([entry]) => {
      root?.setAttribute("data-reading", String(!entry.isIntersecting));
    }) : undefined;
    if (hero) observer?.observe(hero);
    video.addEventListener("canplay", play);
    video.addEventListener("error", onError);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pageshow", sync);
    sync();
    return () => {
      disposed = true;
      observer?.disconnect();
      video.pause();
      video.removeEventListener("canplay", play);
      video.removeEventListener("error", onError);
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pageshow", sync);
    };
  }, []);

  return { videoRef, unavailable };
}
