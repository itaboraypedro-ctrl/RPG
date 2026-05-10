"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Conjurando seu personagem...",
  "Tecendo a essência...",
  "O destino se manifesta...",
  "Moldando o herói...",
];

export function PreviewSkeleton() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      const timeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % MESSAGES.length);
        setFading(false);
      }, 300);
      return () => clearTimeout(timeout);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <div className="relative aspect-[3/4] w-full overflow-hidden border border-arcana-gold/30 bg-arcana-surface/40 rounded-md">
        {/* Silhouette SVG */}
        <svg
          viewBox="0 0 300 400"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="silhouette-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(201,168,76,0.35)" />
              <stop offset="60%" stopColor="rgba(201,168,76,0.15)" />
              <stop offset="100%" stopColor="rgba(201,168,76,0.02)" />
            </linearGradient>
          </defs>
          {/* Head */}
          <circle cx="150" cy="90" r="40" fill="url(#silhouette-grad)" />
          {/* Neck */}
          <rect x="138" y="125" width="24" height="20" fill="url(#silhouette-grad)" />
          {/* Torso */}
          <path
            d="M 95 145 L 205 145 L 215 250 L 85 250 Z"
            fill="url(#silhouette-grad)"
          />
          {/* Arms */}
          <path
            d="M 95 145 L 70 235 L 82 240 L 100 160 Z"
            fill="url(#silhouette-grad)"
          />
          <path
            d="M 205 145 L 230 235 L 218 240 L 200 160 Z"
            fill="url(#silhouette-grad)"
          />
          {/* Legs */}
          <path
            d="M 95 250 L 110 380 L 140 380 L 145 250 Z"
            fill="url(#silhouette-grad)"
          />
          <path
            d="M 205 250 L 190 380 L 160 380 L 155 250 Z"
            fill="url(#silhouette-grad)"
          />
        </svg>

        {/* Shimmer overlay */}
        <div className="character-skeleton-shimmer absolute inset-0 pointer-events-none" />
      </div>

      <p
        className={`mt-4 text-center font-cinzel italic text-arcana-gold/70 text-sm transition-opacity duration-300 ${
          fading ? "opacity-0" : "opacity-100"
        }`}
      >
        {MESSAGES[index]}
      </p>

      <style jsx>{`
        @keyframes characterSkeletonShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .character-skeleton-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(240, 204, 106, 0.08) 40%,
            rgba(240, 204, 106, 0.18) 50%,
            rgba(240, 204, 106, 0.08) 60%,
            transparent 100%
          );
          animation: characterSkeletonShimmer 2.4s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .character-skeleton-shimmer {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
