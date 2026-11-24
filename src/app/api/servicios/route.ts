import { NextResponse } from "next/server";
import { esSearch, wildcardIndex, buildDateRange } from "@/lib/es";
import { ServicioStats } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidor = searchParams.get("servidor");
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    const dateRange = buildDateRange(desde, hasta);
    const must: unknown[] = [{ range: { "@timestamp": dateRange } }];
    if (servidor) must.push({ term: { "server.keyword": servidor } });

    const body = {
      size: 0,
      query: { bool: { must } },
      aggs: {
        por_servicio: {
          terms: { field: "serviceid.keyword", size: 100, order: { _count: "desc" } },
          aggs: {
            tiempo_promedio: { avg: { field: "tiempo_serv" } },
            tiempo_max: { max: { field: "tiempo_serv" } },
            p95: { percentiles: { field: "tiempo_serv", percents: [95, 99] } },
          },
        },
      },
    };

    const data = await esSearch(wildcardIndex(), body) as any;
    const buckets = data?.aggregations?.por_servicio?.buckets ?? [];

    const resultado: ServicioStats[] = buckets.map((b: any) => ({
      serviceid: b.key,
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
