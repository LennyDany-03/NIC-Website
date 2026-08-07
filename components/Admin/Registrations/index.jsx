"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Row from "./Row";
import { ADMITS } from "./status";
import { LABEL_SHADOW } from "../../surfaces";
import { BackLink, PageHeading } from "../ui";
import { ADMIN_FIELD, ADMIN_PANEL } from "../surfaces";

/**
 * One event's register.
 *
 * Generic over an entry in `events.js` — it is handed a table name and a bucket
 * name and knows nothing else about which event it is showing, so the second
 * event to start collecting registrations needs a row in that file and no code
 * here.
 *
 * A client component that fetches on mount rather than a server component that
 * fetches during render, and the reason is the search. Filtering happens on
 * every keystroke against rows that are already in memory; done on the server
 * it would be a round trip per character for a dataset that fits in a variable.
 * A workshop is bounded by the hall it is held in — a couple of hundred rows at
 * the very most — so the whole register is fetched once and every question
 * asked of it afterwards is answered locally.
 *
 * Nothing here writes. The register is a record of what students submitted, and
 * the one column an admin would want to change — `status` — is deliberately not
 * editable from this screen: confirming a payment is a decision made by looking
 * at a bank statement next to a screenshot, and a click target sitting beside
 * two hundred rows is how the wrong one gets confirmed at half past nine in the
 * morning. It is set in the SQL editor, and this screen shows it back.
 */
