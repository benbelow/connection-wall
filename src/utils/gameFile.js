/**
 * File format for exported wall games.
 *
 * A .txt file whose entire content is:
 *   CONNWALL_V1:<rot13_encoded_json>
 *
 * The JSON (before encoding) has the shape:
 *   { "x": number, "groups": [{ "name": string, "items": string[] }, ...] }
 *
 * ROT13 is applied purely to avoid accidental spoilers when the file is
 * opened in a text editor; it is not a security measure.
 */

const MAGIC = 'CONNWALL_V1:'

function rot13(str) {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
  })
}

/**
 * Encode a config object to the .txt file string.
 * @param {{ groups: { name: string, items: string[] }[] }} config
 */
export function encodeGameFile(config) {
  const payload = {
    x: config.groups.length,
    groups: config.groups.map((g) => ({ name: g.name, items: g.items })),
  }
  return MAGIC + rot13(JSON.stringify(payload))
}

/**
 * Decode a .txt file string back to a config object.
 * Returns { ok: true, config } or { ok: false, error: string }.
 */
export function decodeGameFile(text) {
  const trimmed = text.trim()

  if (!trimmed.startsWith(MAGIC)) {
    return { ok: false, error: 'Not a valid Connection Wall file (missing header).' }
  }

  let payload
  try {
    payload = JSON.parse(rot13(trimmed.slice(MAGIC.length)))
  } catch {
    return { ok: false, error: 'File is corrupted or was modified after export.' }
  }

  const { x, groups } = payload

  if (
    typeof x !== 'number' ||
    !Array.isArray(groups) ||
    groups.length !== x ||
    groups.some(
      (g) =>
        typeof g.name !== 'string' ||
        !Array.isArray(g.items) ||
        g.items.length !== x ||
        g.items.some((it) => typeof it !== 'string')
    )
  ) {
    return { ok: false, error: 'File structure is invalid or incomplete.' }
  }

  const config = {
    groups: groups.map((g, i) => ({
      id: `imported-${i}`,
      name: g.name,
      items: g.items,
    })),
  }

  return { ok: true, config }
}
