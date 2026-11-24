# Monitoreo Macro · Accusys

Dashboard de monitoreo de integradores del Banco Macro, construido con **Next.js 15 + TypeScript + Tailwind CSS**.

Consulta directamente el índice `int_servicios_sp-*` de Elasticsearch.

## Setup

### 1. Instalar dependencias
```bash
npm install
```

### 2. Variables de entorno
```bash
cp .env.local.example .env.local
```

Editá `.env.local`:
```env
ES_URL=https://elasticsearch.accusys.com.ar
ES_USERNAME=tu_usuario
ES_PASSWORD=tu_password
NEXT_PUBLIC_REFRESH_INTERVAL=60000
```

### 3. Correr en desarrollo
```bash
npm run dev
# → http://localhost:3000
```

### 4. Deploy en Vercel
1. Subí a GitHub
2. Importá en Vercel
3. Agregá las variables de entorno en Vercel → Settings → Environment Variables

## Pantallas

| Tab | Qué muestra |
|-----|-------------|
| **Pools** | ESB, Cyberbank Empresas, ICF24, Cyberbank Individuos con trx y tiempos |
| **Servidores** | CTSPROD1–12 con estado online/offline, trx y tiempo promedio |
| **Servicios Orquestados** | Tabla de servicios por servidor o global |
| **Peores SPs** | Stored procedures ordenados por tiempo promedio descendente |

## Índice Elasticsearch
- Índice: `int_servicios_sp-YYYY.MM.DD`
- Campos usados: `server`, `serviceid`, `sp`, `base`, `tiempo_sp`, `tiempo_serv`, `@timestamp`
- Ventana temporal: **última hora** (configurable en `src/lib/es.ts`)
