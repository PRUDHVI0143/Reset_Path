"use client";

import { useTheme } from "./ThemeProvider";
import { useEffect, useRef } from "react";

export default function VideoBackground() {
  const { theme } = useTheme();
  const lightRef = useRef<HTMLVideoElement>(null);
  const darkRef = useRef<HTMLVideoElement>(null);

  // Smooth crossfade when theme changes
  useEffect(() => {
    const light = lightRef.current;
    const dark = darkRef.current;
    if (!light || !dark) return;

    if (theme === "light") {
      light.style.opacity = "1";
      dark.style.opacity = "0";
    } else {
      light.style.opacity = "0";
      dark.style.opacity = "1";
    }
  }, [theme]);

  const isLight = theme === "light";

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none select-none">
      {/* Dark / Night Video — highly visible, vivid pixel art developer room */}
      <video
        ref={darkRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          opacity: 1,
          transition: "opacity 0.8s ease-in-out",
        }}
        className="absolute inset-0 w-full h-full object-cover scale-[1.01] filter brightness-100 contrast-105"
        src="/videos/dark-mode.mp4"
      />

      {/* Light / Green Video — highly visible, serene lush green landscape */}
      <video
        ref={lightRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          opacity: 0,
          transition: "opacity 0.8s ease-in-out",
        }}
        className="absolute inset-0 w-full h-full object-cover scale-[1.01] filter brightness-100 saturate-110"
        src="/videos/light-mode.mp4"
      />

      {/* Light translucent tint overlay:
          Keeps the video vivid and 100% visible while providing gentle contrast
          Light mode: soft 18-25% mint wash so green nature bursts through clearly
          Dark mode: soft 30-45% midnight veil so cozy night room details are sharp & visible */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: isLight
            ? "linear-gradient(180deg, rgba(240,253,244,0.18) 0%, rgba(220,252,231,0.28) 60%, rgba(209,250,229,0.38) 100%)"
            : "linear-gradient(180deg, rgba(8,12,24,0.25) 0%, rgba(4,6,16,0.38) 60%, rgba(2,4,10,0.52) 100%)",
        }}
      />

      {/* Soft top-bar shadow to anchor the navbar */}
      <div
        className="absolute top-0 left-0 right-0 h-24 transition-opacity duration-700"
        style={{
          background: isLight
            ? "linear-gradient(180deg, rgba(255,255,255,0.40) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
