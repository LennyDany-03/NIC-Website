import { EVENT as WORKSHOP } from "../WorkshopCyberDefence/content";
import {
  PAYMENT,
  TICKET_PREFIX,
  TICKET_TAG,
} from "../WorkshopCyberDefence/Registration/content";
import { WORKSHOP_HREF } from "../siteLinks";

/**
 * Which events the console can open a register for.
 *
 * An event only appears here once it has somewhere to read registrations
 * *from* — a table and a bucket that exist. That is why this is its own short
 * list rather than the `SCHEDULED` array the public events board is built
 * from: those two lists answer different questions. The board's is "what is the
 * club putting on", which includes Genesis'26; this one is "what has a register
 * behind it", which for now is one workshop. Genesis collects nothing yet, and
 * a card that opened an empty table would be the console claiming to hold
 * records it does not have.
 *
 * Everything a visitor would recognise — the title, the date, the fee — is
 * imported from the event's own folder rather than transcribed. The strings
 * that are *not* imported are the two the event page has no opinion about:
 * `table` and `bucket`, which belong to
 * `supabase/workshop-modern-cyber-defence.sql` and have to match it exactly.
 *
 * ---------------------------------------------------------------------------
 * FILL ME IN — as events start collecting registrations
 *
 *   Adding one: run its own SQL file against the project, then put an entry
 *   here naming the table and bucket it created. The register screen is generic
 *   over this shape and needs nothing else — see `Registrations/index.jsx`.
 * ---------------------------------------------------------------------------
 */
export const ADMIN_EVENTS = [
  {
    id: "workshop-modern-cyber-defence",
    lead: WORKSHOP.lead,
    title: WORKSHOP.title,
    kind: WORKSHOP.kind,
    status: WORKSHOP.status,
    dateLabel: WORKSHOP.dateLabel,
    timeLabel: WORKSHOP.timeLabel,
    href: WORKSHOP_HREF,
    feeLabel: PAYMENT.feeLabel,

    /* Both of these are the literal names in the SQL file. The hyphens are
       load-bearing: supabase-js quotes the identifier for us, but a typo here
       fails as an empty register rather than as an error, which is the worst
       way for this particular screen to be wrong. */
    table: "workshop-modern-cyber-defence",
    bucket: "workshop-modern-cyber-defence-verification",

    /*
     * What the scanner expects to find inside a ticket's QR, imported from the
     * same file the ticket encodes it from — see the payload built in
     * `StepTicket`. `ticketTag` is the leading field, which is how the door
     * tells this event's ticket from another event's; `ticketPrefix` is the
     * shape of the code itself, which is what lets a coordinator type one in by
     * hand when a screen is too cracked or too dim to scan.
     */
    ticketTag: TICKET_TAG,
    ticketPrefix: TICKET_PREFIX,
  },
];

/** The entry a route's `[event]` segment names, or `null` if it names none. */
export function findAdminEvent(id) {
  return ADMIN_EVENTS.find((event) => event.id === id) ?? null;
}
