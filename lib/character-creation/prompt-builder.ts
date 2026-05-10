export type PromptStep = 2 | 3 | 5 | 6;

export type PromptInput = {
  sex?: "male" | "female" | "androgynous";
  ageCategory?: "young" | "adult" | "mature" | "elder";
  raceName?: string;
  subraceName?: string;
  raceVisualDescription?: string;
  className?: string;
  classBasicAttire?: string;
  backgroundVisualDetail?: string;
  outfitDescription?: string;
  weaponDescription?: string;
  focusDescription?: string;
  isSpellcaster?: boolean;
  step: PromptStep;
  hasReferenceImage?: boolean;
};

const SEX_MAP: Record<NonNullable<PromptInput["sex"]>, string> = {
  male: "male",
  female: "female",
  androgynous: "androgynous",
};

const AGE_MAP: Record<NonNullable<PromptInput["ageCategory"]>, string> = {
  young: "young adult",
  adult: "adult",
  mature: "mature",
  elder: "elderly",
};

function normalize(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .trim();
}

function buildSubject(input: PromptInput): string {
  const sex = input.sex ? SEX_MAP[input.sex] : "";
  const age = input.ageCategory ? AGE_MAP[input.ageCategory] : "";
  const race = input.raceName ?? "";
  const subrace = input.subraceName ? ` ${input.subraceName}` : "";

  const subjectParts = [sex, age, `${race}${subrace}`.trim()].filter(
    (part) => part.length > 0
  );
  const subject = subjectParts.join(" ").trim();

  return subject.length > 0 ? `${subject} character` : "character";
}

export function buildCharacterPrompt(input: PromptInput): string {
  const subject = buildSubject(input);
  const raceVisual = input.raceVisualDescription?.trim() ?? "";

  const commonTail = [
    "dark plain background, soft ambient lighting",
    "detailed fantasy illustration style, full body portrait",
    "high quality, professional concept art",
  ].join(",\n");

  let body = "";

  if (input.step === 2) {
    const lines = [
      `${subject},`,
      raceVisual ? `${raceVisual},` : "",
      "wearing only basic undergarments (simple linen tunic and cloth shorts),",
      "neutral standing pose, arms slightly away from body,",
      commonTail,
    ];
    body = lines.join("\n");
  } else if (input.step === 3) {
    const attire = input.classBasicAttire?.trim() ?? "";
    const lines = [
      `${subject},`,
      raceVisual ? `${raceVisual},` : "",
      attire ? `wearing ${attire},` : "",
      "neutral standing pose, arms slightly away from body,",
      commonTail,
    ];
    body = lines.join("\n");
  } else if (input.step === 5) {
    const attire = input.classBasicAttire?.trim() ?? "";
    const bgDetail = input.backgroundVisualDetail?.trim() ?? "";
    const lines = [
      `${subject},`,
      raceVisual ? `${raceVisual},` : "",
      attire ? `wearing ${attire},` : "",
      bgDetail ? `${bgDetail},` : "",
      "neutral standing pose, arms slightly away from body,",
      commonTail,
    ];
    body = lines.join("\n");
  } else {
    // step 6
    const outfit = input.outfitDescription?.trim() ?? "";
    const weapon = input.weaponDescription?.trim() ?? "";
    const focus = input.focusDescription?.trim() ?? "";
    const bgDetail = input.backgroundVisualDetail?.trim() ?? "";
    const lines = [
      `${subject},`,
      raceVisual ? `${raceVisual},` : "",
      outfit ? `wearing ${outfit},` : "",
      weapon ? `holding ${weapon},` : "",
      input.isSpellcaster && focus ? `with ${focus} as magical focus,` : "",
      bgDetail ? `${bgDetail},` : "",
      "heroic stance, dramatic lighting,",
      commonTail,
    ];
    body = lines.join("\n");
  }

  if (input.hasReferenceImage) {
    body = `${body}\nmaintain consistent face and facial features from reference photo`;
  }

  return normalize(body);
}
