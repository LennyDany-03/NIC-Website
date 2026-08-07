"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Ticket from "./Ticket";
import { drawTicket, saveTicket } from "./ticketCanvas";
import WhatsAppIcon from "./WhatsAppIcon";
import { SAVE, TICKET, TICKET_TAG, WHATSAPP } from "./content";
import { submitRegistration } from "./submit";
import { CYBER_BUTTON, CYBER_LINK } from "../../eventsTheme";
import { EVENTS_HREF } from "../../siteLinks";
import { seatRow, slideRise } from "../../motionPresets";

/**
 * Step 4 — the ticket, and the three things that happen the moment it is
 * reached: the QR is encoded, the ticket is drawn, and the whole registration
 * is sent to Supabase.
 *
 * All three run in one effect keyed on the ticket code, in that order, because
 * each one needs what the last produced — the ticket cannot be drawn without
 * the QR to paste into it, and the upload cannot happen without the ticket.
 * Keying on the code rather than on mount is what makes the effect honest: the
 * code is cut once and never changes, so the effect cannot fire twice, and
 * React's development double-invoke does not send two registrations.
 *
 * What is deliberately *not* here is any gate on the ticket. It is drawn and
 * shown the instant the QR resolves, before the upload has been attempted and
 * whatever the upload eventually says: the code on it was cut locally, it is
 * already valid, and holding a student's ticket hostage to a network round trip
 * on campus wifi would be the page inventing a failure for itself. The save
 * reports underneath, where a failure can be retried without taking the ticket
 * off the screen.
 *
 * The QR is generated in the browser rather than fetched, and `qrcode` is
 * imported dynamically so its encoder — which is the largest thing on this page
 * that is not a photograph — is not in the bundle for the three steps that do
 * not use it.
 */
