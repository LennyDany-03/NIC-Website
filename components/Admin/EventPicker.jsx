import Link from "next/link";
import CornerTicks from "../CornerTicks";
import { LABEL_SHADOW } from "../surfaces";
import { PageHeading } from "./ui";
import { ADMIN_PANEL } from "./surfaces";
import { ADMIN_EVENTS } from "./events";

/**
 * Which event, for the two screens that are about a day rather than a record.
 *
 * The scanner and the attendance list both hang off the dashboard rather than
 * off an event, because both are opened on the morning of an event by somebody
 * who is not going to navigate a hierarchy to reach them. That leaves them
 * needing to know *which* event, which is this screen — and only when there is
 * more than one to choose from. With a single event in the registry both routes
 * skip it entirely and open on the thing itself.
 *
 * The choice rides in the query string rather than the path so that the screen
 * behind it stays one route. That matters most for the scanner, where a new
 * page means asking for the camera again, and it costs the attendance list
 * nothing to match.
 */
export default function EventPicker({ basePath, lead, accent, children }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-14 sm:px-8 sm:py-20">
      <PageHeading eyebrow="Today" lead={lead} accent={accent}>
        {children}
      </PageHeading>

      <div className="mt-10 grid gap-4">
        {ADMIN_EVENTS.map((event) => (
          <Link
            key={event.id}
            href={`${basePath}?event=${event.id}`}
            className={`group relative flex flex-col p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-nic-red/70 focus-visible:border-nic-red focus-visible:outline-none ${ADMIN_PANEL}`}
          >
            <CornerTicks />

            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
              {event.kind}
            </span>

            <h2 className="mt-3 text-lg font-black uppercase tracking-tight text-white sm:text-xl">
              {event.lead} {event.title}
            </h2>

            <p
              className={`mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 ${LABEL_SHADOW}`}
            >
              {event.dateLabel}
            </p>

            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[2px] w-0 bg-nic-red transition-all duration-500 ease-out group-hover:w-full group-focus-visible:w-full"
            />
          </Link>
        ))}
      </div>
    </main>
  );
}
