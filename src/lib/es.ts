const ES_URL = process.env.ES_URL!; // ej: https://elasticsearch.accusys.com.ar (puerto 5601 Kibana)
const ES_USERNAME = process.env.ES_USERNAME!;
const ES_PASSWORD = process.env.ES_PASSWORD!;

function authHeader() {
  const token = Buffer.from(`${ES_USERNAME}:${ES_PASSWORD}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

// Kibana expone la API de ES via /api/console/proxy?path=<index>/_search&method=POST
// Requiere además el header kbn-xsrf
export async function esSearch(
  index: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const path = encodeURIComponent(`${index}/_search`);
  const url = `${ES_URL}/api/console/proxy?path=${path}&method=POST`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "kbn-xsrf": "true",
      ...authHeader(),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kibana proxy error ${res.status}: ${text}`);
  }
  return res.json();
}

export function todayIndex(): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  return `int_servicios_sp-${today}`;
}

export function indexForDate(date: Date): string {
  const d = date.toISOString().slice(0, 10).replace(/-/g, ".");
  return `int_servicios_sp-${d}`;
}

export function wildcardIndex(): string {
  return "int_servicios_sp-*";
}
