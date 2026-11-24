"use client";
import { ServicioStats } from "@/types";

interface Props { data: ServicioStats[]; }

function colorTiempo(ms: number) {
  if (ms === 0) return "text-slate-500";
  if (ms < 200) return "text-green-400";
  if (ms < 500) return "text-yellow-400";
  return "text-red-400";
}

function exportCSV(data: ServicioStats[]) {
  const headers = ["Servicio", "Trx", "Prom(ms)", "Max(ms)", "p95(ms)", "p99(ms)"];
  const rows = data.map((r) => [r.serviceid, r.totalTrx, r.tiempoPromedio, r.tiempoMax, r.p95, r.p99]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "servicios.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function TablaServicios({ data }: Props) {
  if (data.length === 0) return <div className="text-slate-500 text-sm py-8 text-center">Sin datos</div>;
  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={() => exportCSV(data)} className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors">
          ↓ Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-xs border-b border-slate-700">
              <th className="text-left pb-3 pr-4">Servicio</th>
              <th className="text-right pb-3 pr-4">Trx</th>
              <th className="text-right pb-3 pr-4">Prom</th>
              <th className="text-right pb-3 pr-4">Máx</th>
              <th className="text-right pb-3 pr-4">p95</th>
              <th className="text-right pb-3">p99</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                <td className="py-2.5 pr-4 font-mono text-xs text-slate-200">{row.serviceid}</td>
                <td className="py-2.5 pr-4 text-right font-mono text-slate-200">{row.totalTrx.toLocaleString("es-AR")}</td>
                <td className={`py-2.5 pr-4 text-right font-mono ${colorTiempo(row.tiempoPromedio)}`}>{row.tiempoPromedio}</td>
                <td className={`py-2.5 pr-4 text-right font-mono ${colorTiempo(row.tiempoMax)}`}>{row.tiempoMax}</td>
                <td className={`py-2.5 pr-4 text-right font-mono ${colorTiempo(row.p95)}`}>{row.p95}</td>
                <td className={`py-2.5 text-right font-mono ${colorTiempo(row.p99)}`}>{row.p99}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
