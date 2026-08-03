import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardHome from "@/components/Admin/DashboardHome";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.js turns a signed-out visitor around before this renders, and the
  // layout above checks too — this is the same check made once more next to
  // the data, which is where the framework's own guidance puts it.
  if (!user) redirect("/admin/login");

  return <DashboardHome />;
}
