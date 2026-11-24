"use client";

import type { PoolInfo, ServidorStats } from "@/types";
import clsx from "clsx";

interface Props {
  pool: PoolInfo;
  servidores: ServidorStats[];
  onSelectServidor: (s: string) => void;
  selectedServidor: string | null;
}

export default function PoolCard({
  pool,
  servidores,
  onSelectServidor,
  selectedServidor,
}: Props) {
  const activos = servidores.filter((s) => s.activo).length;
  const total = servidores.length;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      {/* Pool header */}
      <div className="mb-3">
        <div className="text-sm font-bold text-slate-100 mb-0.5">{pool.nombre}</div>
        <div className="text-xs text-slate-500">
          {pool.servidores.join(" · ")}
        </div>
      </div>

      {/* Métricas */}
      <div className="flex gap-3 mb-3 text-xs">
        <div className="flex-1 bg-slate-900 rounded-lg p-2">
          <p className="text-slate-500 mb-0.5">Trx (1h)</p>
          <p className="text-teal-400 font-bold text-sm">
            {pool.totalTrx.toLocaleString("es-AR")}
          </p>
        </div>
        <div className="flex-1 bg-slate-900 rounded-lg p-2">
          <p className="text-slate-500 mb-0.5">T. Prom.</p>
          <p
            className={clsx(
              "font-bold text-sm",
              pool.tiempoPromedio > 500
                ? "text-red-400"
                : pool.tiempoPromedio > 200
                ? "text-yellow-400"
                : "text-slate-200"
            )}
          >
            {pool.tiempoPromedio} ms
          </p>
        </div>
        <div className="flex-1 bg-slate-900 rounded-lg p-2">
          <p className="text-slate-500 mb-0.5">Nodos</p>
          <p className={clsx("font-bold text-sm", activos < total ? "text-yellow-400" : "text-slate-200")}>
            {activos}/{total}
          </p>
        </div>
      </div>

      {/* Servidores del pool */}
      <div className="flex flex-wrap gap-1.5">
        {servidores.map((s) => (
          <button
            key={s.nombre}
            onClick={() => onSelectServidor(s.nombre)}
            className={clsx(
              "px-2 py-1 rounded text-xs font-medium transition-colors",
              selectedServidor === s.nombre
                ? "bg-teal-500 text-white"
                : s.activo
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                : "bg-red-900/40 text-red-400"
            )}
          >
            {s.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
