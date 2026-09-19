import { requireRole } from "@/lib/auth";

// Área de criação/configuração de campanhas do Juiz — full-screen arcana,
// fora do container mobile do /dashboard.
export default async function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["gm", "admin"]);
  return children;
}
