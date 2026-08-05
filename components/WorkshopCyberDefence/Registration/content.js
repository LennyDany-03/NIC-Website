/**
 * Everything the registration flow says, asks for and points at.
 *
 * Same split the rest of this site keeps — copy here, layout next door — with
 * one addition that matters more than usual: the *option lists* are here too.
 * A dropdown whose choices are typed into its own JSX is a dropdown that gets
 * edited in four files the week somebody adds a section E, and the ticket has to
 * print back exactly what the form offered or a student reads their own class
 * wrong on the thing they showed at the door.
 *
 * The payment details are transcribed from the club's UPI QR in
 * `public/payment-qr/`. When those two disagree the QR is right and this file is
 * the thing to fix — money is the one part of this flow where being confidently
 * wrong costs somebody something.
 */

/* -------------------------------------------------------------- the questions */

/**
 * What the department calls its streams, in the order the office lists them.
 *
 * `Other` is last and is the only one that opens a second field. It exists
 * because this workshop is open past the department in practice — a Mech student
 * who hears about it from a friend should not be told by a dropdown that they do
 * not exist — and a free-text box for everybody would give us four spellings of
 * "AIML" to reconcile afterwards.
 */
export const CLASS_OPTIONS = [
  "CSE : AIML",
  "CSE : BDA",
  "CSE : Cyber Security",
  "CSE : Core",
  "Other",
];

/** The value that turns on the free-text field beside it. Compared, not typed. */
export const CLASS_OTHER = "Other";

/** A to D — what the hall's sections actually run to. */
export const SECTION_OPTIONS = ["A", "B", "C", "D"];

/**
 * Year of study, written the way it is said rather than as I/II/III/IV.
 *
 * The poster's own register-number line is the formal one; this is the field a
 * nineteen-year-old fills in on a phone, and "3rd Year" is unambiguous in a way
 * that a lone roman numeral in a dropdown is not.
 */
export const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

/* ---------------------------------------------------------------- the payment */

/**
 * The club's UPI details, and the deep link built from them.
 *
 * `href` is a `upi://` intent, which is understood by every UPI app on Android
 * and by iOS's registered handlers, and by nothing at all on a desktop browser.
 * That is why the QR is the primary thing on the payment step and this link is
 * the secondary one: the person on a laptop scans with their phone, the person
 * already on their phone taps. Neither is asked to do the other's job.
 *
 * `am` and `cu` pre-fill the amount so a fee is not retyped as ₹15 or ₹1500 by
 * somebody in a hurry. It is stated to two decimals because a bare `150` is
 * accepted by most apps and rejected by a couple of them.
 *
 * `aid` is carried straight from the club's own QR. It identifies the payee's
 * app registration; dropping it is harmless for the transfer but it is what the
 * QR encodes, so the link and the code stay identical.
 */
const UPI = {
  vpa: "lennydany3-2@okicici",
  payeeName: "Lenny Dany . D",
  aid: "uGICAgKCa1f2beg",
  amount: "150.00",
};

export const PAYMENT = {
  fee: 150,
  feeLabel: "₹150",
  vpa: UPI.vpa,
  payeeName: UPI.payeeName,
  href: `upi://pay?pa=${UPI.vpa}&pn=${encodeURIComponent(UPI.payeeName)}&aid=${UPI.aid}&am=${UPI.amount}&cu=INR`,

  /**
   * The QR is generated from `href` above, not cropped from the app
   * screenshot in `public/payment-qr/`.
   *
   * It was the screenshot's crop at first, and that turned out to be a real
   * bug rather than a placeholder detail: a static QR saved out of a UPI app
   * carries no amount, so scanning the poster's own code opens a payment for
   * whatever the person paying decides to type in — which is exactly the
   * ambiguity `am=150.00` on the deep link exists to remove. Encoding `href`
   * instead means the QR and the "Pay ₹150 now" button underneath it are the
   * same instruction read two different ways, and both open a UPI app with
   * ₹150 already filled in. See `StepPayment`, which draws it client-side with
   * the `qrcode` package the ticket already depends on.
   */
  qrAlt: "UPI QR code, pre-filled for the ₹150 registration fee",

  proofNote: `Once it has gone through, put the transaction ID in and attach the screenshot your app gives you. That pair is what the coordinators check a payment against.`,

  /* Said on screen, under the file input. A flow that collects a screenshot and
     does nothing with it is not a thing to be quiet about. */
  pendingNote: `Nothing is uploaded from this page yet — the coordinators are collecting payments by hand for now. Keep the screenshot on your phone until one of them has confirmed you in the group.`,
};

/* ------------------------------------------------------------------ the group */

export const WHATSAPP = {
  href: "https://chat.whatsapp.com/GQUXtucy3oi7Vo26f9YKol",
  label: "Join on WhatsApp",
  chatName: "Modern Cyber Defence — NIC",
  chatKind: "WhatsApp group",
  note: "You can join later, but the ticket on the next step will not tell you where to be.",
};

/* ------------------------------------------------------------------ the steps */

/**
 * The four steps, in order, as the rail reads them out and as each one
 * introduces itself.
 *
 * `id` is what the state machine switches on, `label` is the word in the rail,
 * and `headline`/`lede` are what the step says at the top of its own panel —
 * kept in one list rather than three so a step cannot exist in the rail and not
 * in the flow. The numbers are computed from the index rather than written down;
 * two lists of four that have to agree is one list too many.
 *
 * `next` is the word on the forward button, which is different every time on
 * purpose. "Next" four times running tells you nothing about what you are about
 * to be asked for, and the one place that really matters is step 1 → 2, where a
 * student should know a payment is coming before the QR is on screen.
 */
