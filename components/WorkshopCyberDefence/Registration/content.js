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
 * Which campus somebody is walking in from.
 *
 * Vadapalani first because it is the campus the workshop is held on and will be
 * most of the register; the other two are the campuses students actually travel
 * from. `Other` is last and opens a free-text box, the same arrangement
 * `CLASS_OPTIONS` uses below and for the same reason — the workshop is open past
 * SRM in practice, and a dropdown that cannot express where somebody is from is
 * a dropdown that gets a wrong answer picked out of it.
 *
 * Asked before the class, because the class list underneath is Vadapalani's own
 * departmental one: knowing the campus first is what makes "Other" down there
 * read as an answer rather than as a gap.
 */
export const COLLEGE_OPTIONS = [
  "SRM Vadapalani",
  "SRM Ramapuram",
  "SRM Kattankulathur",
  "Other",
];

/**
 * The value that turns on the free-text field beside it. The same word as
 * `CLASS_OTHER` and deliberately a separate constant: they are two dropdowns
 * that happen to agree today, and one of them changing its wording must not
 * silently unhook the other one's text box.
 */
export const COLLEGE_OTHER = "Other";

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
 * The department's UPI QR, transcribed exactly.
 *
 * ---------------------------------------------------------------------------
 * THIS STRING IS A SIGNATURE. DO NOT REFORMAT IT.
 *
 * It is the literal payload of the City Union Bank QR issued to the Department
 * of Basic Sciences — read off the bank's own PDF rather than retyped, and
 * verified byte for byte by decoding that PDF's QR image.
 *
 * `mode=02` with `sign=` and `orgid=` makes this a *signed merchant* QR: the
 * `sign` value is a signature over this exact URI, and a UPI app that verifies
 * it will reject a payload that has been altered in any way. Everything that
 * would normally be tidied up here is therefore load-bearing:
 *
 *   - the spaces in `pn` are real spaces, not `%20` or `+`
 *   - the `+` inside `sign` is a literal `+`, not `%2B`
 *   - the trailing `=` on `sign` is base64 padding, not an empty parameter
 *   - the parameters are in this order
 *
 * Running this through `encodeURIComponent`, a URL builder, a formatter, or
 * anything else that "cleans up" a URI will silently produce a QR that some
 * apps refuse and others accept — which is the worst possible failure for a
 * page that takes money from students.
 *
 * The bank's payload carries **no amount**. `am` is appended to it below.
 * ---------------------------------------------------------------------------
 */
const DEPARTMENT_QR =
  "upi://pay?pa=EzE0104677@CUB&pn=DEPARTMENT OF BASIC SCIENCES VADAPALANI CAMPUS SRMUNIVERSITY&cu=INR&mode=02&sign=ZSPli8DuxCwxuWNdXg38I7bRGbc+YzvzpShMebtKHt4=&orgid=123456";

/**
 * The fee, fixed into the code so nobody types ₹15 or ₹1500 in a hurry.
 *
 * Two decimals because a bare `150` is accepted by most UPI apps and rejected
 * by a couple of them. `cu=INR` is already in the bank's payload above, so it
 * is not repeated here.
 *
 * ---------------------------------------------------------------------------
 * A caveat worth keeping written down
 *
 * `DEPARTMENT_QR` is a *signed* merchant payload — `mode=02` with a `sign` over
 * its exact contents — so appending anything means the string no longer matches
 * what the bank signed. In practice UPI apps treat `sign` as merchant
 * verification and still honour `am`, which is why this is safe enough to ship;
 * but "in practice" is not "always", and the failure mode would be an app that
 * refuses the code outright rather than one that quietly drops the amount.
 *
 * It is appended at the very end rather than slotted in beside `cu`, which
 * keeps the bank's signed string intact and contiguous as a prefix — the most
 * forgiving arrangement for anything that validates by re-reading what it was
 * handed, and a one-line revert (`href: DEPARTMENT_QR`) if a real payment ever
 * bounces.
 *
 * **Test this with one real ₹1 payment before the event**, from an actual phone
 * and ideally from two different apps. Everything else in this flow can be
 * fixed after the fact; a payment code that will not open cannot.
 * ---------------------------------------------------------------------------
 */
