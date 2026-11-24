"use client";
import { useEffect, useState, useCallback } from "react";
import Header from "./components/Header";
import PoolCard from "./components/PoolCard";
import ServidorCard from "./components/ServidorCard";
import TablaSPs from "./components/TablaSPs";
import TablaServicios from "./components/TablaServicios";
import TablaBases from "./components/TablaBases";
import GraficoTPS from "./components/GraficoTPS";
import GraficoHistorial from "./components/GraficoHistorial";
import DateRangePicker, { DateRange } from "./components/DateRangePicker";
import { PoolStats, ServidorStats, SPStats, ServicioStats, BaseStats, TpsPoint, DiaStats, Alerta } from "@/types";

type Tab = "pools" | "servidores" | "servicios" | "sps" | "bases" | "historial" | "tps";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("pools");
  const [dateRange, setDateRange] = useState<DateRange>({ desde: daysAgoStr(0), hasta: todayStr() });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedServidor, setSelectedServidor] = useState<string | null>(null);

  const [pools, setPools] = useState<PoolStats[]>([]);
  const [servidores, setServidores] = useState<ServidorStats[]>([]);
  const [sps, setSps] = useState<SPStats[]>([]);
  const [servicios, setServicios] = useState<ServicioStats[]>([]);
  const [bases, setBases] = useState<BaseStats[]>([]);
  const [tps, setTps] = useState<TpsPoint[]>([]);
  const [historial, setHistorial] = useState<DiaStats[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { desde, hasta } = dateRange;

      const qs = new URLSearchParams({ desde, hasta });
      if (selectedServidor) qs.set("servidor", selectedServidor);

      const qsHistorial = new URLSearchParams({ desde, hasta });
      if (selectedServidor) qsHistorial.set("servidor", selectedServidor);

      const qsTps = new URLSearchParams();
      if (selectedServidor) qsTps.set("servidor", selectedServidor);

      const [poolsRes, servidoresRes, spsRes, serviciosRes, basesRes, tpsRes, historialRes, alertasRes] =
        await Promise.all([
          fetch(`/api/pools?${qs}`),
          fetch(`/api/servidores?${qs}`),
          fetch(`/api/transacciones?${qs}`),
          fetch(`/api/servicios?${qs}`),
          fetch(`/api/bases?${qs}`),
          fetch(`/api/tps?${qsTps}`),
          fetch(`/api/historial?${qsHistorial}`),
          fetch("/api/alertas"),
        ]);

      const [poolsData, servidoresData, spsData, serviciosData, basesData, tpsData, historialData, alertasData] =
        await Promise.all([
          poolsRes.json(), servidoresRes.json(), spsRes.json(), serviciosRes.json(),
          basesRes.json(), tpsRes.json(), historialRes.json(), alertasRes.json(),
        ]);

      if (Array.isArray(poolsData)) setPools(poolsData);
      if (Array.isArray(servidoresData)) setServidores(servidoresData);
      if (Array.isArray(spsData)) setSps(spsData);
      if (Array.isArray(serviciosData)) setServicios(serviciosData);
      if (Array.isArray(basesData)) setBases(basesData);
      if (Array.isArray(tpsData)) setTps(tpsData);
      if (Array.isArray(historialData)) setHistorial(historialData);
      if (Array.isArray(alertasData)) setAlertas(alertasData);
      setLastUpdate(new Date());
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  }, [selectedServidor, dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL ?? "60000");
    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [fetchData]);

  const totalTrx = servidores.reduce((s, v) => s + v.totalTrx, 0);
  const activosCount = servidores.filter((s) => s.activo).length;
  const activosConDatos = servidores.filter((s) => s.activo && s.tiempoPromedio > 0);
  const tiempoPromGlobal = activosConDatos.length
    ? Math.round(activosConDatos.reduce((s, x) => s + x.tiempoPromedio, 0) / activosConDatos.length)
    : 0;
  const tpsActual = tps.length > 0 ? tps[tps.length - 1]?.trx ?? 0 : 0;

  const colorTiempo = (ms: number) => {
    if (ms === 0) return "text-slate-500";
    if (ms < 200) return "text-green-400";
    if (ms < 500) return "text-yellow-400";
    return "text-red-400";
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "pools", label: "Pools" },
    { id: "servidores", label: "Servidores" },
    { id: "servicios", label: "Servicios" },
    { id: "sps", label: "Peores SPs" },
    { id: "bases", label: "Bases de datos" },
    { id: "tps", label: "TPS en vivo" },
    { id: "historial", label: "Historial" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header lastUpdate={lastUpdate} onRefresh={fetchData} loading={loading} alertas={alertas} />

      {/* Métricas globales */}
      <div className="px-6 py-4 grid grid-cols-4 gap-4 border-b border-slate-800">
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Servidores activos</div>
          <div className="text-2xl font-bold text-white">
            {activosCount}<span className="text-sm text-slate-500 ml-1">/ {servidores.length}</span>
          </div>
        </div>
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Total transacciones</div>
          <div className="text-2xl font-bold text-white">{totalTrx.toLocaleString("es-AR")}</div>
        </div>
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Tiempo promedio</div>
          <div className={`text-2xl font-bold font-mono ${colorTiempo(tiempoPromGlobal)}`}>
            {tiempoPromGlobal > 0 ? `${tiempoPromGlobal}ms` : "-"}
          </div>
        </div>
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="text-xs text-slate-400 mb-1">Trx/min ahora</div>
          <div className="text-2xl font-bold text-blue-400 font-mono">{tpsActual}</div>
        </div>
      </div>

      {/* Filtro activo */}
      {selectedServidor && (
        <div className="px-6 py-2 bg-blue-950 border-b border-blue-800 flex items-center gap-3">
          <span className="text-xs text-blue-300">
            Filtrando: <span className="font-mono font-semibold">{selectedServidor}</span>
          </span>
          <button onClick={() => setSelectedServidor(null)} className="text-xs text-blue-400 hover:text-white">
            ✕ Quitar filtro
          </button>
        </div>
      )}

      <div className="px-6 pt-4">
        {/* Tabs + selector de fechas */}
        <div className="flex items-center justify-between border-b border-slate-800 mb-6">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === t.id ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="mb-1">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* Contenido */}
        {tab === "pools" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
            {pools.map((pool) => (
              <PoolCard key={pool.nombre} pool={pool} selectedServidor={selectedServidor} onSelectServidor={setSelectedServidor} />
            ))}
          </div>
        )}

        {tab === "servidores" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-8">
            {servidores.map((s) => (
              <ServidorCard
                key={s.nombre}
                servidor={s}
                selected={selectedServidor === s.nombre}
                onClick={() => setSelectedServidor(selectedServidor === s.nombre ? null : s.nombre)}
              />
            ))}
          </div>
        )}

        {tab === "servicios" && (
          <div className="bg-slate-900 rounded-xl p-5 pb-8">
            <TablaServicios data={servicios} />
          </div>
        )}

        {tab === "sps" && (
          <div className="bg-slate-900 rounded-xl p-5 pb-8">
            <TablaSPs data={sps} />
          </div>
        )}

        {tab === "bases" && (
          <div className="bg-slate-900 rounded-xl p-5 pb-8">
            <TablaBases data={bases} />
          </div>
        )}

        {tab === "tps" && (
          <div className="bg-slate-900 rounded-xl p-5 pb-8">
            <div className="text-xs text-slate-400 mb-4">Transacciones por minuto — últimas 2 horas</div>
            <GraficoTPS data={tps} />
          </div>
        )}

        {tab === "historial" && (
          <div className="bg-slate-900 rounded-xl p-5 pb-8">
            <GraficoHistorial data={historial} />
          </div>
        )}
      </div>
    </div>
  );
}
