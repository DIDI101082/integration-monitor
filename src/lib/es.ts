/**
 * Cliente HTTP liviano para Elasticsearch.
 * Usa fetch nativo — sin dependencias extra.
 */

const ES_URL = process.env.ES_URL ?? "https://elasticsearch.accusys.com.ar";
const ES_USERNAME = process.env.ES_USERNAME ?? "";
const ES_PASSWORD = process.env.ES_PASSWORD ?? "";

function authHeader(): Record<string, string> {
  if (!ES_USERNAME) return {};
  const token = Buffer.from(`${ES_USERNAME}:${ES_PASSWORD}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

export async function esSearch(
  index: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const url = `${ES_URL}/${index}/_search`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(body),
    // Revalidar cada 30s en caché de Next.js
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ES error ${res.status}: ${text}`);
  }

  return res.json();
}

/** Índice del día actual o del rango solicitado */
export function indexPattern(daysBack = 1): string {
  if (daysBack <= 1) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
    return `int_servicios_sp-${today}`;
  }
  return "int_servicios_sp-*";
}
