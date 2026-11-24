export const POOLS: Record<string, string[]> = {
  "POOL ESB": ["CTSPROD1", "CTSPROD2", "CTSPROD3", "CTSPROD6"],
  "POOL CYBERBANK EMPRESAS": ["CTSPROD5", "CTSPROD7"],
  "POOL ICF24": ["CTSPROD8", "CTSPROD9"],
  "POOL CYBERBANK INDIVIDUOS": ["CTSPROD10", "CTSPROD11", "CTSPROD12"],
};

export interface ServidorStats {
  nombre: string;
  totalTrx: number;
  tiempoPromedio: number;
  tiempoMax: number;
  p95: number;
  p99: number;
  ultimaActividad: string | null;
  activo: boolean;
}

export interface PoolStats {
  nombre: string;
  servidores: ServidorStats[];
  totalTrx: number;
  tiempoPromedio: number;
}

export interface SPStats {
  sp: string;
  base: string;
  totalTrx: number;
  tiempoPromedio: number;
  tiempoMax: number;
  p95: number;
  p99: number;
}

export interface ServicioStats {
  serviceid: string;
  totalTrx: number;
  tiempoPromedio: number;
  tiempoMax: number;
  p95: number;
  p99: number;
}

export interface DiaStats {
  fecha: string;
  totalTrx: number;
  tiempoPromedio: number;
  tiempoMax: number;
}

export interface BaseStats {
  base: string;
  totalTrx: number;
  tiempoPromedio: number;
  tiempoMax: number;
  spsCount: number;
}

export interface TpsPoint {
  timestamp: string;
  trx: number;
}

export interface Alerta {
  tipo: "sp_lento" | "servidor_inactivo" | "volumen_bajo";
  servidor?: string;
  sp?: string;
  valor: number;
  umbral: number;
  mensaje: string;
}
