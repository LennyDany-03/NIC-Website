"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Ticket from "./Ticket";
import { drawTicket, saveTicket } from "./ticketCanvas";
import WhatsAppIcon from "./WhatsAppIcon";
import { TICKET, TICKET_TAG, WHATSAPP, submitRegistration } from "./content";
import { CYBER_BUTTON, CYBER_LINK } from "../../eventsTheme";
import { EVENTS_HREF } from "../../siteLinks";
import { seatRow, slideRise } from "../../motionPresets";

/**
 * Step 4 — the ticket, and the two things that happen the moment it is reached.
 *
 * The registration is handed to `submitRegistration` and the QR is encoded, both
 * exactly once, in an effect keyed on the ticket code. Keying it on the code
 * rather than on mount is what makes the effect honest: the code is cut once and
 * never changes, so the effect cannot fire twice, and React's development
 * double-invoke does not send two registrations.
 *
 * The QR is generated in the browser rather than fetched, and `qrcode` is
 * imported dynamically so its encoder — which is the largest thing on this page
 * that is not a photograph — is not in the bundle for the three steps that do
 * not use it.
 */
export default function StepTicket({ code, values, streamLabel }) {
  const [qr, setQr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const rootRef = useRef(null);

  /**
   * What a coordinator's scanner reads at the door.
   *
   * A pipe-delimited line rather than JSON or a URL. It has to survive being
   * read by whatever QR app is on the phone of whoever is on the door — most of
   * which show the payload as plain text and nothing else — so it is written to
   * be read by a person on a screen the size of a hand: the tag says which event,
   * then the code they are looking up, then the two fields they would otherwise
   * have to ask for. A URL would need this site to be up and a page that does
   * not exist yet; a JSON blob would be shown as a wall of braces.
   */
  const payload = [TICKET_TAG, code, values.registerNumber, values.name].join("|");

  useEffect(() => {
    if (!code) return undefined;

    let live = true;

    (async () => {
      submitRegistration({
        name: values.name,
        stream: streamLabel,
        section: values.section,
        email: values.email,
        registerNumber: values.registerNumber,
        year: values.year,
        transactionId: values.transactionId,
        ticketCode: code,
      });

      const QRCode = (await import("qrcode")).default;

      const url = await QRCode.toDataURL(payload, {
        /* M corrects about 15% of the code, which is the level the club's own
           payment QR uses and is comfortably enough for a screenshot that has
           been forwarded through WhatsApp twice. */
        errorCorrectionLevel: "M",
        margin: 1,
        /* Generated well above the ~120px it is displayed at: this same data URL
           is what the download draws at 384px on a 2× canvas, and upscaling a
           QR blurs the module edges that a scanner is looking for. */
        width: 480,
        color: { dark: "#000000", light: "#ffffff" },
      });

      if (live) setQr(url);
    })();

    return () => {
      live = false;
    };
    /* Keyed on the code alone. The values are read at the moment it fires and
       are frozen by then — every field is behind two steps that have been left
       — so listing them would only add ways for this to run again. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function download() {
    if (!qr || !rootRef.current) return;

    setSaving(true);
    setSaveError(null);

    try {
      const dataUrl = await drawTicket({
        anchor: rootRef.current,
        qr,
        code,
        name: values.name,
        stream: streamLabel,
        section: values.section,
        year: values.year,
        registerNumber: values.registerNumber,
      });

      saveTicket(dataUrl, code);
    } catch {
      setSaveError("The ticket could not be saved. A screenshot works just as well.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div ref={rootRef} variants={seatRow} className="flex flex-col">
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
