import { requireRole } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["gm", "admin"]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col bg-zinc-950 text-zinc-100">
      {children}
    </div>
  );
}
