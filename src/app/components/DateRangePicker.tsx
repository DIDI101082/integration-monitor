"use client";
import { useState } from "react";

export interface DateRange {
  desde: string; // YYYY-MM-DD
  hasta: string; // YYYY-MM-DD
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESETS = [
  { label: "Hoy", getDates: () => { const d = today(); return { desde: d, hasta: d }; } },
  { label: "Ayer", getDates: () => { const d = daysAgo(1); return { desde: d, hasta: d }; } },
  { label: "7 días", getDates: () => ({ desde: daysAgo(6), hasta: today() }) },
  { label: "15 días", getDates: () => ({ desde: daysAgo(14), hasta: today() }) },
  { label: "30 días", getDates: () => ({ desde: daysAgo(29), hasta: today() }) },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [localDesde, setLocalDesde] = useState(value.desde);
  const [localHasta, setLocalHasta] = useState(value.hasta);

  const apply = () => {
    if (localDesde <= localHasta) {
      onChange({ desde: localDesde, hasta: localHasta });
      setOpen(false);
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const r = preset.getDates();
    setLocalDesde(r.desde);
    setLocalHasta(r.hasta);
    onChange(r);
    setOpen(false);
  };

  const label = value.desde === value.hasta
    ? formatDate(value.desde)
    : `${formatDate(value.desde)} → ${formatDate(value.hasta)}`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition-colors border border-slate-700"
      >
        <span>📅</span>
        <span>{label}</span>
        <span className="text-slate-500 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 w-72">
          {/* Presets */}
          <div className="flex flex-wrap gap-1 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className="px-2 py-1 text-xs bg-slate-800 hover:bg-blue-700 text-slate-300 hover:text-white rounded transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Desde</label>
              <input
                type="date"
                value={localDesde}
                max={localHasta}
                onChange={(e) => setLocalDesde(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Hasta</label>
              <input
                type="date"
                value={localHasta}
                min={localDesde}
                max={today()}
                onChange={(e) => setLocalHasta(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={apply}
              disabled={localDesde > localHasta}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg text-sm font-medium transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