export default function StepTicket({ code, values, streamLabel, proof }) {
  const [qr, setQr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const rootRef = useRef(null);

  /* idle | sending | sent | error — what the line under the buttons says. */
  const [submitState, setSubmitState] = useState("idle");
  const [submitDetail, setSubmitDetail] = useState(null);

  /* Which of the two files did not make it, on a save that otherwise worked.
     "Saved" and "saved without your screenshot" are different things to tell
     somebody: only one of them means a coordinator will come asking. */
  const [submitMissing, setSubmitMissing] = useState([]);

  /**
   * The drawn ticket, kept so it is drawn once rather than twice.
   *
   * The upload needs the PNG and so does the download button, and `drawTicket`
   * is a couple of hundred canvas operations against a 2400×1120 bitmap — on
   * the phone this page is read on that is a visible pause, and spending it
   * again for a file that is already sitting in memory would be spending it for
   * nothing. A ref rather than state because nothing renders from it.
   */
  const ticketPng = useRef(null);

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

  /**
   * Hand the registration over, and say what happened.
   *
   * Separate from the effect so the retry button can call the same thing the
   * first attempt did — a retry that goes down a different path is a retry that
   * has not been tested. It reads `ticketPng` off the ref rather than taking it
   * as an argument for the same reason: whatever the draw produced, both callers
   * send the same thing.
   *
   * `submitRegistration` does not throw, so there is no catch here. Its failures
   * come back as `ok: false` with a message, and its partial failures as a
   * `missing` list — a row that saved with one of its two files absent, which is
   * a real state and a different sentence from either success or failure.
   */
  const send = useCallback(async () => {
    setSubmitState("sending");
    setSubmitDetail(null);

    const result = await submitRegistration({
      values,
      streamLabel,
      ticketCode: code,
      proof,
      ticketDataUrl: ticketPng.current,
    });

    setSubmitState(result.ok ? "sent" : "error");
    setSubmitDetail(result.ok ? null : result.message);
    setSubmitMissing(result.missing);
  }, [code, proof, streamLabel, values]);

  useEffect(() => {
    if (!code) return undefined;

    let live = true;

    (async () => {
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

      if (!live) return;
      setQr(url);

      /* Drawn here rather than left to the download button, because the club's
         copy of the ticket is uploaded alongside the payment screenshot and
         that has to happen whether or not anybody presses Download. A failure
         is swallowed on purpose: the ticket on screen is unaffected, the row
         still saves, and `submitRegistration` records a null `ticket_path`
         rather than a broken one. */
      try {
        ticketPng.current = await drawTicket({
          anchor: rootRef.current,
          qr: url,
          code,
          name: values.name,
          stream: streamLabel,
          section: values.section,
          year: values.year,
          registerNumber: values.registerNumber,
        });
      } catch {
        ticketPng.current = null;
      }

      if (live) send();
    })();

    return () => {
      live = false;
    };
    /* Keyed on the code alone. The values are read at the moment it fires and
       are frozen by then — every field is behind two steps that have been left
       — so listing them would only add ways for this to run again, and `send`
       closes over those same frozen values. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function download() {
    if (!qr || !rootRef.current) return;

    setSaving(true);
    setSaveError(null);

    try {
      /* Almost always already drawn — the effect above draws it to upload it,
         and this is the same PNG. The fallback is for the case where that draw
         failed: pressing Download is worth one more attempt, since a canvas
         that fell over once on a busy page may well not the second time. */
      const dataUrl =
        ticketPng.current ??
        (await drawTicket({
          anchor: rootRef.current,
          qr,
          code,
          name: values.name,
          stream: streamLabel,
          section: values.section,
          year: values.year,
          registerNumber: values.registerNumber,
        }));

      ticketPng.current = dataUrl;
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

      <SaveStatus
        state={submitState}
        missing={submitMissing}
        detail={submitDetail}
        onRetry={send}
      />

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
 * Whether the club has the registration yet.
 *
 * Sits under the two buttons rather than over the ticket, and that placement is
 * the whole argument this component makes: what a student came for is on screen
 * and finished, and this is a footnote about the club's bookkeeping. A banner at
 * the top saying "Saving…" would make a successful registration feel provisional
 * for the second and a half it takes.
 *
 * Not `role="alert"` — that interrupts, and three of the four states are not
 * interruptions. A polite live region announces each one at the next natural
 * pause, in the order they happen, which for "sending" → "sent" is exactly
 * right. The rule down the left is the same `border-l-2` the note below it
 * wears, in the colour of the state: teal while it is working, amber where
 * something needs a human, rose where it failed.
 */
function SaveStatus({ state, missing, detail, onRetry }) {
  if (state === "idle") return null;

  const partial = state === "sent" && missing.length > 0;

  const tone =
    state === "error"
      ? "border-cyber-rose/70 text-cyber-rose"
      : partial
        ? "border-cyber-amber/70 text-cyber-amber"
        : "border-cyber-teal/60 text-zinc-500";

  const message =
    state === "sending"
      ? SAVE.sending
      : state === "error"
        ? SAVE.error
        : partial
          ? SAVE.partial
          : SAVE.sent;

  return (
    <div aria-live="polite" className={`mt-8 border-l-2 pl-4 ${tone}`}>
      <p className="text-xs leading-relaxed">{message}</p>

      {/*
       * The raw Supabase message, in development only. It is the fastest way to
       * tell "the SQL file has not been run against this project" apart from "the
       * anon key is wrong" while this is being built, and it is exactly the
       * string a student should never be shown — see the note on `SAVE.error`.
       */}
      {detail && process.env.NODE_ENV !== "production" ? (
        <p className="mt-2 font-cyber-mono text-[10px] leading-relaxed text-zinc-600">
          {detail}
        </p>
      ) : null}

      {state === "error" ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 font-cyber-mono text-[10px] uppercase tracking-[0.24em] text-cyber-aqua underline underline-offset-4 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
        >
          {SAVE.retry}
        </button>
      ) : null}
    </div>
  );
}
