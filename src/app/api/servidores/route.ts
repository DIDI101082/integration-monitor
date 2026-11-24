import { NextResponse } from "next/server";
import { esSearch, indexPattern } from "@/lib/es";
import type { ServidorStats } from "@/types";

export async function GET() {
  try {
    const idx = indexPattern(1);

    // Agregación: por servidor → última actividad, cant trx, tiempo promedio
    const body = {
      size: 0,
      query: {
        range: {
          "@timestamp": { gte: "now-1h", lte: "now" },
        },
      },
      aggs: {
        por_servidor: {
          terms: { field: "server.keyword", size: 20 },
          aggs: {
            total_trx: { value_count: { field: "tiempo_serv" } },
            tiempo_promedio: { avg: { field: "tiempo_serv" } },
            ultima_actividad: { max: { field: "@timestamp" } },
          },
        },
      },
    };

    const data = (await esSearch(idx, body)) as {
      aggregations: {
        por_servidor: {
          buckets: Array<{
            key: string;
            total_trx: { value: number };
            tiempo_promedio: { value: number | null };
            ultima_actividad: { value_as_string: string | null };
          }>;
        };
      };
    };

    const buckets = data.aggregations?.por_servidor?.buckets ?? [];
    const activos = new Set(buckets.map((b) => b.key));

    // Todos los CTSPROD conocidos
    const todos = Array.from({ length: 12 }, (_, i) => `CTSPROD${i + 1}`);

    const servidores: ServidorStats[] = todos.map((nombre) => {
      const bucket = buckets.find((b) => b.key === nombre);
      return {
        nombre,
        totalTrx: bucket?.total_trx.value ?? 0,
        tiempoPromedio: Math.round(bucket?.tiempo_promedio.value ?? 0),
        ultimaActividad: bucket?.ultima_actividad.value_as_string ?? null,
        activo: activos.has(nombre),
      };
    });

    return NextResponse.json(servidores);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
