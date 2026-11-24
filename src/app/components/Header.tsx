"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  onRefresh: () => void;
  loading: boolean;
  lastUpdate: Date | null;
}

export default function Header({ onRefresh, loading, lastUpdate }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (d: Date) =>
    d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-700">
      <div className="flex items-center gap-4">
        {/* Logo Accusys */}
        <div className="text-white font-bold text-xl tracking-tight">
          <span className="text-blue-400">/</span>accusys
        </div>
        <div className="w-px h-6 bg-slate-600" />
        <h1 className="text-lg font-semibold text-white">Monitoreo Macro</h1>
        <span className="px-2 py-0.5 text-xs rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
          ONLINE
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400">
        {lastUpdate && (
          <span>
            Actualizado: <span className="text-slate-200">{fmt(lastUpdate)}</span>
          </span>
        )}
        <span className="text-slate-500">{fmt(now)}</span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-50 transition-colors text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>
    </header>
  );
}
