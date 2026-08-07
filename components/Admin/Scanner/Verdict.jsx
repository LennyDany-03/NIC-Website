"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CornerTicks from "../../CornerTicks";
import { LABEL_SHADOW } from "../../surfaces";
import { statusMeta } from "../Registrations/status";
import { ADMIN_BTN_GHOST, ADMIN_BTN_PRIMARY } from "../surfaces";

/**
 * What the door says, over everything else.
 *
 * ---------------------------------------------------------------------------
 * This was a block underneath the viewfinder, and underneath was the wrong
 * place for it. The viewfinder is a square as wide as the column, so on the
 * phone this screen is actually used on, a verdict appeared *below the fold*:
 * scan a ticket, look at a camera that has frozen, then scroll to find out
 * whether to let somebody in — with a queue waiting. The one moment this
 * screen exists for was the one moment it asked for a scroll.
 *
 * So the verdict interrupts. It is a dialog: it covers the viewfinder it came
 * from, it cannot be missed, and its actions sit at the bottom of the panel
 * where a thumb already is. Dismissing it is what resumes scanning, which
 * makes "next student" a single deliberate tap rather than something that
 * happens while you are still reading.
 * ---------------------------------------------------------------------------
 *
 * Written to be read at arm's length in a corridor: one word at the top in a
 * colour identifiable before it has been read, the student's name at a size
 * that can be checked against a face without leaning in, everything else small
 * underneath. The colour is doing real work — green, amber and red are the
 * whole message, and the sentence under them is the explanation for the one
 * person in twenty who needs it.
 *
 * A bottom sheet below `sm` and a centred panel above it. That is not two
 * designs: it is the same panel, docked to the edge a thumb can reach on the
 * device it is held on, and centred on the device it is looked at.
 *
 * The modal grammar is `Lightbox`'s and `PosterDialog`'s rather than a third
 * invention — portal to `document.body`, Escape and the backdrop as the ways
 * out, `overflow: hidden` raised on the body while open.
 *
 * ---------------------------------------------------------------------------
 * There is still no override, and there never will be.
 *
 * `Allow in` is rendered for `granted` and for nothing else. No "admit anyway",
 * no long-press to force it, no second tap that turns red into green. If a
 * ticket is refused the fix is in the register — look at the payment, set the
 * dropdown — and the dialog's other action goes straight there with the code
 * already searched for. Routing it that way means every admission has a
 * coordinator who checked a screenshot behind it, and the `update` in
 * `Scanner/index.jsx` carries `.eq("status", ADMITS)` so the database refuses
 * to record one that does not.
 * ---------------------------------------------------------------------------
 */

const TONES = {
  granted: {
    edge: "border-emerald-500/70",
    wash: "bg-emerald-500/[0.06]",
    text: "text-emerald-400",
    dot: "bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.7)]",
    word: "Verified",
  },
  admitted: {
    edge: "border-emerald-500/70",
    wash: "bg-emerald-500/[0.06]",
    text: "text-emerald-400",
    dot: "bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.7)]",
    word: "Admitted",
  },
  already: {
    edge: "border-amber-500/70",
    wash: "bg-amber-500/[0.06]",
    text: "text-amber-400",
    dot: "bg-amber-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.7)]",
    word: "Already in",
  },
  refused: {
    edge: "border-nic-red/70",
    wash: "bg-nic-red/[0.06]",
    text: "text-nic-red",
    dot: "bg-nic-red shadow-[0_0_12px_2px_rgba(237,10,20,0.8)]",
    word: "Not verified",
  },
  unknown: {
    edge: "border-nic-red/70",
    wash: "bg-nic-red/[0.06]",
    text: "text-nic-red",
    dot: "bg-nic-red shadow-[0_0_12px_2px_rgba(237,10,20,0.8)]",
    word: "No such ticket",
  },
  invalid: {
    edge: "border-nic-red/70",
    wash: "bg-nic-red/[0.06]",
    text: "text-nic-red",
    dot: "bg-nic-red shadow-[0_0_12px_2px_rgba(237,10,20,0.8)]",
    word: "Not a ticket",
  },
  error: {
    edge: "border-nic-red/70",
    wash: "bg-nic-red/[0.06]",
    text: "text-nic-red",
    dot: "bg-nic-red shadow-[0_0_12px_2px_rgba(237,10,20,0.8)]",
    word: "Could not check",
  },
};

