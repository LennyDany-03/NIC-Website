"use client";

import { LABEL_SHADOW } from "../../surfaces";
import { statusMeta } from "../Registrations/status";
import { ADMIN_BTN_GHOST, ADMIN_BTN_PRIMARY } from "../surfaces";

/**
 * What the door says, and the one button it sometimes offers.
 *
 * Written to be read at arm's length in a corridor by somebody with a queue
 * behind them, which drives every decision here: one word at the top in a
 * colour you can identify before you have read it, the student's name at a size
 * that can be checked against a face without leaning in, and everything else
 * small underneath. The colour is doing real work — green, amber and red are
 * the whole message, and the sentence under them is the explanation for the one
 * person in twenty who needs it.
 *
 * `role="alert"` and `aria-live="assertive"` because a verdict replaces a
 * verdict: the previous one is still on screen when the next student steps up,
 * and nothing about the change is announced by the visual swap alone.
 *
 * The Admit button is the only control that writes anything, and it is only
 * rendered for `granted`. That is deliberate to the point of being the design:
 * there is no override, no "admit anyway", no long-press to force it. If a
 * ticket is refused the fix is in the register — look at the payment, set the
 * dropdown — and routing it that way means an admission always has a coordinator
 * who checked a screenshot behind it.
 */

const TONES = {
  granted: {
    frame: "border-emerald-500/60 bg-emerald-500/[0.07]",
    text: "text-emerald-400",
    word: "Verified",
  },
  admitted: {
    frame: "border-emerald-500/60 bg-emerald-500/[0.07]",
    text: "text-emerald-400",
    word: "Admitted",
  },
  already: {
    frame: "border-amber-500/60 bg-amber-500/[0.07]",
    text: "text-amber-400",
    word: "Already in",
  },
  refused: {
    frame: "border-nic-red/60 bg-nic-red/[0.07]",
    text: "text-nic-red",
    word: "Not verified",
  },
  unknown: {
    frame: "border-nic-red/60 bg-nic-red/[0.07]",
    text: "text-nic-red",
    word: "No such ticket",
  },
  invalid: {
    frame: "border-nic-red/60 bg-nic-red/[0.07]",
    text: "text-nic-red",
    word: "Not a ticket",
  },
  error: {
    frame: "border-nic-red/60 bg-nic-red/[0.07]",
    text: "text-nic-red",
    word: "Could not check",
  },
};

export default function Verdict({ result, busy, onAdmit, onReset }) {
  const tone = TONES[result.kind] ?? TONES.error;
  const row = result.row;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`mt-6 border-l-4 border ${tone.frame} p-5 sm:p-6`}
    >
      <p
        className={`font-mono text-[11px] uppercase tracking-[0.3em] ${tone.text} ${LABEL_SHADOW}`}
      >
        {tone.word}
      </p>

      {row ? (
        <>
          <p className="mt-3 text-2xl font-black uppercase leading-tight tracking-tight text-white sm:text-3xl">
            {row.name}
          </p>

          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
            {row.stream}
            {row.section ? ` — ${row.section}` : ""} · {row.year}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
            <Fact label="Register number" value={row.register_number} />
            <Fact label="Ticket" value={row.ticket_code} />
            <Fact label="Email" value={row.email} wrap />
            <Fact
              label="Payment"
              value={statusMeta(row.status).label}
              tone={statusMeta(row.status).tag.split(" ").pop()}
            />
          </dl>
        </>
      ) : null}

      <p className="mt-5 text-sm leading-relaxed text-zinc-300">
        {message(result, row)}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {result.kind === "granted" ? (
          <button
            type="button"
            onClick={() => onAdmit(row)}
            disabled={busy}
            className={ADMIN_BTN_PRIMARY}
          >
            {busy ? "Marking…" : "Allow in — mark attendance"}
          </button>
        ) : null}

        <button type="button" onClick={onReset} className={ADMIN_BTN_GHOST}>
          {result.kind === "granted" ? "Cancel" : "Scan the next one"}
        </button>
      </div>
    </div>
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
