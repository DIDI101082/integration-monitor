import { NextResponse } from "next/server";
import { esSearch, todayIndex } from "@/lib/es";
import { TpsPoint } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const servidor = searchParams.get("servidor");

    const must: unknown[] = [
      { range: { "@timestamp": { gte: "now-2h", lte: "now" } } },
    ];
    if (servidor) must.push({ term: { "server.keyword": servidor } });

    const body = {
      size: 0,
      query: { bool: { must } },
      aggs: {
        por_minuto: {
          date_histogram: {
            field: "@timestamp",
            fixed_interval: "1m",
            format: "yyyy-MM-dd'T'HH:mm:ss",
          },
        },
      },
    };

    const data = await esSearch(todayIndex(), body) as any;
    const buckets = data?.aggregations?.por_minuto?.buckets ?? [];

    const resultado: TpsPoint[] = buckets.map((b: any) => ({
      timestamp: b.key_as_string,
      trx: b.doc_count,
    }));

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
