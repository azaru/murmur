# Tareas endurecidas para swarmtest (opción B)

Objetivo: tareas donde Pi n=1 (gpt-6-luna, medium) saque 0,25–0,75 de media, con puntuación continua, para que haya margen en el que comparar sistemas. Se calibran solo contra Pi; murmur no se mira hasta que la tarea está fijada.

## Reglas comunes

- Ids nuevos `<original>_hard`, misma `category`; las originales no se tocan. Nada de commits en swarmtest.
- Prompt neutro: sin texto de rosters, propietarios ni "solo".
- Grader con referencia: los casos ocultos son entradas; lo esperado se obtiene ejecutando `solution/` en el mismo grader (no se escriben salidas a mano, así contrato, solución y casos no se desalinean). Checks con `weight`; score = peso ganado / peso posible; `passed` = todos los checks. Timeout por caso (SIGALRM) y < 60 s en total.
- Cada check oculto sale de una frase del contrato. Si Pi falla un check en todos los runs y no hay frase clara detrás, es un bug del contrato, no dificultad.
- Mezcla de formas: no todas deben ser paquetes que se reparten por ficheros (eso favorecería a un enjambre por construcción).
- Validación sin modelo: `solution/` saca 1,0; el workspace inicial < 0,1; `public_check.py` pasa con la solución y falla con el workspace inicial, y su docstring dice que el grader es más amplio; grader determinista en dos ejecuciones; `workspace/` no revela casos ocultos; generadores con semilla en `holdout/`; los tests de swarmtest siguen con los mismos 4 fallos.
- Revisión de ambigüedad: un agente de solo lectura deriva tests desde el contrato y señala cláusulas que no puede concretar, antes de gastar en Pi.

## Protocolo de calibración (fijado antes de medir)

- Solo Pi n=1, k=3 por iteración (el ruido de Pi en `durable` va de 0,24 a 0,96).
- Banda 0,25–0,75 de media.
- > 0,75: añadir familias de cláusulas nuevas (no casos trampa). < 0,25: aclarar el contrato o pasar un ejemplo a `public_check.py`.
- Cada iteración se anota en el registro de `plan.md`.
- **Cambio del 2026-10-01 (aprobado por el usuario):** las tareas de segunda generación (`*_hard2`) se calibran además contra una referencia fuerte de un solo agente, murmur n=1 con `profiles/c4-lessons.json` (c4n1), con k=2 y una banda de 0,3–0,6. Motivo: los mejores brazos de 3 agentes saturan las tareas calibradas solo contra Pi (0,91–1,0 en ieh y durable) y ya no se pueden ordenar entre sí. Pi sigue calibrándose con k=3 como referencia de "supera a Pi", sin límite inferior de banda. Los candidatos de 3 agentes siguen sin mirarse hasta que la tarea está fijada.
- Referencia de escala: `durable` (contrato de 16 KB, ~60 KB de solución, 334 checks) es la única tarea conocida dentro de la banda (~0,59).

## Piloto: `data_analysis_hard`

Forma: un solo script (`analyze.py`) que produce un JSON de respuestas. No se reparte de forma natural por ficheros (contrapeso a las tareas de paquete).

- **Workspace**
  - `data/`: `orders.csv` (~3.000 filas), `refunds.csv`, `fx_rates.csv`, `products.csv`, `customers.csv`.
  - `QUESTIONS.md` (el contrato, ~8–12 KB): ~20 métricas con definición exacta.
  - `public_check.py`: ejecuta `analyze.py` sobre los datos visibles y comprueba el esquema y 3 respuestas.
  - `package.json`.
- **Interfaz:** `python3 analyze.py <data_dir> <output.json>`, solo biblioteca estándar.
- **Dificultad, toda explícita en el contrato**
  - Fechas con zona horaria a mes UTC.
  - Conversión de divisa con el tipo del día del pedido; si falta, el del último día anterior disponible.
  - Pedidos duplicados: se queda la versión con `updated_at` más reciente.
  - Pedidos cancelados excluidos.
  - Reembolsos parciales y totales, imputados al mes del reembolso.
  - Cadenas de renombrado de SKU (`replaced_by`).
  - Clientes duplicados por email con mayúsculas o espacios.
  - Redondeo half-up solo al final.
  - Top-N con desempates.
  - Cohortes de retención.
  - Mediana y percentiles.
  - Reparto por día de la semana.
- **Grader**
  - Ejecuta el `analyze.py` del candidato y el de `solution/` sobre 4 datasets ocultos que genera `holdout/generate.py` con distintas semillas y mezclas de casos raros.
  - Un check por métrica y dataset, con peso.
  - Salida inválida para un dataset: 0 en ese dataset.
- **Dial de dificultad:** número de métricas y de reglas de limpieza, y cuántas reglas solo se notan en los datos ocultos (pero siempre escritas en el contrato).

## Bocetos (se escriben después del piloto)

- **`feature_implementation_hard`:** librería de asignación de inventario ampliada.
  - Lotes con caducidad (FEFO), varios almacenes con envíos partidos según reglas.
  - Reservas con TTL y comandos idempotentes, políticas de backorder.
  - Libro de movimientos con replay y auditoría.
  - Paquete Python de varios módulos, ~150 casos ocultos.
- **`information_extraction_hard`:** 100–150 documentos sintéticos (hilos de email, chats, facturas en texto) → `records.json` según `SCHEMA.md`.
  - Normalización de fechas, importes y nombres.
  - Correcciones posteriores en un hilo que sustituyen a datos anteriores, deduplicación.
  - Exige un `extract.py` que el grader ejecuta sobre corpus ocultos generados con las mismas plantillas.
- **`constrained_planning_hard`:** un planificador que produce `plan.json` para una instancia de horarios.
  - Personas, salas, ventanas, precedencias, habilidades y preferencias blandas.
  - El grader lo ejecuta en instancias ocultas.
  - Score: restricciones duras cumplidas como compuerta, más el objetivo frente al de la referencia.
  - Una sola salida.
