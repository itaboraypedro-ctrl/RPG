"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const ROUTE_VISUAL: Record<string, { src: string; subtitle: string }> = {
  "/login": {
    src: "/landing/hero03.jpg",
    subtitle: "Bem-vindo de volta, aventureiro.",
  },
  "/register": {
    src: "/landing/sapo.jpg",
    subtitle: "Sua jornada começa agora.",
  },
};

const FALLBACK = ROUTE_VISUAL["/login"];

export function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const visual =
    Object.entries(ROUTE_VISUAL).find(([route]) =>
      pathname?.startsWith(route),
    )?.[1] ?? FALLBACK;

  const isRegister = pathname?.startsWith("/register") ?? false;
  const isRoleSelectionStep =
    isRegister && searchParams.get("step") !== "2";
  const formPanelMaxWidth = isRoleSelectionStep ? "max-w-2xl" : "max-w-md";
  const headingText = isRegister
    ? isRoleSelectionStep
      ? "Criar conta"
      : "Quase lá"
    : "Entrar";

  return (
    <div className="flex min-h-dvh w-full flex-col bg-arcana-bg text-arcana-text lg:flex-row">
      <aside className="relative hidden overflow-hidden lg:block lg:w-1/2">
        <Image
          src={visual.src}
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(10,10,15,0.35) 0%, rgba(10,10,15,0.7) 100%)",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <div className="h-px w-24 bg-gradient-to-r from-arcana-gold to-transparent" />
          <p className="mt-6 font-crimson text-2xl italic text-arcana-text drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            {visual.subtitle}
          </p>
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col">
        <div className="absolute inset-0 lg:hidden">
          <Image
            src={visual.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-25"
          />
          <div
            className="absolute inset-0 bg-arcana-bg/70"
            aria-hidden="true"
          />
        </div>

        <div
          className={`relative z-10 mx-auto flex w-full ${formPanelMaxWidth} flex-1 flex-col px-6 py-10 sm:px-10 sm:py-14`}
        >
          <Link
            href="/"
            className="font-cinzel text-base tracking-[0.35em] text-arcana-gold transition-colors hover:text-arcana-gold-bright"
          >
            <span aria-hidden="true" className="mr-2">
              ◆
            </span>
            ARCANA
          </Link>

          <header className="mt-12">
            <div
              className="h-px w-16 bg-gradient-to-r from-arcana-gold to-transparent"
              aria-hidden="true"
            />
            <h1 className="mt-6 font-cinzel text-3xl tracking-[0.15em] text-arcana-text">
              {headingText}
            </h1>
            <p className="mt-2 font-crimson text-base italic text-arcana-text-dim lg:hidden">
              {visual.subtitle}
            </p>
          </header>

          <main className="mt-10 flex flex-1 flex-col">{children}</main>
        </div>
      </div>
    </div>
  );
}
