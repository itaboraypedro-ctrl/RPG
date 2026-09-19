-- 006 — Bucket público para imagens de campanha (lugares etc.).
-- Rodar manualmente no SQL Editor do Supabase, como as migrations anteriores.
--
-- Leitura: pública via URL (o bucket é public).
-- Escrita: apenas via server action com service role (não há policy de INSERT
-- para authenticated de propósito — o upload passa pela checagem de Juiz no servidor).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-images',
  'campaign-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
