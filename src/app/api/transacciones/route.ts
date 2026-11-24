import { NextRequest, NextResponse } from "next/server";
import { esSearch, indexPattern } from "@/lib/es";
import type { SPStats } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const servidor = searchParams.get("servidor"); // opcional
    const idx = indexPattern(1);

    const filter: unknown[] = [
      { range: { "@timestamp": { gte: "now-1h", lte: "now" } } },
    ];
    if (servidor) {
      filter.push({ term: { "server.keyword": servidor } });
    }

    const body = {
      size: 0,
      query: { bool: { filter } },
      aggs: {
        por_sp: {
          terms: { field: "sp.keyword", size: 50, order: { avg_tiempo: "desc" } },
          aggs: {
            avg_tiempo: { avg: { field: "tiempo_sp" } },
            max_tiempo: { max: { field: "tiempo_sp" } },
            cant: { value_count: { field: "tiempo_sp" } },
            top_base: {
              terms: { field: "base.keyword", size: 1 },
            },
          },
        },
      },
    };

    const data = (await esSearch(idx, body)) as {
      aggregations: {
        por_sp: {
          buckets: Array<{
            key: string;
            avg_tiempo: { value: number | null };
            max_tiempo: { value: number | null };
            cant: { value: number };
            top_base: { buckets: Array<{ key: string }> };
          }>;
        };
      };
    };

    const spStats: SPStats[] = (
      data.aggregations?.por_sp?.buckets ?? []
    ).map((b) => ({
      sp: b.key,
      base: b.top_base?.buckets?.[0]?.key ?? "",
      cantTrx: b.cant.value,
      tiempoPromedio: Math.round(b.avg_tiempo.value ?? 0),
      peorTiempo: Math.round(b.max_tiempo.value ?? 0),
    }));

    return NextResponse.json(spStats);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
