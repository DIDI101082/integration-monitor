"use client";
import { PoolStats } from "@/types";

interface Props {
  pool: PoolStats;
  selectedServidor: string | null;
  onSelectServidor: (nombre: string | null) => void;
}

function colorTiempo(ms: number) {
  if (ms === 0) return "text-slate-500";
  if (ms < 200) return "text-green-400";
  if (ms < 500) return "text-yellow-400";
  return "text-red-400";
}

export default function PoolCard({ pool, selectedServidor, onSelectServidor }: Props) {
  const activosCount = pool.servidores.filter((s) => s.activo).length;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-sm">{pool.nombre}</h3>
        <span className="text-xs text-slate-400">{activosCount}/{pool.servidores.length} activos</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="text-slate-400 text-xs mb-1">Total Trx</div>
          <div className="text-white font-mono font-semibold">{pool.totalTrx.toLocaleString("es-AR")}</div>
        </div>
        <div>
          <div className="text-slate-400 text-xs mb-1">Tiempo Prom.</div>
          <div className={`font-mono font-semibold ${colorTiempo(pool.tiempoPromedio)}`}>
            {pool.tiempoPromedio > 0 ? `${pool.tiempoPromedio}ms` : "-"}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.servidores.map((s) => (
          <button
            key={s.nombre}
            onClick={() => onSelectServidor(selectedServidor === s.nombre ? null : s.nombre)}
            className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
              selectedServidor === s.nombre
                ? "bg-blue-600 text-white"
                : s.activo
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                : "bg-slate-900 text-slate-600"
            }`}
          >
            {s.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