const SIGNED_QR = `${DEPARTMENT_QR}&am=150.00`;

export const PAYMENT = {
  fee: 150,
  feeLabel: "₹150",

  vpa: "EzE0104677@CUB",

  /* Printed under the VPA so a student can check it against what their app
     shows them before they confirm. Stated in the bank's own capitals rather
     than tidied into title case for exactly that reason — this is the string
     that will appear on their screen, and a payee name that does not match the
     one on the page is the single best signal that something is wrong. */
  payeeName: "DEPARTMENT OF BASIC SCIENCES VADAPALANI CAMPUS SRMUNIVERSITY",

  /* Both the QR and the button use the payload verbatim. They are the same
     instruction read two ways, which is only true while neither of them
     rewrites it. */
  href: SIGNED_QR,

  qrAlt:
    "UPI QR code for the Department of Basic Sciences, pre-filled for the ₹150 registration fee",

  /**
   * Under the code: check the number, do not just trust it.
   *
   * Worded as a check rather than an instruction because the amount is now
   * pre-filled and *should* already be right — but `am` is appended to a signed
   * payload (see `SIGNED_QR`), and the one failure mode that would otherwise be
   * silent is an app that drops it and opens on a blank amount. A student who
   * has been told to glance at the figure catches that in a second; one who has
   * been told the code fills it in will confirm whatever is on screen.
   */
  amountNote:
    "Your app should already show ₹150. If it shows anything else, type ₹150 in before you confirm.",

  proofNote: `Once it has gone through, put the transaction ID in and attach the screenshot your app gives you. That pair is what the coordinators check a payment against.`,

  /* Under the file input. It says "any screenshot" rather than naming a size
     because there is no longer a size to meet: `compressProof` shrinks whatever
     is picked before it is sent, and a limit stated to somebody who cannot
     exceed it is a hurdle invented for the page's own convenience. What it does
     still ask for is the one thing compression cannot fix — a screenshot of the
     wrong screen. */
  proofHint: `Any screenshot — it is shrunk on your phone before it is sent. Check it shows the amount and the transaction ID.`,

  /* Said on screen, under the file input. The screenshot is uploaded now, and
     saying so is the point: a student who has handed over a picture of their
     banking app is owed a plain sentence about where it went. What has not
     changed is that a seat is confirmed by a person, not by an upload.

     It used to say "when you reach the last step", which was true while the
     registration was filed under the ticket on step 4. It is filed by the
     button at the bottom of *this* step now — see useFiling.js — and a note
     describing the old order would have somebody pressing Continue without
     knowing it was the moment their screenshot left the phone. */
  pendingNote: `Pressing Continue sends your details and this screenshot to the club — nobody outside the coordinators can read either. A payment is still checked by hand, so treat your seat as confirmed once one of them has said so in the group.`,
};

/* ------------------------------------------------------------------ the group */

