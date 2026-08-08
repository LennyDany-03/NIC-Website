"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CLASS_OTHER, COLLEGE_OTHER, TICKET_PREFIX } from "./content";

/**
 * The state behind the four steps: what has been typed, what is wrong with it,
 * and the code the ticket is eventually cut against.
 *
 * A hook rather than state scattered through the steps, because a wizard's whole
 * difficulty is that step 4 needs what was typed in step 1 and step 1 has been
 * unmounted since. Holding all of it here means going back is free — the fields
 * are still filled in when you return to them — and the steps stay presentational
 * enough to read.
 *
 * Deliberately not a `useReducer`. Every action this form has is "set one field"
 * or "clear the errors", and a reducer for that is ceremony that makes the two
 * interesting parts — the validators below — harder to find.
 */

/** The shape of the form, and the value every field starts at. */
const EMPTY = {
  name: "",
  college: "",
  collegeOther: "",
  /* Labelled "Class" on screen. Named `stream` in the code because `class` is a
     reserved word and `className` means something else entirely in a JSX file. */
  stream: "",
  streamOther: "",
  section: "",
  email: "",
  registerNumber: "",
  year: "",
  transactionId: "",
};

/**
 * The alphabet ticket codes are drawn from: 32 characters with `0`, `1`, `I` and
 * `O` taken out.
 *
 * A ticket code's real life is being read aloud across a corridor and copied off
 * a phone screen onto a printed list. `MCD26-1IO0GG` is a code that will be
 * transcribed wrong, and the failure is silent — the coordinator simply does not
 * find them. Dropping four glyphs costs a little entropy and buys back the only
 * property the code needs.
 */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Six characters of it, from the platform CSPRNG where there is one.
 *
 * 32⁶ is about a billion, against a hall that holds a couple of hundred — a
 * collision is not the risk here, transcription is. `Math.random` is the
 * fallback rather than the default only because `crypto` is not guaranteed on an
 * insecure origin, and a ticket that fails to generate is worse than one drawn
 * from a weaker source.
 */
function ticketSuffix() {
  const out = new Array(6);
  const values = new Uint32Array(6);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(values);
  } else {
    for (let i = 0; i < values.length; i += 1) {
      values[i] = Math.floor(Math.random() * 0xffffffff);
    }
  }

  for (let i = 0; i < out.length; i += 1) {
    out[i] = ALPHABET[values[i] % ALPHABET.length];
  }

  return out.join("");
}

/**
 * Loose on purpose.
 *
 * The job of this check is to catch `priya@srmist` and a stray space, not to
 * adjudicate RFC 5322. A regex strict enough to be correct rejects addresses
 * that genuinely work, and every one of those is a student who cannot register
 * and has no idea why.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Letters and digits only — register numbers and UTRs are both. */
const ALNUM = /^[A-Za-z0-9]+$/;

/**
 * 5 MB, and it is the *storage* limit rather than the one a student meets.
 *
 * Everything picked in this form goes through `compressProof` below first, and
 * a screenshot comes out of that at a few hundred KB — so in practice nothing
 * ever fails this check. It stays because compression is allowed to fail
 * (`browser-image-compression` gives up on an image it cannot decode and we
 * keep the original rather than losing the attachment), and when it does this
 * is the number the bucket itself enforces. Both ends state 5 MB; changing one
 * without the other turns a friendly message into an opaque upload error.
 */
export const MAX_PROOF_BYTES = 5 * 1024 * 1024;

