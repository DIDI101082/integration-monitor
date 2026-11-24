"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ServidorStats, PoolInfo, ServicioStats, SPStats } from "@/types";
import { POOLS } from "@/types";
import Header from "./components/Header";
import ServidorCard from "./components/ServidorCard";
import PoolCard from "./components/PoolCard";
import TablaServicios from "./components/TablaServicios";
import TablaSPs from "./components/TablaSPs";
import { Monitor, Layers, Activity, Database } from "lucide-react";
import clsx from "clsx";

type Tab = "servidores" | "pools" | "servicios" | "sps";

const REFRESH_MS = Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL ?? 60000);

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("pools");
  const [servidores, setServidores] = useState<ServidorStats[]>([]);
  const [pools, setPools] = useState<PoolInfo[]>([]);
  const [servicios, setServicios] = useState<ServicioStats[]>([]);
  const [sps, setSps] = useState<SPStats[]>([]);
  const [selectedServidor, setSelectedServidor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [srvRes, poolRes] = await Promise.all([
        fetch("/api/servidores"),
        fetch("/api/pools"),
      ]);
      const [srvData, poolData] = await Promise.all([
        srvRes.json(),
        poolRes.json(),
      ]);
      if (srvRes.ok) setServidores(srvData);
      if (poolRes.ok) setPools(poolData);
      setLastUpdate(new Date());
    } catch {
      setError("Error al conectar con Elasticsearch");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServidorDetail = useCallback(async (servidor: string | null) => {
    const qs = servidor ? `?servidor=${encodeURIComponent(servidor)}` : "";
    const [svcRes, spRes] = await Promise.all([
      fetch(`/api/servicios${qs}`),
      fetch(`/api/transacciones${qs}`),
    ]);
    const [svcData, spData] = await Promise.all([svcRes.json(), spRes.json()]);
    if (svcRes.ok) setServicios(svcData);
    if (spRes.ok) setSps(spData);
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh
  useEffect(() => {
    timerRef.current = setInterval(fetchAll, REFRESH_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchAll]);

  // Cuando cambia el servidor seleccionado o la tab de detalle
  useEffect(() => {
    if (tab === "servicios" || tab === "sps") {
      fetchServidorDetail(selectedServidor);
    }
  }, [tab, selectedServidor, fetchServidorDetail]);

  const handleSelectServidor = (nombre: string) => {
    setSelectedServidor((prev) => (prev === nombre ? null : nombre));
    setTab("servicios");
    fetchServidorDetail(nombre);
  };

  const servidorData = (nombre: string) =>
    servidores.find((s) => s.nombre === nombre);

  const tabs = [
    { id: "pools" as Tab, label: "Pools", icon: Layers },
    { id: "servidores" as Tab, label: "Servidores", icon: Monitor },
    { id: "servicios" as Tab, label: "Servicios Orquestados", icon: Activity },
    { id: "sps" as Tab, label: "Peores SPs", icon: Database },
  ];

  // Stats generales
  const totalTrx = servidores.reduce((a, s) => a + s.totalTrx, 0);
  const activosCount = servidores.filter((s) => s.activo).length;
  const avgTiempo =
    servidores.filter((s) => s.tiempoPromedio > 0).length > 0
      ? Math.round(
          servidores
            .filter((s) => s.tiempoPromedio > 0)
            .reduce((a, s) => a + s.tiempoPromedio, 0) /
            servidores.filter((s) => s.tiempoPromedio > 0).length
        )
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Header onRefresh={fetchAll} loading={loading} lastUpdate={lastUpdate} />

      {/* Métricas globales */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Servidores activos", value: `${activosCount}/12`, color: activosCount < 12 ? "text-yellow-400" : "text-teal-400" },
          { label: "Trx última hora", value: totalTrx.toLocaleString("es-AR"), color: "text-blue-400" },
          { label: "Tiempo promedio", value: `${avgTiempo} ms`, color: avgTiempo > 300 ? "text-red-400" : "text-slate-200" },
          { label: "Pools activos", value: `${pools.length}`, color: "text-purple-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-800/50 rounded-xl border border-slate-700 px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={clsx("text-2xl font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mx-6 mb-3 px-4 py-3 bg-red-900/30 border border-red-700 rounded-xl text-red-400 text-sm">
          {error} — Verificá las credenciales en las variables de entorno.
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl w-fit border border-slate-700">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === id
                  ? "bg-teal-500 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <main className="flex-1 px-6 pb-6">

        {/* TAB: POOLS */}
        {tab === "pools" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {Object.entries(POOLS).map(([poolNombre, srvNombres]) => {
              const poolInfo = pools.find((p) => p.nombre === poolNombre) ?? {
                nombre: poolNombre,
                servidores: srvNombres,
                totalTrx: 0,
                tiempoPromedio: 0,
              };
              const srvStats = srvNombres.map(
                (n) => servidorData(n) ?? { nombre: n, totalTrx: 0, tiempoPromedio: 0, ultimaActividad: null, activo: false }
              );
              return (
                <PoolCard
                  key={poolNombre}
                  pool={poolInfo}
                  servidores={srvStats}
                  onSelectServidor={handleSelectServidor}
                  selectedServidor={selectedServidor}
                />
              );
            })}
          </div>
        )}

        {/* TAB: SERVIDORES */}
        {tab === "servidores" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {servidores.map((s) => (
              <ServidorCard
                key={s.nombre}
                servidor={s}
                selected={selectedServidor === s.nombre}
                onClick={() => handleSelectServidor(s.nombre)}
              />
            ))}
          </div>
        )}

        {/* TAB: SERVICIOS ORQUESTADOS */}
        {tab === "servicios" && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">
                Servicios Orquestados
                {selectedServidor && (
                  <span className="ml-2 text-teal-400">— {selectedServidor}</span>
                )}
              </h2>
              {selectedServidor && (
                <button
                  onClick={() => setSelectedServidor(null)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Ver todos
                </button>
              )}
            </div>
            <TablaServicios servicios={servicios} loading={loading} />
          </div>
        )}

        {/* TAB: PEORES SPs */}
        {tab === "sps" && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">
                Peores Tiempos por SP
                {selectedServidor && (
                  <span className="ml-2 text-teal-400">— {selectedServidor}</span>
                )}
              </h2>
              {selectedServidor && (
                <button
                  onClick={() => setSelectedServidor(null)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Ver todos
                </button>
              )}
            </div>
            <TablaSPs sps={sps} loading={loading} />
          </div>
        )}
      </main>
    </div>
  );
}
