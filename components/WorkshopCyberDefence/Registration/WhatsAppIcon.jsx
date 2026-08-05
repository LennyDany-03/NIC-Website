/**
 * The WhatsApp glyph — a phone handset in a speech bubble — used everywhere
 * this flow links to the group chat.
 *
 * The one deliberate crack in this page's own rule that colour stays inside
 * the `cyber-*` palette: `WHATSAPP_GREEN` below is the app's own brand green,
 * not a token from `eventsTheme`. The reason is the thing that sent this
 * component here in the first place — a teal chat-bubble icon on a teal page
 * reads as "some link", and the whole point of drawing the icon at all is that
 * a green speech bubble is recognised on sight, faster than any label next to
 * it could be read. One glyph, one colour, spent on the one control this page
 * most needs to be unmissable.
 */
export const WHATSAPP_GREEN = "#25D366";

export default function WhatsAppIcon({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M16.004 3C9.4 3 4 8.4 4 15.004c0 2.386.674 4.61 1.84 6.5L4 29l7.68-1.79a11.94 11.94 0 0 0 4.324.79H16c6.6 0 12-5.4 12-12.004C28 8.4 22.6 3 16.004 3Zm.001 21.83a9.76 9.76 0 0 1-4.978-1.36l-.357-.213-4.556 1.062 1.085-4.44-.234-.363a9.78 9.78 0 0 1-1.5-5.512c0-5.41 4.404-9.814 9.814-9.814 2.62 0 5.084 1.023 6.937 2.878a9.75 9.75 0 0 1 2.877 6.937c0 5.41-4.404 9.825-9.088 9.825Zm5.36-7.34c-.294-.147-1.74-.858-2.01-.956-.27-.098-.467-.147-.663.147-.196.294-.76.956-.932 1.152-.172.196-.343.221-.637.074-.294-.147-1.243-.458-2.367-1.462-.875-.78-1.466-1.744-1.638-2.038-.172-.294-.018-.453.129-.6.133-.132.294-.343.441-.515.147-.172.196-.294.294-.49.098-.196.049-.368-.024-.515-.074-.147-.663-1.6-.909-2.192-.24-.577-.484-.5-.663-.51l-.564-.01c-.196 0-.515.074-.784.368-.27.294-1.03 1.006-1.03 2.454s1.054 2.847 1.201 3.043c.147.196 2.075 3.17 5.028 4.443.703.303 1.25.484 1.677.62.705.224 1.346.192 1.853.117.565-.084 1.74-.712 1.985-1.4.245-.688.245-1.278.172-1.4-.073-.123-.269-.196-.563-.343Z" />
    </svg>
  );
}
