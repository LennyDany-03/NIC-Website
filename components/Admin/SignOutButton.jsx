"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className="shrink-0 border border-white/15 bg-black/40 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-nic-red hover:text-white focus-visible:border-nic-red focus-visible:outline-none disabled:opacity-40"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
