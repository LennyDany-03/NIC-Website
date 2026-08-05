"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CLASS_OTHER, TICKET_PREFIX } from "./content";

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

/** 5 MB. Comfortably above a phone screenshot and below a phone photograph. */
export const MAX_PROOF_BYTES = 5 * 1024 * 1024;

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
export function validatePayment(values, proof) {
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

  /* Cut once, when the flow first asks for it, and kept for the life of the
     page. Generating it in render would hand out a different ticket on every
     re-render — including the one the countdown causes every second. */
  const [ticketCode, setTicketCode] = useState(null);

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

  const attachProof = useCallback((file) => {
    setProof(file);
    setProofUrl(file ? URL.createObjectURL(file) : null);
    setErrors((prev) => {
      if (!("proof" in prev)) return prev;
      const next = { ...prev };
      delete next.proof;
      return next;
    });
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
            ? validatePayment(values, proof)
            : {};

      setErrors(found);

      const order = stepId === "details" ? DETAIL_ORDER : PAYMENT_ORDER;
      return order.find((id) => id in found) ?? null;
    },
    [proof, values],
  );

  const issueTicket = useCallback(() => {
    setTicketCode((prev) => prev ?? `${TICKET_PREFIX}-${ticketSuffix()}`);
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

  return {
    values,
    errors,
    proof,
    proofUrl,
    ticketCode,
    streamLabel,
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
  "stream",
  "streamOther",
  "section",
  "email",
  "registerNumber",
  "year",
];

const PAYMENT_ORDER = ["transactionId", "proof"];
