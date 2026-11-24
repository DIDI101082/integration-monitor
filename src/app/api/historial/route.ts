import { NextResponse } from "next/server";
import { esSearch, wildcardIndex } from "@/lib/es";
import { DiaStats } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidor = searchParams.get("servidor");
    const dias = parseInt(searchParams.get("dias") ?? "30");

    const must: unknown[] = [
      { range: { "@timestamp": { gte: `now-${dias}d`, lte: "now" } } },
    ];
    if (servidor) must.push({ term: { "server.keyword": servidor } });

    const body = {
      size: 0,
      query: { bool: { must } },
      aggs: {
        por_dia: {
          date_histogram: {
            field: "@timestamp",
            calendar_interval: "day",
            format: "yyyy-MM-dd",
          },
          aggs: {
            tiempo_promedio: { avg: { field: "tiempo_sp" } },
            tiempo_max: { max: { field: "tiempo_sp" } },
          },
        },
      },
    };

    const data = await esSearch(wildcardIndex(), body) as any;
    const buckets = data?.aggregations?.por_dia?.buckets ?? [];

    const resultado: DiaStats[] = buckets.map((b: any) => ({
      fecha: b.key_as_string,
      totalTrx: b.doc_count,
      tiempoPromedio: Math.round(b.tiempo_promedio?.value ?? 0),
      tiempoMax: Math.round(b.tiempo_max?.value ?? 0),
    }));

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
