import xss from "xss";

/**
 * Sanitize plain text input against XSS.
 * Strips all HTML tags and keeps only the text content.
 * E.g. "Hello <b>world</b>" → "Hello world"
 * Use for sentence, translation, tag names, and any user-provided text.
 */
export function sanitizeText(str: string): string {
  if (typeof str !== "string") return "";
  const trimmed = str.trim();
  if (!trimmed) return "";
  return xss(trimmed, {
    whiteList: {},
    onIgnoreTag: () => "", // strip tags, preserve inner text
  });
}
