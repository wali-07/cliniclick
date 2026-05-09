type JsonLdData = Record<string, unknown> | null;

export function JsonLd({ data }: { data: JsonLdData }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
