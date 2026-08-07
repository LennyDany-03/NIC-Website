"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileField, TextField } from "./fields";
import { PAYMENT } from "./content";
import { CYBER_BUTTON, CYBER_HEADING, CYBER_LABEL, NEON, SOFT_RULE } from "../../eventsTheme";
import { seatRow, slideRise } from "../../motionPresets";

/**
 * Step 2 — the fee, and the proof it was paid.
 *
 * Laid out with the QR first and the deep link second, which is the opposite of
 * how a payment screen usually reads. The reason is that a `upi://` link does
 * nothing whatsoever in a desktop browser: on the larger of the two layouts the
 * button is decoration, and the code is the entire mechanism. Putting the code
 * on top means the page works the same way at both sizes rather than leading
 * with a control that half its visitors cannot use.
 *
 * The UPI ID is printed underneath both of them as selectable text with a copy
 * button, because that is the fallback that survives everything — a code that
 * will not focus, an app that will not open a link, a phone with a cracked
 * camera. Three routes to the same eleven-rupee-symbol transfer.
 */
export default function StepPayment({
  values,
  errors,
  setField,
  proof,
  proofUrl,
  proofStatus,
  proofOriginalSize,
  attachProof,
}) {
  /*
   * The QR is drawn client-side from `PAYMENT.href`, which is the department's
   * signed City Union Bank payload transcribed exactly — see the block comment
   * on `SIGNED_QR` in `content.js`, which is required reading before touching
   * anything in this component. The short version: that string is covered by a
   * signature, so it is encoded verbatim and no amount can be added to it.
   *
   * Drawing it here rather than shipping the bank's PDF as an image is what
   * keeps the code and the "Pay ₹150 now" button below it the same instruction
   * — both carry the identical payload, amount included, so they cannot drift.
   *
   * Generated once per mount rather than memoised across the whole flow: the
   * encode is a few milliseconds and this step is only on screen at all while
   * somebody is looking at it, so there is nothing worth caching.
   */
  const [qr, setQr] = useState(null);

  useEffect(() => {
    let live = true;

    (async () => {
      const QRCode = (await import("qrcode")).default;

      const url = await QRCode.toDataURL(PAYMENT.href, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 480,
        color: { dark: "#000000", light: "#ffffff" },
      });

      if (live) setQr(url);
    })();

    return () => {
      live = false;
    };
  }, []);

  return (
    <motion.div variants={seatRow} className="flex flex-col">
      {/* ------------------------------------------------------------- the fee */}
      <motion.div variants={slideRise} className="flex flex-col items-center text-center">
        <span className={CYBER_LABEL}>Registration fee</span>

        <p className={`mt-3 text-[clamp(2.75rem,12vw,4.5rem)] ${CYBER_HEADING} ${NEON}`}>
          {PAYMENT.feeLabel}
        </p>
      </motion.div>

      {/* -------------------------------------------------------------- the QR */}
      <motion.div variants={slideRise} className="mt-9 flex flex-col items-center">
        {/*
         * White plate, and it is not negotiable.
         *
         * Everything else on this page is teal on near-black, and a QR code
         * inverted or tinted is a QR code that a phone camera reads slowly or
         * not at all. The padding is the quiet zone, which is part of the code
         * rather than styling around it. So the palette stops at this border:
         * the plate is white, the code is black, and the page's colour is spent
         * on the frame instead.
         */}
        <div className="flex h-[13rem] w-[13rem] items-center justify-center rounded-sm border border-cyber-steel/70 bg-white p-3 shadow-[0_24px_60px_-30px_rgba(43,183,189,0.55)] sm:h-[15rem] sm:w-[15rem] sm:p-4">
          {qr ? (
            // A data URL generated in this tab — nothing for `next/image` to
            // fetch, optimise or cache.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt={PAYMENT.qrAlt} className="h-full w-full" />
          ) : (
            /* Held open at the code's own size so the plate does not jolt
               narrower the instant this step mounts and then snap wide again
               once the encode resolves a frame later. */
            <span
              aria-hidden
              className="h-6 w-6 animate-pulse rounded-full bg-cyber-steel/40"
            />
          )}
        </div>

        <p className="mt-4 font-cyber-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
          Scan with any UPI app
        </p>

        {/*
         * The amount, immediately under the code, boxed so it is not read as a
         * caption — and worded as something to check rather than something to
         * do.
         *
         * The fee is appended to a *signed* merchant payload (see `SIGNED_QR`),
         * which apps overwhelmingly honour but are not bound to. This line is
         * the cheap insurance against the one silent failure that leaves: an app
         * that drops `am` and opens on a blank field. It sits here because the
         * moment it is needed is the moment somebody has just scanned and is
         * looking at the amount.
         */}
        <p
          role="note"
          className="mt-5 max-w-xs border border-cyber-amber/50 bg-cyber-amber/[0.07] px-4 py-3 text-center text-xs leading-relaxed text-cyber-amber"
        >
          {PAYMENT.amountNote}
        </p>
      </motion.div>

      {/* ------------------------------------------------------- the deep link */}
      <motion.div variants={slideRise} className="mt-8 flex flex-col items-center gap-3">
        <a href={PAYMENT.href} className={CYBER_BUTTON}>
          Pay {PAYMENT.feeLabel} now
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </a>

        <p className="text-center text-xs leading-relaxed text-zinc-500">
          Opens a UPI app on your phone, with the department as the payee and{" "}
          {PAYMENT.feeLabel} already filled in. On a computer, scan the code
          above instead.
        </p>
      </motion.div>

      <motion.span aria-hidden variants={slideRise} className={`mx-auto mt-10 block h-px w-full max-w-sm ${SOFT_RULE}`} />

      {/* ----------------------------------------------------------- the payee */}
      <motion.div variants={slideRise} className="mt-8 flex flex-col items-center gap-3">
        <span className={CYBER_LABEL}>Or pay this UPI ID</span>
        <CopyableVpa />

        {/*
         * The payee name, wrapped rather than tracked out.
         *
         * The club's old payee was "Lenny Dany . D" — fourteen characters, which
         * sat happily on one line in tracked-out mono. The department's is sixty
         * and would run off a 390px screen at that spacing, so the tracking comes
         * down and the line is allowed to break. It is worth the space: this is
         * the string a student checks against what their UPI app shows them
         * before confirming, and a payee name truncated by the page is a check
         * they cannot make.
         */}
        <p className="max-w-xs text-center font-cyber-mono text-[10px] uppercase leading-relaxed tracking-[0.1em] text-zinc-500">
          {PAYMENT.payeeName}
        </p>
      </motion.div>

      {/* ------------------------------------------------------------ the proof */}
      <motion.div variants={slideRise} className="mt-12">
        <p className="text-sm leading-relaxed text-zinc-400 sm:leading-[1.85]">
          {PAYMENT.proofNote}
        </p>
      </motion.div>

      <motion.div variants={seatRow} className="mt-8 grid gap-6">
        <TextField
          id="transactionId"
          label="Transaction / UTR ID"
          value={values.transactionId}
          onChange={setField}
          onBlur={(id, value) => setField(id, value.trim())}
          error={errors.transactionId}
          placeholder="From your payment app"
          autoComplete="off"
        />

        <FileField
          id="proof"
          label="Payment screenshot"
          file={proof}
          previewUrl={proofUrl}
          status={proofStatus}
          originalSize={proofOriginalSize}
          onSelect={attachProof}
          error={errors.proof}
          hint={PAYMENT.proofHint}
        />
      </motion.div>

      <motion.p
        variants={slideRise}
        className="mt-6 border-l-2 border-cyber-amber/60 pl-4 text-xs leading-relaxed text-zinc-500"
      >
        {PAYMENT.pendingNote}
      </motion.p>
    </motion.div>
  );
}

/**
 * The UPI ID, and a button that puts it on the clipboard.
 *
 * `navigator.clipboard` is unavailable on an insecure origin and can be refused
 * outright, so the address is selectable text first and the button is an
 * accelerator on top of it — if the copy fails, the thing to do is already what
 * it always was. The label reverts after two seconds rather than latching,
 * because "Copied" left up forever stops being feedback and becomes a claim
 * about a clipboard nobody can see.
 */
function CopyableVpa() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(PAYMENT.vpa);
      setCopied(true);
    } catch {
      /* Refused, or no clipboard at all. The text below is still selectable,
         which is the fallback this button was only ever a shortcut past. */
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <code className="select-all break-all border border-cyber-steel/60 bg-black/50 px-4 py-2.5 font-cyber-mono text-sm text-cyber-aqua">
        {PAYMENT.vpa}
      </code>

      <button
        type="button"
        onClick={copy}
        className="border border-cyber-steel/60 px-3 py-2.5 font-cyber-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:border-cyber-teal/70 hover:text-cyber-aqua focus-visible:border-cyber-teal focus-visible:text-cyber-aqua focus-visible:outline-none"
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
