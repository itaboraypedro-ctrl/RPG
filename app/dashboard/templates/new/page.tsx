import Link from "next/link";
import { AiTemplateGenerator } from "@/components/templates/AiTemplateGenerator";
import { TemplateWizard } from "@/components/templates/TemplateWizard";

export default async function NewTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const isAi = mode === "ai";

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">
          {isAi ? "Gerar com IA" : "Novo template"}
        </h1>
        <Link
          href={isAi ? "/dashboard/templates/new" : "/dashboard/templates/new?mode=ai"}
          className="text-xs text-emerald-400 hover:text-emerald-300"
        >
          {isAi ? "Modo manual" : "Usar IA"}
        </Link>
      </header>

      {isAi ? <AiTemplateGenerator /> : <TemplateWizard mode="create" />}
    </div>
  );
}
