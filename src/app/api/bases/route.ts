import { NextResponse } from "next/server";
import { esSearch, todayIndex, wildcardIndex } from "@/lib/es";
import { BaseStats } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rango = searchParams.get("rango") ?? "1h";

    const index = rango === "1h" ? todayIndex() : wildcardIndex();
    const gte = rango === "1h" ? "now-1h" : rango === "24h" ? "now-24h" : rango === "7d" ? "now-7d" : "now-30d";

    const body = {
      size: 0,
      query: { range: { "@timestamp": { gte, lte: "now" } } },
      aggs: {
        por_base: {
          terms: { field: "base.keyword", size: 50, order: { _count: "desc" } },
          aggs: {
            tiempo_promedio: { avg: { field: "tiempo_sp" } },
            tiempo_max: { max: { field: "tiempo_sp" } },
            sps_unicos: { cardinality: { field: "sp.keyword" } },
          },
        },
      },
    };

    const data = await esSearch(index, body) as any;
    const buckets = data?.aggregations?.por_base?.buckets ?? [];

    const resultado: BaseStats[] = buckets.map((b: any) => ({
      base: b.key,
      totalTrx: b.doc_count,
      tiempoPromedio: Math.round(b.tiempo_promedio?.value ?? 0),
      tiempoMax: Math.round(b.tiempo_max?.value ?? 0),
      spsCount: b.sps_unicos?.value ?? 0,
    }));

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
