"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EVENTS } from "./events";
import { LABEL_SHADOW } from "../surfaces";
import {
  BOARDS,
  DEFAULT_TERM,
  MASTERMINDS,
  mastermindSlug,
} from "../CrewSequence/content";

/**
 * What the console is holding right now.
 *
 * This replaces a row that counted seats off `content.js` — faculty 03, senior
 * board 09, joint board 08. Those numbers were correct and they were useless:
 * they are the *size of the roster*, which is a constant until somebody edits
 * the codebase, so the strip read identically on every load the console has
 * ever had, directly above a card whose own copy already says it edits the
 * roster. A dashboard's opening row is the most-looked-at space on the screen,
 * and spending it on a number that cannot change is spending it on nothing.
 *
 * So these four are the things that *do* change between one load and the next,
 * and every one of them is a link to the screen that acts on it. A statistic
 * you cannot do anything about is trivia; a statistic that is also the door to
 * the work is the shortest path from opening the console to being in the right
 * place. Awaiting check is the one that matters most — it is a queue of
 * payments with students waiting on the other end of it — so it is the only
 * cell that lights up on its own.
 *
 * Its own client component rather than data fetched in `DashboardHome`, which
 * is deliberately a view that renders without a session (see the note at the
 * top of that file). The strip degrades to dashes until its numbers land, so
 * the page it sits in is still the same page with or without a database behind
 * it, and nothing below it moves when the counts arrive.
 */

/**
 * Every seat on the current roster, as the set of slugs `bod_bios` is keyed by.
 *
 * Built from the same two sources the editor's rail is built from, so "filled"
 * here and "has a red dot" there are the same claim. A `Set` because the
 * question asked of it is membership, once per saved row: the table can hold a
 * slug that is no longer on the roster — a seat from a previous term, or one
 * renamed in code after it was edited — and counting those would report more
 * seats filled than the roster has.
 */
const ROSTER_SLUGS = new Set([
  ...MASTERMINDS.people.map((person) => mastermindSlug(person.id)),
  ...BOARDS.flatMap((board) =>
    board.terms[DEFAULT_TERM].members.map((member) => member.slug),
  ),
]);

const ROSTER_TOTAL = ROSTER_SLUGS.size;

/**
 * Where the register cells point.
 *
 * Straight at the one event while there is only one — a list of one is a click
 * that asks somebody to confirm what they already chose — and at the index the
 * moment there are two, because by then the strip's sums are across all of them
 * and no single register is the answer.
 */
const REGISTER_HREF =
  ADMIN_EVENTS.length === 1
    ? `/admin/dashboard/events/${ADMIN_EVENTS[0].id}`
    : "/admin/dashboard/events";

