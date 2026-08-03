import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.js already redirects a signed-out visitor before this renders;
  // this is the same check made again close to the data, per the app's own
  // auth guidance — don't rely on proxy.js alone.
  if (!user) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-zinc-100 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red">
              NIC admin
            </span>
            <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/dashboard/bod"
            className="group border border-white/12 bg-zinc-950 p-6 transition-colors hover:border-nic-red/70"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-nic-red">
              Roster
            </span>
            <h2 className="mt-3 text-lg font-bold text-white">
              Edit BOD details
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Update the bio shown for each seat on the senior and joint
              boards, and for the faculty masterminds.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
