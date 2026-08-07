/**
 * What came out of the camera, turned into a ticket code.
 *
 * The QR on a ticket encodes a pipe-delimited line — see the payload built in
 * `StepTicket`:
 *
 *     NIC-MCD26|MCD26-7K2QX4|RA2311003010999|Priya S
 *
 * Only the first two fields are read. The name and register number are in there
 * so that a coordinator holding a phone with a generic QR app still sees
 * something useful, but this screen looks the student up in the register rather
 * than believing what the code says about them — a QR is a piece of paper, and
 * the row is the record.
 *
 * A bare code is accepted too, because the manual box on the scanner exists for
 * the ticket that will not scan: a cracked screen, a photograph of a photograph,
 * a phone at 5% brightness in a corridor. `MCD26-7K2QX4` typed in by hand has to
 * do exactly what scanning it would have done.
 *
 * Returns `{ code }`, or `{ error }` naming which kind of nonsense it was — the
 * two are worth telling apart on screen, because "this is a ticket for a
 * different event" and "this is a QR code off a shampoo bottle" want different
 * things done about them.
 */
export function parseTicketPayload(raw, event) {
  const text = String(raw ?? "").trim();
  if (!text) return { error: "empty" };

  if (text.includes("|")) {
    const [tag, code] = text.split("|");

    if (tag.trim().toUpperCase() !== event.ticketTag.toUpperCase()) {
      return { error: "other-event" };
    }

    const cleaned = (code ?? "").trim().toUpperCase();
    return cleaned ? { code: cleaned } : { error: "unreadable" };
  }

  /* Typed by hand. Spaces are stripped rather than rejected: the code is read
     aloud in two halves across a noisy corridor and gets written down with a
     gap in the middle about half the time. */
  const bare = text.toUpperCase().replace(/\s+/g, "");

  if (bare.startsWith(`${event.ticketPrefix}-`)) return { code: bare };

  /* The prefix alone, without the code after it, is somebody halfway through
     typing rather than an error worth shouting about. */
  return { error: "unreadable" };
}

/** What to say about a payload that did not yield a code. */
export const PARSE_MESSAGES = {
  empty: "Nothing to look up.",
  "other-event": "That is a ticket for a different event.",
  unreadable:
    "That is not a ticket code. It should look like MCD26-7K2QX4.",
};
