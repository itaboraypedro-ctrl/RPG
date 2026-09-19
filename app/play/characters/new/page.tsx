import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { CharacterWizard } from "./CharacterWizard";

export default async function NewCharacterPage() {
  const auth = await getProfile();
  if (!auth) redirect("/login?redirect=/play/characters/new");

  return <CharacterWizard />;
}
