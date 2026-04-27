export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-zinc-950 px-6 py-10 text-zinc-100">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">GM Controller</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Mestre sua mesa em qualquer lugar.
        </p>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
