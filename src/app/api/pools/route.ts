import { NextResponse } from "next/server";
import { esSearch, wildcardIndex, buildDateRange } from "@/lib/es";
import { POOLS, PoolStats } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    const dateRange = buildDateRange(desde, hasta);

    const body = {
      size: 0,
      query: { range: { "@timestamp": dateRange } },
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

    const data = await esSearch(wildcardIndex(), body) as any;
    const buckets = data?.aggregations?.por_servidor?.buckets ?? [];

    const resultado: PoolStats[] = Object.entries(POOLS).map(([poolNombre, servidores]) => {
      const servidoresStats = servidores.map((nombre) => {
        const b = buckets.find((x: any) => x.key === nombre);
        if (!b) return { nombre, totalTrx: 0, tiempoPromedio: 0, tiempoMax: 0, p95: 0, p99: 0, ultimaActividad: null, activo: false };
        return {
          nombre,
          totalTrx: b.doc_count,
          tiempoPromedio: Math.round(b.tiempo_promedio?.value ?? 0),
          tiempoMax: Math.round(b.tiempo_max?.value ?? 0),
          p95: Math.round(b.p95?.values?.["95.0"] ?? 0),
          p99: Math.round(b.p95?.values?.["99.0"] ?? 0),
          ultimaActividad: b.ultima_actividad?.value_as_string ?? null,
          activo: true,
        };
      });

      const totalTrx = servidoresStats.reduce((s, x) => s + x.totalTrx, 0);
      const activos = servidoresStats.filter((s) => s.activo && s.tiempoPromedio > 0);
      const tiempoPromedio = activos.length
        ? Math.round(activos.reduce((s, x) => s + x.tiempoPromedio, 0) / activos.length)
        : 0;

      return { nombre: poolNombre, servidores: servidoresStats, totalTrx, tiempoPromedio };
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
