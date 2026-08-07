import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Registrations from "@/components/Admin/Registrations";
import { findAdminEvent } from "@/components/Admin/events";

/**
 * One event's register.
 *
 * A dynamic segment rather than a route per event, because the screen below is
 * generic over an entry in `events.js` — the second event to collect
 * registrations should not need a second copy of this file.
 *
 * `params` is a Promise in this version of Next and has to be awaited; a
 * segment that names no event in the registry is a 404 rather than an empty
 * register, so a typed URL cannot render a screen that looks like an event
 * nobody signed up for.
 *
 * `?q=` pre-fills the register's search. It is how the scanner hands a refused
 * ticket over — the coordinator who has just been told a payment is unchecked
 * arrives on that student's row rather than on two hundred of them. Read here
 * and passed down as a prop rather than read in the client with
 * `useSearchParams`, which would put the whole register behind a Suspense
 * boundary for one string that is known before the page renders.
 */
export default async function AdminEventRegisterPage({ params, searchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { event: id } = await params;
  const event = findAdminEvent(id);

  if (!event) notFound();

  const { q } = await searchParams;

  return (
    <Registrations
      event={event}
      /* A repeated `?q=a&q=b` arrives as an array; one search box takes one
         string, and the first is the one the link meant. */
      initialQuery={typeof q === "string" ? q : Array.isArray(q) ? (q[0] ?? "") : ""}
    />
  );
}
