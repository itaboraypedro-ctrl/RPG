"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Role } from "@/lib/types";

const HOME_FOR_ROLE: Record<Role, string> = {
  admin: "/admin",
  gm: "/dashboard",
  player: "/play",
};

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

    let target = redirectTo;
    if (!target) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single<{ role: Role }>();
      target = HOME_FOR_ROLE[profile?.role ?? "player"];
    }

    router.push(target);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-zinc-400">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm text-zinc-400">
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
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
      >
        {submitting ? "Entrando..." : "Entrar"}
      </button>

      <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-500">
        <Link href="/register" className="hover:text-zinc-300">
          Não tem conta? <span className="text-emerald-400">Cadastrar</span>
        </Link>
        <Link href="/reset-password" className="hover:text-zinc-300">
          Esqueci minha senha
        </Link>
      </div>
    </form>
  );
}
