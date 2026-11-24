# Aforos a PTV Vissim (v1.2)

Herramienta y pruebas del artículo *Integración de datos de aforos vehiculares mediante una herramienta computacional para la microsimulación en PTV Vissim*.

Autores: Axel David Chávez Chumbe (ORCID 0009-0009-1400-6773), Pedro Luis Miñano Chamorro (ORCID 0000-0002-3763-3202) y Yosel Luis Velasquez Quezada (ORCID 0009-0004-6539-0529). Universidad Peruana de Ciencias Aplicadas, Lima, Perú.

## Contenido
- `herramienta/Aforos_a_Vissim.html`: herramienta lista para usar (v1.2). Se abre con doble clic en el navegador y funciona sin internet; incluye la biblioteca SheetJS 0.18.5 (licencia Apache 2.0). Al cargar los archivos muestra el plano de la intersección dibujado con la geometría del .inpx, el volumen por intervalo y por giro, la composición vehicular y la calidad del aforo por giro e intervalo.
- `herramienta/codigo_fuente_sin_biblioteca.html`: el mismo código sin la biblioteca incrustada, para revisarlo.
- `pruebas/`: scripts de Node.js que ejecutan la propia herramienta en un navegador sin interfaz (Playwright).
  - `exp_inject_A.js` / `exp_inject_D.js`: inyección de errores (500 ensayos por tipo) y falsas alarmas (1 000 días Poisson) con las reglas iniciales y ajustadas.
  - `exp_grid.js`: comparación de configuraciones de umbrales.
  - `exp_nb.js`: falsas alarmas con conteos binomiales negativos (k = 50, 20, 10).
  - `exp_sens.js`: sensibilidad a la definición de la hora pico.
  - `test2.js`: resultados por día y periodo, tiempos de procesamiento y verificación.
- `resultados/`: salidas JSON de cada script, tal como se reportan en el artículo.
- `datos/`: colocar aquí `aforos.xlsx` y `modelo.inpx` (no se incluyen).

## Reproducir
```
npm install playwright@1
npx playwright install chromium
cd pruebas
node exp_inject_D.js
```
Las semillas aleatorias son fijas, por lo que los resultados son reproducibles con los mismos datos.

## Cambios de la v1.2
Vista previa (plano de la red con bandas de flujo por giro y cuatro gráficos), interfaz por pasos y carga por arrastre. La lectura, el control de calidad, el cálculo y la escritura no cambiaron: los scripts de `pruebas/` producen con la v1.2 los mismos resultados que con la v1.1.

## Umbrales de control de calidad (desde la v1.1)
Intervalo en cero: mediana del giro ≥ 10 veh/15 min. Intervalo repetido: total ≥ 10 veh y al menos dos clases no nulas. Valor atípico: valor ≥ 15 y mayor que 5 veces la mediana de su clase en el periodo.

## Declaración
La herramienta se desarrolló con asistencia de un asistente de inteligencia artificial generativa; los autores definieron los requisitos, revisaron los resultados y verificaron los archivos generados en PTV Vissim.
