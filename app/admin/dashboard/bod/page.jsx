"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CornerTicks from "@/components/CornerTicks";
import { PageHeading, Slate } from "@/components/Admin/ui";
import {
  ADMIN_BTN_GHOST,
  ADMIN_BTN_PRIMARY,
  ADMIN_FIELD,
  ADMIN_LABEL,
  ADMIN_PANEL,
} from "@/components/Admin/surfaces";
import { GRAIN_PLATE, LABEL_SHADOW } from "@/components/surfaces";
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
        placeholderRole: person.role,
        placeholderName: person.name,
        placeholder: person.bio,
        placeholderPhoto: person.photo,
        supportsLinks: false,
      })),
    },
    ...BOARDS.map((board) => ({
      id: board.id,
      label: board.short,
      items: board.terms[DEFAULT_TERM].members.map((member) => ({
        slug: member.slug,
        placeholderRole: member.role,
        placeholderName: member.name,
        placeholder: member.bio,
        placeholderPhoto: member.photo,
        placeholderLinks: member.links || {},
        supportsLinks: true,
      })),
    })),
  ];
}

const GROUPS = buildGroups();

/**
 * Who currently holds a seat: whoever an admin saved into it, or whoever
 * content.js still says. The same fallback the public site applies in
 * CrewSequence, restated here so the rail and the form agree with it.
 *
 * There is deliberately no `effectiveRole` beside this. The designation is
 * what the seat *is* — the boards are dealt by it, `SEATS_PER_SCREEN`
 * counts it, and the popup's tag is sized for it — so it stays in
 * content.js and the editor only ever shows it back, read-only.
 */
