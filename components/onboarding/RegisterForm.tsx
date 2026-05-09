"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Role } from "@/lib/types";

type Props = {
  role: Role;
};

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  gm: "Mestre",
  player: "Jogador",
};

export function RegisterForm({ role }: Props) {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): string | null {
    if (displayName.trim().length < 2)
      return "Nome precisa ter ao menos 2 caracteres.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Email inválido.";
    if (password.length < 8)
      return "Senha precisa ter ao menos 8 caracteres.";
    if (password !== confirm) return "Senhas não conferem.";
    return null;
  }

  const isValid = validate() === null;

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

    const { error: roleError } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", data.user.id);

    if (roleError) {
      setError(`Conta criada, mas papel não foi salvo: ${roleError.message}`);
      setSubmitting(false);
      return;
    }

    router.push("/hub");
    router.refresh();
  }

  const inputClass =
    "rounded-sm border border-arcana-border bg-arcana-surface/80 px-4 py-3 font-crimson text-base text-arcana-text transition-colors focus:border-arcana-gold focus:outline-none disabled:opacity-60";
  const labelClass =
    "font-cinzel text-xs uppercase tracking-[0.25em] text-arcana-text-dim";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link
          href="/register"
          className="font-cinzel text-[11px] uppercase tracking-[0.3em] text-arcana-text-dim transition-colors hover:text-arcana-gold"
        >
          ← Voltar
        </Link>
        <span
          className="border border-arcana-gold/40 px-3 py-1 font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold"
          aria-label={`Papel selecionado: ${ROLE_LABEL[role]}`}
        >
          {ROLE_LABEL[role]}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="displayName" className={labelClass}>
          Nome de usuário
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={submitting}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass}>
          Senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            className={`${inputClass} w-full pr-20`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text-dim transition-colors hover:text-arcana-gold"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirm" className={labelClass}>
          Confirmar senha
        </label>
        <input
          id="confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={submitting}
          className={inputClass}
        />
      </div>

      {error && (
        <p className="font-crimson text-sm italic text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={!isValid || submitting}
        className="mt-2 rounded-sm bg-gradient-to-br from-arcana-gold to-arcana-gold-bright px-6 py-3 font-cinzel text-sm uppercase tracking-[0.3em] text-arcana-bg shadow-[0_0_20px_rgba(201,168,76,0.2)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(201,168,76,0.55)] disabled:opacity-50 disabled:hover:shadow-[0_0_20px_rgba(201,168,76,0.2)]"
      >
        {submitting ? "Criando conta..." : "Criar minha conta"}
      </button>

      <Link
        href="/login"
        className="mt-4 font-crimson text-sm text-arcana-text-dim transition-colors hover:text-arcana-text"
      >
        Já tem conta? <span className="text-arcana-gold">Entrar →</span>
      </Link>
    </form>
  );
}
