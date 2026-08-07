import Link from "next/link";
import CornerTicks from "../CornerTicks";
import { LABEL_SHADOW } from "../surfaces";
import { BackLink, PageHeading } from "./ui";
import { ADMIN_PANEL } from "./surfaces";
import { ADMIN_EVENTS } from "./events";

/**
 * The events the console holds a register for.
 *
 * One screen between the dashboard and a register, rather than linking the
 * workshop straight off the front page, and that middle step is deliberate even
 * while there is only one thing on it. "Events" is a category the club will
 * keep — Genesis'26 is already on the public board and will want a register of
 * its own — whereas "the cyber defence workshop" is a card that has to be
 * removed by hand the week after it runs. Putting the list here means adding
 * the next event is an entry in `events.js` and nothing else.
 *
 * Each row states its date and how many seats it has taken, and the count is
 * *not* fetched here: it lives on the register screen, which is the only thing
 * that reads the table. A list that showed live counts would make the console's
 * front door wait on a query per event to render, for a number nobody navigates
 * by.
 */
export default function EventsList() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-8 sm:py-20">
      <BackLink href="/admin/dashboard">Dashboard</BackLink>

      <div className="mt-6">
        <PageHeading eyebrow="NIC Admin" lead="Event" accent="Registers">
          Who has signed up, what they paid and the screenshot they paid it
          with. Read-only — a registration is made by the student on the
          event&apos;s own page and this is where it arrives.
        </PageHeading>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {ADMIN_EVENTS.map((event) => (
          <Link
            key={event.id}
            href={`/admin/dashboard/events/${event.id}`}
            className={`group relative flex flex-col p-7 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-nic-red/70 hover:shadow-[0_26px_60px_-24px_rgba(237,10,20,0.55)] focus-visible:border-nic-red focus-visible:outline-none sm:p-8 ${ADMIN_PANEL}`}
          >
            <CornerTicks />

            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
              {event.kind}
            </span>

            <h2 className="mt-4 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
              {event.lead} {event.title}
            </h2>

            <p
              className={`mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400 ${LABEL_SHADOW}`}
            >
              {event.dateLabel} · {event.timeLabel}
            </p>

            <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-400">
              Registrations taken at {event.feeLabel} a seat, each with a
              transaction ID and the screenshot it was paid with.
            </p>

            <span className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 transition-colors group-hover:text-white">
              Open register →
            </span>

            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[2px] w-0 bg-nic-red transition-all duration-500 ease-out group-hover:w-full group-focus-visible:w-full"
            />
          </Link>
        ))}
      </div>

      {/* An empty list is a real state — every event the club has run has been
          retired out of `events.js` — and it says so rather than rendering an
          empty grid that reads as a page that failed to load. */}
      {ADMIN_EVENTS.length === 0 ? (
        <p className={`mt-10 border border-white/10 bg-black/70 p-7 text-sm leading-relaxed text-zinc-400 ${ADMIN_PANEL}`}>
          No event is collecting registrations at the moment.
        </p>
      ) : null}
    </main>
  );
}
