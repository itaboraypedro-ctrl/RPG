import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-zinc-100">
      <span className="text-4xl">🔒</span>
      <h1 className="text-xl font-bold">Acesso negado</h1>
      <p className="text-sm text-zinc-400">
        Você não tem permissão para acessar esta página.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
