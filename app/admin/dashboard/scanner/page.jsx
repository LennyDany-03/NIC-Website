import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Scanner from "@/components/Admin/Scanner";
import EventPicker from "@/components/Admin/EventPicker";
import { ADMIN_EVENTS, findAdminEvent } from "@/components/Admin/events";

/**
 * The door, reached straight off the dashboard.
 *
 * One route rather than one per event, because the scanner is a camera and a
 * camera is a permission: switching events through a query string keeps the
 * same page, the same granted stream and the same warm decoder, where a path
 * segment per event would be a fresh page asking for the camera again.
 *
 * With a single event in the registry there is nothing to choose, so the
 * picker is skipped entirely and this opens on the camera. That is the case
 * that matters — on the morning of an event, dashboard to viewfinder should be
 * one tap.
 *
 * The user's id goes down with it: it is written into `attended_by` on every
 * admission, so the attendance sheet records which coordinator was on the door.
 */
export default async function AdminScannerPage({ searchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { event: requested } = await searchParams;

  const event =
    findAdminEvent(requested) ??
    (ADMIN_EVENTS.length === 1 ? ADMIN_EVENTS[0] : null);

  if (!event) {
    return (
      <EventPicker basePath="/admin/dashboard/scanner" lead="Ticket" accent="scanner">
        Which event is being run today? The scanner checks a ticket against that
        event&apos;s register and nothing else.
      </EventPicker>
    );
  }

  return <Scanner event={event} adminId={user.id} />;
}
