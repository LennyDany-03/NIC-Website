import Link from "next/link";
import CornerTicks from "../CornerTicks";
import { LABEL_SHADOW } from "../surfaces";
import { PageHeading } from "./ui";
import { ADMIN_PANEL } from "./surfaces";
import {
  BOARDS,
  DEFAULT_TERM,
  MASTERMINDS,
} from "../CrewSequence/content";

/**
 * The console's front page, as a view.
 *
 * Split from the route so the page is only the two things a route should be
 * — the auth check and the data — and this is only what is drawn. It is also
 * the half that can be rendered without a session, which is the half worth
 * putting in front of a browser before shipping.
 */

/**
 * What the console is looking after, counted off the roster itself rather
 * than written down here — a seat added to content.js has to change this
 * line too, or the dashboard is quietly lying about what it edits.
 */
const ROSTER_STATS = [
  { label: "Faculty", value: MASTERMINDS.people.length },
  ...BOARDS.map((board) => ({
    label: board.short,
    value: board.terms[DEFAULT_TERM].members.length,
  })),
];

export default function DashboardHome() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-8 sm:py-20">
      <PageHeading eyebrow="NIC Admin" lead="Control" accent="Room">
        Everything here writes straight to the live site. There is no draft
        state and no publish step — a saved change is on the homepage the
        next time the crew section loads.
      </PageHeading>

      {/* -------------------------------------------------- what's in there */}
      {/* Hairline dividers by way of a 1px gap over a lit background, so the
          three tiles read as one instrument rather than three boxes. */}
      <dl className="mt-10 grid grid-cols-3 gap-px overflow-hidden border border-white/10 bg-white/10">
        {ROSTER_STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-black/70 px-4 py-5 backdrop-blur-md sm:px-6"
          >
            <dt
              className={`font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500 sm:text-[10px] ${LABEL_SHADOW}`}
            >
              {stat.label}
            </dt>
            <dd className="mt-2 font-mono text-2xl font-black tracking-tight text-white sm:text-3xl">
              {String(stat.value).padStart(2, "0")}
              <span className="ml-1.5 align-middle text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                seats
              </span>
            </dd>
          </div>
        ))}
      </dl>

      {/* ---------------------------------------------------- what you can do */}
      <h2
        className={`mt-14 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red ${LABEL_SHADOW}`}
      >
        <span aria-hidden className="h-px w-6 bg-nic-red/70" />
        Tools
      </h2>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/*
         * One card, and it is allowed to be one card. A grid padded out with
         * greyed-out tiles for things that do not exist is a promise the
         * console has not made.
         */}
        <Link
          href="/admin/dashboard/bod"
          className={`group relative flex flex-col p-7 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-nic-red/70 hover:shadow-[0_26px_60px_-24px_rgba(237,10,20,0.55)] focus-visible:border-nic-red focus-visible:outline-none sm:p-8 ${ADMIN_PANEL}`}
        >
          <CornerTicks />

          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
            Roster
          </span>

          <h3 className="mt-4 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
            Edit BOD details
          </h3>

          <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
            Photo, bio and contact links for every seat on the senior and
            joint boards, and for the faculty masterminds — picked by
            designation, in the order the boards are dealt on the site.
          </p>

          <span className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 transition-colors group-hover:text-white">
            Open editor →
          </span>

          {/* The affordance the seat cards carry along their foot. */}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[2px] w-0 bg-nic-red transition-all duration-500 ease-out group-hover:w-full group-focus-visible:w-full"
          />
        </Link>
      </div>
    </main>
  );
}
