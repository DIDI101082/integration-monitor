import { NextResponse } from "next/server";
import { esSearch, indexPattern } from "@/lib/es";
import { POOLS } from "@/types";
import type { PoolInfo } from "@/types";

export async function GET() {
  try {
    const idx = indexPattern(1);

    const body = {
      size: 0,
      query: {
        range: { "@timestamp": { gte: "now-1h", lte: "now" } },
      },
      aggs: {
        por_servidor: {
          terms: { field: "server.keyword", size: 20 },
          aggs: {
            total_trx: { value_count: { field: "tiempo_serv" } },
            tiempo_promedio: { avg: { field: "tiempo_serv" } },
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
          }>;
        };
      };
    };

    const buckets = data.aggregations?.por_servidor?.buckets ?? [];
    const statsPorServidor = new Map(
      buckets.map((b) => [
        b.key,
        { trx: b.total_trx.value, avg: b.tiempo_promedio.value ?? 0 },
      ])
    );

    const pools: PoolInfo[] = Object.entries(POOLS).map(
      ([nombre, servidores]) => {
        const totalTrx = servidores.reduce(
          (acc, s) => acc + (statsPorServidor.get(s)?.trx ?? 0),
          0
        );
        const tiempos = servidores
          .map((s) => statsPorServidor.get(s)?.avg ?? 0)
          .filter((t) => t > 0);
        const tiempoPromedio =
          tiempos.length > 0
            ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length)
            : 0;

        return { nombre, servidores, totalTrx, tiempoPromedio };
      }
    );

    return NextResponse.json(pools);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
