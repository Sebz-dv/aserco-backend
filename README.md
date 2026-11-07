# Aserco Backend

Backend en Node.js + TypeScript + MySQL para manejar autenticación y futuras tablas del sistema.

## Requisitos

- Node.js 18+
- MySQL server en local o remoto
- Opción rápida: Docker

## Instalación

```bash
npm install
cp .env.example .env
```

Ajusta las variables de entorno antes de iniciar.

### Levantar MySQL con Docker (recomendado)

```bash
docker compose up -d
```

Esto crea la base de datos `aserco_app` si no existe y deja MySQL disponible en `localhost:3306`.

## Scripts

```bash
npm run dev
npm run build
npm start
```

## Base de datos

La aplicación crea la base de datos si no existe y luego crea las tablas necesarias al iniciar.

## Estructura de crecimiento

- `src/config` para configuración global
- `src/database` para creación y mantenimiento de tablas
- `src/routes` para endpoints
- `src/modules` para lógica por dominio