export default function Verdict({ result, busy, onAdmit, onReset, registerHref }) {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const panelRef = useRef(null);

  useEffect(() => setMounted(true), []);

  const open = Boolean(result);

  useEffect(() => {
    if (!open) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onReset();
    };
    window.addEventListener("keydown", onKeyDown);

    /* Focus the panel, not the button inside it. A coordinator working a queue
       one-handed taps; a keyboard user gets the dialog announced and Tab lands
       on the first action. Focusing `Allow in` directly would make a stray
       Enter — the key somebody just pressed to submit the manual code box —
       admit whoever is on screen. */
    panelRef.current?.focus({ preventScroll: true });

    return () => {
      body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onReset]);

  if (!mounted) return null;

  const tone = (result && TONES[result.kind]) ?? TONES.error;
  const row = result?.row;

  const backdropMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  };

  const panelMotion = prefersReducedMotion
    ? backdropMotion
    : {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 18 },
        transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="scanner-verdict"
          /* Docked to the bottom on a phone, centred from `sm`. `items-end`
             is what makes the actions land under a thumb rather than in the
             middle of a screen being held at the bottom. */
          className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6"
          {...backdropMotion}
        >
          <button
            type="button"
            aria-label="Dismiss and scan the next one"
            tabIndex={-1}
            onClick={onReset}
            className="absolute inset-0 h-full w-full cursor-default bg-black/85 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-label={`${tone.word}${row?.name ? ` — ${row.name}` : ""}`}
            tabIndex={-1}
            /* `max-h` in `svh` and an internal scroll, because the case that
               breaks a dialog like this is not the phone — it is a laptop
               turned landscape at 390px tall, where the panel is taller than
               the window and the actions end up off the bottom. */
            className={`relative flex max-h-[92svh] w-full flex-col border-t-2 bg-black/95 backdrop-blur-md outline-none sm:max-w-lg sm:border ${tone.edge}`}
            {...panelMotion}
          >
            <CornerTicks still />

            {/* --------------------------------------------------- the word */}
            <div className={`shrink-0 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5 ${tone.wash}`}>
              <p
                className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] ${tone.text} ${LABEL_SHADOW}`}
              >
                <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
                {tone.word}
              </p>

              {row ? (
                <>
                  <p className="mt-3 break-words text-2xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-3xl">
                    {row.name}
                  </p>

                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-[11px]">
                    {row.stream}
                    {row.section ? ` — ${row.section}` : ""} · {row.year}
                    {row.college ? ` · ${row.college}` : ""}
                  </p>
                </>
              ) : null}
            </div>

            {/* ------------------------------------------------- the details */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              {row ? (
                <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <Fact label="Register number" value={row.register_number} />
                  <Fact label="Ticket" value={row.ticket_code} />
                  <Fact label="Email" value={row.email} wrap />
                  <Fact
                    label="Payment"
                    value={statusMeta(row.status).label}
                    tone={statusMeta(row.status).tag.split(" ").pop()}
                  />
                </dl>
              ) : null}

              <p
                className={`text-sm leading-relaxed text-zinc-300 ${row ? "mt-5" : ""}`}
              >
                {message(result, row)}
              </p>
            </div>

            {/* ------------------------------------------------- the actions */}
            {/*
             * A footer bar rather than buttons in the flow: it does not scroll
             * away with the details above it, which is the whole reason the
             * detail pane is the part that scrolls. The primary action is
             * full-width and first in the column on a phone — bottom of the
             * sheet, biggest target on the screen.
             */}
            <div className="shrink-0 border-t border-white/10 bg-black/60 px-5 py-4 sm:px-7 sm:py-5">
              <div className="flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-end">
                {result.kind === "granted" ? (
                  <button
                    type="button"
                    onClick={() => onAdmit(row)}
                    disabled={busy}
                    className={`w-full justify-center sm:w-auto ${ADMIN_BTN_PRIMARY}`}
                  >
                    {busy ? "Marking…" : "Allow in — mark attendance"}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={onReset}
                  className={`w-full justify-center sm:w-auto ${ADMIN_BTN_GHOST}`}
                >
                  {result.kind === "granted" ? "Cancel" : "Scan the next one"}
                </button>
              </div>

              {/*
               * The way out for every verdict that is not an admission.
               *
               * A refusal is not the end of the interaction — somebody is
               * standing there, and the only thing that changes their status is
               * a coordinator looking at their payment. This goes to that row
               * with the code already searched for, which is the difference
               * between "sort it out at the register" and making somebody find
               * one name in two hundred. A link rather than a button because it
               * leaves the page, and it is set quietly because at a busy door
               * the right move is usually to wave them aside and scan the next
               * one.
               */}
              {row && registerHref ? (
                <Link
                  href={`${registerHref}?q=${encodeURIComponent(row.ticket_code)}`}
                  className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 underline decoration-dotted underline-offset-4 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
                >
                  Open this one in the register
                  <span aria-hidden>↗</span>
                </Link>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * The sentence under the verdict.
 *
 * Each one names the thing to do next, because the person reading it has
 * somebody standing in front of them expecting to be told something. "Not
 * verified" on its own invites an argument; "send them to a coordinator, the
 * payment has not been checked yet" ends one.
 */
function message(result, row) {
  switch (result.kind) {
    case "granted":
      return "Payment verified. Mark them in and let them through.";

    case "admitted":
      return "Marked in. They are on the attendance sheet.";

    case "already":
      return `This ticket was already used at ${formatWhen(row.attended_at)}. If that was not them, check the name above against their ID before letting anybody else through on it.`;

    case "refused":
      return row.status === "failed"
        ? "This payment was checked and did not go through. Send them to a coordinator — nothing here can be overridden at the door."
        : "Nobody has checked this payment yet, so the ticket does not open. A coordinator can verify it in the register and then it will scan.";

    case "unknown":
      return `No registration has the code ${result.code}. It may be a ticket for another event, or the code may have been mistyped.`;

    case "invalid":
      return result.message;

    default:
      return `The register could not be reached. ${result.message ?? ""}`;
  }
}

function Fact({ label, value, wrap, tone }) {
  return (
    <div className="min-w-0">
      <dt
        className={`font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500 ${LABEL_SHADOW}`}
      >
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm ${tone ?? "text-white"} ${wrap ? "break-all" : "truncate"}`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

function formatWhen(iso) {
  if (!iso) return "—";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
