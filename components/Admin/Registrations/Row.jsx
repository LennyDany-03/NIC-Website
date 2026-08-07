"use client";

import { useCallback, useEffect, useState } from "react";
import { LABEL_SHADOW } from "../../surfaces";
import { ADMIN_BTN_GHOST } from "../surfaces";

/**
 * One registration, closed and open.
 *
 * Closed it is the five things a coordinator scans a list for — the code, who
 * it belongs to, their class, whether it has been checked, and when it came in.
 * Open it is everything else, including the screenshot, which is the whole
 * reason this screen exists: verifying a payment means looking at a picture of
 * it, and a register that made you open a new tab per row to do that would be a
 * register nobody used twice.
 *
 * A `<button>` heading a region rather than a row with a click handler, so the
 * thing that expands is reachable by keyboard and announces its state. The
 * detail is unmounted rather than hidden when closed — it holds an image, and a
 * hundred hidden `<img>` tags all pointed at signed URLs is a hundred requests
 * for something nobody is looking at.
 */
export default function Row({ row, bucket, supabase, expanded, onToggle }) {
  return (
    <div className="border border-white/10 bg-black/60 transition-colors hover:border-white/20">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nic-red sm:px-5"
      >
        <span
          aria-hidden
          className={`shrink-0 font-mono text-[11px] text-nic-red transition-transform duration-300 ${expanded ? "rotate-90" : ""}`}
        >
          ▸
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[11px] uppercase tracking-[0.2em] text-nic-ember">
            {row.ticket_code}
          </span>
          <span className="mt-1 block truncate text-sm font-medium text-white">
            {row.name}
          </span>
        </span>

        <span className="hidden min-w-0 shrink-0 sm:block sm:w-44">
          <span className="block truncate font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            {row.stream}
            {row.section ? ` — ${row.section}` : ""}
          </span>
          <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            {row.register_number}
          </span>
        </span>

        <StatusTag status={row.status} />
      </button>

      {expanded ? (
        <Detail row={row} bucket={bucket} supabase={supabase} />
      ) : null}
    </div>
  );
}

/**
 * Whether a coordinator has been through this one yet.
 *
 * Amber for pending rather than grey, because "nobody has checked this" is the
 * state that wants doing something about — grey would file it under settled.
 * Nothing on this screen writes the column; it is set in the SQL editor, and
 * the tag is here so that when it is set, the register shows it.
 */
function StatusTag({ status }) {
  const tone =
    status === "confirmed"
      ? "border-emerald-500/50 text-emerald-400"
      : status === "rejected"
        ? "border-nic-red/60 text-nic-red"
        : "border-amber-500/50 text-amber-400";

  return (
    <span
      className={`shrink-0 border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] ${tone} ${LABEL_SHADOW}`}
    >
      {status}
    </span>
  );
}

function Detail({ row, bucket, supabase }) {
  return (
    <div className="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Fact label="Email" value={row.email} wrap />
        <Fact label="Register number" value={row.register_number} />
        <Fact label="Year" value={row.year} />
        <Fact label="Class" value={row.stream} />
        <Fact label="Section" value={row.section} />
        <Fact label="Registered" value={formatWhen(row.created_at)} />
        <Fact label="Transaction / UTR" value={row.transaction_id} wrap />
        <Fact label="Amount" value={row.amount != null ? `₹${row.amount}` : "—"} />
        <Fact label="Ticket code" value={row.ticket_code} />
      </dl>

      {row.notes ? (
        <p className="mt-5 border-l-2 border-nic-red/60 pl-4 text-sm leading-relaxed text-zinc-400">
          {row.notes}
        </p>
      ) : null}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Attachment
          label="Payment screenshot"
          path={row.proof_path}
          bucket={bucket}
          supabase={supabase}
          missing="No screenshot was uploaded with this registration."
        />
        <Attachment
          label="Ticket"
          path={row.ticket_path}
          bucket={bucket}
          supabase={supabase}
          missing="The ticket image did not upload. The code above is still valid."
        />
      </div>
    </div>
  );
}

function Fact({ label, value, wrap }) {
  return (
    <div className="min-w-0">
      <dt
        className={`font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500 ${LABEL_SHADOW}`}
      >
        {label}
      </dt>
      <dd
        className={`mt-1.5 text-sm text-white ${wrap ? "break-all" : "truncate"}`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

/**
 * One of the two files in the private bucket.
 *
 * The URL is signed on mount — that is, when the row is opened — rather than
 * for every row up front. The bucket is private precisely so these cannot be
 * guessed at, and the cost of that is a round trip per object; spending it only
 * on the row somebody actually opened is the difference between a register that
 * loads and one that signs two hundred URLs to show ten.
 *
 * An hour of validity. Long enough to work through a morning's payments without
 * the image dying mid-scroll, short enough that a URL pasted into a chat stops
 * working long before it stops being somebody's bank screenshot.
 */
function Attachment({ label, path, bucket, supabase, missing }) {
  const [url, setUrl] = useState(null);
  const [state, setState] = useState("idle");

  const sign = useCallback(async () => {
    if (!path) return;
    setState("loading");

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600);

    if (error) {
      setState("error");
      return;
    }

    setUrl(data.signedUrl);
    setState("ready");
  }, [bucket, path, supabase]);

  useEffect(() => {
    sign();
  }, [sign]);

  return (
    <div className="min-w-0">
      <p
        className={`font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500 ${LABEL_SHADOW}`}
      >
        {label}
      </p>

      {!path ? (
        <p className="mt-2 text-xs leading-relaxed text-amber-400/80">{missing}</p>
      ) : state === "error" ? (
        <p className="mt-2 text-xs leading-relaxed text-nic-red">
          That file could not be opened. It may have been removed from the
          bucket.
        </p>
      ) : state !== "ready" ? (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          Loading…
        </p>
      ) : (
        <div className="mt-2.5">
          {/* Not `next/image`: the source is a signed URL that expires, on a
              host the optimiser is not configured for, for an image nobody
              needs resized. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`${label} for ${path}`}
            className="max-h-64 w-auto max-w-full border border-white/12 bg-black/40 object-contain"
          />

          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className={`mt-3 ${ADMIN_BTN_GHOST}`}
          >
            Open full size ↗
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * A timestamp as a coordinator in Chennai reads it.
 *
 * Pinned to `Asia/Kolkata` rather than left to the viewer's zone: the workshop,
 * the payments and everybody checking them are in IST, and a register that
 * quietly re-times itself because somebody opened it on a laptop still set to
 * another zone would be wrong in a way nothing on screen explains. Formatted in
 * the browser only — this component never renders on the server, so there is no
 * locale mismatch to hydrate through.
 */
function formatWhen(iso) {
  if (!iso) return "—";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
