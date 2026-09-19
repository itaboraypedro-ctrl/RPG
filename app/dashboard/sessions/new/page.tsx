import { redirect } from "next/navigation";

// A criação de campanha foi refeita como wizard com preset de RPG.
export default function NewSessionPage() {
  redirect("/campaigns/new");
}
