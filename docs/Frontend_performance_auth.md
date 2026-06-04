# Vista

## Desempeño

| Métrica | Resultado | Valor Recomendado |
|---|---|---|
| TTFB | 14.1 ms (good) | < 800 ms |
| FCP | 202 ms (good) | < 1800 ms |
| LCP | - | < 2500 ms |
| CLS | 0.00 (good) | < 0.1 |
| INP | - | < 200 ms |

---

## Análisis de Resultados

### Resumen general
El rendimiento de la vista de login es muy bueno en base a todas las métricas que se capturaron.  

El LCP no fue reportado por la librería, lo que nos da a entender que el elemento más grande tiene el mismo FCP y ambos cargan al mismo tiempo.

### Hallazgos clave
- No se detectaron problemas de rendimiento: todos los valores están dentro del rango “good” con un margen bastante grande.
- El script de `web-vitals` no está en la vista de login: el login usa `Layout.astro` en lugar de `MainLayout.astro`, donde sí está `web-vitals`.

---

## Problemas Detectados

| Problema | Impacto | Prioridad |
|---|---|---|
| Script de `web-vitals` no estaba incluido en `Layout.astro` | Bajo | Bajo |

---

## Recomendaciones

- Agregar `web-vitals` en `Layout.astro` para que el monitoreo también sea automático en el login.

---

# Vista

## Desempeño (Carga Inicial)

| Métrica | Resultado | Valor Recomendado |
|---|---|---|
| TTFB | 13.2 ms (good) | < 800 ms |
| FCP | 128 ms (good) | < 1800 ms |
| LCP | 128 ms (good) | < 2500 ms |
| CLS | 0.011 (good) | < 0.1 |
| INP | no capturado | < 200 ms |

---

## Desempeño (Recarga x1)

| Métrica | Resultado | Valor Recomendado |
|---|---|---|
| TTFB | 16.5 ms (good) | < 800 ms |
| FCP | 120 ms (good) | < 1800 ms |
| LCP | 120 ms (good) | < 2500 ms |
| CLS | 0.022 (good) | < 0.1 |
| INP | 16 ms (good) | < 200 ms |

---

## Desempeño (Recarga x5)

| # | TTFB | FCP | LCP | CLS | INP |
|---|---|---|---|---|---|
| 1 | 21.8 ms (good) | 136 ms (good) | 136 ms (good) | 0.022 (good) | 16 ms (good) |
| 2 | 16.8 ms (good) | 124 ms (good) | 124 ms (good) | 0.022 (good) | 16 ms (good) |
| 3 | 14.2 ms (good) | 132 ms (good) | 132 ms (good) | 0.022 (good) | 16 ms (good) |
| 4 | 13.1 ms (good) | 124 ms (good) | 124 ms (good) | 0.022 (good) | 16 ms (good) |
| 5 | 14.6 ms (good) | 120 ms (good) | 120 ms (good) | 0.013 (good) | 16 ms (good) |

---

## Análisis de Resultados

### Resumen general
El rendimiento del dashboard es muy bueno y consistente en todas las recargas.  

A diferencia de otros dashboards, el dashboard del autorizador no tiene ningún pico en los datos; los valores se mantienen entre 13 y 22 ms en los cinco intentos.

### Hallazgos clave
- El TTFB es estable y bajo, sin variabilidad notable.
- LCP y FCP coinciden en todos los intentos: el elemento más grande carga al mismo tiempo que el primer contenido visible, lo cual es óptimo.
- INP de 16 ms: respuesta inmediata a las interacciones del usuario.

---

## Problemas Detectados

No se detectaron problemas de rendimiento en esta vista.

| Problema | Impacto | Prioridad |
|---|---|---|
| N/A | N/A | N/A |

---

## Recomendaciones

- Mantener el estado actual.

---

# Vista

## Desempeño (Carga Inicial)

| Métrica | Resultado | Valor Recomendado |
|---|---|---|
| TTFB | 43.9 ms (good) | < 800 ms |
| FCP | 140 ms (good) | < 1800 ms |
| LCP | 140 ms (good) | < 2500 ms |
| CLS | 0.019 (good) | < 0.1 |
| INP | 32 ms (good) | < 200 ms |

---

## Desempeño (Recarga x1)

| Métrica | Resultado | Valor Recomendado |
|---|---|---|
| TTFB | 31 ms (good) | < 800 ms |
| FCP | 164 ms (good) | < 1800 ms |
| LCP | 164 ms (good) | < 2500 ms |
| CLS | 0.019 (good) | < 0.1 |
| INP | 32 ms (good) | < 200 ms |

---

## Desempeño (Recarga x5)

| # | TTFB | FCP | LCP | CLS | INP |
|---|---|---|---|---|---|
| 1 | 46.8 ms (good) | 136 ms (good) | 136 ms (good) | 0.019 (good) | 32 ms (good) |
| 2 | 43.3 ms (good) | 148 ms (good) | 148 ms (good) | 0.019 (good) | 32 ms (good) |
| 3 | 43.4 ms (good) | 152 ms (good) | 152 ms (good) | 0.034 (good) | 32 ms (good) |
| 4 | 43.4 ms (good) | 148 ms (good) | 148 ms (good) | 0.009 (good) | 32 ms (good) |
| 5 | 41.8 ms (good) | 144 ms (good) | 144 ms (good) | 0.019 (good) | 32 ms (good) |

---

## Botones e Interacciones

| Botón/Interacción | INP | Rating |
|---|---|---|
| Dropdown “Ordenar” abrir | 40 ms | good |
| Dropdown “Ordenar” seleccionar opción | 64 ms | good |
| Botón “Atender” | 0 ms | good |

---

## Análisis de Resultados

### Resumen general
El rendimiento de la vista de autorizaciones es muy bueno en todas las métricas capturadas.  

El TTFB es consistentemente más alto que en el dashboard, lo cual es normal porque esta vista realiza una consulta a la base de datos para cargar las solicitudes pendientes.

### Hallazgos clave
- El TTFB es estable, con una variación mínima entre las 5 recargas, sin picos ni comportamientos raros.
- El CLS varía ligeramente entre recargas, lo que se puede atribuir al renderizado de las tarjetas de solicitudes, pero siempre dentro del rango “good”.
- El botón “Atender” registró 0 ms de INP, lo que representa una respuesta inmediata antes de la navegación a la vista de detalle.

---

## Problemas Detectados

No se detectaron problemas de rendimiento en esta vista.

| Problema | Impacto | Prioridad |
|---|---|---|
| N/A | N/A | N/A |

---

## Recomendaciones

- Mantener el estado actual.

---

# Conclusión

El rendimiento del frontend para el rol del autorizador es muy bueno en todas las vistas que se midieron. Todas las métricas se encuentran dentro del rango “good” bajo los estándares de Google.  

No se detectaron problemas originados en el frontend (fuera de la inclusión de `web-vitals` en `Layout.astro`), que es el único punto de atención identificado; sin embargo, esto no afecta el rendimiento, únicamente el monitoreo automático.
