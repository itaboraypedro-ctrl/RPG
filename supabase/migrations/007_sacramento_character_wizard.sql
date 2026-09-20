-- =============================================================
-- 007 — Wizard Sacramento de criação de personagens
-- RODAR MANUALMENTE NO SUPABASE SQL EDITOR (mesmo procedimento da 004/006)
-- =============================================================

-- Aparência (traços base + personalização) e história estruturada.
-- Escolhas visuais não concedem atributos (docs/01 §2).
alter table characters add column if not exists visual jsonb not null default '{}'::jsonb;
alter table characters add column if not exists story  jsonb not null default '{}'::jsonb;

comment on column characters.visual is
  'Sacramento: { base: {apresentacao, tomDePele, faixaEtaria, tipoFisico, baseId}, customizacao, rosto: {modo, descricao} } — identidade narrativa, sem efeito mecânico';
comment on column characters.story is
  'Sacramento: { elementos, historia: {resumo, capitulos[], familia, vinculos[], redencao, ganchos[]}, origem: "manual"|"ia", aprovadaEm } — nada aqui concede itens/dinheiro/atributos (docs/01 PJ-21)';

-- Bucket público de retratos de personagem (leitura pública, escrita só via
-- service role no servidor — mesmo desenho do campaign-images/006).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'character-images',
  'character-images',
  true,
  10485760, -- 10MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
