"use client";
import { TpsPoint } from "@/types";

interface Props { data: TpsPoint[]; }

export default function GraficoTPS({ data }: Props) {
  if (data.length === 0) return <div className="text-slate-500 text-sm py-8 text-center">Sin datos de TPS</div>;

  const max = Math.max(...data.map((d) => d.trx), 1);
  const ultimos = data.slice(-60); // últimos 60 minutos

  return (
    <div>
      <div className="flex items-end gap-0.5 h-24">
        {ultimos.map((p, i) => {
          const h = Math.max((p.trx / max) * 100, p.trx > 0 ? 4 : 0);
          return (
            <div
              key={i}
              className="flex-1 bg-blue-500 hover:bg-blue-400 transition-colors rounded-sm cursor-default"
              style={{ height: `${h}%` }}
              title={`${p.timestamp.slice(11, 16)} — ${p.trx} trx`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{ultimos[0]?.timestamp?.slice(11, 16) ?? ""}</span>
        <span>Trx/min — máx: {max.toLocaleString("es-AR")}</span>
        <span>{ultimos[ultimos.length - 1]?.timestamp?.slice(11, 16) ?? ""}</span>
      </div>
    </div>
  );
}
