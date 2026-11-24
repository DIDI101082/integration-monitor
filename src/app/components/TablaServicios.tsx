"use client";

import type { ServicioStats } from "@/types";
import clsx from "clsx";

interface Props {
  servicios: ServicioStats[];
  loading?: boolean;
  titulo?: string;
}

export default function TablaServicios({ servicios, loading, titulo }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (servicios.length === 0) {
    return (
      <p className="text-slate-500 text-sm text-center py-6">
        Sin datos en la última hora
      </p>
    );
  }

  return (
    <div>
      {titulo && (
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {titulo}
        </h3>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-700">
              <th className="text-left pb-2 pr-3 font-medium">Servicio</th>
              <th className="text-right pb-2 px-2 font-medium">Trx</th>
              <th className="text-right pb-2 px-2 font-medium">Prom (ms)</th>
              <th className="text-right pb-2 font-medium">Peor (ms)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {servicios.map((s) => (
              <tr key={s.serviceid} className="hover:bg-slate-800/50">
                <td className="py-2 pr-3 text-slate-200 font-mono truncate max-w-[200px]">
                  {s.serviceid}
                </td>
                <td className="py-2 px-2 text-right text-slate-300">
                  {s.cantTrx.toLocaleString("es-AR")}
                </td>
                <td
                  className={clsx(
                    "py-2 px-2 text-right font-medium",
                    s.tiempoPromedio > 500
                      ? "text-red-400"
                      : s.tiempoPromedio > 200
                      ? "text-yellow-400"
                      : "text-slate-300"
                  )}
                >
                  {s.tiempoPromedio}
                </td>
                <td
                  className={clsx(
                    "py-2 text-right font-medium",
                    s.peorTiempo > 1000
                      ? "text-red-400"
                      : s.peorTiempo > 500
                      ? "text-yellow-400"
                      : "text-slate-300"
                  )}
                >
                  {s.peorTiempo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
