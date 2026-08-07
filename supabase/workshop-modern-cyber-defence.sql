-- Workshop on Modern Cyber Defence — registrations + verification bucket.
--
-- Paste this whole file into the Supabase SQL editor and run it. It is safe
-- to re-run: every statement either checks "if not exists" or drops its own
-- policy first. `supabase/schema.sql` is the other half of this project's
-- backend (the BOD editor); the two are independent and either can be run
-- without the other.
--
-- ---------------------------------------------------------------------
-- A note on the name
--
-- The table is called "workshop-modern-cyber-defence", with hyphens, to
-- match the route it serves (/events/workshop-modern-cyber-defence) and the
-- bucket beside it. Postgres folds unquoted identifiers to lower case and
-- reads a hyphen as minus, so **every raw SQL reference to it must be
-- double-quoted** — including in the SQL editor when a coordinator goes
-- looking at the rows:
--
--     select * from "workshop-modern-cyber-defence" order by created_at desc;
--
-- supabase-js quotes identifiers for you, so the client code just says
-- .from("workshop-modern-cyber-defence") and nothing else has to know.
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- 0. Who counts as an admin
--
-- Read this before the rest of the file, because every policy below is
-- built on it.
--
-- The obvious way to write these policies is `to authenticated` — the way
-- schema.sql writes them for the BOD editor. That is safe there: the bio
-- table is public-read anyway, so an account that should not exist gains
-- nothing by reading it. It is **not** safe here. This table holds names,
-- email addresses, register numbers and transaction ids, and the bucket
-- beside it holds photographs of students' banking apps.
--
-- `to authenticated` means "anybody Supabase Auth will issue a token for",
-- and unless sign-ups are turned off in the dashboard (Authentication →
-- Providers → Email → "Allow new users to sign up") that is *anybody at
-- all*: sign up with any working inbox, confirm the mail, and the register
-- opens. The login page says "Accounts are issued from Supabase — there is
-- no sign-up", and this is the half of that sentence the database has to
-- enforce for it to be true.
--
-- So membership is an explicit list. `is_nic_admin()` is `security definer`
-- so that reading the list is not itself gated by the policies that depend
-- on it, and `stable` so Postgres may call it once per statement rather
-- than once per row.
--
-- ---------------------------------------------------------------------
-- FILL ME IN — as the board changes
--
--   Adding an admin, once they have an account:
--
--     insert into public.nic_admins (user_id, email)
--     select id, email from auth.users where email = 'them@example.com'
--     on conflict (user_id) do nothing;
--
--   Removing one:  delete from public.nic_admins where email = '…';
--   Checking:      select email from public.nic_admins;
--
--   An account that is not on this list can still sign in — the console's
--   front page and the BOD editor work — but the event registers will read
--   as empty. That is the intended failure: no error, no data.
-- ---------------------------------------------------------------------

create table if not exists public.nic_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  added_at timestamptz not null default now()
);

alter table public.nic_admins enable row level security;

create or replace function public.is_nic_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.nic_admins where user_id = auth.uid()
  );
$$;

-- The list is readable by the people on it and by nobody else. There is no
-- insert or update policy at all: an admin is added from the SQL editor,
-- which is the one place that already requires a project owner's login.
-- A table that could add to itself would be a privilege escalation with
-- extra steps.
drop policy if exists "Admins may read the admin list" on public.nic_admins;
create policy "Admins may read the admin list"
on public.nic_admins
for select
to authenticated
using (public.is_nic_admin());

