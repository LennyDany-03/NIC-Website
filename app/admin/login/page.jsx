"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CornerTicks from "@/components/CornerTicks";
import NicLogoMark from "@/components/NicLogoMark";
import {
  ADMIN_BTN_PRIMARY,
  ADMIN_FIELD,
  ADMIN_LABEL,
  ADMIN_PANEL,
} from "@/components/Admin/surfaces";
import { HEADING_SHADOW, LABEL_SHADOW } from "@/components/surfaces";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-viewport items-center justify-center px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className={`relative w-full max-w-sm p-8 shadow-[0_40px_120px_-30px_rgba(0,0,0,1)] sm:p-9 ${ADMIN_PANEL}`}
      >
        {/* The leading seam, solid rather than a hairline fade — at this width
            a fade has nothing left in the middle to read as red. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-nic-red shadow-[0_0_20px_3px_rgba(237,10,20,0.5)]"
        />
        <CornerTicks still />

        <NicLogoMark className="h-12 w-auto" title="NIC" />

        <span
          className={`mt-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red ${LABEL_SHADOW}`}
        >
          <span aria-hidden className="h-px w-5 bg-nic-red/70" />
          Restricted
        </span>

        <h1
          className={`mt-3 text-3xl font-black uppercase leading-[0.95] tracking-tight text-white ${HEADING_SHADOW}`}
        >
          Sign in
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          The board's own console. Accounts are issued from Supabase — there
          is no sign-up.
        </p>

        <label className={`mt-8 block ${ADMIN_LABEL}`}>
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`mt-2 normal-case tracking-normal ${ADMIN_FIELD}`}
          />
        </label>

        <label className={`mt-5 block ${ADMIN_LABEL}`}>
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`mt-2 normal-case tracking-normal ${ADMIN_FIELD}`}
          />
        </label>

        {error && (
          <p
            role="alert"
            className="mt-5 border-l-2 border-nic-red bg-nic-red/10 px-3 py-2 text-sm text-[#ff8a8a]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`mt-8 w-full ${ADMIN_BTN_PRIMARY}`}
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
