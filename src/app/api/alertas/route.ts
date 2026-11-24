import { NextResponse } from "next/server";
import { esSearch, todayIndex } from "@/lib/es";
import { POOLS, Alerta } from "@/types";

export const dynamic = "force-dynamic";

const UMBRAL_SP_LENTO = parseInt(process.env.UMBRAL_SP_LENTO ?? "1000");
const UMBRAL_VOLUMEN_BAJO = parseInt(process.env.UMBRAL_VOLUMEN_BAJO ?? "10");

export async function GET() {
  try {
    const body = {
      size: 0,
      query: { range: { "@timestamp": { gte: "now-1h", lte: "now" } } },
      aggs: {
        por_servidor: {
          terms: { field: "server.keyword", size: 20 },
          aggs: {
            ultima_actividad: { max: { field: "@timestamp" } },
          },
        },
        por_sp: {
          terms: { field: "sp.keyword", size: 100 },
          aggs: {
            tiempo_promedio: { avg: { field: "tiempo_sp" } },
            tiempo_max: { max: { field: "tiempo_sp" } },
          },
        },
      },
    };

    const data = await esSearch(todayIndex(), body) as any;
    const servidorBuckets = data?.aggregations?.por_servidor?.buckets ?? [];
    const spBuckets = data?.aggregations?.por_sp?.buckets ?? [];

    const alertas: Alerta[] = [];
    const todosServidores = Object.values(POOLS).flat();
    const ahora = Date.now();

    // Servidores inactivos
    for (const nombre of todosServidores) {
      const bucket = servidorBuckets.find((b: any) => b.key === nombre);
      if (!bucket) {
        alertas.push({
          tipo: "servidor_inactivo",
          servidor: nombre,
          valor: 0,
          umbral: 0,
          mensaje: `${nombre} no registra actividad en la última hora`,
        });
      } else {
        const ultimaMs = bucket.ultima_actividad?.value ?? 0;
        const minInactivo = Math.round((ahora - ultimaMs) / 60000);
        if (minInactivo > 15) {
          alertas.push({
            tipo: "servidor_inactivo",
            servidor: nombre,
            valor: minInactivo,
            umbral: 15,
            mensaje: `${nombre} sin actividad hace ${minInactivo} minutos`,
          });
        }
        // Volumen bajo
        if (bucket.doc_count < UMBRAL_VOLUMEN_BAJO) {
          alertas.push({
            tipo: "volumen_bajo",
            servidor: nombre,
            valor: bucket.doc_count,
            umbral: UMBRAL_VOLUMEN_BAJO,
            mensaje: `${nombre} con solo ${bucket.doc_count} trx en la última hora`,
          });
        }
      }
    }

    // SPs lentos
    for (const b of spBuckets) {
      const promedio = Math.round(b.tiempo_promedio?.value ?? 0);
      if (promedio > UMBRAL_SP_LENTO) {
        alertas.push({
          tipo: "sp_lento",
          sp: b.key,
          valor: promedio,
          umbral: UMBRAL_SP_LENTO,
          mensaje: `SP "${b.key}" promedio ${promedio}ms (umbral: ${UMBRAL_SP_LENTO}ms)`,
        });
      }
    }

    return NextResponse.json(alertas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
