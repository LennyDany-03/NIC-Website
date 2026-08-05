import { Orbitron, Poppins, Share_Tech_Mono } from "next/font/google";

/**
 * The events segment's type, loaded once for every route under `/events`.
 *
 * A segment layout rather than the root one, and that is the whole point: the
 * site is set in Geist and stays set in Geist. This is a poster's typography,
 * scoped to the pages that are posters the same way its colours are — three
 * families fetched here are three families the front page never pays for.
 *
 * It began as the workshop's own layout and moved up a level with `eventsTheme`,
 * for the reason stated there: the events board is permanent and an event folder
 * is meant to be deletable whole, so neither the board's colours nor its type can
 * live inside one.
 *
 * The three, and why each:
 *
 * `Orbitron` is the closest thing on Google Fonts to the squared, wide display
 * face the poster's title is drawn in — the one that turns its `s` into
 * something like a `3`. It is a display face in the strict sense: superb at
 * 4rem, illegible as a paragraph, so `eventsTheme.js` never lets it below ~1rem.
 *
 * `Poppins` is the geometric bold the poster sets its dates, session headings
 * and coordinator blocks in, and it carries all the running copy here.
 *
 * `Share Tech Mono` is the terminal face the labels and timestamps take. It is a
 * light font, hence the rule in `CYBER_LABEL` that it only ever appears
 * uppercase, tracked out and in teal.
 *
 * Exposed as CSS variables rather than applied as a class. Nothing here sets a
 * default family, deliberately: `<Navbar>` and `<Footer>` are rendered inside
 * these routes and are the club's furniture, not the event's, so they must keep
 * arriving in the site's own type. The event's `<main>` opts in with
 * `font-cyber-body` and its headings with `font-cyber` — see `globals.css`,
 * where the three are wired into Tailwind's theme.
 *
 * Poppins needs its weights listed (it has no variable version on Google Fonts)
 * and Share Tech Mono has exactly one; only Orbitron is variable.
 */
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export default function EventsLayout({ children }) {
  return (
    <div
      className={`${orbitron.variable} ${poppins.variable} ${shareTechMono.variable}`}
    >
      {children}
    </div>
  );
}
