export interface ServidorStats {
  nombre: string; // CTSPROD1 … CTSPROD12
  totalTrx: number;
  tiempoPromedio: number; // ms
  ultimaActividad: string | null; // ISO timestamp
  activo: boolean;
}

export interface PoolInfo {
  nombre: string;
  servidores: string[];
  totalTrx: number;
  tiempoPromedio: number;
}

export const POOLS: Record<string, string[]> = {
  "POOL ESB": ["CTSPROD1", "CTSPROD2", "CTSPROD3", "CTSPROD6"],
  "POOL CYBERBANK EMPRESAS": ["CTSPROD5", "CTSPROD7"],
  "POOL ICF24": ["CTSPROD8", "CTSPROD9"],
  "POOL CYBERBANK INDIVIDUOS": ["CTSPROD10", "CTSPROD11", "CTSPROD12"],
};

export interface ServicioStats {
  serviceid: string;
  cantTrx: number;
  tiempoPromedio: number;
  peorTiempo: number;
}

export interface SPStats {
  sp: string;
  base: string;
  cantTrx: number;
  tiempoPromedio: number;
  peorTiempo: number;
}
