"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useQrCamera } from "./useQrCamera";
import { PARSE_MESSAGES, parseTicketPayload } from "./ticket";
import Verdict from "./Verdict";
import { ADMITS } from "../Registrations/status";
import { LABEL_SHADOW } from "../../surfaces";
import { Eyebrow } from "../ui";
import { ADMIN_BTN_GHOST, ADMIN_FIELD } from "../surfaces";

/**
 * The door.
 *
 * Point it at the QR on a student's ticket and it says one of five things: come
 * in, you are already in, your payment has not been checked yet, your payment
 * failed, or this is not a ticket. Only the first of those offers a button, and
 * pressing it writes the attendance sheet.
 *
 * ---------------------------------------------------------------------------
 * The rule this screen exists to enforce
 *
 * A ticket's QR is not a credential. It is cut in the student's own browser
 * the moment they finish the form, before anybody has looked at their payment,
 * and it is a picture they can forward to a friend. So scanning it proves
 * nothing on its own, and this screen never treats it as proof: the code is
 * only ever used to *find the row*, and it is the row's `status` that decides.
 * Verified opens the door. Pending and Failed do not, and no amount of
 * re-scanning changes that — the only thing that changes it is a coordinator
 * setting the dropdown in the register after looking at the screenshot.
 *
 * That check is made twice on purpose. Once here, to say something useful to
 * the person standing in front of you, and once in the `update` itself, which
 * carries `.eq("status", ADMITS)` so the database will not write an attendance
 * row for an unverified ticket even if this component is wrong. The screen is
 * the explanation; the query is the rule.
 * ---------------------------------------------------------------------------
 *
 * Scanning stops dead on the first decode. A camera pointed at a QR decodes it
 * sixty times a second, and a screen that re-rendered a verdict sixty times a
 * second would be unreadable and would hammer the database — so a result
 * freezes the camera until it is dismissed, which is also the only way a person
 * gets time to read the name and check it against the face in front of them.
 */
