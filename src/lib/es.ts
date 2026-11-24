const ES_URL = process.env.ES_URL!;
const ES_USERNAME = process.env.ES_USERNAME!;
const ES_PASSWORD = process.env.ES_PASSWORD!;

function authHeader() {
  const token = Buffer.from(`${ES_USERNAME}:${ES_PASSWORD}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

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

/**
 * Construye un filtro de rango de fechas para Elasticsearch.
 * Los datos en ES están en UTC. Argentina es UTC-3,
 * así que un "día" local = desde las 03:00 UTC hasta las 02:59 UTC del día siguiente.
 * Si desde === hasta (un solo día), cubre las 24hs locales completas.
 */
export function buildDateRange(
  desde: string | null | undefined,
  hasta: string | null | undefined
): Record<string, string> {
  if (desde && hasta) {
    // desde: 00:00 hora argentina = 03:00 UTC
    const gteUTC = `${desde}T03:00:00Z`;
    // hasta: 23:59 hora argentina = siguiente día 02:59 UTC
    const hastaDate = new Date(`${hasta}T00:00:00`);
    hastaDate.setDate(hastaDate.getDate() + 1);
    const hastaSiguiente = hastaDate.toISOString().slice(0, 10);
    const lteUTC = `${hastaSiguiente}T02:59:59Z`;

    return { gte: gteUTC, lte: lteUTC };
  }
  return { gte: "now-24h", lte: "now" };
}
