import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EventsList from "@/components/Admin/EventsList";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Same check the dashboard's own page makes: proxy.js turns a signed-out
  // visitor around and the layout checks too, and this is that check once
  // more next to the data, which is where the framework's guidance puts it.
  if (!user) redirect("/admin/login");

  return <EventsList />;
}