function effectiveName(item, overrides) {
  return overrides[item.slug]?.name || item.placeholderName || "";
}

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
  const [draftName, setDraftName] = useState("");
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
      .select("slug, name, bio, photo_url, email, instagram, linkedin, github")
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) {
          const map = {};
          for (const row of data) {
            const links = {};
            for (const key of LINK_KEYS) {
              if (row[key] != null) links[key] = row[key];
            }
            map[row.slug] = {
              name: row.name,
              bio: row.bio,
              photo: row.photo_url,
              links,
            };
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
    setDraftName(effectiveName(item, overrides));
    setDraftBio(effectiveBio(item, overrides));
    setDraftPhoto(effectivePhoto(item, overrides));
    setDraftLinks(
      item.supportsLinks ? effectiveLinks(item, overrides) : EMPTY_LINKS,
    );
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
      // Trimmed, and an empty box stored as null rather than "" — null is
      // what the merge on the public site reads as "unchanged", so clearing
      // the field hands the seat back to content.js instead of blanking it.
      name: draftName.trim() || null,
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
        name: row.name,
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
    setDraftName(selected.placeholderName ?? "");
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
    ? draftName !== effectiveName(selected, overrides) ||
      draftBio !== effectiveBio(selected, overrides) ||
      draftPhoto !== effectivePhoto(selected, overrides) ||
      (selected.supportsLinks &&
        LINK_KEYS.some(
          (key) => draftLinks[key] !== effectiveLinks(selected, overrides)[key],
        ))
    : false;

  const editedCount = Object.keys(overrides).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-8 sm:py-16">
      <Link
        href="/admin/dashboard"
        className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 transition-colors hover:text-white"
      >
        ← Dashboard
      </Link>

      <div className="mt-6">
        <PageHeading eyebrow="Roster" lead="Edit BOD" accent="Details">
          Pick a designation to edit its photo, bio and contact links. Saved
          changes go straight to the live site — the crew section on the
          homepage picks them up on load.
        </PageHeading>
      </div>

      {loading ? (
        <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
          Loading roster…
        </p>
      ) : (
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-8">
          {/* ----------------------------------------------------- the rail */}
          {/*
           * Scrolls inside itself on a wide screen, so a seat three boards
           * down is still one click away from the form rather than a scroll
           * back up. `top-20` clears the sticky bar above it.
           */}
          <div className="lg:sticky lg:top-20 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:pr-1">
            <div className="space-y-7">
              {GROUPS.map((group) => (
                <section key={group.id}>
                  <Slate count={group.items.length}>{group.label}</Slate>

                  <ul className="mt-2.5 space-y-1.5">
                    {group.items.map((item, index) => {
                      const active = item.slug === selectedSlug;
                      const customized = Boolean(overrides[item.slug]);
                      // Who the seat reads as now, so a rename shows up in
                      // the rail the moment it is saved rather than at the
                      // next reload. The designation beside it never moves.
                      const railName = effectiveName(item, overrides);

                      return (
                        <li key={item.slug}>
                          <button
                            type="button"
                            onClick={() => selectItem(item)}
                            aria-current={active}
                            className={`flex w-full items-center gap-3 border-l-2 py-2.5 pl-3 pr-3 text-left transition-all duration-300 focus-visible:outline-none ${
                              active
                                ? "border-nic-red bg-nic-red/12"
                                : "border-white/10 bg-black/55 backdrop-blur-sm hover:border-white/35 hover:bg-black/75"
                            }`}
                          >
                            <span
                              className={`shrink-0 font-mono text-[10px] tabular-nums ${
                                active ? "text-nic-ember" : "text-zinc-600"
                              }`}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span
                                className={`block truncate text-[13px] font-bold leading-tight ${
                                  active ? "text-white" : "text-zinc-200"
                                }`}
                              >
                                {item.placeholderRole}
                              </span>
                              {railName && (
                                <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                                  {railName}
                                </span>
                              )}
                            </span>

                            {customized && (
                              <span
                                title="Edited — saved details are live"
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-nic-red shadow-[0_0_8px_1px_rgba(237,10,20,0.8)]"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------- the form */}
          <div className={`relative ${ADMIN_PANEL}`}>
            <CornerTicks still />

            {!selected ? (
              <div className="flex min-h-[24rem] flex-col items-center justify-center px-8 py-16 text-center">
                <span
                  aria-hidden
                  className="font-mono text-5xl font-black text-white/[0.06]"
                >
                  {String(editedCount).padStart(2, "0")}
                </span>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
                  Select a designation on the left to edit its details.
                  {editedCount > 0 && (
                    <>
                      {" "}
                      <span className="text-zinc-400">
                        {editedCount} {editedCount === 1 ? "seat has" : "seats have"}{" "}
                        saved edits — marked with a red dot.
                      </span>
                    </>
                  )}
                </p>
              </div>
            ) : (
              <>
                {/* ------------------------------------------- who is open */}
                <div className="border-b border-white/10 p-6 sm:p-7">
                  {/* The card's own two marks. The name is drawn off the
                      draft, so a rename is visible in the shape it will
                      take before it is saved; the designation is the seat
                      itself and is only ever shown back. */}
                  <span
                    className={`inline-block border-l-2 border-nic-red bg-nic-red/12 py-1 pl-2 pr-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#ff6b6b] ${LABEL_SHADOW}`}
                  >
                    {selected.placeholderRole}
                  </span>

                  <h2 className="mt-3.5 text-2xl font-black uppercase leading-[0.95] tracking-tight text-white">
                    {draftName || "Seat open"}
                  </h2>

                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    {hasOverride
                      ? "Showing saved details"
                      : "Showing the placeholder from the codebase"}
                  </p>
                </div>

                <div className="p-6 sm:p-7">
                  {/* -------------------------------------- who and what */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Emptying this stores null, which the site reads as
                        "use content.js" — so a cleared box is a reset, not
                        a nameless seat. */}
                    <label className={`block ${ADMIN_LABEL}`}>
                      Name
                      <input
                        type="text"
                        value={draftName}
                        placeholder={selected.placeholderName}
                        onChange={(event) => {
                          setDraftName(event.target.value);
                          setStatus("idle");
                        }}
                        className={`mt-2.5 normal-case tracking-normal ${ADMIN_FIELD}`}
                      />
                    </label>

                    {/*
                     * Shown, and frozen. The designation is what the seat
                     * is rather than something about whoever is in it: the
                     * boards are dealt in this order, the rail is grouped
                     * by it, and the site's own tags are sized for these
                     * exact strings. It stays in content.js.
                     *
                     * `readOnly` rather than `disabled` — it still takes
                     * focus and can be copied, it just cannot be typed
                     * into, and the cursor says so.
                     */}
                    <label className={`block ${ADMIN_LABEL}`}>
                      <span className="flex items-center gap-2">
                        Designation
                        <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">
                          — locked
                        </span>
                      </span>
                      <input
                        type="text"
                        value={selected.placeholderRole}
                        readOnly
                        aria-readonly="true"
                        tabIndex={-1}
                        className={`mt-2.5 cursor-not-allowed border-white/8 bg-black/30 normal-case tracking-normal text-zinc-500 focus:border-white/8 focus:bg-black/30 ${ADMIN_FIELD}`}
                      />
                    </label>
                  </div>

                  <p className="mt-2.5 text-xs leading-relaxed text-zinc-600">
                    The designation, the board a seat sits on and its
                    position in the order all come from the roster in code —
                    they decide how the boards are dealt, so they are not
                    editable here.
                  </p>

                  {/* ------------------------------------------- the photo */}
                  <span className={`mt-8 block ${ADMIN_LABEL}`}>Photo</span>

                  <div className="mt-3 flex items-start gap-5">
                    {/*
                     * Shown at the 4:5 the roster card crops to, mounted on
                     * the same grain plate and ticks, so what is checked here
                     * is the shape the site will actually draw.
                     *
                     * A plain <img> rather than next/image: the preview is a
                     * local blob: URL while a file uploads, which the
                     * optimizer cannot take, and this is an admin-only
                     * thumbnail.
                     */}
                    <figure className="relative aspect-4/5 w-28 shrink-0 overflow-hidden border border-white/15 bg-zinc-900 sm:w-32">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-10 mix-blend-screen"
                        style={{ backgroundImage: GRAIN_PLATE, opacity: 0.16 }}
                      />

                      {photoPreview || draftPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photoPreview || draftPhoto}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center px-2 text-center font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-zinc-600">
                          No photo
                        </span>
                      )}

                      {photoStatus === "uploading" && (
                        <span className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 font-mono text-[9px] uppercase tracking-[0.2em] text-white">
                          Uploading…
                        </span>
                      )}

                      <CornerTicks still />
                    </figure>

                    <div className="min-w-0 flex-1">
                      <input
                        id="bod-photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        disabled={photoStatus === "uploading"}
                        className="block w-full font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500 file:mr-3 file:cursor-pointer file:border file:border-white/15 file:bg-black/60 file:px-3.5 file:py-2 file:font-mono file:text-[10px] file:font-bold file:uppercase file:tracking-[0.2em] file:text-zinc-300 hover:file:border-nic-red hover:file:text-white"
                      />

                      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                        Replaces the portrait on the card and in the popup.
                        A tall, roughly 4:5 crop reads best.
                      </p>

                      {/*
                       * Said out loud because this editor cannot fix it: each
                       * seat's face position is a percentage measured against
                       * the original photograph and still lives in
                       * content.js, so a new photo framed differently can sit
                       * off-centre until that number is re-measured.
                       */}
                      <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                        The face position (<code className="text-zinc-500">crop</code>)
                        stays as set in the codebase — a very differently framed
                        photo may need it re-measured.
                      </p>

                      {photoError && (
                        <p
                          role="alert"
                          className="mt-3 border-l-2 border-nic-red bg-nic-red/10 px-3 py-2 text-xs text-[#ff8a8a]"
                        >
                          {photoError}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={!draftPhoto && !photoPreview}
                        className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 underline decoration-dotted underline-offset-4 transition-colors hover:text-nic-ember disabled:opacity-40 disabled:no-underline disabled:hover:text-zinc-500"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>

                  {/* --------------------------------------------- the bio */}
                  <label className={`mt-8 block ${ADMIN_LABEL}`}>
                    Bio
                    <textarea
                      value={draftBio}
                      onChange={(event) => {
                        setDraftBio(event.target.value);
                        setStatus("idle");
                      }}
                      rows={7}
                      className={`mt-2.5 resize-y normal-case leading-relaxed tracking-normal ${ADMIN_FIELD}`}
                    />
                  </label>

                  {/* ------------------------------------------- the links */}
                  {selected.supportsLinks && (
                    <fieldset className="mt-8">
                      <legend className={ADMIN_LABEL}>Contact links</legend>

                      <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                        The popup shows all four tiles either way — an empty
                        one renders dimmed and dead rather than disappearing.
                      </p>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {LINK_KEYS.map((key) => (
                          <label
                            key={key}
                            className="block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500"
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
                              className={`mt-2 normal-case tracking-normal ${ADMIN_FIELD}`}
                            />
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {errorMessage && (
                    <p
                      role="alert"
                      className="mt-6 border-l-2 border-nic-red bg-nic-red/10 px-3 py-2 text-sm text-[#ff8a8a]"
                    >
                      {errorMessage}
                    </p>
                  )}
                </div>

                {/* ------------------------------------------------ commit */}
                <div className="flex flex-wrap items-center gap-3 border-t border-white/10 bg-black/40 p-6 sm:px-7">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                      status === "saving" ||
                      photoStatus === "uploading" ||
                      !dirty
                    }
                    className={ADMIN_BTN_PRIMARY}
                  >
                    {status === "saving" ? "Saving…" : "Save changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={status === "saving" || !hasOverride}
                    className={ADMIN_BTN_GHOST}
                  >
                    Reset to default
                  </button>

                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    {status === "saved" && !dirty
                      ? "Saved — live on the site"
                      : dirty
                        ? "Unsaved changes"
                        : ""}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
