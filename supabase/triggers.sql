-- GM Controller — Triggers
-- Materializes SPEC_DATABASE.md §5.

-- (a) Cria profile automaticamente ao cadastrar em auth.users
create or replace function public.create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'player'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_user();

-- (b) Atualiza updated_at em profiles, sessions, characters, story_templates
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on profiles
for each row execute function public.update_updated_at();

create trigger sessions_set_updated_at
before update on sessions
for each row execute function public.update_updated_at();

create trigger characters_set_updated_at
before update on characters
for each row execute function public.update_updated_at();

create trigger story_templates_set_updated_at
before update on story_templates
for each row execute function public.update_updated_at();

-- (c) Garante invite_code único ao criar sessão (regenera em colisão)
create or replace function public.generate_unique_invite_code()
returns trigger
language plpgsql
as $$
begin
  loop
    exit when not exists (
      select 1 from sessions where invite_code = new.invite_code and id <> new.id
    );
    new.invite_code := substr(md5(random()::text), 1, 8);
  end loop;
  return new;
end;
$$;

create trigger sessions_unique_invite_code
before insert on sessions
for each row execute function public.generate_unique_invite_code();

-- (d) Cria session_media_state ao criar sessão
create or replace function public.create_session_media_state()
returns trigger
language plpgsql
as $$
begin
  insert into session_media_state (session_id) values (new.id);
  return new;
end;
$$;

create trigger sessions_create_media_state
after insert on sessions
for each row execute function public.create_session_media_state();