export const WHATSAPP = {
  href: "https://chat.whatsapp.com/BZF82TyLmDq8SG5yTIBoev?s=sw&p=a&mlu=0",
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
    lede: `Your name as it is on your ID card, and the campus and class the register will be checked against. Seven fields, and the ticket at the end is printed from them.`,
    next: "Continue to payment",
  },
  {
    id: "payment",
    label: "Payment",
    headline: "Pay the registration fee",
    /* Names the amount and the payee before the code appears, because the payee
       is no longer the club — it is the department's own account, and a student
       who scans expecting "NIC" and sees "DEPARTMENT OF BASIC SCIENCES" should
       have been told first. */
    lede: `Registration is ₹150, paid to the Department of Basic Sciences. Scan the code with any UPI app, or tap the button below if you are reading this on your phone — it opens your app with the amount already filled in.`,
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
 * What the flow says while the registration is being filed, and afterwards.
 *
 * Split across two screens, which is worth knowing before changing any of it.
 * The unhappy states are read on the **payment** step, where the button that
 * caused them still is and every field is still filled in; the two happy ones
 * are read under the **ticket**, two steps later. That is why `failed` can say
 * "you are not registered yet" — at the point it is shown, that is simply true,
 * and nobody is holding a ticket it would contradict. An earlier version of
 * this flow filed the row under the ticket and had to word the same failure
 * around a ticket already on the screen; see the note at the top of
 * `useFiling.js` for why it moved.
 *
 * None of these print the message Supabase returned. That string is written for
 * whoever is reading the logs — "duplicate key value violates unique
 * constraint" — and putting it in front of a student turns a retry into a
 * support conversation. It is shown in development only; see `FilingNotice` in
 * index.jsx.
 */
export const SAVE = {
  /* On the button, so it is short. The sentence version has nowhere to go now
     that the filing happens behind a control rather than under a ticket. */
  working: "Filing…",

  sent: "Filed. A coordinator can see your payment against this code.",

  /* The row saved but a file did not. The screenshot is the one worth chasing
     — the club's copy of the ticket can be redrawn from the row, a payment
     screenshot cannot be redrawn from anything. */
  partial: `Filed, but your screenshot did not upload. Send it to a coordinator in the group with the code above and you are done.`,

  /* The row did not save. Read on the payment step with everything still
     typed in, so the action is the button they just pressed — and it says
     outright that they are not registered, because the one dangerous version
     of this message is the one somebody skims and walks away from. */
  failed: `That did not reach the club, so you are not registered yet. Nothing you typed has been lost — press Continue to try again. If it keeps failing, either number below the group step will sort it out.`,

  /**
   * The two ways the rate limit says no.
   *
   * Both are written to be read by the student it happened to, who is almost
   * never the person the limit was aimed at — on the college wifi the whole
   * campus shares one address, so the commonest way to meet `ip` is to be the
   * thirteenth person in a lecture hall to register in ten minutes. So neither
   * of these accuses anybody of anything, and both say the same two things: it
   * is temporary, and nothing you typed has been lost.
   *
   * `register` is the one that is usually the person's own doing — a form
   * submitted five times because the first four looked like they had not
   * worked — so it is the one that points at the group, since by then a
   * coordinator can see the rows and they cannot.
   *
   * The wait is stated by the step, from the number the route sends back;
   * these are the sentences it goes around.
   */
  blocked: {
    ip: `A lot of registrations have come from this network in the last few minutes — on campus wifi that is everybody else registering too, not you. Nothing you have typed is lost.`,
    register: `This register number has been submitted several times already today. If one of them worked you are registered, and a coordinator in the group can tell you which.`,
    /* The scope did not come back — an old response, a proxy that ate the body.
       Says the true part of both without claiming which. */
    unknown: `That was one attempt too many for now. Nothing you have typed is lost.`,
  },
};

/**
 * The two moments the flow stops and says something.
 *
 * A curtain between steps, not a step of its own: it plays over the panel for
 * under two seconds and lifts itself. Each one exists because the step it
 * introduces buries the thing that just happened — step 3 opens on a WhatsApp
 * group, which is not the answer to "did that work?", and step 4 opens on a
 * ticket, which is the whole point of the last four minutes and deserves more
 * than appearing.
 *
 * `filed` is the honest one and it can only say what it says because the
 * registration is genuinely written by the time it plays. It is fired from the
 * payment step's own result — see `advance` in index.jsx — and never from the
 * mere fact of a step changing, which is the difference between a tick that
 * means something and a tick that is decoration.
 */
export const CELEBRATION = {
  filed: {
    mark: "check",
    headline: "You're registered",
    lede: "Your details and your payment screenshot are with the club.",
    /* Shown under the headline so the code is in front of somebody twice — here
       and on the ticket — before they are asked to remember it. */
    codeLabel: "Your code",
  },
  ticket: {
    mark: "ticket",
    headline: "Here is your ticket",
    lede: "Save it, and bring it on the day.",
    codeLabel: "Your code",
  },
  /* Every curtain on this page can be dismissed, and says so. It is two seconds
     and it is in the way of something somebody asked for. */
  skip: "Tap to continue",
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

/* ---------------------------------------------------------------- the backend */

/**
 * A registration is persisted by `submit.js`, next door.
 *
 * This file used to hold a stub for it. It has moved because it stopped being
 * a placeholder and became plumbing — a Supabase insert and two storage
 * uploads — and plumbing does not belong in the file the copy lives in. The
 * table and bucket it writes to are created by
 * `supabase/workshop-modern-cyber-defence.sql`, which is the other half of it
 * and has to be run once against the project before this flow will save
 * anything.
 */
