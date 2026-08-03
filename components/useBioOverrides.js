"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const LINK_KEYS = ["email", "instagram", "linkedin", "github"];

/**
 * Name, bio, photo and contact links an admin has saved from
 * /admin/dashboard/bod, keyed by the same `slug` content.js stamps onto
 * every mastermind and board seat (see mastermindSlug and seat() in
 * CrewSequence/content.js). A plain object lookup is enough to merge these
 * into the static roster at render time — see CrewSequence/index.jsx.
 *
 * A link column of `null` means "never touched" and falls back to whatever
 * content.js has; an empty string means an admin explicitly cleared it, so
 * the merge in CrewSequence treats those two cases differently. `photo_url`
 * and `name` follow the same rule: null falls back to content.js.
 *
 * `role` is deliberately not among these. A seat's designation is what the
 * roster is ordered and grouped by, so it stays in content.js and the admin
 * only ever shows it back, read-only.
 */
export default function useBioOverrides() {
  const [overrides, setOverrides] = useState({});

  useEffect(() => {
    let active = true;

    createClient()
      .from("bod_bios")
      .select("slug, name, bio, photo_url, email, instagram, linkedin, github")
      .then(({ data, error }) => {
        if (!active || error || !data) return;
        const map = {};
        for (const row of data) {
          const links = {};
          for (const key of LINK_KEYS) {
            if (row[key] != null) links[key] = row[key];
          }
          map[row.slug] = {
            name: row.name,
            bio: row.bio,
            photo: row.photo_url,
            links,
          };
        }
        setOverrides(map);
      });

    return () => {
      active = false;
    };
  }, []);

  return overrides;
}