-- Seeds the account this console was built for, so running this file does
-- not lock its author out of the screen it creates. It is a no-op if that
-- user does not exist — check with the `select` above after running.
insert into public.nic_admins (user_id, email)
select id, email from auth.users where email = 'lennydany3@gmail.com'
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------
-- 1. The registrations table
--
-- One row per completed run through the four steps in
-- components/WorkshopCyberDefence/Registration. Written by the browser with
-- the anon key at the moment the ticket is cut — see submit.js — so the row
-- and the ticket a student is holding are the same event.
--
-- `ticket_code` is the join key for everything a human does with this: it is
-- printed on the ticket, encoded in its QR, read aloud at the door, and it
-- is what both objects in the storage bucket are named after. Unique, so a
-- second insert under a code that somehow repeated fails loudly rather than
-- quietly giving two students the same code.
--
-- `stream` is the class *as printed on the ticket*, which is not always the
-- class that was picked from the dropdown: "Other" opens a free-text box and
-- what gets stored is what the student typed. See streamLabel in
-- useRegistration.js. The column is deliberately plain text and not an enum
-- for exactly that reason.
--
-- `college` is the campus, on exactly the same terms — three SRM campuses in
-- the dropdown and an "Other" that opens a box, stored as whatever came out of
-- that (collegeLabel in useRegistration.js). It is the one column on this
-- table that is **nullable**, and that is a migration fact rather than a
-- design one: it was added after the register had already been open, so rows
-- filed before it existed have no answer to give and there is no honest value
-- to invent for them. Null means "registered before we started asking", not
-- "did not say". Everything the form writes from now on fills it in — the
-- field is required on the client and the step will not advance without it.
--
-- `proof_path` and `ticket_path` are object paths inside the bucket below,
-- not URLs. The bucket is private, so a URL would be a signed one with an
-- expiry baked in — storing that would mean storing a link that stops
-- working. A path plus createSignedUrl() at the moment somebody looks is the
-- shape that survives. Both are nullable: a storage upload that fails must
-- not cost us the registration itself, so the row is written either way and
-- a null path means "the file did not make it, ask them for it again".
--
-- `status` is the coordinators' column, and it is the one the door turns
-- on. Nothing on the public site writes or reads it — the ticket already
-- says, in as many words, that a seat is not confirmed until somebody has
-- checked the payment by hand. It is set from the dropdown in the register
-- screen, and it is what the scanner refuses on: a ticket whose row is
-- `pending` or `failed` does not open the door, however genuine the QR code
-- printed on it is. That is the whole point of having it.
--
-- `attended_at` / `attended_by` are the attendance sheet. Null means "has
-- not walked in yet"; a timestamp is the moment a coordinator admitted them
-- and which coordinator it was. Two columns rather than a separate table
-- because attendance here is one bit and one instant per registration —
-- nobody is admitted twice — and a join table for a boolean is a table to
-- keep in step for no gain.
-- ---------------------------------------------------------------------

create table if not exists public."workshop-modern-cyber-defence" (
  id uuid primary key default gen_random_uuid(),
  ticket_code text not null unique,

  name text not null,
  college text,
  stream text not null,
  section text not null,
  email text not null,
  register_number text not null,
  year text not null,

  transaction_id text not null,
  amount numeric(10, 2) not null default 150.00,
  proof_path text,
  ticket_path text,

  status text not null default 'pending'
    check (status in ('pending', 'verified', 'failed')),
  notes text,

  attended_at timestamptz,
  attended_by uuid references auth.users (id),

  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Migrations for anyone who ran an earlier version of this file.
--
-- `create table if not exists` does nothing to a table that already
-- exists, so every column and constraint added after the first run has to
-- be stated again here. All of it is idempotent.
--
-- The status vocabulary changed from confirmed/rejected to verified/failed
-- to match the words on the dropdown in the register. The old constraint
-- has to come off before the rows can be rewritten — Postgres checks it on
-- every update, including the update that is migrating away from it — and
-- the new one goes on afterwards, by which point no row can violate it.
-- The generated constraint name carries the table's hyphens, so it needs
-- quoting like the table itself.
-- ---------------------------------------------------------------------

-- The college dropdown, added to the form after the register was already
-- taking rows. Nullable for the reason given above the table: the rows that
-- predate it were never asked, and a `not null` here would need a default
-- backfilled into them that no student ever said.
alter table public."workshop-modern-cyber-defence"
  add column if not exists college text;

alter table public."workshop-modern-cyber-defence"
  add column if not exists attended_at timestamptz;
alter table public."workshop-modern-cyber-defence"
  add column if not exists attended_by uuid references auth.users (id);

alter table public."workshop-modern-cyber-defence"
  drop constraint if exists "workshop-modern-cyber-defence_status_check";
alter table public."workshop-modern-cyber-defence"
  drop constraint if exists workshop_mcd_status_check;

update public."workshop-modern-cyber-defence"
   set status = 'verified' where status = 'confirmed';
update public."workshop-modern-cyber-defence"
   set status = 'failed' where status = 'rejected';

alter table public."workshop-modern-cyber-defence"
  add constraint workshop_mcd_status_check
  check (status in ('pending', 'verified', 'failed'));

-- The door's own lookup: the scanner reads a ticket code and asks this
-- table one question about it. Already unique, so already indexed — this
-- is here only to note that the scanner's query is the cheapest one in the
-- file, which matters when it runs once per student walking through a door.

-- The two lookups a coordinator actually performs: "who is this person at
-- the door" (by the code on their phone — already covered by the unique
-- constraint) and "has this register number already paid", which is how a
-- double payment gets spotted. Neither is a unique index on purpose: a
-- student whose first attempt failed halfway must be able to go round again.
create index if not exists workshop_mcd_register_number_idx
  on public."workshop-modern-cyber-defence" (register_number);

