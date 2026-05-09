"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      { email, password }
    );

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Não foi possível entrar.");
      setSubmitting(false);
      return;
    }

    router.push(redirectTo ?? "/hub");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="font-cinzel text-xs uppercase tracking-[0.25em] text-arcana-text-dim"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-sm border border-arcana-border bg-arcana-surface/80 px-4 py-3 font-crimson text-base text-arcana-text transition-colors focus:border-arcana-gold focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="font-cinzel text-xs uppercase tracking-[0.25em] text-arcana-text-dim"
        >
          Senha
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-sm border border-arcana-border bg-arcana-surface/80 px-4 py-3 font-crimson text-base text-arcana-text transition-colors focus:border-arcana-gold focus:outline-none"
        />
      </div>

      {error && (
        <p className="font-crimson text-sm italic text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-sm bg-gradient-to-br from-arcana-gold to-arcana-gold-bright px-6 py-3 font-cinzel text-sm uppercase tracking-[0.3em] text-arcana-bg shadow-[0_0_20px_rgba(201,168,76,0.2)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(201,168,76,0.55)] disabled:opacity-50 disabled:hover:shadow-[0_0_20px_rgba(201,168,76,0.2)]"
      >
        {submitting ? "Entrando..." : "Entrar"}
      </button>

      <div className="mt-6 flex flex-col gap-3 font-crimson text-sm text-arcana-text-dim">
        <Link
          href="/register"
          className="transition-colors hover:text-arcana-text"
        >
          Não tem conta?{" "}
          <span className="text-arcana-gold">Criar conta →</span>
        </Link>
        <Link
          href="/reset-password"
          className="transition-colors hover:text-arcana-text"
        >
          Esqueci minha senha
        </Link>
      </div>
    </form>
  );
}
