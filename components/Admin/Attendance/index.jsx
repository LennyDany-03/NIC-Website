"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LABEL_SHADOW } from "../../surfaces";
import { PageHeading } from "../ui";
import { ADMIN_BTN_GHOST, ADMIN_FIELD, ADMIN_PANEL } from "../surfaces";

/**
 * Who is in the room.
 *
 * The other end of the scanner: every registration the door has admitted, most
 * recent first, so the person running the desk can watch the hall fill up
 * without standing at the door themselves. Nothing reaches this list except
 * through the scanner — `attended_at` is written in exactly one place — which
 * is what makes it an attendance sheet rather than a second opinion.
 *
 * It polls. A door and a desk are two different devices, often two different
 * people, and a list that only updated when somebody remembered to reload is a
 * list that is quietly wrong for most of the morning. Fifteen seconds is slow
 * enough to be free — one indexed query returning a few hundred rows — and fast
 * enough that the count on screen is never meaningfully behind the room.
 *
 * (Supabase Realtime would push these instead of polling for them, and is the
 * better answer if this ever runs at a scale where the poll shows up. It needs
 * the table added to the `supabase_realtime` publication, which is a schema
 * change; polling needs nothing and cannot fall silently out of sync, which at
 * one workshop a term is the trade worth making.)
 */

const POLL_MS = 15000;

