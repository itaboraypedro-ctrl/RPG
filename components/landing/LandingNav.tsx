import Link from "next/link";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-arcana-border/60 bg-arcana-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
        <Link
          href="/"
          className="font-cinzel text-base tracking-[0.35em] text-arcana-gold transition-colors hover:text-arcana-gold-bright sm:text-lg"
        >
          <span aria-hidden="true" className="mr-2">
            ◆
          </span>
          ARCANA
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="rounded-sm border border-arcana-gold/30 px-3 py-2 font-cinzel text-[11px] uppercase tracking-[0.2em] text-arcana-gold transition-all hover:border-arcana-gold hover:bg-arcana-gold/10 sm:px-5 sm:text-xs"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-sm bg-gradient-to-br from-arcana-gold to-arcana-gold-bright px-3 py-2 font-cinzel text-[11px] uppercase tracking-[0.2em] text-arcana-bg shadow-[0_0_0_1px_rgba(240,204,106,0.2)] transition-all hover:shadow-[0_0_24px_rgba(201,168,76,0.5)] sm:px-5 sm:text-xs"
          >
            Criar conta
          </Link>
        </nav>
      </div>
    </header>
  );
}
