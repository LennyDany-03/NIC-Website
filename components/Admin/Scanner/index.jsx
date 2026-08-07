"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useQrCamera } from "./useQrCamera";
import { PARSE_MESSAGES, parseTicketPayload } from "./ticket";
import Verdict from "./Verdict";
import { ADMITS, STATUSES } from "../Registrations/status";
import { LABEL_SHADOW } from "../../surfaces";
import { BackLink, Eyebrow } from "../ui";
import { ADMIN_BTN_GHOST, ADMIN_FIELD, ADMIN_PANEL } from "../surfaces";

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
 *
 * ---------------------------------------------------------------------------
 * Two shapes, one screen
 *
 * The layout used to be a single `max-w-2xl` column with a square viewfinder in
 * it, which meant a 672px black square owning a laptop screen — the camera is a
 * phone instrument, and on a desktop that square is mostly an empty box with
 * the fallback everybody actually uses there pushed below it.
 *
 * So from `lg` this is two columns: the viewfinder capped at a size a face fits
 * in, and beside it the things a desk uses — typing a code in, and the rule the
 * door runs on. Below `lg` it is one column in the order a phone needs it:
 * camera, then the box for the ticket that will not scan. The viewfinder is
 * capped in `svh` as well as in pixels, because the shape that breaks it is a
 * phone held sideways, where a square as wide as the screen is taller than the
 * screen.
 * ---------------------------------------------------------------------------
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

      /* A short buzz the moment a code is read, before the lookup has said
         anything about it. At a door this is the only feedback that arrives
         while the phone is still being held up and pointed away from the
         person holding it — the screen has the verdict a moment later, but the
         buzz is what says "stop moving, it got it". Guarded because iOS has no
         `vibrate` at all, and wrapped because a browser that has it can still
         refuse when the page has never been tapped. */
      try {
        navigator.vibrate?.(40);
      } catch {
        /* A door that cannot buzz is a door that works silently. */
      }

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

  const registerHref = `/admin/dashboard/events/${event.id}`;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-14 sm:px-8 sm:py-20 lg:max-w-5xl">
      {/* Back to where this was opened from, and — separately — through to the
          register, because the one thing a refused ticket needs is somebody
          looking at that payment. Two destinations rather than one: the door
          is reached from the dashboard now, but the fix for a refusal is
          always in the register. */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <BackLink href="/admin/dashboard">Dashboard</BackLink>

        <Link
          href={registerHref}
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

      <header className="mt-6 max-w-2xl">
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

      {/*
       * Camera on the left, desk on the right, and one column until there is
       * room for two. `items-start` so the right-hand column sits at the top of
       * the viewfinder rather than being stretched down beside it.
       */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-10">
        {/* --------------------------------------------------- the viewfinder */}
        {/*
         * Capped twice over. `max-w` stops it becoming a 672px square on a
         * laptop, where it was more black rectangle than instrument; `max-h` in
         * `svh` is for the landscape phone, where a square as wide as the
         * screen is taller than the screen and pushes its own controls out of
         * reach. `mx-auto` keeps it centred in the column once the cap bites.
         */}
        <div className="relative mx-auto aspect-square w-full max-w-[26rem] max-h-[62svh] overflow-hidden border border-white/12 bg-black lg:mx-0">
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

          {/* The lookup, over the frozen frame it belongs to. It was a line of
              text under the viewfinder, which on a phone is a line nobody sees
              — the camera has just stopped and this is the half-second that
              explains why. */}
          {busy && !result ? (
            <p
              className={`absolute inset-x-0 bottom-0 bg-black/85 px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300 backdrop-blur-sm ${LABEL_SHADOW}`}
            >
              Checking the register…
            </p>
          ) : null}
        </div>

        {/* --------------------------------------------------------- the desk */}
        <div className="flex flex-col gap-8">
          {/* ------------------------------------------------------- by hand */}
          {/*
           * Always present, not tucked behind "having trouble?". A scanner that
           * only works when the camera does is a scanner that stops a queue dead
           * the first time somebody's screen is too cracked to read, and at that
           * point the fallback needs to be already on screen rather than something
           * to go looking for.
           *
           * On a wide screen it is the first thing in the right-hand column,
           * because a laptop at the desk is where a code gets typed rather than
           * scanned — the camera beside it is the one that is not being used.
           */}
          <form onSubmit={submitManual}>
            <label
              htmlFor="manual-code"
              className={`font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400 ${LABEL_SHADOW}`}
            >
              Or type the code
            </label>

            {/* Wraps rather than squeezing the input to nothing: at 390px a
                row of field-plus-button leaves about 180px for a fifteen
                character code set in tracked-out mono. */}
            <div className="mt-2.5 flex flex-wrap gap-3">
              <input
                id="manual-code"
                value={manual}
                onChange={(changeEvent) => setManual(changeEvent.target.value)}
                placeholder={`${event.ticketPrefix}-…`}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className={`min-w-[12rem] flex-1 ${ADMIN_FIELD} font-mono uppercase tracking-[0.15em]`}
              />
              <button
                type="submit"
                disabled={busy}
                className={`shrink-0 ${ADMIN_BTN_GHOST}`}
              >
                Look up
              </button>
            </div>
          </form>

          {/*
           * What the door will and will not do, on the screen where somebody
           * is about to be told one of them.
           *
           * It is here rather than in the header because it is reference, not
           * introduction: the sentence that matters is the one you go looking
           * for when a student is arguing that their ticket is real — and it
           * is, and that is not what opens the door. On a phone it sits under
           * the manual box, out of the way of the scanning; on a laptop it
           * fills the column the camera is not using.
           */}
          <div className={`p-5 sm:p-6 ${ADMIN_PANEL}`}>
            <h2
              className={`font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red ${LABEL_SHADOW}`}
            >
              What opens the door
            </h2>

            <dl className="mt-4 space-y-3.5">
              {DOOR_RULES.map((rule) => (
                <div key={rule.state} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${rule.dot}`}
                  />
                  <div className="min-w-0">
                    <dt
                      className={`font-mono text-[10px] uppercase tracking-[0.2em] ${rule.text}`}
                    >
                      {rule.state}
                    </dt>
                    <dd className="mt-1 text-xs leading-relaxed text-zinc-400">
                      {rule.says}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <p className="mt-5 border-l-2 border-white/15 pl-4 text-xs leading-relaxed text-zinc-500">
              There is no override here. A refused ticket is fixed by checking
              the payment in{" "}
              <Link
                href={registerHref}
                className="text-zinc-300 underline decoration-dotted underline-offset-4 transition-colors hover:text-white"
              >
                the register
              </Link>
              , and then it scans.
            </p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- the verdict */}
      {/* A dialog over the whole screen rather than a block below the
          viewfinder — see the note at the top of `Verdict`. */}
      <Verdict
        result={result}
        busy={busy}
        onAdmit={admit}
        onReset={reset}
        registerHref={registerHref}
      />
    </main>
  );
}

/**
 * The three answers the register can give, and what each means at the door.
 *
 * Read off the same vocabulary the register's dropdown writes — `STATUSES` in
 * `Registrations/status.js` — rather than restated, because a fourth status
 * added there without a line here would be a state the door has no words for.
 */
const DOOR_RULES = STATUSES.map((status) => ({
  state: status.label,
  dot: status.dot,
  text: status.tag.split(" ").pop(),
  says:
    status.value === ADMITS
      ? "Opens. Somebody has looked at the payment and confirmed it."
      : status.value === "failed"
        ? "Refused. The payment was checked and did not go through."
        : "Refused. Nobody has checked this payment yet — it is not a rejection, it is a queue.",
}));