/**
 * What the compressor is aimed at.
 *
 * A payment screenshot has one job — a coordinator reading a transaction ID
 * and an amount off it — and that job survives a great deal of squeezing. The
 * long edge is the setting that matters: a modern phone screenshots at around
 * 2800px tall, which is roughly four times more than anybody will ever look at
 * on this, and downscaling to 1600 does most of the work before quality is
 * touched at all.
 *
 * `useWebWorker` is not a micro-optimisation here. Decoding a 12-megapixel
 * image to a canvas allocates ~48 MB of bitmap, and doing that on the main
 * thread of a mid-range phone freezes the page — including the file input the
 * student just tapped — for long enough that it reads as a crash. Off the main
 * thread the page stays live and the memory is freed with the worker.
 *
 * `fileType` used to be left unset, so an image came back as whatever it went
 * in as — the note here argued, correctly, that forcing JPEG would put ringing
 * artefacts around exactly the thing this file exists to show: small text on a
 * flat background. WebP is the answer that objection did not have. It carries
 * hard edges and flat colour far better than JPEG at the same size, and it
 * fixes the case the old setting could not touch at all: a PNG screenshot,
 * which is what an iPhone hands over, cannot be shrunk by quality at all
 * because PNG has no quality knob — the compressor could only reach the target
 * by throwing away resolution.
 *
 * `maxSizeMB` is 0.4 rather than 1 for the same reason the ticket beside it
 * stopped being a PNG: a megabyte per registration is real storage for a
 * picture whose entire job is letting a coordinator read an amount and a
 * transaction ID. At 0.4 a screenshot still reads comfortably at full size.
 * Both numbers are ceilings the compressor aims under, not targets it pads up
 * to — a small screenshot stays small.
 */
const COMPRESSION = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  initialQuality: 0.82,
  fileType: "image/webp",
};

/**
 * Under this, compressing is not worth the decode.
 *
 * 200 KB is already a cheap upload on a phone connection, and re-encoding it
 * would spend a second of somebody's time and a canvas the size of the image to
 * save a rounding error — occasionally making the file *larger*, which is what
 * happens when a small PNG of flat colour is handed to a lossy encoder.
 *
 * Halved from 400 KB along with the target above. The gap between the two
 * numbers is the band where a file is left alone: at 400 against a 0.4 MB
 * ceiling there was effectively no band at all, and screenshots that arrived
 * just under the threshold sat in the bucket at four times what they needed.
 */
const COMPRESS_ABOVE_BYTES = 200 * 1024;

/**
 * Shrink a screenshot in the browser, or hand back what came in.
 *
 * Imported dynamically, the same way `qrcode` is on the two steps that draw
 * one: the compressor and its worker are the largest thing this flow depends
 * on and there is no reason for them to be in the bundle for a student who is
 * still on step 1. The import happens the moment a file is picked, which is a
 * beat before the result is needed.
 *
 * Never throws. Every failure path — an unreadable image, a worker that will
 * not start, a browser without `createImageBitmap` — returns the original file,
 * because a slightly-too-large screenshot that uploads is worth incomparably
 * more than a perfectly-sized one that does not exist.
 */
export async function compressProof(file) {
  if (!file?.type?.startsWith("image/")) return file;
  if (file.size <= COMPRESS_ABOVE_BYTES) return file;

  try {
    const imageCompression = (await import("browser-image-compression")).default;
    const compressed = await imageCompression(file, COMPRESSION);

    /* The compressor is not guaranteed to win. On an image that is already
       near-optimally encoded it can come back heavier than it went in, and
       shipping the larger of the two would be the opposite of the point. */
    return compressed.size < file.size ? compressed : file;
  } catch {
    return file;
  }
}

/**
 * Step 1, checked.
 *
 * Returns a map of field id → message; empty means it passed. Messages say what
 * to do rather than what happened ("Pick your class", not "Class is required"),
 * because the person reading them is mid-task and does not want a diagnosis.
 */
export function validateDetails(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = "Tell us your name.";
  if (!values.college) errors.college = "Pick your college.";

  if (values.college === COLLEGE_OTHER && !values.collegeOther.trim()) {
    errors.collegeOther = "Type the college you are from.";
  }

  if (!values.stream) errors.stream = "Pick your class.";

  if (values.stream === CLASS_OTHER && !values.streamOther.trim()) {
    errors.streamOther = "Type the class you are in.";
  }

  if (!values.section) errors.section = "Pick your section.";

  if (!values.email.trim()) {
    errors.email = "We need an email to reach you on.";
  } else if (!EMAIL.test(values.email.trim())) {
    errors.email = "That does not look like an email address.";
  }

  const reg = values.registerNumber.trim();
  if (!reg) {
    errors.registerNumber = "Your register number, as it is on your ID card.";
  } else if (!ALNUM.test(reg) || reg.length < 6) {
    errors.registerNumber = "Letters and numbers only, and at least six of them.";
  }

  if (!values.year) errors.year = "Pick your year.";

  return errors;
}

