import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * For Server Components and Server Actions under app/admin. Reads the
 * session from the request's cookies; writes are best-effort here because a
 * Server Component can't set cookies — proxy.js is what actually refreshes
 * the session cookie on each request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render, which can't set
            // cookies — proxy.js refreshes the session instead.
          }
        },
      },
    },
  );
}
