import { NextResponse } from "next/server";
import { esSearch, todayIndex } from "@/lib/es";
import { POOLS, ServidorStats } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const body = {
      size: 0,
      query: { range: { "@timestamp": { gte: "now-1h", lte: "now" } } },
      aggs: {
        por_servidor: {
          terms: { field: "server.keyword", size: 20 },
          aggs: {
            tiempo_promedio: { avg: { field: "tiempo_sp" } },
            tiempo_max: { max: { field: "tiempo_sp" } },
            ultima_actividad: { max: { field: "@timestamp" } },
            p95: { percentiles: { field: "tiempo_sp", percents: [95, 99] } },
          },
        },
      },
    };

    const data = await esSearch(todayIndex(), body) as any;
    const buckets = data?.aggregations?.por_servidor?.buckets ?? [];
    const todosLosServidores = Object.values(POOLS).flat();

    const resultado: ServidorStats[] = todosLosServidores.map((nombre) => {
      const bucket = buckets.find((b: any) => b.key === nombre);
      if (!bucket) return { nombre, totalTrx: 0, tiempoPromedio: 0, tiempoMax: 0, p95: 0, p99: 0, ultimaActividad: null, activo: false };
      return {
        nombre,
        totalTrx: bucket.doc_count,
        tiempoPromedio: Math.round(bucket.tiempo_promedio?.value ?? 0),
        tiempoMax: Math.round(bucket.tiempo_max?.value ?? 0),
        p95: Math.round(bucket.p95?.values?.["95.0"] ?? 0),
        p99: Math.round(bucket.p95?.values?.["99.0"] ?? 0),
        ultimaActividad: bucket.ultima_actividad?.value_as_string ?? null,
        activo: true,
      };
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