export default function Attendance({ event, adminId }) {
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState([]);
  const [state, setState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState(null);
  const [query, setQuery] = useState("");
  const [checkedAt, setCheckedAt] = useState(null);

  /* The poll must not fight the component's own lifecycle: a fetch in flight
     when the screen closes would otherwise call setState on a dead tree, and —
     worse on a phone — a second interval can be started by a re-render before
     the first is cleared. */
  const alive = useRef(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from(event.table)
      .select("*")
      .not("attended_at", "is", null)
      .order("attended_at", { ascending: false });

    if (!alive.current) return;

    if (error) {
      setState("error");
      setErrorMessage(error.message);
      return;
    }

    setRows(data ?? []);
    setCheckedAt(new Date());
    setState("ready");
  }, [event.table, supabase]);

  useEffect(() => {
    alive.current = true;
    load();

    const timer = setInterval(load, POLL_MS);

    return () => {
      alive.current = false;
      clearInterval(timer);
    };
  }, [load]);

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return rows;

    return rows.filter((row) => {
      const haystack = [
        row.ticket_code,
        row.name,
        row.register_number,
        row.stream,
        row.section,
        row.year,
      ]
        .join(" ")
        .toLowerCase();

      return terms.every((term) => haystack.includes(term));
    });
  }, [query, rows]);

  /**
   * The number printed beside each name: the order they walked in.
   *
   * Built once per fetch rather than looked up per row while rendering.
   * `rows.indexOf(row)` inside the map would be a scan of the whole list for
   * every line drawn, which is the kind of quadratic that is invisible at the
   * twenty rows this is developed against and noticeable at the two hundred it
   * is used at. `rows` is newest-first, so the earliest arrival is number one.
   */
  const entryNumbers = useMemo(() => {
    const map = new Map();
    rows.forEach((row, index) => map.set(row.ticket_code, rows.length - index));
    return map;
  }, [rows]);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-14 sm:px-8 sm:py-20">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link
          href="/admin/dashboard"
          className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 transition-colors hover:text-white"
        >
          <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          Dashboard
        </Link>

        <Link
          href="/admin/dashboard/scanner"
          className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 transition-colors hover:text-white"
        >
          The scanner ↗
        </Link>
      </div>

      <div className="mt-6">
        <PageHeading eyebrow="Entry" lead="In the" accent="room">
          {event.lead} {event.title} — everybody the scanner has let in, newest
          first. This list is written only by the door.
        </PageHeading>
      </div>

      {/* ------------------------------------------------------- the headcount */}
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border border-white/10 bg-black/70 px-5 py-5 backdrop-blur-md sm:px-6">
        <div>
          <p
            className={`font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500 sm:text-[10px] ${LABEL_SHADOW}`}
          >
            Admitted
          </p>
          <p className="mt-2 font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
            {state === "ready" ? String(rows.length).padStart(2, "0") : "––"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* The timestamp is the honest part of a polling screen: it says how
              stale what you are looking at is allowed to be, which a spinner
              that appears every fifteen seconds would not. */}
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
            {checkedAt
              ? `Checked ${checkedAt.toLocaleTimeString("en-IN", { hour12: true })}`
              : ""}
          </span>

          <button type="button" onClick={load} className={ADMIN_BTN_GHOST}>
            Refresh
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------- the search */}
      <div className="mt-8">
        <label
          htmlFor="attendance-search"
          className={`font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 ${LABEL_SHADOW}`}
        >
          Find somebody who came in
        </label>

        <input
          id="attendance-search"
          type="search"
          value={query}
          onChange={(changeEvent) => setQuery(changeEvent.target.value)}
          placeholder="Name, register number or ticket code…"
          autoComplete="off"
          className={`mt-2.5 ${ADMIN_FIELD}`}
        />

        <p
          aria-live="polite"
          className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600"
        >
          {state === "ready" && query.trim()
            ? `${filtered.length} of ${rows.length} matching`
            : ""}
        </p>
      </div>

      {/* ------------------------------------------------------------ the sheet */}
      <div className="mt-6">
        {state === "loading" ? (
          <p className={`p-7 text-sm text-zinc-400 ${ADMIN_PANEL}`}>
            Reading the attendance sheet…
          </p>
        ) : state === "error" ? (
          <div className={`p-7 ${ADMIN_PANEL}`}>
            <p className="text-sm leading-relaxed text-nic-red">
              The attendance sheet could not be read.
            </p>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-600">
              {errorMessage}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <p className={`p-7 text-sm leading-relaxed text-zinc-400 ${ADMIN_PANEL}`}>
            Nobody has been let in yet. Names appear here the moment a
            coordinator admits somebody on the scanner.
          </p>
        ) : filtered.length === 0 ? (
          <p className={`p-7 text-sm leading-relaxed text-zinc-400 ${ADMIN_PANEL}`}>
            Nobody matching “{query.trim()}” has come in.
          </p>
        ) : (
          <ol className="grid gap-2">
            {filtered.map((row) => (
              <li
                key={row.ticket_code}
                className="flex items-center gap-4 border border-white/10 bg-black/60 px-4 py-3.5 sm:px-5"
              >
                {/* Numbered against the whole list rather than the filtered
                    one, so the figure beside a name is the order they walked in
                    and not their position in a search result. */}
                <span
                  aria-hidden
                  className="w-8 shrink-0 font-mono text-[11px] tracking-[0.1em] text-zinc-600"
                >
                  {String(entryNumbers.get(row.ticket_code) ?? 0).padStart(2, "0")}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">
                    {row.name}
                  </span>
                  <span className="mt-1 block truncate font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {row.stream}
                    {row.section ? ` — ${row.section}` : ""} · {row.register_number}
                  </span>
                </span>

                <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-nic-ember sm:block">
                  {row.ticket_code}
                </span>

                <span className="shrink-0 text-right">
                  <span className="block font-mono text-[11px] tracking-[0.1em] text-emerald-400">
                    {formatTime(row.attended_at)}
                  </span>
                  {/* Who was on the door. A raw uuid would be noise, so it is
                      reduced to the only distinction anybody cares about while
                      two coordinators are scanning at two doors. */}
                  <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">
                    {row.attended_by
                      ? row.attended_by === adminId
                        ? "by you"
                        : "by a coordinator"
                      : ""}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}

function formatTime(iso) {
  if (!iso) return "—";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeStyle: "medium",
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
