"use client";

import { useCallback, useRef, useState } from "react";
import { drawTicket } from "./ticketCanvas";
import { submitRegistration } from "./submit";
import { TICKET_TAG } from "./content";

/**
 * Everything that happens between the payment step's button and the club
 * having the registration: the QR is encoded, the ticket is drawn, the two
 * files go up, and the row is filed through the rate-limited route.
 *
 * ---------------------------------------------------------------------------
 * Why this runs on step 2 and not on step 4
 *
 * It used to live in an effect at the top of `StepTicket`, keyed on the ticket
 * code — the ticket appeared, and the registration was filed quietly underneath
 * it while the student read it. That was the right shape for as long as the
 * only thing that could go wrong was a network, because the argument for it was
 * airtight: the code was cut on this device, the ticket is valid whatever the
 * upload says, and holding it hostage to a round trip on campus wifi would be
 * the page inventing a failure for itself.
 *
 * The rate limit is what changed it. A limit that can refuse this attempt is a
 * refusal a student has to be able to *act on*, and there is nothing to do
 * about it from a screen that has already handed them a ticket — the step is
 * over, the panel says "You're registered", and the only honest thing left to
 * put on it is a contradiction. So the work moved to the last button that still
 * has somewhere to stand: press Continue on the payment step, and by the time
 * anything else moves, either the row is written or the reason it is not is on
 * the screen you are still standing on, with every field you typed still in it.
 *
 * The old argument survives the move intact, because none of it was about
 * *when*. The ticket is still drawn from a code cut on this device, it is still
 * shown whatever the uploads did, and a row that filed without its screenshot
 * still reaches step 4 — see `missing`. The one thing that now blocks is the
 * one thing that always should have: no row at all.
 * ---------------------------------------------------------------------------
 *
 * A hook rather than a function so the results outlive the button that started
 * them. Step 4 is two steps away and needs all of it — the QR to render, the
 * drawn image to offer as a download, and the outcome to report at the bottom
 * of the panel.
 */