export default function Registrations({ event, initialQuery = "" }) {
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState([]);
  const [state, setState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState(null);
  /* Seeded from `?q=` so the scanner can hand a refused ticket straight to the
     row it belongs to. State rather than a controlled reading of the URL: once
     the screen is open the search box is the coordinator's, and typing in it
     must not be fighting a query string that never changes. */
  const [query, setQuery] = useState(initialQuery);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let active = true;

    supabase
      .from(event.table)
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          setState("error");
          setErrorMessage(error.message);
          return;
        }

        setRows(data ?? []);
        setState("ready");
      });

    return () => {
      active = false;
    };
  }, [event.table, supabase]);

  /**
   * The search, as a coordinator would expect it to behave.
   *
   * Every word has to match *somewhere* in the row, not all in the same field —
   * so "lenny aiml" finds the AIML student called Lenny, and a register number
   * pasted whole finds exactly one row. Case and surrounding space are
   * discarded because half of what gets typed in here has been copied off a
   * WhatsApp message.
   *
   * Recomputed on every keystroke over the whole array, which is the right
   * shape at this size: a few hundred rows against a handful of terms is
   * microseconds, and any indexing scheme cleverer than this would be a cache
   * to keep in step for no gain anybody could perceive.
   */
  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return rows;

    return rows.filter((row) => {
      const haystack = [
        row.ticket_code,
        row.name,
        row.email,
        row.register_number,
        row.college,
        row.stream,
        row.section,
        row.year,
        row.transaction_id,
        row.status,
      ]
        .join(" ")
        .toLowerCase();

      return terms.every((term) => haystack.includes(term));
    });
  }, [query, rows]);

  const counts = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((row) => row.status === "pending").length,
      verified: rows.filter((row) => row.status === ADMITS).length,
      admitted: rows.filter((row) => row.attended_at).length,
    }),
    [rows],
  );

  /**
   * Rewrite one row in place after its dropdown changed it.
   *
   * Called twice per change on a failed write — once optimistically with the
   * new value, once again with the old one to put it back — which is why it
   * takes the value to set rather than toggling anything itself. Matched on
   * `ticket_code` because that is the column the update was keyed on, so the
   * screen and the database are identifying the same row the same way.
   */
  const applyStatus = useCallback((row, status) => {
    setRows((prev) =>
      prev.map((entry) =>
        entry.ticket_code === row.ticket_code ? { ...entry, status } : entry,
      ),
    );
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-8 sm:py-20">
      <BackLink href="/admin/dashboard/events">All events</BackLink>

      <div className="mt-6">
        <PageHeading eyebrow={event.kind} lead={event.lead} accent={event.title}>
          {event.dateLabel} · {event.timeLabel}. Every seat taken through the
          registration page, newest first. Setting a row to Verified is what
          lets its ticket through the door — the scanner is on the dashboard.
        </PageHeading>
      </div>

      {/* ------------------------------------------------------- the counts */}
      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
        {[
          { label: "Registered", value: counts.total },
          { label: "Pending", value: counts.pending },
          { label: "Verified", value: counts.verified },
          { label: "Admitted", value: counts.admitted },
        ].map((stat) => (
          <div key={stat.label} className="bg-black/70 px-4 py-5 backdrop-blur-md sm:px-6">
            <dt
              className={`font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500 sm:text-[10px] ${LABEL_SHADOW}`}
            >
              {stat.label}
            </dt>
            <dd className="mt-2 font-mono text-2xl font-black tracking-tight text-white sm:text-3xl">
              {state === "ready" ? String(stat.value).padStart(2, "0") : "––"}
            </dd>
          </div>
        ))}
      </dl>

      {/* ------------------------------------------------------- the search */}
      <div className="mt-10">
        <label
          htmlFor="registration-search"
          className={`font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 ${LABEL_SHADOW}`}
        >
          Search the register
        </label>

        {/* `type="search"` for the platform's own clear button, which on a
            filter field is the control people reach for first. */}
        <input
          id="registration-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, register number, ticket code, email or UTR…"
          autoComplete="off"
          className={`mt-2.5 ${ADMIN_FIELD}`}
        />

        {/* The count is the feedback that a search did anything at all — with
            two hundred rows on screen, a filter that removed four of them is
            otherwise invisible. `aria-live` so it is announced rather than only
            seen, since typing here does not move focus. */}
        <p
          aria-live="polite"
          className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600"
        >
          {state === "ready"
            ? query.trim()
              ? `${filtered.length} of ${rows.length} matching`
              : `${rows.length} registration${rows.length === 1 ? "" : "s"}`
            : ""}
        </p>
      </div>

      {/* ------------------------------------------------------- the register */}
      <div className="mt-6">
        {state === "loading" ? (
          <p className={`p-7 text-sm text-zinc-400 ${ADMIN_PANEL}`}>
            Reading the register…
          </p>
        ) : state === "error" ? (
          <div className={`p-7 ${ADMIN_PANEL}`}>
            <p className="text-sm leading-relaxed text-nic-red">
              The register could not be read. If this event&apos;s SQL file has
              not been run against the project yet, that is the first thing to
              check.
            </p>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-600">
              {errorMessage}
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className={`p-7 ${ADMIN_PANEL}`}>
            <p className="text-sm leading-relaxed text-zinc-400">
              Nobody has registered yet. Rows appear here the moment a student
              reaches the ticket at the end of the registration page.
            </p>
            {/*
             * The other thing an empty register means, said out loud.
             * Registrations are readable only by accounts on the `nic_admins`
             * list, and row-level security expresses "you may not see this" as
             * an empty result rather than as an error — so a coordinator who
             * has an account but is not on that list sees exactly this screen.
             * Without this line the two cases are indistinguishable, and the
             * wrong one is very reassuring.
             */}
            <p className="mt-4 border-l-2 border-white/15 pl-4 font-mono text-[10px] leading-relaxed text-zinc-600">
              If you were expecting rows here, check that your account is on
              the admin list — see section 0 of
              supabase/workshop-modern-cyber-defence.sql.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className={`p-7 text-sm leading-relaxed text-zinc-400 ${ADMIN_PANEL}`}>
            Nothing matches “{query.trim()}”. Try a register number, or part of
            a name.
          </p>
        ) : (
          <div className="grid gap-2">
            {filtered.map((row) => (
              <Row
                key={row.id ?? row.ticket_code}
                row={row}
                bucket={event.bucket}
                table={event.table}
                supabase={supabase}
                onStatusChange={applyStatus}
                expanded={openId === (row.id ?? row.ticket_code)}
                /* One open at a time. Two expanded rows put four signed image
                   requests in flight and push the row being read off the
                   screen; this is a list to work down, not to compare across. */
                onToggle={() =>
                  setOpenId((prev) =>
                    prev === (row.id ?? row.ticket_code)
                      ? null
                      : (row.id ?? row.ticket_code),
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
