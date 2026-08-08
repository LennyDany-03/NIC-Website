"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Ticket from "./Ticket";
import { drawTicket, saveTicket } from "./ticketCanvas";
import WhatsAppIcon from "./WhatsAppIcon";
import { SAVE, TICKET, WHATSAPP } from "./content";
import { CYBER_BUTTON, CYBER_LINK } from "../../eventsTheme";
import { EVENTS_HREF } from "../../siteLinks";
import { seatRow, slideRise } from "../../motionPresets";

/**
 * Step 4 — the ticket.
 *
 * Presentational, and that is the whole of what changed about it. This step
 * used to be where the registration happened: an effect keyed on the ticket
 * code encoded the QR, drew the ticket and sent the whole thing to Supabase
 * while the student read what it had produced. All three of those now run on
 * the way out of the payment step — see the note at the top of `useFiling.js`
 * for why, which is short: a rate limit can refuse an attempt, and a refusal is
 * no use on a screen that has already handed somebody a ticket.
 *
 * So nothing here can fail, and nothing here is awaited. By the time this
 * renders the row is written, the QR is encoded and the ticket is drawn; this
 * component shows them, offers the download, and says whether the club got the
 * screenshot as well as the row.
 *
 * The download is the one thing still done here rather than earlier, because
 * it is the one thing that needs a person to ask for it.
 */
export default function StepTicket({ code, values, streamLabel, qr, ticketImage, missing }) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  async function download() {
    if (!qr) return;

    setSaving(true);
    setSaveError(null);

    try {
      /* Almost always already drawn — `useFiling` draws it to upload it, and
         this is the same image. The fallback is for the case where that draw
         failed: pressing Download is worth one more attempt, since a canvas
         that fell over once on a busy page may well not the second time.

         `anchor` is this button itself. Any element inside the `/events` layout
         will do — `drawTicket` reads the font custom properties off it and
         nothing else — and an element that is definitely mounted at the moment
         it is clicked is the least fragile one available. */
      const image =
        ticketImage.current ??
        (await drawTicket({
          anchor: document.getElementById("ticket-download"),
          qr,
          code,
          name: values.name,
          stream: streamLabel,
          section: values.section,
          year: values.year,
          registerNumber: values.registerNumber,
        }));

      ticketImage.current = image;
      saveTicket(image, code);
    } catch {
      setSaveError("The ticket could not be saved. A screenshot works just as well.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div variants={seatRow} className="flex flex-col">
      <Ticket
        code={code}
        qr={qr}
        name={values.name}
        stream={streamLabel}
        section={values.section}
        year={values.year}
        registerNumber={values.registerNumber}
      />

      <motion.div variants={slideRise} className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          id="ticket-download"
          type="button"
          onClick={download}
          disabled={!qr || saving}
          className={`${CYBER_BUTTON} justify-center disabled:cursor-not-allowed disabled:border-cyber-steel/50 disabled:bg-transparent disabled:text-zinc-500 disabled:hover:bg-transparent disabled:hover:text-zinc-500`}
        >
          {saving ? "Saving…" : TICKET.downloadLabel}
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-y-0.5"
          >
            ↓
          </span>
        </button>

        <a
          href={WHATSAPP.href}
          target="_blank"
          rel="noreferrer noopener"
          className={CYBER_LINK}
        >
          <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
          The group
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            ↗
          </span>
        </a>
      </motion.div>

      {saveError ? (
        <p role="alert" className="mt-4 text-xs leading-relaxed text-cyber-rose">
          {saveError}
        </p>
      ) : null}

      <FiledStatus missing={missing} />

      <motion.p
        variants={slideRise}
        className="mt-10 border-l-2 border-cyber-amber/60 pl-4 text-xs leading-relaxed text-zinc-500"
      >
        {TICKET.note}
      </motion.p>

      <motion.div variants={slideRise} className="mt-10">
        <Link href={EVENTS_HREF} className={CYBER_LINK}>
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:-translate-x-1"
          >
            ←
          </span>
          Everything else the club is running
        </Link>
      </motion.div>
    </motion.div>
  );
}

/**
 * What the club has, stated once, under the two buttons.
 *
 * Two states rather than the four this used to carry, because the other two
 * cannot reach this screen any more: a row that failed keeps somebody on the
 * payment step, and a filing in flight has not left it yet. What survives is
 * the distinction that only shows up here — the row is written either way, and
 * the screenshot either arrived with it or did not.
 *
 * Its placement is the argument it makes: what a student came for is on screen
 * and finished, and this is a footnote about the club's bookkeeping. A banner
 * over the ticket would make a finished registration feel provisional.
 *
 * Not `role="alert"` — that interrupts, and neither of these is an
 * interruption. A polite live region announces it at the next natural pause.
 *
 * The screenshot alone decides which one is shown, not `missing.length`. The
 * other thing in that list is the club's own copy of the ticket, and it can be
 * redrawn from the row by anybody who needs it — telling a student "your
 * screenshot did not upload" because a PNG they will never see failed to
 * upload would send them chasing a coordinator over nothing.
 */
function FiledStatus({ missing }) {
  const partial = missing.includes("proof");

  return (
    <div
      aria-live="polite"
      className={`mt-8 border-l-2 pl-4 ${
        partial
          ? "border-cyber-amber/70 text-cyber-amber"
          : "border-cyber-teal/60 text-zinc-500"
      }`}
    >
      <p className="text-xs leading-relaxed">{partial ? SAVE.partial : SAVE.sent}</p>
    </div>
  );
}
