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
  const url = `${ES_URL}/${index}/_search`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ES error ${res.status}: ${text}`);
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
