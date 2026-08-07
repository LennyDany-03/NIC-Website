/**
 * The three states a registration can be in, stated once.
 *
 * The register's dropdown, the tag on a row and the scanner's verdict all read
 * from this list, which is the only way those three can be guaranteed to agree
 * — and they have to agree, because the scanner refuses entry on exactly the
 * value the dropdown writes. Two lists of three that drift by one string is a
 * student standing at a door being told their verified ticket is invalid.
 *
 * The values match the `check` constraint in
 * `supabase/workshop-modern-cyber-defence.sql`. Adding a fourth means changing
 * both, and the database is the one that will complain if you forget.
 */

/** The one status the door opens for. Compared, never typed out elsewhere. */
export const ADMITS = "verified";

export const STATUSES = [
  {
    value: "pending",
    label: "Pending",
    /* The default, and deliberately the alarming colour rather than a neutral
       one: "nobody has looked at this payment yet" is a job outstanding, and a
       grey tag reads as a job done. */
    tag: "border-amber-500/50 text-amber-400",
    dot: "bg-amber-400",
  },
  {
    value: "verified",
    label: "Verified",
    tag: "border-emerald-500/50 text-emerald-400",
    dot: "bg-emerald-400",
  },
  {
    value: "failed",
    label: "Failed",
    tag: "border-nic-red/60 text-nic-red",
    dot: "bg-nic-red",
  },
];

export function statusMeta(value) {
  return STATUSES.find((status) => status.value === value) ?? STATUSES[0];
}