export default function Pulse() {
  const supabase = useMemo(() => createClient(), []);

  const [state, setState] = useState("loading"); // loading | ready | error
  const [counts, setCounts] = useState({
    seats: 0,
    registered: 0,
    pending: 0,
    admitted: 0,
  });

  useEffect(() => {
    let active = true;

    (async () => {
      /*
       * Counted at the database rather than fetched and measured here.
       * `head: true` sends the filter and brings back the number alone — no
       * rows, no columns, no attendee's email crossing the wire for a figure
       * that is going to be rendered two characters wide. Three of these per
       * event and one small select for the roster is the whole cost of this
       * strip.
       */
      const countRows = (table, refine) => {
        const query = supabase
          .from(table)
          .select("ticket_code", { count: "exact", head: true });
        return refine ? refine(query) : query;
      };

      const [bios, ...registers] = await Promise.all([
        supabase.from("bod_bios").select("slug"),
        ...ADMIN_EVENTS.flatMap((event) => [
          countRows(event.table),
          countRows(event.table, (q) => q.eq("status", "pending")),
          countRows(event.table, (q) => q.not("attended_at", "is", null)),
        ]),
      ]);

      if (!active) return;

      /* One failure is the whole strip's failure. Half a status line is worse
         than none: a zero that is really "you are not on the admin list" reads
         exactly like a zero that is really "nobody has registered", and those
         two send a coordinator to very different places. */
      if (bios.error || registers.some((result) => result.error)) {
        setState("error");
        return;
      }

      const seats = (bios.data ?? []).filter((row) =>
        ROSTER_SLUGS.has(row.slug),
      ).length;

      /* Summed across every event with a register behind it, in the order the
         three queries were queued per event. One event today; the arithmetic is
         already right for the second one. */
      const sum = (offset) =>
        registers.reduce(
          (total, result, i) => (i % 3 === offset ? total + (result.count ?? 0) : total),
          0,
        );

      setCounts({
        seats,
        registered: sum(0),
        pending: sum(1),
        admitted: sum(2),
      });
      setState("ready");
    })();

    return () => {
      active = false;
    };
  }, [supabase]);

  const ready = state === "ready";
  const { seats, registered, pending, admitted } = counts;

  return (
    <section className="mt-10">
      {/* Hairline dividers by way of a 1px gap over a lit background, so the
          four cells read as one instrument rather than four boxes. Two up on a
          phone: four columns of tracked-out mono at 390px sets the labels at a
          size that is decoration rather than text. */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-4">
        <Cell
          href="/admin/dashboard/bod"
          label="Roster filled"
          value={ready ? seats : null}
          of={ROSTER_TOTAL}
          /* Of the seats, not of the registrations — this is the one cell
             measured against a different whole, which is why it states its
             denominator on the face rather than only in the bar. */
          fill={ready ? seats / ROSTER_TOTAL : 0}
          tone="red"
          action="Edit details"
        />

        <Cell
          href={REGISTER_HREF}
          label="Registered"
          value={ready ? registered : null}
          /* The baseline the two cells after it are fractions of, so its own
             bar is full whenever there is anything to be a fraction of. */
          fill={ready && registered > 0 ? 1 : 0}
          tone="plain"
          action="Open register"
        />

        <Cell
          href={REGISTER_HREF}
          label="Awaiting check"
          value={ready ? pending : null}
          fill={ready && registered > 0 ? pending / registered : 0}
          tone="amber"
          /* The only cell that raises its own voice, and only when it has
             something to say. A queue of nought is not an alert. */
          alert={ready && pending > 0}
          action="Check payments"
        />

        <Cell
          href="/admin/dashboard/attendance"
          label="Admitted"
          value={ready ? admitted : null}
          fill={ready && registered > 0 ? admitted / registered : 0}
          tone="emerald"
          action="Open the sheet"
        />
      </dl>

      {/*
       * The sentence the four numbers add up to.
       *
       * The strip says what is true; this says what to do about it, which is
       * the question somebody opening a console at nine in the morning is
       * actually asking. `aria-live` because it arrives a moment after the page
       * does and is the only part of this that is worth interrupting for.
       */}
      <p
        aria-live="polite"
        className="mt-3.5 flex items-start gap-2.5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-zinc-500"
      >
        <span
          aria-hidden
          className={`mt-[0.45rem] h-1.5 w-1.5 shrink-0 ${
            state === "error"
              ? "bg-nic-red shadow-[0_0_8px_1px_rgba(237,10,20,0.8)]"
              : ready && pending > 0
                ? "bg-amber-400 shadow-[0_0_8px_1px_rgba(251,191,36,0.7)]"
                : ready
                  ? "bg-emerald-400 shadow-[0_0_8px_1px_rgba(52,211,153,0.6)]"
                  : "bg-white/25"
          }`}
        />
        <Verdict state={state} counts={counts} />
      </p>
    </section>
  );
}

/**
 * What the strip amounts to, in one line.
 *
 * Ordered by what a person can act on rather than by how the numbers were
 * fetched: a queue of payments outranks a half-written roster, and both outrank
 * a register that nobody has reached yet. Only one sentence is ever shown —
 * three lines of status is a status board, and a status board is the thing this
 * component exists to not be.
 */
function Verdict({ state, counts }) {
  if (state === "loading") return <span>Reading the console…</span>;

  if (state === "error") {
    return (
      <span className="text-[#ff8a8a]">
        These could not be read. If your account is not on the admin list, the
        registers come back empty rather than as an error — see section 0 of
        supabase/workshop-modern-cyber-defence.sql.
      </span>
    );
  }

  const { seats, registered, pending, admitted } = counts;

  if (pending > 0) {
    return (
      <span>
        <span className="text-amber-300">
          {pending} payment{pending === 1 ? "" : "s"}
        </span>{" "}
        {pending === 1 ? "is" : "are"} waiting to be checked — a seat is not
        through the door until one of them is verified.
      </span>
    );
  }

  if (registered === 0) {
    return (
      <span>
        Nothing in the register yet. Rows appear the moment a student reaches
        the ticket at the end of the form.
      </span>
    );
  }

  if (admitted > 0 && admitted < registered) {
    return (
      <span>
        Every payment is checked. {admitted} of {registered} through the door so
        far.
      </span>
    );
  }

  if (seats < ROSTER_TOTAL) {
    return (
      <span>
        Every payment is checked. {ROSTER_TOTAL - seats} roster seat
        {ROSTER_TOTAL - seats === 1 ? "" : "s"} still showing the placeholder
        from the codebase.
      </span>
    );
  }

  return <span>Every payment is checked and every seat is written up.</span>;
}

/**
 * One number, and the screen it is answered on.
 *
 * A `<Link>` wrapping a `<div>` inside the `<dl>` rather than a bare cell: the
 * number and the place you go to act on it are one thing, and splitting them
 * into a figure with a link underneath is two controls for one intention — the
 * mistake the register's attachment thumbnails already had to be talked out of.
 *
 * The foot bar is the cell's own proportion, drawn on the hairline that divides
 * the strip so it costs no height. It animates from nought on the first paint
 * for the same reason the counts do not: the row must be the same height empty
 * as full, so that a page which has finished loading does not push the tools
 * below it down the screen.
 */
function Cell({ href, label, value, of, fill = 0, tone = "plain", alert, action }) {
  const bar =
    tone === "red"
      ? "bg-nic-red"
      : tone === "amber"
        ? "bg-amber-400"
        : tone === "emerald"
          ? "bg-emerald-400"
          : "bg-white/35";

  return (
    <Link
      href={href}
      className="group relative flex flex-col bg-black/70 px-4 py-5 backdrop-blur-md transition-colors hover:bg-black/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-nic-red sm:px-6"
    >
      <dt
        className={`font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500 sm:text-[10px] ${LABEL_SHADOW}`}
      >
        {label}
      </dt>

      <dd className="mt-2 flex items-baseline gap-1.5">
        <span
          className={`font-mono text-2xl font-black tabular-nums tracking-tight transition-colors sm:text-3xl ${
            value == null
              ? "text-zinc-700"
              : alert
                ? "text-amber-300"
                : "text-white"
          }`}
        >
          {value == null ? "––" : String(value).padStart(2, "0")}
        </span>

        {of != null && (
          <span className="font-mono text-[11px] font-medium tabular-nums tracking-[0.1em] text-zinc-600">
            / {of}
          </span>
        )}
      </dd>

      {/* Kept in the flow rather than pinned to the bottom, so a cell that
          wraps its action onto a second line on a narrow screen does not leave
          the others' text floating above an empty gap. */}
      <span className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600 transition-colors group-hover:text-zinc-300">
        {action}{" "}
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
        >
          →
        </span>
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-white/10"
      >
        <span
          className={`block h-full transition-[width] duration-700 ease-out ${bar}`}
          style={{ width: `${Math.min(100, Math.max(0, fill * 100))}%` }}
        />
      </span>
    </Link>
  );
}
