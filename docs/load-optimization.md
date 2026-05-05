# Optimización de Carga de Componentes y Recursos Iniciales
**Task:** Optimización de carga de componentes y recursos iniciales
**Autor:** Luis Emilio Veledíaz Flores - A01029829
**Fecha:** 04/05/2026

---

## 1. Contexto

Esta task se basó directamente en el análisis de renderizado (`rendering-analysis.md`), el cual identificó cinco mejoras de rendimiento (MR-1 a MR-5) para el frontend.

Este documento describe cuáles se implementaron, cuáles no, y por qué.
 
El estado del frontend antes de esta task era:
 
- Modo de renderizado: `server` (SSR con `@astrojs/node`)
- ~40 componentes con directiva `client:only="react"`
- 0 páginas estáticas pregeneradas
- 1 warning de import no utilizado en el build: `Check` de `@mui/icons-material`


## 2. MRs implementadas
### MR-1 — Eliminar import Check no utilizado en TravelSearchCard.tsx
### MR-2 — Prerender de páginas de autenticación
### MR-4 — Reemplazar client:only por client:load en páginas con fetch de servidor

## 3. MRs descartadas
### MR-3 — Convertir componentes a .astro
### MR-5 — Eliminar imports de useMemo no utilizados

## 4. Comparativa