import { NextResponse } from "next/server";
import { esSearch, todayIndex, wildcardIndex } from "@/lib/es";
import { SPStats } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidor = searchParams.get("servidor");
    const rango = searchParams.get("rango") ?? "1h";

    const index = rango === "1h" ? todayIndex() : wildcardIndex();
    const gte = rango === "1h" ? "now-1h" : rango === "24h" ? "now-24h" : rango === "7d" ? "now-7d" : "now-30d";

    const must: unknown[] = [{ range: { "@timestamp": { gte, lte: "now" } } }];
    if (servidor) must.push({ term: { "server.keyword": servidor } });

    const body = {
      size: 0,
      query: { bool: { must } },
      aggs: {
        por_sp: {
          terms: { field: "sp.keyword", size: 50, order: { tiempo_promedio: "desc" } },
          aggs: {
            tiempo_promedio: { avg: { field: "tiempo_sp" } },
            tiempo_max: { max: { field: "tiempo_sp" } },
            p95: { percentiles: { field: "tiempo_sp", percents: [95, 99] } },
            base: { terms: { field: "base.keyword", size: 1 } },
          },
        },
      },
    };

    const data = await esSearch(index, body) as any;
    const buckets = data?.aggregations?.por_sp?.buckets ?? [];

    const resultado: SPStats[] = buckets.map((b: any) => ({
      sp: b.key,
      base: b.base?.buckets?.[0]?.key ?? "-",
      totalTrx: b.doc_count,
      tiempoPromedio: Math.round(b.tiempo_promedio?.value ?? 0),
      tiempoMax: Math.round(b.tiempo_max?.value ?? 0),
      p95: Math.round(b.p95?.values?.["95.0"] ?? 0),
      p99: Math.round(b.p95?.values?.["99.0"] ?? 0),
    }));

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