export function useFiling() {
  /* idle | filing | filed | blocked | error */
  const [state, setState] = useState("idle");

  /* Which of the two files did not make it, on a row that otherwise saved.
     "Filed" and "filed without your screenshot" are different things to tell
     somebody: only one of them means a coordinator will come asking. */
  const [missing, setMissing] = useState([]);

  /* The raw message from the route, shown in development only — see
     `SaveStatus` in StepTicket.jsx and the note on `SAVE.error`. */
  const [detail, setDetail] = useState(null);

  /* Which limit refused, and for how long. `scope` picks the sentence; the wait
     is counted down from the moment it arrived rather than displayed as the
     absolute time the route named, because a student reading "try again at
     16:42" has to work out what that means and "in 3 minutes" is already the
     answer. */
  const [scope, setScope] = useState(null);
  const [blockedUntil, setBlockedUntil] = useState(0);

  /* The QR, as a data URL. State rather than a ref: the ticket renders it. */
  const [qr, setQr] = useState(null);

  /**
   * The drawn ticket, kept so it is drawn once rather than twice.
   *
   * The upload needs the image and so does the download button, and
   * `drawTicket` is a couple of hundred canvas operations against a 2400×1120
   * bitmap — on the phone this page is read on that is a visible pause, and
   * spending it again for a file that is already sitting in memory would be
   * spending it for nothing. A ref rather than state because nothing renders
   * from it.
   *
   * Holds the whole `{ url, type, ext }` that `drawTicket` returns, not just
   * the data URL: both consumers have to name a file after the format it
   * actually came out as. See the encoding note in `ticketCanvas.js`.
   */
  const ticketImage = useRef(null);

  /* Kept beside the state copy so a retry can reuse an encode that already
     worked without waiting for a render to hand it back. */
  const qrRef = useRef(null);

  /**
   * Encode the QR and draw the ticket, at most once.
   *
   * Both are swallowed on failure rather than raised, and the difference
   * between them is only what is lost. A QR that will not encode costs the
   * ticket its code square — the ticket still prints the code in type, which is
   * what a coordinator reads out anyway. A ticket that will not draw costs the
   * club its own copy of it, which `submitRegistration` records as a null
   * `ticket_path` rather than a broken one. Neither is a reason to refuse
   * somebody a registration, so neither stops what follows.
   */
  const prepare = useCallback(
    async ({ anchor, code, values, streamLabel }) => {
      if (!qrRef.current) {
        try {
          const QRCode = (await import("qrcode")).default;

          /*
           * What a coordinator's scanner reads at the door.
           *
           * A pipe-delimited line rather than JSON or a URL. It has to survive
           * being read by whatever QR app is on the phone of whoever is on the
           * door — most of which show the payload as plain text and nothing
           * else — so it is written to be read by a person on a screen the size
           * of a hand: the tag says which event, then the code they are looking
           * up, then the two fields they would otherwise have to ask for. A URL
           * would need this site to be up and a page that does not exist yet; a
           * JSON blob would be shown as a wall of braces.
           */
          const payload = [
            TICKET_TAG,
            code,
            values.registerNumber,
            values.name,
          ].join("|");

          qrRef.current = await QRCode.toDataURL(payload, {
            /* M corrects about 15% of the code, which is the level the club's
               own payment QR uses and is comfortably enough for a screenshot
               that has been forwarded through WhatsApp twice. */
            errorCorrectionLevel: "M",
            margin: 1,
            /* Generated well above the ~120px it is displayed at: this same data
               URL is what the download draws at 384px on a 2× canvas, and
               upscaling a QR blurs the module edges a scanner looks for. */
            width: 480,
            color: { dark: "#000000", light: "#ffffff" },
          });

          setQr(qrRef.current);
        } catch {
          qrRef.current = null;
        }
      }

      if (!ticketImage.current && qrRef.current) {
        try {
          ticketImage.current = await drawTicket({
            anchor,
            qr: qrRef.current,
            code,
            name: values.name,
            stream: streamLabel,
            section: values.section,
            year: values.year,
            registerNumber: values.registerNumber,
          });
        } catch {
          ticketImage.current = null;
        }
      }
    },
    [],
  );

  /**
   * File it, and say what happened.
   *
   * Returns the result rather than only publishing it to state, because the
   * caller has to decide in the same tick whether the flow moves on — and a
   * `setState` it just made is not readable until the render after.
   *
   * Safe to call again, which matters because both unhappy outcomes leave the
   * student on a step whose button calls it: a refusal from the rate limit and
   * a row that did not save. `prepare` is idempotent and the ticket code is
   * fixed by the time this runs, so a retry sends the same registration under
   * the same code. The uploads are the subtle part — they go to paths named
   * after that code and the bucket refuses to overwrite them — and
   * `submitRegistration` reads the resulting 409 as "already there" rather than
   * as a file that did not make it.
   */
  const file = useCallback(
    async ({ anchor, code, values, streamLabel, collegeLabel, proof }) => {
      setState("filing");
      setDetail(null);
      setScope(null);

      await prepare({ anchor, code, values, streamLabel });

      const result = await submitRegistration({
        values,
        streamLabel,
        collegeLabel,
        ticketCode: code,
        proof,
        ticketImage: ticketImage.current,
      });

      setMissing(result.missing);

      if (result.blocked) {
        setState("blocked");
        setScope(result.scope ?? null);
        setBlockedUntil(Date.now() + result.retryAfterMs);
        return result;
      }

      setState(result.ok ? "filed" : "error");
      setDetail(result.ok ? null : result.message);

      return result;
    },
    [prepare],
  );

  return {
    state,
    missing,
    detail,
    scope,
    blockedUntil,
    qr,
    ticketImage,
    file,
  };
}
