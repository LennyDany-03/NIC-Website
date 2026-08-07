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
 */
export default async function AdminEventRegisterPage({ params }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { event: id } = await params;
  const event = findAdminEvent(id);

  if (!event) notFound();

  return <Registrations event={event} />;
}
