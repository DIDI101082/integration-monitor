import { NextRequest, NextResponse } from "next/server";
import { esSearch, indexPattern } from "@/lib/es";
import type { ServicioStats } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const servidor = searchParams.get("servidor");
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
        por_servicio: {
          terms: {
            field: "serviceid.keyword",
            size: 100,
            order: { cant: "desc" },
          },
          aggs: {
            cant: { value_count: { field: "tiempo_serv" } },
            avg_tiempo: { avg: { field: "tiempo_serv" } },
            max_tiempo: { max: { field: "tiempo_serv" } },
          },
        },
      },
    };

    const data = (await esSearch(idx, body)) as {
      aggregations: {
        por_servicio: {
          buckets: Array<{
            key: string;
            cant: { value: number };
            avg_tiempo: { value: number | null };
            max_tiempo: { value: number | null };
          }>;
        };
      };
    };

    const servicios: ServicioStats[] = (
      data.aggregations?.por_servicio?.buckets ?? []
    ).map((b) => ({
      serviceid: b.key,
      cantTrx: b.cant.value,
      tiempoPromedio: Math.round(b.avg_tiempo.value ?? 0),
      peorTiempo: Math.round(b.max_tiempo.value ?? 0),
    }));

    return NextResponse.json(servicios);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
