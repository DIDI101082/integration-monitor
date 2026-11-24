"use client";

import type { ServidorStats } from "@/types";
import clsx from "clsx";

interface Props {
  servidor: ServidorStats;
  onClick: () => void;
  selected: boolean;
}

export default function ServidorCard({ servidor, onClick, selected }: Props) {
  const { nombre, totalTrx, tiempoPromedio, activo } = servidor;

  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full text-left rounded-xl p-4 border transition-all",
        activo
          ? selected
            ? "bg-teal-500/20 border-teal-400 shadow-teal-500/20 shadow-lg"
            : "bg-slate-800 border-slate-600 hover:border-teal-500/50"
          : "bg-slate-900 border-slate-700 opacity-50"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-100">{nombre}</span>
        <span
          className={clsx(
            "w-2.5 h-2.5 rounded-full",
            activo ? "bg-teal-400 shadow-sm shadow-teal-400" : "bg-red-500"
          )}
        />
      </div>
      <div className="text-xs text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Trx (1h)</span>
          <span className="text-slate-200 font-medium">
            {totalTrx.toLocaleString("es-AR")}
          </span>
        </div>
        <div className="flex justify-between">
          <span>T. Prom.</span>
          <span
            className={clsx(
              "font-medium",
              tiempoPromedio > 500
                ? "text-red-400"
                : tiempoPromedio > 200
                ? "text-yellow-400"
                : "text-slate-200"
            )}
          >
            {tiempoPromedio} ms
          </span>
        </div>
      </div>
    </button>
  );
}