/**
 * Step 2, checked.
 *
 * The transaction id is allowed 6 to 40 characters, which is wider than any one
 * app's format. GPay hands out a long alphanumeric reference, a bank UTR is
 * twelve digits, and PhonePe sits between them — a rule tight enough to describe
 * one of those turns the other two away, and the cost of a too-loose rule here is
 * a coordinator squinting at a screenshot they were going to open anyway.
 */
export function validatePayment(values, proof, proofStatus = "idle") {
  const errors = {};
  const txn = values.transactionId.trim();

  if (!txn) {
    errors.transactionId = "Your app shows this after the payment goes through.";
  } else if (!ALNUM.test(txn) || txn.length < 6 || txn.length > 40) {
    errors.transactionId = "Letters and numbers only, between 6 and 40 of them.";
  }

  if (!proof) {
    errors.proof = "Attach the screenshot your app gave you.";
  } else if (!proof.type.startsWith("image/")) {
    errors.proof = "That is not an image — a screenshot or a photo of one.";
  } else if (proofStatus === "compressing") {
    /* Held rather than let through. Leaving now would carry the *original*
       file forward — the compressor has not swapped its result in yet — and on
       the phone photograph this check exists for, that is the upload that
       fails at the bucket a step and a half later, by which point the ticket is
       on screen and it is too late to say so. It is a second, at most. */
    errors.proof = "Still shrinking that screenshot. One moment.";
  } else if (proof.size > MAX_PROOF_BYTES) {
    errors.proof = "That file is over 5 MB. A screenshot rather than a photo.";
  }

  return errors;
}

