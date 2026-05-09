"use client";

import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "@/components/providers/AuthProvider";
import type { Profile, Role } from "@/lib/types";

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  gm: "Mestre",
  player: "Jogador",
};

type Props = {
  profile: Profile;
};

export function HubNav({ profile }: Props) {
  const auth = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const initial = profile.display_name.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-50 border-b border-arcana-border/60 bg-arcana-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
        <Link
          href="/hub"
          className="font-cinzel text-base tracking-[0.35em] text-arcana-gold transition-colors hover:text-arcana-gold-bright"
        >
          <span aria-hidden="true" className="mr-2">
            ◆
          </span>
          ARCANA
        </Link>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-3 rounded-sm border border-transparent px-2 py-1.5 transition-colors hover:border-arcana-gold/30 hover:bg-arcana-surface/60"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-arcana-surface font-cinzel text-sm text-arcana-gold ring-1 ring-arcana-gold/40 sm:h-10 sm:w-10"
              aria-hidden="true"
              style={
                profile.avatar_url
                  ? {
                      backgroundImage: `url(${profile.avatar_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      color: "transparent",
                    }
                  : undefined
              }
            >
              {profile.avatar_url ? "" : initial}
            </span>
            <span className="hidden flex-col items-start sm:flex">
              <span className="font-cinzel text-sm tracking-[0.18em] text-arcana-text">
                {profile.display_name}
              </span>
              <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold/70">
                {ROLE_LABEL[profile.role]}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="hidden text-arcana-text-dim sm:inline"
            >
              ▾
            </span>
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 border border-arcana-border bg-arcana-surface/95 shadow-[0_10px_40px_rgba(0,0,0,0.7)] backdrop-blur-md"
            >
              <div className="border-b border-arcana-border px-4 py-3 sm:hidden">
                <p className="font-cinzel text-sm tracking-[0.18em] text-arcana-text">
                  {profile.display_name}
                </p>
                <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold/70">
                  {ROLE_LABEL[profile.role]}
                </p>
              </div>
              <Link
                href="/hub"
                role="menuitem"
                className="block px-4 py-3 font-crimson text-sm text-arcana-text transition-colors hover:bg-arcana-gold/10 hover:text-arcana-gold"
                onClick={() => setOpen(false)}
              >
                Meu perfil
              </Link>
              <Link
                href="/hub"
                role="menuitem"
                className="block px-4 py-3 font-crimson text-sm text-arcana-text transition-colors hover:bg-arcana-gold/10 hover:text-arcana-gold"
                onClick={() => setOpen(false)}
              >
                Configurações
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  auth?.signOut();
                }}
                className="block w-full border-t border-arcana-border px-4 py-3 text-left font-crimson text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
