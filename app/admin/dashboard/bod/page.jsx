"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  BOARDS,
  DEFAULT_TERM,
  MASTERMINDS,
  mastermindSlug,
} from "@/components/CrewSequence/content";

const LINK_KEYS = ["email", "instagram", "linkedin", "github"];
const LINK_LABELS = {
  email: "Email",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  github: "GitHub",
};
const EMPTY_LINKS = { email: "", instagram: "", linkedin: "", github: "" };
const PHOTO_BUCKET = "bod-photos";

/**
 * The same hierarchy the crew section deals out — masterminds, then the
 * senior board, then the joint board, seats in the order the roster already
 * holds them. Only the current term is editable here; the previous board is
 * a closed record and isn't offered.
 *
 * Every item carries a photo (masterminds and board seats both show a
 * portrait on the public site). Only board seats carry `supportsLinks` —
 * the mastermind slide has no contact strip for those fields to feed.
 */
function buildGroups() {
  return [
    {
      id: "masterminds",
      label: "Masterminds",
      items: MASTERMINDS.people.map((person) => ({
        slug: mastermindSlug(person.id),
        role: person.role,
        name: person.name,
        placeholder: person.bio,
        placeholderPhoto: person.photo,
        supportsLinks: false,
      })),
    },
    ...BOARDS.map((board) => ({
      id: board.id,
      label: board.label,
      items: board.terms[DEFAULT_TERM].members.map((member) => ({
        slug: member.slug,
        role: member.role,
        name: member.name,
        placeholder: member.bio,
        placeholderPhoto: member.photo,
        placeholderLinks: member.links || {},
        supportsLinks: true,
      })),
    })),
  ];
}

const GROUPS = buildGroups();

function effectiveBio(item, overrides) {
  return overrides[item.slug]?.bio ?? item.placeholder ?? "";
}

function effectivePhoto(item, overrides) {
  return overrides[item.slug]?.photo ?? item.placeholderPhoto ?? "";
}

function effectiveLinks(item, overrides) {
  const saved = overrides[item.slug]?.links;
  const links = { ...EMPTY_LINKS };
  for (const key of LINK_KEYS) {
    links[key] = saved?.[key] ?? item.placeholderLinks?.[key] ?? "";
  }
  return links;
}

function extensionOf(filename) {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "jpg" : filename.slice(dot + 1).toLowerCase();
}

