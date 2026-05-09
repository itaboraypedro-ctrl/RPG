"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  /** Color used in the title border accent. */
  accent?: "blue" | "gold" | "green" | "red" | "purple" | "default";
  children: React.ReactNode;
};

const ACCENT_BORDER: Record<NonNullable<Props["accent"]>, string> = {
  blue: "border-l-rpg-blue",
  gold: "border-l-rpg-gold",
  green: "border-l-rpg-green",
  red: "border-l-rpg-red",
  purple: "border-l-rpg-purple",
  default: "border-l-transparent",
};

export function PlayerBottomSheet(props: Props) {
  if (!props.open) return null;
  return <Sheet {...props} />;
}

function Sheet({ open, onClose, title, subtitle, accent = "default", children }: Props) {
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0]?.clientY ?? null;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startY.current == null) return;
    const delta = (e.touches[0]?.clientY ?? 0) - startY.current;
    if (delta > 0) setDragOffset(delta);
  }
  function onTouchEnd() {
    if (dragOffset > 50) {
      onClose();
    } else {
      setDragOffset(0);
    }
    startY.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      style={{ animation: "rpgSheetFadeIn 200ms ease-out" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex max-h-[85dvh] w-full max-w-[420px] flex-col gap-3 rounded-t-2xl border border-b-0 border-rpg-border bg-rpg-surface px-4 pb-6 pt-3 text-rpg-text shadow-2xl"
        style={{
          transform:
            dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          animation: dragOffset > 0 ? undefined : "rpgSheetSlideUp 200ms ease-out",
          transition: dragOffset > 0 ? undefined : "transform 200ms ease-out",
        }}
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-rpg-border" />
        {(title || subtitle) && (
          <header
            className={`flex flex-col gap-0.5 border-l-4 pl-3 ${ACCENT_BORDER[accent]}`}
          >
            {title && (
              <h2
                className="text-lg font-semibold leading-tight text-rpg-text"
                style={{ fontFamily: "var(--font-rpg-numbers)" }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="text-[11px] uppercase tracking-wider text-rpg-text-dim"
                style={{ fontFamily: "var(--font-rpg-hud)" }}
              >
                {subtitle}
              </p>
            )}
          </header>
        )}
        <div className="overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}
