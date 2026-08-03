import { redirect } from "next/navigation";

/**
 * `/admin` itself has nothing to show — proxy.js already sorts visitors
 * into /admin/login or lets them through, so this only ever runs for a
 * signed-in visit and can go straight to the dashboard.
 */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