export default function EditBodPage() {
  const supabase = useMemo(() => createClient(), []);

  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [draftBio, setDraftBio] = useState("");
  const [draftPhoto, setDraftPhoto] = useState("");
  const [draftLinks, setDraftLinks] = useState(EMPTY_LINKS);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [errorMessage, setErrorMessage] = useState(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoStatus, setPhotoStatus] = useState("idle"); // idle | uploading | error
  const [photoError, setPhotoError] = useState(null);

  // The preview is a local blob: URL created for instant feedback while a
  // file uploads — it has to be revoked or it leaks, and it's only ever
  // read by the <img> below, not by anything a re-render needs to diff.
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  useEffect(() => {
    let active = true;

    supabase
      .from("bod_bios")
      .select("slug, bio, photo_url, email, instagram, linkedin, github")
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) {
          const map = {};
          for (const row of data) {
            const links = {};
            for (const key of LINK_KEYS) {
              if (row[key] != null) links[key] = row[key];
            }
            map[row.slug] = { bio: row.bio, photo: row.photo_url, links };
          }
          setOverrides(map);
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [supabase]);

  const selected = useMemo(() => {
    for (const group of GROUPS) {
      const item = group.items.find((entry) => entry.slug === selectedSlug);
      if (item) return item;
    }
    return null;
  }, [selectedSlug]);

  function selectItem(item) {
    setSelectedSlug(item.slug);
    setDraftBio(effectiveBio(item, overrides));
    setDraftPhoto(effectivePhoto(item, overrides));
    setDraftLinks(item.supportsLinks ? effectiveLinks(item, overrides) : EMPTY_LINKS);
    setPhotoPreview(null);
    setPhotoStatus("idle");
    setPhotoError(null);
    setStatus("idle");
    setErrorMessage(null);
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selected) return;

    setPhotoStatus("uploading");
    setPhotoError(null);
    setPhotoPreview(URL.createObjectURL(file));

    // One object per seat (`upsert: true` replaces it), so re-uploading a
    // photo doesn't pile up orphaned files in the bucket.
    const path = `${selected.slug}.${extensionOf(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setPhotoStatus("error");
      setPhotoError(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);

    // The path is stable across re-uploads, so a cache-busting query string
    // is the only way a browser (or the CDN in front of the bucket) notices
    // the object underneath it changed.
    setDraftPhoto(`${publicUrl}?v=${Date.now()}`);
    setPhotoStatus("idle");
    setStatus("idle");
  }

  function handleRemovePhoto() {
    setDraftPhoto("");
    setPhotoPreview(null);
    setStatus("idle");
  }

  async function handleSave() {
    if (!selected) return;
    setStatus("saving");
    setErrorMessage(null);

    const row = {
      slug: selected.slug,
      bio: draftBio,
      photo_url: draftPhoto || null,
      updated_at: new Date().toISOString(),
      ...(selected.supportsLinks ? draftLinks : {}),
    };

    const { error } = await supabase.from("bod_bios").upsert(row);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setOverrides((prev) => ({
      ...prev,
      [selected.slug]: {
        bio: draftBio,
        photo: draftPhoto || null,
        links: selected.supportsLinks ? { ...draftLinks } : {},
      },
    }));
    setStatus("saved");
  }

  async function handleReset() {
    if (!selected) return;
    setStatus("saving");
    setErrorMessage(null);

    const { error } = await supabase
      .from("bod_bios")
      .delete()
      .eq("slug", selected.slug);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setOverrides((prev) => {
      const next = { ...prev };
      delete next[selected.slug];
      return next;
    });
    setDraftBio(selected.placeholder ?? "");
    setDraftPhoto(selected.placeholderPhoto ?? "");
    setPhotoPreview(null);
    setDraftLinks(
      selected.supportsLinks
        ? { ...EMPTY_LINKS, ...selected.placeholderLinks }
        : EMPTY_LINKS,
    );
    setStatus("idle");
  }

  const hasOverride = selected ? Boolean(overrides[selected.slug]) : false;
  const dirty = selected
    ? draftBio !== effectiveBio(selected, overrides) ||
      draftPhoto !== effectivePhoto(selected, overrides) ||
      (selected.supportsLinks &&
        LINK_KEYS.some(
          (key) => draftLinks[key] !== effectiveLinks(selected, overrides)[key],
        ))
    : false;

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-zinc-100 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/dashboard"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-white"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
          Edit BOD details
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-500">
          Pick a seat to edit its photo, bio and contact links. Saved changes
          go straight to the live site — the crew section on the homepage
          picks them up on load.
        </p>

        {loading ? (
          <p className="mt-10 text-sm text-zinc-500">Loading roster…</p>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <div className="space-y-8">
              {GROUPS.map((group) => (
                <div key={group.id}>
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
                    {group.label}
                  </h2>
                  <ul className="mt-3 space-y-1.5">
                    {group.items.map((item) => {
                      const active = item.slug === selectedSlug;
                      const customized = Boolean(overrides[item.slug]);
                      return (
                        <li key={item.slug}>
                          <button
                            type="button"
                            onClick={() => selectItem(item)}
                            className={`flex w-full items-center justify-between gap-3 border px-3 py-2.5 text-left text-sm transition-colors ${
                              active
                                ? "border-nic-red bg-nic-red/10 text-white"
                                : "border-white/10 bg-zinc-950 text-zinc-300 hover:border-white/25"
                            }`}
                          >
                            <span>
                              <span className="block font-bold">
                                {item.role}
                              </span>
                              {item.name && (
                                <span className="block text-xs text-zinc-500">
                                  {item.name}
                                </span>
                              )}
                            </span>
                            {customized && (
                              <span
                                aria-hidden
                                title="Custom details saved"
                                className="h-2 w-2 shrink-0 rounded-full bg-nic-red"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border border-white/10 bg-zinc-950 p-6">
              {!selected ? (
                <p className="text-sm text-zinc-500">
                  Select a designation on the left to edit its details.
                </p>
              ) : (
                <>
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
                    {selected.role}
                  </span>
                  <h2 className="mt-2 text-lg font-bold text-white">
                    {selected.name || "Seat open"}
                  </h2>
                  {hasOverride && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Showing saved details, not the placeholder.
                    </p>
                  )}

                  <div className="mt-6 flex items-start gap-4">
                    {/*
                     * A plain <img>, not next/image: the preview is a local
                     * blob: URL while a file is uploading, which next/image
                     * can't optimize, and this thumbnail is small and fixed
                     * — the deck's performance rules don't apply on an
                     * admin-only screen.
                     */}
                    <div className="h-28 w-24 shrink-0 overflow-hidden border border-white/15 bg-black">
                      {photoPreview || draftPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photoPreview || draftPhoto}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                          No photo
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs uppercase tracking-[0.2em] text-zinc-400">
                        Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          disabled={photoStatus === "uploading"}
                          className="mt-2 block w-full text-xs text-zinc-400 file:mr-3 file:border file:border-white/15 file:bg-black file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-[0.15em] file:text-zinc-300 hover:file:border-nic-red"
                        />
                      </label>

                      {photoStatus === "uploading" && (
                        <p className="mt-2 text-xs text-zinc-500">
                          Uploading…
                        </p>
                      )}
                      {photoError && (
                        <p className="mt-2 text-xs text-red-400" role="alert">
                          {photoError}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={!draftPhoto && !photoPreview}
                        className="mt-2 text-xs uppercase tracking-[0.15em] text-zinc-500 underline decoration-dotted hover:text-white disabled:opacity-40 disabled:no-underline"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>

                  <label className="mt-6 block text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Bio
                    <textarea
                      value={draftBio}
                      onChange={(event) => {
                        setDraftBio(event.target.value);
                        setStatus("idle");
                      }}
                      rows={8}
                      className="mt-2 w-full border border-white/15 bg-black px-3 py-2.5 text-sm leading-relaxed text-white outline-none focus:border-nic-red"
                    />
                  </label>

                  {selected.supportsLinks && (
                    <div className="mt-6 space-y-4">
                      <span className="block text-xs uppercase tracking-[0.2em] text-zinc-400">
                        Contact links
                      </span>
                      {LINK_KEYS.map((key) => (
                        <label
                          key={key}
                          className="block text-xs uppercase tracking-[0.2em] text-zinc-500"
                        >
                          {LINK_LABELS[key]}
                          <input
                            type={key === "email" ? "email" : "url"}
                            value={draftLinks[key]}
                            placeholder={
                              key === "email"
                                ? "someone@example.com"
                                : "https://…"
                            }
                            onChange={(event) => {
                              setDraftLinks((prev) => ({
                                ...prev,
                                [key]: event.target.value,
                              }));
                              setStatus("idle");
                            }}
                            className="mt-1.5 w-full border border-white/15 bg-black px-3 py-2 text-sm normal-case tracking-normal text-white outline-none focus:border-nic-red"
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  {errorMessage && (
                    <p className="mt-3 text-sm text-red-400" role="alert">
                      {errorMessage}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={
                        status === "saving" ||
                        photoStatus === "uploading" ||
                        !dirty
                      }
                      className="bg-nic-red px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-opacity disabled:opacity-40"
                    >
                      {status === "saving" ? "Saving…" : "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={status === "saving" || !hasOverride}
                      className="border border-white/15 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-nic-red hover:text-white disabled:opacity-40"
                    >
                      Reset to default
                    </button>

                    {status === "saved" && !dirty && (
                      <span className="text-xs text-zinc-500">Saved.</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
