"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-zinc-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-white/12 bg-zinc-950 p-8"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-nic-red">
          NIC admin
        </span>
        <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-white">
          Sign in
        </h1>

        <label className="mt-8 block text-xs uppercase tracking-[0.2em] text-zinc-400">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full border border-white/15 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-nic-red"
          />
        </label>

        <label className="mt-5 block text-xs uppercase tracking-[0.2em] text-zinc-400">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full border border-white/15 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-nic-red"
          />
        </label>

        {error && (
          <p className="mt-5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-8 w-full bg-nic-red py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition-opacity disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
