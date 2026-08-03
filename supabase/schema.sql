-- NIC admin: BOD bio overrides + photo storage bucket.
-- Paste this whole file into the Supabase SQL editor and run it. It is
-- safe to re-run: every statement either checks "if not exists" or drops
-- its own policy first.

-- ---------------------------------------------------------------------
-- 1. Bio + contact overrides
--
-- One row per seat that an admin has actually edited. `slug` matches what
-- Next.js computes for that seat — see mastermindSlug() and seat() in
-- components/CrewSequence/content.js, and the manifest built in
-- app/admin/dashboard/bod/page.jsx. A seat with no row here just falls
-- back to its placeholder bio and whatever links content.js has for it.
--
-- `name` is who holds the seat, and it is editable because a board turns
-- over without anyone wanting to open the codebase. Null means
-- "unchanged", so an untouched seat still reads out of content.js.
--
-- There is no `role` column on purpose. A seat's designation is what the
-- roster is ordered and grouped by — the boards are dealt in that order and
-- the site's tags are sized for those exact strings — so it stays in
-- content.js and the admin shows it back read-only. (If an earlier version
-- of this file left a `role` column behind, nothing reads or writes it; it
-- is inert and can be dropped whenever convenient.)
--
-- The four link columns are only surfaced in the editor for board seats —
-- masterminds have no contact strip on the public site — but they live on
-- every row for a uniform shape. `photo_url` points at an object in the
-- `bod-photos` bucket below (or is null, meaning "use content.js's photo").
-- `add column if not exists` covers anyone who already ran an earlier
-- version of this file.
-- ---------------------------------------------------------------------

create table if not exists public.bod_bios (
  slug text primary key,
  name text,
  bio text not null default '',
  email text,
  instagram text,
  linkedin text,
  github text,
  photo_url text,
  updated_at timestamptz not null default now()
);

alter table public.bod_bios add column if not exists name text;
alter table public.bod_bios add column if not exists email text;
alter table public.bod_bios add column if not exists instagram text;
alter table public.bod_bios add column if not exists linkedin text;
alter table public.bod_bios add column if not exists github text;
alter table public.bod_bios add column if not exists photo_url text;

alter table public.bod_bios enable row level security;

drop policy if exists "Public read access to BOD bios" on public.bod_bios;
create policy "Public read access to BOD bios"
on public.bod_bios
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users manage BOD bios" on public.bod_bios;
create policy "Authenticated users manage BOD bios"
on public.bod_bios
for all
to authenticated
using (true)
with check (true);

-- ---------------------------------------------------------------------
-- 2. Photo storage bucket
--
-- Each upload from /admin/dashboard/bod is written to a path named after
-- the seat's slug (with `upsert: true`), so re-uploading a photo replaces
-- the same object rather than piling up new ones.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('bod-photos', 'bod-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to BOD photos" on storage.objects;
create policy "Public read access to BOD photos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'bod-photos');

drop policy if exists "Authenticated users upload BOD photos" on storage.objects;
create policy "Authenticated users upload BOD photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'bod-photos');

drop policy if exists "Authenticated users update BOD photos" on storage.objects;
create policy "Authenticated users update BOD photos"
on storage.objects
for update
to authenticated
using (bucket_id = 'bod-photos')
with check (bucket_id = 'bod-photos');

drop policy if exists "Authenticated users delete BOD photos" on storage.objects;
create policy "Authenticated users delete BOD photos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'bod-photos');
