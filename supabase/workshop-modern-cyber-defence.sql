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
-- `proof_path` and `ticket_path` are object paths inside the bucket below,
-- not URLs. The bucket is private, so a URL would be a signed one with an
-- expiry baked in — storing that would mean storing a link that stops
-- working. A path plus createSignedUrl() at the moment somebody looks is the
-- shape that survives. Both are nullable: a storage upload that fails must
-- not cost us the registration itself, so the row is written either way and
-- a null path means "the file did not make it, ask them for it again".
--
-- `status` is the coordinators' column. Nothing on the public site writes or
-- reads it — the ticket already says, in as many words, that a seat is not
-- confirmed until somebody has checked the payment by hand — it exists so
-- that checking can be recorded somewhere other than a WhatsApp scroll.
-- ---------------------------------------------------------------------

create table if not exists public."workshop-modern-cyber-defence" (
  id uuid primary key default gen_random_uuid(),
  ticket_code text not null unique,

  name text not null,
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
    check (status in ('pending', 'confirmed', 'rejected')),
  notes text,

  created_at timestamptz not null default now()
);

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

-- Signed-in admins (the same ones the /admin dashboard authenticates) get
-- the whole table, including marking a payment confirmed.
drop policy if exists "Authenticated users manage workshop registrations"
  on public."workshop-modern-cyber-defence";
create policy "Authenticated users manage workshop registrations"
on public."workshop-modern-cyber-defence"
for all
to authenticated
using (true)
with check (true);

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

drop policy if exists "Authenticated users read workshop verification files"
  on storage.objects;
create policy "Authenticated users read workshop verification files"
on storage.objects
for select
to authenticated
using (bucket_id = 'workshop-modern-cyber-defence-verification');

drop policy if exists "Authenticated users update workshop verification files"
  on storage.objects;
create policy "Authenticated users update workshop verification files"
on storage.objects
for update
to authenticated
using (bucket_id = 'workshop-modern-cyber-defence-verification')
with check (bucket_id = 'workshop-modern-cyber-defence-verification');

drop policy if exists "Authenticated users delete workshop verification files"
  on storage.objects;
create policy "Authenticated users delete workshop verification files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'workshop-modern-cyber-defence-verification');
