-- ============================================================
--  ÁLBUM MUNDIAL 2026 — Schema de Supabase
--  Ejecutá este script en: Supabase → SQL Editor → New query
-- ============================================================

-- Tabla de usuarios
create table if not exists public.users (
  username   text primary key,
  password   text not null,         -- SHA-256 hash, generado en el navegador
  name       text not null,
  created_at timestamptz default now() not null
);

-- Tabla de colecciones (una por usuario)
create table if not exists public.collections (
  username   text primary key references public.users(username) on delete cascade,
  owned      jsonb default '{}'::jsonb not null,   -- {"FWC-1": true, "MEX-3": true, ...}
  dupes      jsonb default '{}'::jsonb not null,   -- {"MEX-3": 2, "ARG-7": 1, ...}
  updated_at timestamptz default now() not null
);

-- Tabla de mensajes / solicitudes de intercambio
create table if not exists public.messages (
  id           text primary key,
  from_user    text not null,
  from_name    text not null,
  to_user      text not null,
  message      text default '',
  they_give_me jsonb default '[]'::jsonb,  -- figuritas que el remitente da al destinatario
  i_give_them  jsonb default '[]'::jsonb,  -- figuritas que el destinatario da al remitente
  status       text default 'pending',
  created_at   timestamptz default now() not null
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.users       enable row level security;
alter table public.collections enable row level security;
alter table public.messages    enable row level security;

-- Políticas para users
create policy "Leer usuarios"   on public.users for select using (true);
create policy "Crear usuario"   on public.users for insert with check (true);

-- Políticas para collections
create policy "Leer colecciones"      on public.collections for select using (true);
create policy "Crear colección"       on public.collections for insert with check (true);
create policy "Actualizar colección"  on public.collections for update using (true);

-- Políticas para messages
create policy "Leer mensajes"  on public.messages for select using (true);
create policy "Enviar mensaje" on public.messages for insert with check (true);

-- ─── Índices opcionales para mejor performance ────────────────────────────────

create index if not exists idx_messages_to_user on public.messages(to_user);
create index if not exists idx_collections_username on public.collections(username);
