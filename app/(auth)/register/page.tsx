"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const OPEN_GM_REGISTRATION =
  process.env.NEXT_PUBLIC_GM_OPEN_REGISTRATION === "true";

export default function RegisterPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): string | null {
    if (displayName.trim().length < 2) return "Nome precisa ter ao menos 2 caracteres.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Email inválido.";
    if (password.length < 8) return "Senha precisa ter ao menos 8 caracteres.";
    if (password !== confirm) return "Senhas não conferem.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setSubmitting(false);
      return;
    }

    if (!data.session || !data.user) {
      setError("Confirme seu email para concluir o cadastro.");
      setSubmitting(false);
      return;
    }

    if (OPEN_GM_REGISTRATION) {
      await supabase
        .from("profiles")
        .update({ role: "gm" })
        .eq("id", data.user.id);
    }

    router.push(OPEN_GM_REGISTRATION ? "/dashboard" : "/play");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm text-zinc-400">
          Nome
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm" className="text-sm text-zinc-400">
          Confirmar senha
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
      >
        {submitting ? "Cadastrando..." : "Criar conta"}
      </button>

      <Link
        href="/login"
        className="mt-4 text-sm text-zinc-500 hover:text-zinc-300"
      >
        Já tem conta? <span className="text-emerald-400">Entrar</span>
      </Link>
    </form>
  );
}
