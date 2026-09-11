import type { JsonLdValue } from "@/lib/seoJsonLd";

export function JsonLd({ data, id }: { data: JsonLdValue; id?: string }) {
  // Escaping '<' prevents a CMS value containing </script> from breaking out
  // of this script element while keeping valid JSON-LD.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script id={id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
