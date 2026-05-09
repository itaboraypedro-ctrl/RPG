import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/onboarding/RegisterForm";
import { RegisterStepIndicator } from "@/components/onboarding/RegisterStepIndicator";
import { RoleSelector } from "@/components/onboarding/RoleSelector";
import type { Role } from "@/lib/types";

type SearchParams = Promise<{
  step?: string;
  role?: string;
}>;

const ALLOWED_ROLES: Role[] = ["gm", "player"];

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { step, role } = await searchParams;

  if (step === "2") {
    if (!role || !ALLOWED_ROLES.includes(role as Role)) {
      redirect("/register");
    }

    return (
      <div className="flex flex-col gap-8">
        <RegisterStepIndicator step={2} />
        <RegisterForm role={role as Role} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <RegisterStepIndicator step={1} />
      <RoleSelector />
    </div>
  );
}
