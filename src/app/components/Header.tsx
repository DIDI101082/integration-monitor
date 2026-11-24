"use client";
import { useEffect, useState } from "react";
import { Alerta } from "@/types";

interface HeaderProps {
  lastUpdate: Date | null;
  onRefresh: () => void;
  loading: boolean;
  alertas: Alerta[];
}

export default function Header({ lastUpdate, onRefresh, loading, alertas }: HeaderProps) {
  const [now, setNow] = useState(new Date());
  const [showAlertas, setShowAlertas] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (d: Date) =>
    d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const colorAlerta = (tipo: string) => {
    if (tipo === "sp_lento") return "text-yellow-400";
    if (tipo === "servidor_inactivo") return "text-red-400";
    return "text-orange-400";
  };

  return (
    <header className="relative flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <h1 className="text-lg font-semibold text-white">Monitor Integradores</h1>
        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Accusys</span>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400">
        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowAlertas(!showAlertas)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/50 hover:bg-red-900 border border-red-700 text-red-300 rounded text-xs transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {alertas.length} alerta{alertas.length > 1 ? "s" : ""}
            </button>
            {showAlertas && (
              <div className="absolute right-0 top-9 w-80 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {alertas.map((a, i) => (
                  <div key={i} className="px-4 py-2.5 border-b border-slate-700 last:border-0">
                    <span className={`text-xs ${colorAlerta(a.tipo)}`}>{a.mensaje}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {alertas.length === 0 && (
          <span className="text-xs text-green-500">✓ Sin alertas</span>
        )}

        {lastUpdate && (
          <span className="text-xs">Actualizado: <span className="text-slate-200">{fmt(lastUpdate)}</span></span>
        )}
        <span className="text-xs font-mono text-slate-200">{fmt(now)}</span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded text-xs transition-colors"
        >
          {loading ? "..." : "↻"}
        </button>
      </div>
    </header>
  );
}
