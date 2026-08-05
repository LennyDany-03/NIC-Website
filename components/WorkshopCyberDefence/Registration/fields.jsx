"use client";

import { motion } from "framer-motion";
import { CYBER_FIELD, CYBER_SELECT } from "../../eventsTheme";
import { slideRise } from "../../motionPresets";

/**
 * The three controls this form is built out of.
 *
 * Written once here rather than inline at each of the nine call sites, for the
 * usual reason and one specific one: the accessible wiring — `htmlFor`,
 * `aria-invalid`, `aria-describedby` pointing at the message — is four
 * attributes that have to agree with each other, and four attributes copied nine
 * times is one that will be wrong somewhere. Getting it right in one place means
 * a field cannot be added to this form in a state where the error is visible but
 * unannounced.
 *
 * Every one of them uses its state key as its DOM `id`, which is what lets the
 * step put focus on the first field that failed without holding a ref per field.
 */

/**
 * The label and the error message under a control.
 *
 * The message occupies the same slot the hint does — one line, one place — so a
 * field that goes wrong does not push the four below it down the page. It is
 * `role="alert"` rather than a live region on the form, because the error is
 * raised by a click on Next and needs announcing at that moment, not on the next
 * keystroke.
 */
function Frame({ id, label, hint, error, children }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <motion.div variants={slideRise} className="flex min-w-0 flex-col gap-2">
      <label
        htmlFor={id}
        className="font-cyber-mono text-[10px] uppercase tracking-[0.26em] text-cyber-teal"
      >
        {label}
      </label>

      {/* The control is cloned rather than rendered raw so the wiring above can
          reach it without every caller passing `aria-describedby` by hand. */}
      {typeof children === "function" ? children({ describedBy }) : children}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs leading-relaxed text-cyber-rose"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-zinc-500">
          {hint}
        </p>
      ) : null}
    </motion.div>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
}) {
  return (
    <Frame id={id} label={label} hint={hint} error={error}>
      {({ describedBy }) => (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(id, event.target.value)}
          onBlur={onBlur ? (event) => onBlur(id, event.target.value) : undefined}
          className={CYBER_FIELD}
        />
      )}
    </Frame>
  );
}

/**
 * A native `<select>`, wearing the palette.
 *
 * Native rather than a built menu, and that is a decision rather than a
 * shortcut. This form is filled in on a phone by somebody who is probably
 * standing up: the platform's own picker is the thing their thumb already knows,
 * it scrolls with momentum, it is reachable by keyboard without any work, and it
 * cannot be rendered off the bottom of the viewport. A prettier listbox would
 * lose all four to gain a chevron that animates.
 *
 * The two prices paid: the arrow is drawn here because `appearance-none` removed
 * the OS one (see `CYBER_SELECT`), and each `<option>` states its own colours
 * inline because the open menu is a platform surface that Tailwind's stylesheet
 * does not reach — without them a dark page hands white text to a white list on
 * Windows.
 */
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  error,
  hint,
  placeholder = "Choose…",
}) {
  return (
    <Frame id={id} label={label} hint={hint} error={error}>
      {({ describedBy }) => (
        <div className="relative">
          <select
            id={id}
            name={id}
            value={value}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={(event) => onChange(id, event.target.value)}
            className={`${CYBER_SELECT} ${value ? "text-white" : "text-zinc-600"}`}
          >
            <option value="" disabled style={OPTION_STYLE}>
              {placeholder}
            </option>

            {options.map((option) => (
              <option key={option} value={option} style={OPTION_STYLE}>
                {option}
              </option>
            ))}
          </select>

          <span
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-cyber-teal"
          >
            <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
              <path
                d="M1 1L5.5 5.5L10 1"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="square"
              />
            </svg>
          </span>
        </div>
      )}
    </Frame>
  );
}

const OPTION_STYLE = { backgroundColor: "#04090b", color: "#ffffff" };

/**
 * The screenshot.
 *
 * A real `<input type="file">` styled through the `file:` variants rather than a
 * hidden input behind a fake button — the same shape the admin's photo upload
 * takes. The native control already handles the drag target, the keyboard, and
 * the "no file chosen" state, and a hidden one has to be given all three back.
 *
 * The preview is the part that earns its place: a file input tells you a
 * filename, and a filename is not enough to notice you have attached the wrong
 * screenshot. Showing the image back is what makes the mistake visible while it
 * is still cheap to fix.
 */
export function FileField({ id, label, onSelect, file, previewUrl, error, hint }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <motion.div variants={slideRise} className="flex min-w-0 flex-col gap-2">
      <label
        htmlFor={id}
        className="font-cyber-mono text-[10px] uppercase tracking-[0.26em] text-cyber-teal"
      >
        {label}
      </label>

      <input
        id={id}
        name={id}
        type="file"
        accept="image/*"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
        className="w-full cursor-pointer border border-cyber-steel/60 bg-black/50 text-sm text-zinc-400 outline-none transition-colors file:mr-4 file:cursor-pointer file:border-0 file:border-r file:border-cyber-steel/60 file:bg-cyber-teal/10 file:px-4 file:py-3 file:font-cyber-mono file:text-[11px] file:uppercase file:tracking-[0.2em] file:text-cyber-aqua hover:file:bg-cyber-teal/20 focus:border-cyber-teal aria-[invalid=true]:border-cyber-rose"
      />

      {previewUrl ? (
        <div className="mt-2 flex items-start gap-4">
          {/* Not `next/image`: the source is a blob URL for a file that exists
              only in this tab, so there is nothing for the optimiser to fetch,
              cache or resize. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="The payment screenshot you attached"
            className="h-28 w-auto max-w-[8rem] border border-cyber-steel/60 object-contain"
          />

          <p className="min-w-0 flex-1 break-words font-cyber-mono text-[11px] leading-relaxed text-zinc-500">
            {file?.name}
            <br />
            {file ? `${Math.round(file.size / 1024)} KB` : null}
          </p>
        </div>
      ) : null}

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs leading-relaxed text-cyber-rose"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-zinc-500">
          {hint}
        </p>
      ) : null}
    </motion.div>
  );
}