export function useRegistration() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  /* The screenshot is held as the `File` itself, not as a data URL. It has to
     survive being carried to whatever eventually uploads it, and a 5 MB image
     re-encoded to base64 in React state is 6.7 MB of string being diffed on
     every keystroke in the field next to it. */
  const [proof, setProof] = useState(null);
  const [proofUrl, setProofUrl] = useState(null);

  /* "compressing" while the worker is running, so the step can say so rather
     than leaving a student looking at a file input that has apparently
     accepted their screenshot and done nothing with it. */
  const [proofStatus, setProofStatus] = useState("idle");

  /* What was picked, before it was shrunk — kept only to show the saving back
     ("2.4 MB → 180 KB"). It is a number, not the file: holding the original
     `File` alongside the compressed one to report a size would keep the whole
     12-megapixel image alive for the rest of the session, which is the exact
     cost the compression was there to avoid. */
  const [proofOriginalSize, setProofOriginalSize] = useState(null);

  /* Which attachment is current. Compression is async and a student who
     notices they picked the wrong screenshot will pick another one while the
     first is still in the worker — without this, the slower of the two wins
     and the form ends up holding an image nobody chose. */
  const attachSeq = useRef(0);

  /* Cut once, when the flow first asks for it, and kept for the life of the
     page. Generating it in render would hand out a different ticket on every
     re-render — including the one the countdown causes every second.

     Held in a ref as well as in state, and the ref is the copy that decides.
     `issueTicket` is now called by an event handler that has to *use* the code
     in the same tick — it files the registration with it — and a `setState` is
     not readable until the render after it. The state exists only so the steps
     re-render once the code is cut. */
  const [ticketCode, setTicketCode] = useState(null);
  const issuedRef = useRef(null);

  /* An object URL is a document-lifetime reference to a blob: not revoking it
     keeps the whole file alive until the tab closes. Keyed on the URL rather
     than on the file so that replacing a screenshot frees the one it replaced,
     which is the case that actually leaks. */
  useEffect(() => {
    if (!proofUrl) return undefined;
    return () => URL.revokeObjectURL(proofUrl);
  }, [proofUrl]);

  const setField = useCallback((id, value) => {
    setValues((prev) => (prev[id] === value ? prev : { ...prev, [id]: value }));

    /* Clear this field's error the moment it is touched. Errors are raised on
       Next and cleared on edit — an error that stays up while you are fixing it
       is the page arguing with somebody who has already agreed. */
    setErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  /**
   * Take the screenshot, show it back immediately, and shrink it behind that.
   *
   * The preview is deliberately raised from the file as picked rather than
   * waiting on the compressor: seeing the image is how somebody notices they
   * attached the wrong one, and that check should not be a second late on the
   * device where it is most likely to be needed. What the compressor changes,
   * when it finishes, is which `File` the upload will actually send — and the
   * preview is re-pointed at it so the original can be released.
   */
  const attachProof = useCallback(async (file) => {
    const seq = attachSeq.current + 1;
    attachSeq.current = seq;

    setProof(file);
    setProofUrl(file ? URL.createObjectURL(file) : null);
    setProofOriginalSize(file?.size ?? null);
    setErrors((prev) => {
      if (!("proof" in prev)) return prev;
      const next = { ...prev };
      delete next.proof;
      return next;
    });

    if (!file) {
      setProofStatus("idle");
      return;
    }

    setProofStatus("compressing");
    const compressed = await compressProof(file);

    /* A newer attachment landed while this one was in the worker. Its own call
       has already set the state; saying anything here would undo it. */
    if (attachSeq.current !== seq) return;

    /* Identity, not size: `compressProof` hands back the very same object when
       it declined to compress or failed, and minting a second object URL for a
       file that already has one is a leak in the shape of an optimisation. */
    if (compressed !== file) {
      setProof(compressed);
      setProofUrl(URL.createObjectURL(compressed));
    }

    setProofStatus("idle");
  }, []);

  /**
   * Validate one step and publish whatever it found.
   *
   * Returns the id of the first field that failed, or `null` if it passed —
   * "first" in the order the fields are declared in, which is the order they are
   * read in, so the caller can put focus where the eye is already going.
   */
  const check = useCallback(
    (stepId) => {
      const found =
        stepId === "details"
          ? validateDetails(values)
          : stepId === "payment"
            ? validatePayment(values, proof, proofStatus)
            : {};

      setErrors(found);

      const order = stepId === "details" ? DETAIL_ORDER : PAYMENT_ORDER;
      return order.find((id) => id in found) ?? null;
    },
    [proof, proofStatus, values],
  );

  /**
   * The code for this registration, cutting one if there is not one yet.
   *
   * Idempotent and synchronous: it returns the code rather than only setting
   * it, because the caller files the registration with it immediately and
   * cannot wait a render to find out what it is. A student who goes back from
   * the group step to fix a typo and comes forward again gets the same code
   * they already have — a second one would mean two rows and one of them
   * unreachable.
   */
  const issueTicket = useCallback(() => {
    if (!issuedRef.current) {
      issuedRef.current = `${TICKET_PREFIX}-${ticketSuffix()}`;
      setTicketCode(issuedRef.current);
    }

    return issuedRef.current;
  }, []);

  /**
   * The class as it will be printed, which is not always the class that was
   * picked: "Other" is a placeholder for the box underneath it, and a ticket
   * that says a student is in "Other" has printed the form's plumbing.
   */
  const streamLabel = useMemo(
    () =>
      values.stream === CLASS_OTHER
        ? values.streamOther.trim() || CLASS_OTHER
        : values.stream,
    [values.stream, values.streamOther],
  );

  /**
   * The campus as it will be filed, on exactly the same terms as `streamLabel`
   * above: "Other" is the name of a text box, not the name of a college, and a
   * register with fifteen rows reading "Other" has recorded the form's plumbing
   * instead of an answer.
   */
  const collegeLabel = useMemo(
    () =>
      values.college === COLLEGE_OTHER
        ? values.collegeOther.trim() || COLLEGE_OTHER
        : values.college,
    [values.college, values.collegeOther],
  );

  return {
    values,
    errors,
    proof,
    proofUrl,
    proofStatus,
    proofOriginalSize,
    ticketCode,
    streamLabel,
    collegeLabel,
    setField,
    attachProof,
    check,
    issueTicket,
  };
}

/* The reading order of each step, used only to decide which bad field gets
   focus. Kept beside the validators they belong to rather than derived from
   `Object.keys`, whose order is an implementation detail of how the errors
   happened to be assigned. */
const DETAIL_ORDER = [
  "name",
  "college",
  "collegeOther",
  "stream",
  "streamOther",
  "section",
  "email",
  "registerNumber",
  "year",
];

const PAYMENT_ORDER = ["transactionId", "proof"];
