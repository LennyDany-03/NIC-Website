import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminChrome from "@/components/Admin/Chrome";

/**
 * The signed-in shell: the bar, and the account it names.
 *
 * The user is read here because the bar has to print the email, not as the
 * gate — a layout does not re-render on every navigation within itself, so
 * each page below still makes its own check close to the data it touches.
 * proxy.js is the thing that actually turns a signed-out visitor around.
 */
export default async function AdminDashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <>
      <AdminChrome email={user.email} />
      {children}
    </>
  );
}