export default function Scanner({ event, adminId }) {
  const supabase = useMemo(() => createClient(), []);

  const [result, setResult] = useState(null); // { kind, row?, message? }
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState("");

  /* Which code is being looked up right now. A ref rather than state because
     the decode loop reads it between renders — the point is to swallow the
     fifty-nine further decodes of the same ticket that arrive while the first
     lookup is still in flight. */
  const inFlight = useRef(null);

  const scanning = result === null && !busy;

  /**
   * Look a code up and decide what the door says.
   *
   * Every branch sets `result`, which is what stops the camera — including the
   * failure branches. A scanner that kept scanning after "this ticket does not
   * exist" would clear the message off the screen before it had been read.
   */
  const lookup = useCallback(
    async (code) => {
      if (inFlight.current === code) return;
      inFlight.current = code;

      setBusy(true);

      const { data, error } = await supabase
        .from(event.table)
        .select("*")
        .eq("ticket_code", code)
        .maybeSingle();

      setBusy(false);
      inFlight.current = null;

      if (error) {
        setResult({ kind: "error", message: error.message });
        return;
      }

      if (!data) {
        setResult({ kind: "unknown", code });
        return;
      }

      if (data.attended_at) {
        setResult({ kind: "already", row: data });
        return;
      }

      if (data.status !== ADMITS) {
        setResult({ kind: "refused", row: data });
        return;
      }

      setResult({ kind: "granted", row: data });
    },
    [event.table, supabase],
  );

  const onDecode = useCallback(
    (raw) => {
      /* The loop is still running for the frame or two it takes React to
         re-render with a result — guard here as well as through `active`. */
      if (!scanning) return;

      const parsed = parseTicketPayload(raw, event);

      if (parsed.error) {
        setResult({
          kind: "invalid",
          message: PARSE_MESSAGES[parsed.error] ?? PARSE_MESSAGES.unreadable,
        });
        return;
      }

      lookup(parsed.code);
    },
    [event, lookup, scanning],
  );

  const { videoRef, canvasRef, state, error } = useQrCamera({
    onDecode,
    paused: !scanning,
  });

  /**
   * Admit them, and write who did it.
   *
   * `.eq("status", ADMITS)` is the load-bearing clause: it means the database
   * refuses to record attendance against a ticket that is not verified, so the
   * rule survives a bug in the branch above, a stale row held in this
   * component, and anybody driving the client by hand. `.select()` is what
   * makes that refusal visible — a filtered-out update succeeds with zero rows,
   * which is silence, and the one thing this screen must not do is tell a
   * coordinator somebody is in when nothing was written.
   */
  async function admit(row) {
    setBusy(true);

    const { data, error: updateError } = await supabase
      .from(event.table)
      .update({
        attended_at: new Date().toISOString(),
        attended_by: adminId ?? null,
      })
      .eq("ticket_code", row.ticket_code)
      .eq("status", ADMITS)
      .is("attended_at", null)
      .select();

    setBusy(false);

    if (updateError) {
      setResult({ kind: "error", message: updateError.message });
      return;
    }

    if (!data || data.length === 0) {
      /* Nothing matched: either somebody changed the status to Pending while
         this was on screen, or another coordinator on another phone admitted
         them a second ago. Re-reading is the honest response — say what is
         true now rather than what was true when the code was scanned. */
      lookup(row.ticket_code);
      return;
    }

    setResult({ kind: "admitted", row: data[0] });
  }

  function reset() {
    setResult(null);
    setManual("");
    inFlight.current = null;
  }

  function submitManual(formEvent) {
    formEvent.preventDefault();
    if (!manual.trim()) return;

    const parsed = parseTicketPayload(manual, event);

    if (parsed.error) {
      setResult({
        kind: "invalid",
        message: PARSE_MESSAGES[parsed.error] ?? PARSE_MESSAGES.unreadable,
      });
      return;
    }

    lookup(parsed.code);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-14 sm:px-8 sm:py-20">
      {/* Back to where this was opened from, and — separately — through to the
          register, because the one thing a refused ticket needs is somebody
          looking at that payment. Two destinations rather than one: the door
          is reached from the dashboard now, but the fix for a refusal is
          always in the register. */}
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
          href={`/admin/dashboard/events/${event.id}`}
          className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 transition-colors hover:text-white"
        >
          The register ↗
        </Link>

        <Link
          href={`/admin/dashboard/attendance?event=${event.id}`}
          className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 transition-colors hover:text-white"
        >
          In the room ↗
        </Link>
      </div>

      <header className="mt-6">
        <Eyebrow>Door</Eyebrow>
        <h1 className="mt-4 text-[clamp(1.75rem,4vw,2.5rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
          Ticket <span className="text-nic-red">scanner</span>
        </h1>
        <span aria-hidden className="mt-5 block h-px w-14 bg-nic-red" />
        <p className="mt-5 text-sm leading-relaxed text-zinc-400">
          Point the camera at the QR on a ticket. Only a registration marked
          Verified in the register will open — a ticket whose payment is still
          pending, or has failed, is turned away here however real its code is.
        </p>
      </header>

      {/* ------------------------------------------------------ the viewfinder */}
      <div className="relative mt-8 aspect-square w-full overflow-hidden border border-white/12 bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`h-full w-full object-cover transition-opacity duration-300 ${scanning ? "opacity-100" : "opacity-25"}`}
        />

        {/* jsQR's scratch surface. Never displayed — the native decoder does
            not need it at all, and the fallback only reads pixels out of it. */}
        <canvas ref={canvasRef} className="hidden" />

        {/* The reticle: four corners rather than a full box, so the thing being
            scanned is never behind a line. */}
        {scanning ? (
          <span aria-hidden className="pointer-events-none absolute inset-0">
            <span className="absolute left-[15%] top-[15%] h-10 w-10 border-l-2 border-t-2 border-nic-red" />
            <span className="absolute right-[15%] top-[15%] h-10 w-10 border-r-2 border-t-2 border-nic-red" />
            <span className="absolute bottom-[15%] left-[15%] h-10 w-10 border-b-2 border-l-2 border-nic-red" />
            <span className="absolute bottom-[15%] right-[15%] h-10 w-10 border-b-2 border-r-2 border-nic-red" />
          </span>
        ) : null}

        {state !== "live" ? (
          <p
            className={`absolute inset-0 flex items-center justify-center px-8 text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] ${state === "error" ? "text-nic-red" : "text-zinc-500"} ${LABEL_SHADOW}`}
          >
            {state === "error" ? error : "Opening the camera…"}
          </p>
        ) : null}
      </div>

      {/* ---------------------------------------------------------- the verdict */}
      {busy && !result ? (
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
          Checking the register…
        </p>
      ) : null}

      {result ? (
        <Verdict
          result={result}
          busy={busy}
          onAdmit={admit}
          onReset={reset}
        />
      ) : null}

      {/* ----------------------------------------------------------- by hand */}
      {/*
       * Always present, not tucked behind "having trouble?". A scanner that
       * only works when the camera does is a scanner that stops a queue dead
       * the first time somebody's screen is too cracked to read, and at that
       * point the fallback needs to be already on screen rather than something
       * to go looking for.
       */}
      <form onSubmit={submitManual} className="mt-10">
        <label
          htmlFor="manual-code"
          className={`font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 ${LABEL_SHADOW}`}
        >
          Or type the code
        </label>

        <div className="mt-2.5 flex gap-3">
          <input
            id="manual-code"
            value={manual}
            onChange={(changeEvent) => setManual(changeEvent.target.value)}
            placeholder={`${event.ticketPrefix}-…`}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className={`${ADMIN_FIELD} font-mono uppercase tracking-[0.15em]`}
          />
          <button type="submit" disabled={busy} className={`shrink-0 ${ADMIN_BTN_GHOST}`}>
            Look up
          </button>
        </div>
      </form>
    </main>
  );
}
