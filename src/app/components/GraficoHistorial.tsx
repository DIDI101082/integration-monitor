"use client";
import { DiaStats } from "@/types";

interface Props { data: DiaStats[]; }

function exportCSV(data: DiaStats[]) {
  const headers = ["Fecha", "Trx", "Prom(ms)", "Max(ms)"];
  const rows = data.map((r) => [r.fecha, r.totalTrx, r.tiempoPromedio, r.tiempoMax]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "historial.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function GraficoHistorial({ data }: Props) {
  if (data.length === 0) return <div className="text-slate-500 text-sm py-8 text-center">Sin datos históricos</div>;

  const maxTrx = Math.max(...data.map((d) => d.totalTrx), 1);
  const maxProm = Math.max(...data.map((d) => d.tiempoPromedio), 1);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => exportCSV(data)} className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors">
          ↓ Exportar CSV
        </button>
      </div>

      {/* Gráfico barras trx */}
      <div className="mb-6">
        <div className="text-xs text-slate-400 mb-2">Transacciones por día</div>
        <div className="flex items-end gap-1 h-32">
          {data.map((d, i) => {
            const h = Math.max((d.totalTrx / maxTrx) * 100, d.totalTrx > 0 ? 2 : 0);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full bg-blue-600 hover:bg-blue-500 rounded-sm transition-colors cursor-default"
                  style={{ height: `${h}%` }}
                  title={`${d.fecha}: ${d.totalTrx.toLocaleString("es-AR")} trx`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{data[0]?.fecha?.slice(5) ?? ""}</span>
          <span>{data[data.length - 1]?.fecha?.slice(5) ?? ""}</span>
        </div>
      </div>

      {/* Gráfico línea tiempo promedio */}
      <div className="mb-6">
        <div className="text-xs text-slate-400 mb-2">Tiempo promedio por día (ms)</div>
        <svg viewBox={`0 0 ${data.length * 12} 60`} className="w-full h-20" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            points={data.map((d, i) => {
              const x = i * 12 + 6;
              const y = 60 - (d.tiempoPromedio / maxProm) * 55;
              return `${x},${y}`;
            }).join(" ")}
          />
          {data.map((d, i) => {
            const x = i * 12 + 6;
            const y = 60 - (d.tiempoPromedio / maxProm) * 55;
            return (
              <circle key={i} cx={x} cy={y} r="2" fill="#f59e0b">
                <title>{`${d.fecha}: ${d.tiempoPromedio}ms`}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      {/* Tabla resumen */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left pb-2 pr-4">Fecha</th>
              <th className="text-right pb-2 pr-4">Trx</th>
              <th className="text-right pb-2 pr-4">Prom (ms)</th>
              <th className="text-right pb-2">Máx (ms)</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((row, i) => (
              <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-2 pr-4 font-mono text-slate-300">{row.fecha}</td>
                <td className="py-2 pr-4 text-right font-mono text-slate-200">{row.totalTrx.toLocaleString("es-AR")}</td>
                <td className="py-2 pr-4 text-right font-mono text-yellow-400">{row.tiempoPromedio}</td>
                <td className="py-2 text-right font-mono text-red-400">{row.tiempoMax}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
