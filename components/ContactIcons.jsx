/**
 * The four ways a board member can be reached, as glyphs.
 *
 * Inline paths rather than an icon package: four marks is not worth a
 * dependency, and every one of them has to inherit `currentColor` so the dead
 * tiles in the contact strip dim with their container instead of needing a
 * second set of assets. All four are drawn on the same 24-unit grid and filled
 * rather than stroked, so they hold their weight at the 16px they are set at.
 *
 * The brand marks are the official ones — a recognisable Instagram glyph is the
 * Instagram glyph, and redrawing it only makes it harder to recognise at this
 * size. The envelope is generic, because "email" has no owner.
 */

const ICONS = {
  email: (
    <path d="M1.5 5.7A2.7 2.7 0 0 1 4.2 3h15.6a2.7 2.7 0 0 1 2.7 2.7v.34l-10.5 5.85L1.5 6.04V5.7Zm0 2.63V18.3A2.7 2.7 0 0 0 4.2 21h15.6a2.7 2.7 0 0 0 2.7-2.7V8.33l-9.98 5.56a1.5 1.5 0 0 1-1.46 0L1.5 8.33Z" />
  ),
  instagram: (
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0Zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06L12 2.16Zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.846-10.405a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
  ),
  linkedin: (
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
  ),
  github: (
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  ),
};

export default function ContactIcon({ name, className = "h-4 w-4" }) {
  const path = ICONS[name];
  if (!path) return null;

  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      {path}
    </svg>
  );
}

/**
 * The four channels, in a fixed order, whether or not the subject has them.
 *
 * Fixed because the strip is the same object everywhere it appears: four tiles,
 * always the same four, in the same places. A row that only carried the handles
 * that happened to exist would be a different width and a different shape on
 * every card, and where nothing was filled in at all it would vanish and take
 * the whole "contact" idea with it — which is the one thing a visitor is
 * looking for. A channel with no handle stays in place, dimmed and dead, the
 * same way an unfilled seat stays in the roster.
 *
 * Shared by the member popup and the footer, so a person and the club itself
 * are reached the same way.
 */
export const CHANNELS = [
  { key: "email", label: "Email" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
];

export const hrefFor = (key, value) =>
  key === "email" ? `mailto:${value}` : value;

/**
 * One channel. A live one is a link; a missing one is a `span`, because there
 * is nothing behind it to go to and a disabled anchor is still a tab stop.
 *
 * The dead tile is not hidden from assistive tech either — "Instagram, not
 * listed" is a real answer to the question the strip is there to answer, and a
 * silently absent icon is not.
 */
export function ContactTile({ channel, href, size = "h-12 w-12" }) {
  const { key, label } = channel;
  const base = `group/tile relative flex ${size} items-center justify-center border transition-all duration-300`;

  if (!href) {
    return (
      <li>
        <span
          title={`${label} — not listed`}
          className={`${base} cursor-default border-white/6 bg-white/[0.015] text-zinc-700`}
        >
          <ContactIcon name={key} className="h-[18px] w-[18px]" />
          <span className="sr-only">{label} — not listed</span>
        </span>
      </li>
    );
  }

  return (
    <li>
      <a
        href={href}
        target={key === "email" ? undefined : "_blank"}
        rel={key === "email" ? undefined : "noreferrer"}
        title={label}
        className={`${base} border-white/15 bg-white/[0.03] text-zinc-300 hover:-translate-y-0.5 hover:border-nic-red hover:bg-nic-red hover:text-white focus-visible:-translate-y-0.5 focus-visible:border-nic-red focus-visible:bg-nic-red focus-visible:text-white focus-visible:outline-none`}
      >
        <ContactIcon name={key} className="h-[18px] w-[18px]" />
        <span className="sr-only">{label}</span>
        {/* The corner tick the rest of the site is built from, at tile scale —
            one mark, on the corner the eye lands on. */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-nic-red/0 transition-colors duration-300 group-hover/tile:border-white"
        />
      </a>
    </li>
  );
}

/** The strip itself: all four channels, live ones lit, missing ones dead. */
export function ContactStrip({ links, size }) {
  const live = CHANNELS.filter(({ key }) => links?.[key]);

  return (
    <>
      <ul className="flex flex-wrap gap-2.5">
        {CHANNELS.map((channel) => (
          <ContactTile
            key={channel.key}
            channel={channel}
            size={size}
            href={
              links?.[channel.key]
                ? hrefFor(channel.key, links[channel.key])
                : null
            }
          />
        ))}
      </ul>

      {live.length === 0 && (
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
          Handles not listed yet
        </p>
      )}
    </>
  );
}
