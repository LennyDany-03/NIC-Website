import Link from "next/link";
import CornerTicks from "../CornerTicks";
import { LABEL_SHADOW } from "../surfaces";
import Pulse from "./Pulse";
import { PageHeading } from "./ui";
import { ADMIN_PANEL } from "./surfaces";

/**
 * The console's front page, as a view.
 *
 * Split from the route so the page is only the two things a route should be
 * — the auth check and the data — and this is only what is drawn. It is also
 * the half that can be rendered without a session, which is the half worth
 * putting in front of a browser before shipping. `Pulse` is the one thing on
 * it that reads from the database, and it does its own fetching for exactly
 * that reason: this file stays renderable with nothing behind it.
 */

export default function DashboardHome() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-8 sm:py-20">
      <PageHeading eyebrow="NIC Admin" lead="Control" accent="Room">
        Everything here writes straight to the live site. There is no draft
        state and no publish step — a saved change is on the homepage the
        next time the crew section loads.
      </PageHeading>

      {/* ------------------------------------------------ where things stand */}
      <Pulse />

      {/* ---------------------------------------------------- what you can do */}
      <h2
        className={`mt-14 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red ${LABEL_SHADOW}`}
      >
        <span aria-hidden className="h-px w-6 bg-nic-red/70" />
        Tools
      </h2>

      {/*
       * Three cards, and between them the whole of what this console does: it
       * edits the roster, it reads the registers, and on the morning of an
       * event it works the door. A grid padded out with greyed-out tiles for
       * things that do not exist is a promise the console has not made.
       *
       * The scanner sits here rather than inside an event's register because
       * of when it is used. The register is a desk screen, worked through the
       * week before with a bank statement open beside it; the scanner is a
       * phone screen held at a door for four hours on one morning. Reaching it
       * should not mean going through the desk.
       */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <ToolCard
          href="/admin/dashboard/bod"
          eyebrow="Roster"
          title="Edit BOD details"
          action="Open editor"
        >
          Photo, bio and contact links for every seat on the senior and joint
          boards, and for the faculty masterminds — picked by designation, in
          the order the boards are dealt on the site.
        </ToolCard>

        <ToolCard
          href="/admin/dashboard/events"
          eyebrow="Registers"
          title="Events"
          action="Open registers"
        >
          Who has signed up for each event the club is running, searchable by
          name, register number or ticket code, with the transaction ID and the
          payment screenshot behind every seat.
        </ToolCard>

        <ToolCard
          href="/admin/dashboard/scanner"
          eyebrow="Door"
          title="Ticket scanner"
          action="Open scanner"
        >
          Scan a ticket&apos;s QR on the day and mark the student in. Only a
          registration set to Verified in the register will open — a pending or
          failed payment is turned away at the door.
        </ToolCard>

        <ToolCard
          href="/admin/dashboard/attendance"
          eyebrow="Entry"
          title="In the room"
          action="Open the sheet"
        >
          The attendance sheet the scanner writes: everybody admitted so far, in
          the order they walked in, with the time each one came through. Updates
          itself while the door is running.
        </ToolCard>
      </div>
    </main>
  );
}

/**
 * One thing the console can do.
 *
 * Extracted when the second card arrived rather than the first, which is the
 * right moment for it: a single card written inline is a card, and two written
 * inline is a shape that will drift — the lift on hover, the red foot rule and
 * the corner ticks are five properties that have to agree across every tile in
 * the grid or the row reads as two different components.
 */
function ToolCard({ href, eyebrow, title, action, children }) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col p-7 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-nic-red/70 hover:shadow-[0_26px_60px_-24px_rgba(237,10,20,0.55)] focus-visible:border-nic-red focus-visible:outline-none sm:p-8 ${ADMIN_PANEL}`}
    >
      <CornerTicks />

      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
        {eyebrow}
      </span>

      <h3 className="mt-4 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
        {children}
      </p>

      <span className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 transition-colors group-hover:text-white">
        {action} →
      </span>

      {/* The affordance the seat cards carry along their foot. */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px] w-0 bg-nic-red transition-all duration-500 ease-out group-hover:w-full group-focus-visible:w-full"
      />
    </Link>
  );
}
