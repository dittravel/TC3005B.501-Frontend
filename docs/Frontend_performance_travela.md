# Reporte de Desempeño

---

## Vista 1

### Desempeño (Carga Inicial)

| Métrica | Resultado | Valor Recomendado |
|---------|-----------|-------------------|
| TTFB | 20.5 (good) | < 800 ms |
| FCP | 96 (good) | < 1800 ms |
| CLS | 0.047 (good) | < 0.1 |
| LCP | 96 (good) | < 2500 ms |
| INP | - | < 200 ms |

---

### Desempeño (Recarga x1)

| Métrica | Resultado | Valor Recomendado |
|---------|-----------|-------------------|
| TTFB | 81 (good) | < 800 ms |
| FCP | 244 (good) | < 1800 ms |
| LCP | 244 (good) | < 2500 ms |
| CLS | 0.152 (needs-improvement) | < 0.1 |
| INP | - | < 200 ms |

---

### Desempeño (Recarga x5)

| # | TTFB | FCP | LCP | CLS | INP |
|---|------|-----|-----|-----|-----|
| 1 | 47.099 (good) | 208 (good) | 208 (good) | 0.152 (needs-improvement) | - |
| 2 | 43.5 (good) | 120 (good) | 120 (good) | 0.152 (needs-improvement) | - |
| 3 | 46.900 (good) | 136 (good) | 136 (good) | 0.151 (needs-improvement) | - |
| 4 | 41 (good) | 168 (good) | 168 (good) | 0.152 (needs-improvement) | - |
| 5 | 44 (good) | 124 (good) | 124 (good) | 0.152 (needs-improvement) | - |

---

### Análisis de Resultados

**Resumen general:**

El rendimiento global de las vistas que comprenden al usuario solicitante demuestra buen desempeño en todas las métricas. Sin embargo, se detectó una oportunidad de mejora en la estabilidad visual de la interfaz. Esto indica que algunos elementos de la página cambian de posición durante la carga, afectando la experiencia del usuario.

**Hallazgos clave:**

- El problema está relacionado con estabilidad visual, no con velocidad de carga.
- El CLS se mantiene dentro de un rango moderado. Aunque no es crítico, sí impacta la percepción de calidad y usabilidad.

---

### Problemas Detectados

| Problema | Impacto | Prioridad |
|----------|---------|-----------|
| Desplazamiento visual durante la carga (CLS) | Medio | Media |
| Posible carga tardía de imágenes o componentes | Medio | Media |

---

### Recomendaciones

- Reservar espacio para contenido dinámico.
- Evitar insertar componentes encima del contenido ya renderizado.

---

## Vista 2

### Desempeño (Carga Inicial)

| Métrica | Resultado | Valor Recomendado |
|---------|-----------|-------------------|
| TTFB | 62.100 (good) | < 800 ms |
| FCP | 96 (good) | < 1800 ms |
| LCP | 96 (good) | < 2500 ms |
| CLS | 0.0411 (good) | < 0.1 |
| INP | 0 (good) | < 200 ms |

---

### Desempeño (Recarga x1)

| Métrica | Resultado | Valor Recomendado |
|---------|-----------|-------------------|
| TTFB | 85.200 (good) | < 800 ms |
| FCP | 172 (good) | < 1800 ms |
| LCP | 172 (good) | < 2500 ms |
| CLS | 0.145 (needs-improvement) | < 0.1 |
| INP | - | < 200 ms |

---

### Desempeño (Recarga x5)

| # | TTFB | FCP | LCP | CLS | INP |
|---|------|-----|-----|-----|-----|
| 1 | 50.100 (good) | 204 (good) | 204 (good) | 0.145 (needs-improvement) | - |
| 2 | 71.1 (good) | 152 (good) | 152 (good) | 0.145 (needs-improvement) | - |
| 3 | 53.8 (good) | 136 (good) | 136 (good) | 0.145 (needs-improvement) | - |
| 4 | 67.8 (good) | 148 ms (good) | 144 (good) | 0.145 (needs-improvement) | - |
| 5 | 67.4 (good) | 156 (good) | 144 ms (good) | 0.145 (needs-improvement) | - |

---

### Botones e Interacciones

| Botón/Interacción | INP | Rating |
|-------------------|-----|--------|
| Guardar preferencias | 8 ms | good |

---

### Análisis de Resultados

**Resumen general:**

El rendimiento de la vista evaluada es muy bueno en la mayoría de las métricas capturadas, tanto en la carga inicial como en las pruebas de recarga. Los tiempos de respuesta del frontend son rápidos y consistentes, mostrando una experiencia fluida para el usuario.

El TTFB, FCP y LCP se mantienen dentro del rango recomendado por Google, indicando que el servidor responde rápidamente y que el contenido principal se renderiza casi de forma inmediata. Sin embargo, se identifica una oportunidad de mejora en el CLS durante las recargas, ya que supera ligeramente el umbral recomendado.

**Hallazgos clave:**

- El TTFB es estable y rápido tanto en carga inicial como en las 5 recargas, se mantiene muy por debajo del valor recomendado (< 800 ms), sin variaciones significativas.
- FCP y LCP muestran excelente desempeño; el contenido principal es visible prácticamente de inmediato en todas las pruebas, reflejando una carga eficiente de la interfaz.
- El CLS presenta una oportunidad de mejora; durante las recargas se mantiene constante en 0.145, ligeramente por encima del valor recomendado (< 0.1), lo que sugiere pequeños desplazamientos visuales en la interfaz al renderizar ciertos componentes.
- La interacción de "Guardar preferencias" registró un INP de 8 ms, lo cual representa una respuesta prácticamente inmediata y confirma una buena experiencia de interacción del usuario.

---

### Problemas Detectados

| Problema | Impacto | Prioridad |
|----------|---------|-----------|
| CLS ligeramente elevado en recargas (0.145) | Puede generar pequeños cambios visuales en el layout durante la carga o actualización de elementos | Baja |

---

### Recomendaciones

- Revisar los elementos visuales que puedan estar provocando desplazamientos durante las recargas, como imágenes, contenedores dinámicos o componentes que cambian de tamaño después del renderizado.
- Definir tamaños fijos o espacios reservados para componentes dinámicos con el fin de reducir el CLS.
- Mantener el estado actual del resto de métricas, ya que el desempeño general del frontend es bueno.

---

## Conclusión

El rendimiento del frontend en esta vista es muy bueno y cumple con los estándares de desempeño de Google en casi todas las métricas evaluadas. Los tiempos de carga e interacción son excelentes, proporcionando una experiencia rápida y fluida al usuario. El único punto de atención identificado corresponde al CLS en recargas, el cual se encuentra ligeramente fuera del rango de "good", sin embargo, su impacto es bajo y no representa un problema crítico de rendimiento.
