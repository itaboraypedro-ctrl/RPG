export function getClassColor(className: string | null | undefined): string {
  const k = (className ?? "").toLowerCase();
  if (/(guerreiro|paladino|fighter|paladin)/.test(k)) return "#c9a84c";
  if (/(mago|feiticeiro|wizard|sorcerer)/.test(k)) return "#9b6bcc";
  if (/(ladino|ranger|rogue)/.test(k)) return "#4ecb8a";
  if (/(cl[eé]rigo|druida|cleric|druid)/.test(k)) return "#4a8fff";
  if (/(b[áa]rbaro|monge|barbarian|monk)/.test(k)) return "#e05050";
  return "#888888";
}