create index if not exists workshop_mcd_created_at_idx
  on public."workshop-modern-cyber-defence" (created_at desc);

alter table public."workshop-modern-cyber-defence" enable row level security;

-- Insert, and only insert, for the anonymous browser.
--
-- There is no select policy for `anon` and that is the important half of
-- this: the table holds names, email addresses, register numbers and
-- transaction ids, and a public read policy would publish the whole
-- attendee list to anybody who opened the network tab. The client never
-- reads back — submit.js calls .insert() without .select() precisely so it
-- does not need a representation returned.
drop policy if exists "Anyone may register for the cyber defence workshop"
  on public."workshop-modern-cyber-defence";
create policy "Anyone may register for the cyber defence workshop"
on public."workshop-modern-cyber-defence"
for insert
to anon, authenticated
with check (true);

-- Admins on the list in section 0 — not every signed-in account — get the
-- whole table, including marking a payment confirmed.
--
-- The old name is dropped as well as the new one, so that re-running this
-- file over an earlier version of itself removes the `to authenticated`
-- policy rather than leaving it in place beside this one. Postgres ORs
-- permissive policies together: one leftover `using (true)` would make
-- everything above pointless.
drop policy if exists "Authenticated users manage workshop registrations"
  on public."workshop-modern-cyber-defence";
drop policy if exists "Admins manage workshop registrations"
  on public."workshop-modern-cyber-defence";
create policy "Admins manage workshop registrations"
on public."workshop-modern-cyber-defence"
for all
to authenticated
using (public.is_nic_admin())
with check (public.is_nic_admin());

-- ---------------------------------------------------------------------
-- 2. The verification bucket
--
-- Two objects per registration, both named after the ticket code:
--
--   proofs/MCD26-XXXXXX.jpeg   the payment screenshot, compressed in the
--                              browser before it is sent (see compressProof
--                              in useRegistration.js)
--   tickets/MCD26-XXXXXX.png   the ticket itself, the same PNG the student
--                              downloads, so a coordinator can reissue one
--                              to somebody who lost theirs
--
-- **Private.** A payment screenshot is a photograph of somebody's banking
-- app; it is not a club photo and must not sit behind a guessable public
-- URL. `public => false` means getPublicUrl() returns a dead link and
-- reading an object requires either a signed URL or a signed-in session.
--
-- The size and mime limits are a floor under the client-side checks rather
-- than a replacement for them: validatePayment already refuses a non-image
-- and anything over 5 MB, and the compressor gets a typical screenshot well
-- under 1 MB, but neither of those runs anywhere the anon key cannot be
-- pointed at by hand.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workshop-modern-cyber-defence-verification',
  'workshop-modern-cyber-defence-verification',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Upload, and only upload.
--
-- No select for `anon`, matching the table: a visitor may hand a screenshot
-- in and may never read one back out — not even their own. No update and no
-- delete either, which is what stops one registration overwriting another's
-- proof. Uploads go up with upsert:false, so a path that somehow collided
-- fails rather than replacing what was there.
drop policy if exists "Anyone may upload workshop verification files"
  on storage.objects;
create policy "Anyone may upload workshop verification files"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'workshop-modern-cyber-defence-verification');

-- Reading a payment screenshot is the most sensitive thing anybody does
-- against this project, so it is gated on the admin list rather than on
-- being signed in. This is what makes the signed URLs in the register
-- screen work for a coordinator and fail for everybody else.
drop policy if exists "Authenticated users read workshop verification files"
  on storage.objects;
drop policy if exists "Admins read workshop verification files"
  on storage.objects;
create policy "Admins read workshop verification files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'workshop-modern-cyber-defence-verification'
  and public.is_nic_admin()
);

drop policy if exists "Authenticated users update workshop verification files"
  on storage.objects;
drop policy if exists "Admins update workshop verification files"
  on storage.objects;
create policy "Admins update workshop verification files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'workshop-modern-cyber-defence-verification'
  and public.is_nic_admin()
)
with check (
  bucket_id = 'workshop-modern-cyber-defence-verification'
  and public.is_nic_admin()
);

drop policy if exists "Authenticated users delete workshop verification files"
  on storage.objects;
drop policy if exists "Admins delete workshop verification files"
  on storage.objects;
create policy "Admins delete workshop verification files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'workshop-modern-cyber-defence-verification'
  and public.is_nic_admin()
);