export const STEPS = [
  {
    id: "details",
    label: "Details",
    headline: "Who is coming",
    lede: `Your name as it is on your ID card, and the class the register will be checked against. Six fields, and the ticket at the end is printed from them.`,
    next: "Continue to payment",
  },
  {
    id: "payment",
    label: "Payment",
    headline: "Pay the registration fee",
    lede: `Registration is ₹150. Scan the code with any UPI app, or tap the button below if you are reading this on your phone — it opens your app with the amount already filled in.`,
    next: "Continue",
  },
  {
    id: "group",
    label: "Group",
    headline: "Join the WhatsApp group",
    lede: `The venue is not on the poster yet, and it — along with any change to the timings and whatever the sessions ask you to install — goes to the group first. It is the only place the day is announced from.`,
    next: "Get my ticket",
  },
  {
    id: "ticket",
    label: "Ticket",
    headline: "You're registered",
    lede: `Here is your ticket. Save it — the code on it is what a coordinator matches you against at the door, and it is easier to show than to spell out.`,
    next: null,
  },
];

export const FLOW = {
  eyebrow: "Registration",
  headline: "Register",
  lede: `Four steps: who you are, the fee, the group, and the ticket you bring on the day. It takes about two minutes and nothing is asked for twice.`,
};

/* ----------------------------------------------------------------- the ticket */

export const TICKET = {
  admit: "Admit one",
  club: "Nextgen Intelligence Club",
  venueFallback: "Venue — to be announced",
  note: `Seats are limited by the hall and payments are checked by hand, so treat this as confirmed once a coordinator has said so in the group. If anything on it is wrong, either number on the poster will fix it.`,
  downloadLabel: "Download ticket",
};

/**
 * The prefix on every ticket code, and the tag the ticket's QR opens with.
 *
 * Short and typed in capitals because its real life is being read aloud across a
 * noisy corridor and written on a printed list — `MCD26-7K2QX4` survives that
 * and a UUID does not.
 */
export const TICKET_PREFIX = "MCD26";
export const TICKET_TAG = "NIC-MCD26";

/**
 * The row of bars under the ticket code — the boarding-pass barcode a keycard
 * borrows its look from, and purely decorative: nothing scans it, the QR
 * above it is the only thing on the ticket that actually encodes anything.
 *
 * Seeded from the ticket code's own characters rather than `Math.random`, so
 * it is deterministic: the on-page ticket in `Ticket.jsx` and the downloaded
 * PNG in `ticketCanvas.js` draw the same bars for the same code without
 * either of them having to send the pattern to the other. Two callers reading
 * one pure function instead of one of them reading the other's markup.
 */
export function barcodeWidths(code, count = 46) {
  const chars = (code ?? "").replace(/[^A-Z0-9]/gi, "") || TICKET_PREFIX;

  return Array.from({ length: count }, (_, i) => 1 + (chars.charCodeAt(i % chars.length) % 4));
}

/**
 * The poster's three stops — magenta, amber, teal — as RGB triples rather than
 * as the CSS custom properties `eventsTheme` exposes them as. `SPECTRUM_RULE`
 * is a Tailwind gradient class and can only be painted with; it cannot be
 * asked what colour it is at 40% along itself, which is what colouring 46
 * individually-sized barcode bars — or a canvas gradient built by hand,
 * outside any DOM `linear-gradient` at all — needs.
 */
const SPECTRUM_STOPS = [
  [200, 31, 110],
  [242, 178, 60],
  [43, 183, 189],
];

/**
 * The same sweep `SPECTRUM_RULE` paints, sampled at `t` (0 = magenta, 1 =
 * teal) and handed back as an `rgb()` string usable in an inline style or a
 * canvas `fillStyle`. Shared by the ticket's barcode in both `Ticket.jsx` and
 * `ticketCanvas.js`, so the same bar is the same colour in the on-page ticket
 * and the file saved from it.
 */
export function spectrumColorAt(t) {
  const clamped = Math.min(1, Math.max(0, t));
  const span = clamped * (SPECTRUM_STOPS.length - 1);
  const i = Math.min(SPECTRUM_STOPS.length - 2, Math.floor(span));
  const local = span - i;
  const [r1, g1, b1] = SPECTRUM_STOPS[i];
  const [r2, g2, b2] = SPECTRUM_STOPS[i + 1];

  const mix = (a, b) => Math.round(a + (b - a) * local);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

/* ------------------------------------------------------------------ the stub */

/**
 * Where a registration will be sent, once there is somewhere to send it.
 *
 * Nothing is persisted in this pass — deliberately, so the flow could be built
 * and looked at before a schema was committed to. It is a function rather than
 * an inline `TODO` at the call site so that the day the backend lands, exactly
 * one body changes and the four steps above are untouched.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN
 *
 *   Wants a `workshop_registrations` table (name, class, section, email,
 *   register number, year, txn id, proof path, ticket code, created_at) with an
 *   insert-only policy for `anon`, and a `payment-proofs` storage bucket for the
 *   screenshot — private, since it is somebody's bank app. `lib/supabase/client`
 *   is the browser client; the upload flow to copy is the one in
 *   `app/admin/dashboard/bod/page.jsx`.
 *
 *   Note the screenshot arrives here as a `File` and is currently dropped on the
 *   floor. It is held in state and previewed from an object URL, so wiring the
 *   upload is a matter of sending `payload.proof`, not of collecting it.
 * ---------------------------------------------------------------------------
 */
export async function submitRegistration(payload) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[registration] not persisted yet:", payload);
  }

  return { ok: true };
}
