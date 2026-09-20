// Upload server-side de retratos de personagem para o Supabase Storage.
// Bucket público criado na migration 007 — escrita só via service role.

import { createAdminClient } from "@/lib/supabase-admin";

const BUCKET = "character-images";

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadCharacterImage(
  ownerId: string,
  bytes: ArrayBuffer | Uint8Array,
  contentType: "image/png" | "image/jpeg" | "image/webp" = "image/png",
): Promise<UploadResult> {
  const ext = contentType === "image/webp" ? "webp" : contentType === "image/jpeg" ? "jpg" : "png";
  const admin = createAdminClient();
  const path = `${ownerId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, { contentType });
  if (error) {
    const missing = /bucket/i.test(error.message) && /not.*found/i.test(error.message);
    return {
      ok: false,
      error: missing
        ? "Bucket de retratos não existe — rode a migration 007_sacramento_character_wizard.sql no SQL Editor."
        : error.message,
    };
  }
  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
