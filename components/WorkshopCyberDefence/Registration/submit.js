"use client";

import { createClient } from "@/lib/supabase/client";

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
 * keeps. The caller still calls one function and still passes it everything it
 * knows, which was the point of the stub in the first place.
 *
 * ---------------------------------------------------------------------------
 * The row goes through a route; the files do not
 *
 * The files are still written straight from the browser with the publishable
 * key, and the honest consequence is the one this file has always carried:
 * anybody who reads the bundle can put an object in that bucket. It is the
 * trade the BOD editor already makes on the same project — the bucket is
 * private, its size and mime types are capped by the bucket itself, and a
 * payment is confirmed by a human looking at a screenshot rather than by
 * anything this function returns.
 *
 * The *row* is no longer written that way. It goes to
 * `/api/events/workshop-modern-cyber-defence/register`, which counts it against
 * a per-address and a per-register-number limit before it writes anything —
 * see `lib/rateLimit.js`. A limit counted in a bundle the person being limited
 * downloaded is not a limit, so that counting has to happen somewhere they
 * cannot reach, and this is the only such place on the site.
 * ---------------------------------------------------------------------------
 */

const BUCKET = "workshop-modern-cyber-defence-verification";
const ENDPOINT = "/api/events/workshop-modern-cyber-defence/register";

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
 * Returns `{ ok, missing, blocked, retryAfterMs, message }` and never throws —
 * the caller is a student who has just pressed a button on a form they have
 * spent two minutes filling in, and an exception escaping into that render
 * would take the whole step off the screen.
 *
 * `blocked` is the one outcome that is neither success nor breakage: the route
 * refused this attempt because too many have arrived from the same address or
 * under the same register number recently. It is separated from `ok: false`
 * because the two want opposite things said to them — a failure asks somebody
 * to try again, and this one asks them not to.
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
  collegeLabel,
  ticketCode,
  proof,
  ticketImage,
}) {
  const supabase = createClient();

  const proofPath = proof
    ? `proofs/${ticketCode}.${extensionFor(proof.type)}`
    : null;

  /* Named and typed from what the canvas actually produced rather than from a
     hard-coded `.png`. `drawTicket` encodes WebP where it can — a fifteenth of
     the bytes for the same ticket — and falls back through JPEG to PNG, so the
     extension is not knowable here. See the encoding note in ticketCanvas.js. */
  const ticketPath = ticketImage
    ? `tickets/${ticketCode}.${ticketImage.ext}`
    : null;

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
      ? dataUrlToBlob(ticketImage.url).then((blob) =>
          supabase.storage.from(BUCKET).upload(ticketPath, blob, {
            upsert: false,
            contentType: ticketImage.type,
          }),
        )
      : Promise.resolve({ error: null }),
  ]);

  /**
   * Whether one of the two uploads did not end with the object in the bucket.
   *
   * Two things make this more than `Boolean(error)`.
   *
   * `allSettled` reports the promise, and a supabase-js call resolves with an
   * `error` property rather than rejecting — so a rejection and a resolved
   * error are both failures and both have to be checked.
   *
   * And a 409 is not a failure *here*. The paths are named after the ticket
   * code and the uploads go up with `upsert: false`, so the second time this
   * function runs under a code it already used — a row that was refused by the
   * rate limit, or one that failed on the network, and then a retry — both
   * objects come back "The resource already exists". They do exist: this very
   * function put them there a minute ago. Counting that as missing would file
   * the row with null paths and tell a coordinator to go and ask a student for
   * a screenshot that is sitting in the bucket.
   */
  const failed = (result) => {
    if (result.status === "rejected") return true;

    const error = result.value?.error;
    if (!error) return false;

    const duplicate =
      String(error.statusCode) === "409" ||
      /already exists/i.test(error.message ?? "");

    return !duplicate;
  };

  const missing = [];
  if (failed(uploads[0])) missing.push("proof");
  if (failed(uploads[1])) missing.push("ticket");

  let response;

  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketCode,
        name: values.name.trim(),
        /* Both of these are the *label*, not the raw field: "Other" is the name
           of a text box in the form and never the name of a college or a class.
           See `collegeLabel` / `streamLabel` in useRegistration.js. */
        college: collegeLabel,
        stream: streamLabel,
        section: values.section,
        email: values.email.trim(),
        registerNumber: values.registerNumber.trim(),
        year: values.year,
        transactionId: values.transactionId.trim(),
        /* Null where the object is not there, which is what the nullable
           columns in the schema mean. A path recorded for a file that failed to
           upload is worse than no path: it reads as a working registration
           right up until a coordinator clicks it. */
        proofPath: missing.includes("proof") ? null : proofPath,
        ticketPath: missing.includes("ticket") ? null : ticketPath,
      }),
    });
  } catch (error) {
    /* The route was never reached — campus wifi between two lecture halls, a
       tab that went to sleep mid-submit. Distinct from a 500, and worth saying
       so in the message the log gets, because the two are fixed by different
       people. */
    return {
      ok: false,
      missing,
      blocked: false,
      retryAfterMs: 0,
      message: error?.message ?? "The registration could not be sent.",
    };
  }

  /* A 429 carries JSON, but so does a proxy's own error page carry HTML — and
     `.json()` on that throws. Everything about the response after this point is
     optional decoration on a status code that has already said what happened. */
  const payload = await response.json().catch(() => ({}));

  if (response.status === 429) {
    return {
      ok: false,
      missing,
      blocked: true,
      /* Falls back to the `Retry-After` header when the body did not survive,
         and to a minute when neither did — a wait this page has to name
         somehow, and one minute is the smallest honest guess. */
      retryAfterMs:
        payload.retryAfterMs ??
        Number(response.headers.get("Retry-After") ?? 60) * 1000,
      scope: payload.scope ?? null,
      message: null,
    };
  }

  if (!response.ok || !payload.ok) {
    return {
      ok: false,
      missing,
      blocked: false,
      retryAfterMs: 0,
      message: payload.message ?? `The register refused the row (${response.status}).`,
    };
  }

  return { ok: true, missing, blocked: false, retryAfterMs: 0, message: null };
}
