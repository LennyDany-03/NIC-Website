"use client";

import { createClient } from "@/lib/supabase/client";
import { PAYMENT } from "./content";

/**
 * Where a finished registration goes.
 *
 * One row in `workshop-modern-cyber-defence` and two objects in
 * `workshop-modern-cyber-defence-verification` — the payment screenshot and the
 * ticket PNG — all three named after the ticket code, which is the only
 * identifier a coordinator at the door has to work with. `supabase/workshop-
 * modern-cyber-defence.sql` is the other end of this file and the two have to
 * be read together; the policies there are why nothing here ever reads back.
 *
 * Its own module rather than the stub it replaces in `content.js`, because
 * content.js is copy and this is plumbing — the split the rest of the site
 * keeps. The step still calls one function and still passes it everything it
 * knows, which was the point of the stub in the first place.
 *
 * Written from the browser with the anon key. There is no server route in
 * front of it, and the honest consequence is that anybody who reads the
 * bundle can insert rows into this table and objects into that bucket. It is
 * the trade the BOD editor already makes on the same project: the table holds
 * no secret (it is written *to*, never read from, by `anon`), the bucket is
 * private, and a payment is confirmed by a human looking at a screenshot
 * rather than by anything this function returns. A stuffed table costs a
 * coordinator an afternoon of sorting; it does not admit anybody to the hall.
 */

const TABLE = "workshop-modern-cyber-defence";
const BUCKET = "workshop-modern-cyber-defence-verification";

/**
 * The extension the bucket should file an image under, taken from its MIME
 * type rather than from its filename.
 *
 * A file arriving off a phone's camera roll may be called anything at all —
 * `IMG_0421`, or nothing, or a name in a script the storage API will not
 * accept in a path — and by the time it reaches here it has usually been
 * through the compressor and is a `File` synthesised in this tab anyway. The
 * MIME type is the thing that is actually true about it.
 */
function extensionFor(type) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpeg";
}

/** A `data:` URL back into bytes, without hand-rolling a base64 decoder. */
async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

/**
 * Persist one registration.
 *
 * Returns `{ ok, missing, message }` and never throws — the caller is a
 * student looking at a ticket that has already been cut, and an exception
 * escaping into that render would take the ticket off the screen over a
 * failure that does not invalidate it.
 *
 * The order matters. Both files go up first and the row is written last, with
 * whichever paths survived: a row is the thing a coordinator works from, so it
 * is written even if an upload failed, and `missing` says which files to ask
 * the student for. The other order — row first, then files — leaves a window
 * where a row points at an object that never arrived, which looks identical to
 * a working registration until somebody clicks the link.
 *
 * The two uploads are settled together rather than awaited in sequence. They
 * are independent objects on a connection that, for the phone this form is
 * filled in on, is the slowest part of the whole flow; one failing is not a
 * reason to skip the other.
 */
export async function submitRegistration({
  values,
  streamLabel,
  ticketCode,
  proof,
  ticketDataUrl,
}) {
  const supabase = createClient();

  const proofPath = proof
    ? `proofs/${ticketCode}.${extensionFor(proof.type)}`
    : null;
  const ticketPath = ticketDataUrl ? `tickets/${ticketCode}.png` : null;

  /* `upsert: false` — the code is drawn from a 32-character alphabet six
     times over and a collision is not a real risk, but if one ever happened
     the right outcome is a failed upload rather than one student's payment
     proof silently replacing another's. */
  const uploads = await Promise.allSettled([
    proofPath
      ? supabase.storage
          .from(BUCKET)
          .upload(proofPath, proof, { upsert: false, contentType: proof.type })
      : Promise.resolve({ error: null }),

    ticketPath
      ? dataUrlToBlob(ticketDataUrl).then((blob) =>
          supabase.storage
            .from(BUCKET)
            .upload(ticketPath, blob, { upsert: false, contentType: "image/png" }),
        )
      : Promise.resolve({ error: null }),
  ]);

  /* `allSettled` reports the promise, and a supabase-js call resolves with an
     `error` property rather than rejecting — so a rejection and a resolved
     error are both failures and both have to be checked. */
  const failed = (result) =>
    result.status === "rejected" || Boolean(result.value?.error);

  const missing = [];
  if (failed(uploads[0])) missing.push("proof");
  if (failed(uploads[1])) missing.push("ticket");

  const { error } = await supabase.from(TABLE).insert({
    ticket_code: ticketCode,
    name: values.name.trim(),
    stream: streamLabel,
    section: values.section,
    email: values.email.trim(),
    register_number: values.registerNumber.trim(),
    year: values.year,
    transaction_id: values.transactionId.trim(),
    amount: PAYMENT.fee,
    /* Null where the object is not there, which is what the nullable columns
       in the schema mean. A path recorded for a file that failed to upload is
       worse than no path: it reads as a working registration right up until a
       coordinator clicks it. */
    proof_path: missing.includes("proof") ? null : proofPath,
    ticket_path: missing.includes("ticket") ? null : ticketPath,
  });
  /* No `.select()` on purpose. Asking for the inserted row back would need a
     select policy for `anon`, and a select policy on this table publishes
     every attendee's email and register number. */

  if (error) {
    return { ok: false, missing, message: error.message };
  }

  return { ok: true, missing, message: null };
}
