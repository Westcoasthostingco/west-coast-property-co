// Renders one or more schema.org objects as a JSON-LD script tag.
// Serialization escapes "<" so untrusted strings (summaries, names) can never
// close the script element or inject markup.
export type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

export function serializeJsonLd(data: JsonLdValue): string {
  // JSON.stringify already escapes U+2028/U+2029; the rest guards the script element.
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export default function JsonLd({ data }: { data: JsonLdValue }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
