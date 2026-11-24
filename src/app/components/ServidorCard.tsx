"use client";
import { ServidorStats } from "@/types";

interface Props {
  servidor: ServidorStats;
  selected: boolean;
  onClick: () => void;
}

function colorTiempo(ms: number) {
  if (ms === 0) return "text-slate-500";
  if (ms < 200) return "text-green-400";
  if (ms < 500) return "text-yellow-400";
  return "text-red-400";
}

export default function ServidorCard({ servidor, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        selected ? "border-blue-500 bg-blue-950" : "border-slate-700 bg-slate-800 hover:border-slate-500"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm font-semibold text-white">{servidor.nombre}</span>
        <span className={`w-2 h-2 rounded-full ${servidor.activo ? "bg-green-400" : "bg-slate-600"}`} />
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <span className="text-slate-400">Trx:</span>
        <span className="text-slate-200 text-right font-mono">{servidor.totalTrx.toLocaleString("es-AR")}</span>
        <span className="text-slate-400">Prom:</span>
        <span className={`text-right font-mono ${colorTiempo(servidor.tiempoPromedio)}`}>
          {servidor.tiempoPromedio > 0 ? `${servidor.tiempoPromedio}ms` : "-"}
        </span>
        <span className="text-slate-400">p95:</span>
        <span className={`text-right font-mono ${colorTiempo(servidor.p95)}`}>
          {servidor.p95 > 0 ? `${servidor.p95}ms` : "-"}
        </span>
        <span className="text-slate-400">p99:</span>
        <span className={`text-right font-mono ${colorTiempo(servidor.p99)}`}>
          {servidor.p99 > 0 ? `${servidor.p99}ms` : "-"}
        </span>
      </div>
    </button>
  );
}
