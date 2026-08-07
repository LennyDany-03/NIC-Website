import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Attendance from "@/components/Admin/Attendance";
import EventPicker from "@/components/Admin/EventPicker";
import { ADMIN_EVENTS, findAdminEvent } from "@/components/Admin/events";

/**
 * The entry list — who the scanner has let in.
 *
 * Shaped exactly like the scanner route beside it, and deliberately so: the two
 * are the same job seen from the door and from the desk, and on the morning of
 * an event a coordinator moves between them. Same query-string event, same skip
 * of the picker when there is only one event, same handing down of the user id
 * — here so the sheet can say which entries this coordinator admitted
 * themselves.
 */
export default async function AdminAttendancePage({ searchParams }) {
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
      <EventPicker basePath="/admin/dashboard/attendance" lead="In the" accent="room">
        Which event&apos;s door? The list shows everybody the scanner has
        admitted for that event.
      </EventPicker>
    );
  }

  return <Attendance event={event} adminId={user.id} />;
}
