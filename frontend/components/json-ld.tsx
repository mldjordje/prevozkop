/**
 * Server-rendered JSON-LD. Unlike next/script (afterInteractive), this emits a
 * plain <script> tag in the initial HTML, so non-JS crawlers (GPTBot, ClaudeBot,
 * PerplexityBot, Bingbot, Googlebot without render) read the structured data.
 */
export default function JsonLd({ id, data }: { id?: string; data: unknown }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
