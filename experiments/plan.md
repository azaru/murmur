# Plan de experimentos: murmur vs Pi

Objetivo: una configuración de murmur que supere a Pi n=1 (mismo modelo: `openai-codex/gpt-6-luna`, thinking `medium`) de forma consistente. Se prueba de todo con perfiles, sin OpenSpec. Cuando algo dé señal, se fija con un change de OpenSpec, por ejemplo convirtiendo un perfil ganador en el comportamiento por defecto.

Requisito previo: las palancas (perfiles, variantes en swarmtest, adapter de autotuner, `scripts/arms.mjs`), implementadas sin OpenSpec; notas de diseño y pasos en `experiments/levers/`.

## Regla de diseño de candidatos

Nada jerárquico: el sistema nunca asigna roles ni reparte el trabajo. Sí puede ofrecer un menú de roles (con instrucciones propias que el agente lee al elegir), escalonar las entradas para que cada uno elija y anuncie su rol antes de que entre el siguiente, y dar herramientas, señales y condiciones de fin que ayuden a autodescubrir qué hace falta. Quién hace qué lo deciden los agentes, y pueden cambiar de rol.

## Criterio de "supera a Pi de forma consistente" (fijado antes de medir)

- **Conjunto de confirmación.** Nunca se usa para decidir candidatos. Lo forman:
  - las 18 tareas `validation_pool` del agentic-canary;
  - las 8 tareas de swarmtest (abajo), con repeticiones nuevas y otra semilla.
  - `holdout_final` queda reservado; solo se usaría una vez, con `holdout --i-am-releasing`.
- **Reglas.** Hacen falta dos campañas de confirmación independientes y cada una debe cumplir:
  - delta medio pareado por tarea (score de murmur − score de Pi) > 0, con el extremo inferior del IC bootstrap al 90 % > 0;
  - murmur gana más tareas de las que pierde;
  - la tasa de timeouts y fallos no supera la de Pi en más de 10 puntos.
- **Coste.** Los tokens se registran pero no deciden; cada run tiene un tope de 1,5M.

## Ruido conocido

- Pi n=1 en `durable_workflow_engine`, con el mismo adapter, dio 0,67 / 0,90 / 0,65 / 0,49 y una media de 0,51 en 3 runs.
- Conclusión: un run no ordena nada. Siempre k≥2, comparación pareada por tarea y decisión sobre la media por tarea.

## Fases

### F0: palancas (sin OpenSpec; ver `experiments/levers/`) — HECHO 2026-09-30
Solo smoke runs; menos de 1M tokens.

### F1: piloto en swarmtest, ¿aporta el tablero? (tope 20M tokens)
- **Tareas (8):** `bug_fixing`, `complex_workflow_engine`, `constrained_planning`, `data_analysis`, `durable_workflow_engine`, `feature_implementation`, `incremental_workflow_engine`, `information_extraction`. Se excluyen `document_synthesis` y `live_web_research`, que requieren revisión humana.
- **Brazos:** `pi/n=1`, `murmur/n=1`, `murmur/n=3` y `murmur[profiles/no-messaging.json]/n=3`, con k=2. Son 64 runs.
- **Parámetros:** `token_budget` 1,5M por run, `timeout_seconds` 1200, `--max-total-tokens 20000000`. Estimación: 8–12M.
- **Decisión sobre el tablero** (`scripts/arms.mjs`, n3 con mensajes vs n3 sin mensajes):
  - aporta si el delta medio es ≥ +0,05 y gana en ≥ 5 de 8 tareas;
  - no aporta si el delta medio es ≤ 0;
  - en otro caso es inconclusivo y se hacen k=2 más.
- **Además, de forma descriptiva:** la distancia actual entre murmur n=1 y n=3 y Pi.

### F2: autotuner, línea base exploratoria
- Murmur con la mejor configuración de F1 contra Pi en el panel de 12 tareas del canary (split train, tareas activas), con k=2. Estimación: 3–8M.
- Es exploratorio porque el canary está calibrado para Pi `gpt-5.6-luna`.
- Hay que revisar el timeout de 480 s por tarea para murmur n≥3.

### F3: bucle de afinado (panel del canary)
- **Candidato:** un fichero `profiles/<id>.json` más su config de autotuner. Nunca se edita un perfil en su sitio: cada candidato nuevo es un fichero nuevo. Autotuner no ve el contenido del perfil en su caché ni en el control de versión, así que editarlo en su sitio mezclaría resultados sin avisar.
- **Evaluación:** gate conservador 12×2 contra la línea base de murmur (en caché). Si promueve, pasa a ser la nueva línea base; si rechaza, se registra y se descarta.
- **Tandas:** de 3 a 5 candidatos, con una estimación de tokens aprobada antes de lanzarlas. Cada candidato cuesta unos 2–7M.
- **Seguimiento:** cada 3 promociones, comparación exploratoria contra Pi en el panel.

### F4: confirmación
- Cuando el panel muestre murmur ≥ Pi, se lanzan las dos campañas de confirmación.
- Si pasan, se abre un change de OpenSpec para fijar el perfil ganador.
- Si no pasan, se anota como posible sobreajuste y se vuelve a F3.

## Backlog inicial de hipótesis (palanca → idea)

1. `messaging`: ¿el tablero aporta frente a trabajar en silencio? (F1)
2. `agents`: comparar N = 2, 3 y 5.
3. `spawnGapSeconds`: 0 frente a 20–30 s, para que el primero explore y publique un plan antes de que entren los demás.
4. `briefing`: pedir al primero en entrar que reparta el trabajo por el tablero, y a los demás que esperen el plan o lo contesten.
5. `systemPromptAppend`: normas de convivencia del enjambre (reclamar antes de editar, publicar hallazgos y resultados de tests).
6. `tools`: añadir `grep`, `find` y `ls`.
7. `thinking`: medium frente a high.
8. Textos de `steer` y `wake` más directivos: resumir el mensaje nuevo y decir qué hacer.
9. `toolDescriptions`: que `post` anime a compartir resultados de tests y que `done` exija haber corrido el check después del último cambio de un compañero.
10. `done` del briefing más estricto: no terminar si otro compañero sigue trabajando en el mismo archivo.

## Ideas abiertas (se amplían con cada análisis de transcripciones)

Solo dos principios: no jerárquico y autogestionado. Todo lo demás es probable.

- Menú de roles que cada agente elige y cambia (herramienta `role(nombre)` que devuelve instrucciones del rol, lo anuncia y lo muestra en `team`).
- Entrada escalonada para que cada uno elija y anuncie antes de que entre el siguiente; agente "ojo fresco" que entra tarde sin historial.
- Checklist del contrato en un fichero compartido (`SWARM.md`) que todos mantienen.
- Suite de tests del enjambre (`swarm_tests/`) que cualquiera amplía; `done` exige que pase.
- Aviso automático de ediciones en el tablero (resumen por ventana de tiempo).
- Fin por consenso con época: cualquier edición invalida los `done` anteriores y despierta a quien terminó.
- Despertar a quien lleva N s parado para que busque huecos; estado periódico de una línea.
- `budget()` con tiempo restante.
- Diversidad de agentes (thinking distinto por agente).
- Pedir un compañero con contexto limpio o retirarse.
- Lecciones genéricas en el prompt de sistema, sacadas de las transcripciones.

### Hallazgos F1a/F1b (transcripciones) e ideas que salen de ellos

- Todos (Pi y murmur) paran en cuanto `npm run test` pasa, usando ~11 % del tiempo y 8–43 % de tokens; varios `done` admiten el hueco ("replay validation is not complete"). El único 0,987 salió de un agente que, tras el verde, contrastó el código con el contrato y escribió checkpoints forjados para romperlo.
  → Norma: el check es una muestra; el contrato es lo que cuenta; usar el tiempo sobrante para romper el trabajo propio y ajeno. Mostrar tiempo y presupuesto restantes.
- Un hallazgo tardío se pierde: los posts a agentes `done` no los despiertan y nadie reabre el trabajo.
  → `done` revocable: una edición o un post posterior despierta a los que terminaron; `done` rechazado con mensajes sin leer o con el check en rojo tras el último cambio.
- Sin tablero hay sobrescrituras (18 writes sobre 5 ficheros; bugs de un solo autor que pisa a otros). Con tablero no, pero no mejora la calidad: 61 % de las tool calls son coordinación (inbox, acks, "I'll take X").
  → Meter el texto de los mensajes nuevos en el steer (sin viaje a `inbox`); `post` solo para decisiones, interfaces, fallos y bloqueos; aviso automático de claims y ediciones.
- El texto ArcSwarm de las tareas ("The solo Pi run implements all modules itself") hace que cada agente se crea el único.
  → Línea en el prompt: el texto de la tarea puede hablar de otros arneses; tú eres uno de N iguales.
- `claim("bindings.py")` y `claim("workflow_engine/bindings.py")` no colisionan; `engine.py` quedó sin dueño 70 s.
  → Canonizar rutas; `team()` lista lo que nadie ha cogido.
- `budgetTokens` cuenta cache_read: sondear quema presupuesto sin trabajo real.
- Control extra: sin mensajes pero sabiendo que hay compañeros, para separar comunicación de conciencia del equipo.

### Ideas "out of the box" (2026-10-01; revisión bibliográfica más datos propios)

Datos propios que las enmarcan:
- El contexto se triplica a lo largo de un run (de ~6k a ~19k tokens por turno) y la segunda mitad de los turnos se lleva el 66 % del gasto.
- c5 casi no usa sus intentos privados: crea `attempts/` en cph y en uno de los dos runs de ieh; en durable y fih reparte el trabajo. Su ventaja se debe en parte a las normas de c1.

Ideas:
1. **Selección por ejecución** (CodeT, S*, CodeMonkeys). Intentos independientes; cada agente escribe sondas derivadas del contrato, se ejecutan todos los intentos contra todas las sondas, se publica una matriz de resultados y se instala el intento con más acuerdo. Las dos o tres sondas que separan a los candidatos las escribe alguien que no es autor de ninguno de ellos.
2. **`done` con evidencia y reloj visible.** No se puede terminar sin N acciones de verificación posteriores al último verde o sin una lista de cláusulas marcada; el tiempo y los tokens restantes llegan con los resultados de las herramientas (SWE-Marathon y MAST: parada prematura y verificación pobre entre los fallos principales).
3. **Relevos con contexto limpio** (Anthropic, Cursor, Carlini, Fail-Fast Restart-Smart). Cuando un agente hace `done` o supera K turnos, escribe `NOTES.md` y otro agente nuevo del mismo nombre continúa con contexto limpio, hasta agotar tiempo o presupuesto. Ataca a la vez el coste (contexto creciente) y el abandono temprano. Sirve también de control con cómputo equiparado: n=1 con relevos.
4. **Menú de estrategias elegidas** (Self-MoA y diversidad de personalidad). Cada agente elige una estrategia distinta (test-first, contrato a checklist, de abajo arriba). Solo compensa si después hay selección por ejecución; se mide el mejor de 3, no solo el elegido.
5. **Polinización cruzada tras la selección** (AlphaEvolve, SWE-Replay). Los no elegidos llevan al ganador las cláusulas donde su intento puntúa mejor, con aceptación solo por tests.
6. **Fases en silencio** (pizarra o estigmergia). Tablero solo en las fronteras de fase. Cursor ve que los pares planos evitan lo difícil, y nuestro "ceder el fichero" es lo mismo, así que ceder se prohíbe explícitamente: quien encuentra un defecto lo arregla en su copia y publica el parche.
- **Control que falta:** un agente solo con 3 veces el presupuesto. En nuestro caso no basta subir el tope, porque c4n1 no llega a gastarlo (para antes); el control justo es n=1 con relevos (idea 3).

### Hallazgos de la criba 3 (trazas de 15 campañas; recuentos de events.jsonl y traces.mjs, más lectura de unos pocos runs)

- **El fichero roto casi desapareció.** Hubo 6 sobrescrituras en total, como mucho una por run, y ningún run quedó con el fichero roto sin arreglar. `writeGuard` rechazó 12 escrituras parciales, stale 10 y lock 6 (todas en `50117473/0006`). Con el guard, A, B y C ya no tienen nada que arreglar, y por eso no aportan.
- **El fallo dominante pasa a ser ceder y parar pronto:**
  - **ieh (un solo fichero):** en los brazos n=3 suele haber un implementador y 1–2 "revisores" que hacen `done` con "X owns extract.py". En parts es extremo (`cc8a515c/0002`, 0,00 en 66 s): los tres reclaman partes que no son implementación (auditoría o normalización), sueltan "extract.py implementation", y los tres hacen `done` con el stub intacto. En fih y durable las partes son módulos reales y parts funciona (1,0 y 0,88–0,96).
  - **durable:** guard pierde 0,36 en las dos repeticiones por las mismas familias (checkpoint, replay y foreach-resume), porque para nada más salir el verde: 2/2/2 llamadas tras el verde en `/0007`. lock y parts siguen 7–27 llamadas y pierden solo 17–90 puntos. El check público no cubre esas familias, así que lo que decide es seguir trabajando después del verde, no el mecanismo de ficheros.
  - **c4g en ieh:** todos los runs que llegan a verde sacan ≥ 0,90, y los que paran en rojo 0,27–0,53, rindiéndose con un caso testarudo (CS-11073).
  - **lock en fih:** 0,73 dos veces con los mismos checks fallidos (fuzz, ValueError en el primer `add_lot`). Es una mala lectura compartida del contrato, no un bloqueo.
- **Llamadas tras el primer verde (media de los agentes que llegan a verde):** c4g 3,9, stale 3,8, guard 9,3, parts 10,0, lock 10,9 y c5 15,3. Agentes que no corren ningún check: guard 6 de 24, stale 7 de 18, lock y parts 3 de 18, c5 1 de 18.
- **Coste:** los turnos que solo usan herramientas del tablero se llevan ~31–45 % de los tokens en n=3, frente a ~9 % en c4g. De los runs cortados a 3M, dos estaban avanzando (stale ieh y c5 ieh 0,97). Uno de guard en fih sacó 1,0 y siguió verificando hasta el tope. Uno de c5 en ieh (`ea037e72/0002`, 0,54) entró en bucle: 184 llamadas, 49 `inbox`, 32 `post`, 5 ediciones y ningún verde.
- **Consecuencia para la ronda 4:** las palancas ya preparadas (evidencia en `done` con reloj, relevos con contexto limpio y selección por ejecución) atacan justo estos fallos. Ceder sin implementar con el check en rojo debería no valer como motivo de `done`.

### Hallazgos de la criba 2 (réplica contra c4n1; `criba12-rows.json` junta las dos cribas)

- **Regla aplicada:** pasa un brazo con Δ medio frente a c4n1 ≥ +0,05 y que gane en ≥ 3 de 4 tareas. **c5 pasa:** +0,22 frente a c4n1, gana 4 de 4 tareas, +0,42 frente a Pi, 2,49M de media. c1 no pasa (+0,09 pero solo gana 2 de 4) y x1 tampoco (−0,04, gana 1 de 4).
- **Por qué gana c5:** cada agente trabaja en su propia copia (`attempts/<nombre>/`), así que nadie pisa el fichero de otro. En ieh saca 0,97 y 0,90. En la réplica, c1 y x1 sacan 0,00 en ieh:
  - x1: un agente sobrescribe `extract.py` con un trozo de continuación y los tres se rinden a los 4 minutos;
  - c1: se le acaba el tope de 3M a mitad de una edición y el fichero queda con un paréntesis sin cerrar.
- **El fallo dominante en las tareas de un solo fichero es el fichero compartido roto, seguido de abandono.** Ya van 4 de 6 brazos de 3 agentes con 0,00 en ieh (x2, c6, c1, x1). Lo arreglan dos mecanismos distintos: el aislamiento (c5) y `writeGuard` (todavía sin medir).
- **c4n1 se confirma como referencia fuerte y barata:** ieh 0,67, cph 0,40, durable 0,59 y fih 0,83 (Pi en fih: 0,29 en calibración), con 0,25M de media.
- **Techo:** c1, x1 y c5 sacan 0,92–0,99 en durable; c1 y c5 sacan 1,0 en fih con k=1. La saturación por arriba se confirma; de ahí `information_extraction_hard2`.
- **Coste de la criba 2:** 26,0M. Tres runs cortados por el tope: c5 en durable y c1 en ieh y en cph.

### Hallazgos de la criba 1 (74 runs, k=1 por brazo; tablas en `experiments/criba1-rows.json` y `criba1-traces.md`)

- **Lo más limpio: c4n1.** Un solo agente murmur con las lecciones de c4 saca +0,245 frente a Pi en las tres tareas, con 0,36M. El brazo por defecto n=3 saca +0,10 con 1,19M, y c4 n=3 +0,22 con 2,43M (cortado dos veces). Con el mismo prompt, pasar de 1 a 3 agentes no añadió nada y costó 7 veces más. Casi toda la ventaja sobre Pi viene de "no parar con el check en rojo", no de tener compañeros. La comparación que importa a partir de ahora es murmur n=3 frente a murmur n=1 con el mismo prompt.
- **Seguir trabajando después del verde predice el score** en tareas multi-fichero y de planificación (Spearman entre llamadas tras el primer verde y score: 0,80 en durable, 0,72 en cph). En la tarea de un solo fichero no (0,16 en ieh); allí lo que falla es la colisión.
- **Escritura en trozos que se pisa, dentro del enjambre:** 8 de 39 runs de murmur. Es fatal cuando nadie lo arregla. En ieh, x2 y c6 (coordinación por ficheros, sin tablero) sacan 0,00: un agente sobrescribe `extract.py` con un trozo de continuación y los tres se rinden a los 3–5 minutos de 20, dejándoselo a otro. Saber que hay compañeros sin tener canal lleva a ceder, no a arreglar. En durable, que es multi-fichero, c6 saca 0,90. La lección de c4 no evitó la sobrescritura.
- **x1 (attach):** quitó los steers (0 frente a 12), pero no ahorra: 1,37M frente a 1,19M. Los agentes siguen llamando a `inbox` (5–12) y a `team` (9–11), y publican más (13–27). El canal cambió, el hábito no; habría que quitar esas herramientas. La predicción de −30–50 % de tokens queda refutada. El score sale mejor que el brazo por defecto, pero se apoya en durable (0,99 frente a 0,18).
- **x3 (avisos automáticos) es peor que x1 en las tres tareas:** refutado con k=1. **x4 (tablero voluntario)** saca +0,21 con 0,91M; frente al brazo por defecto es más barato y algo mejor.
- **El 0,18 del brazo por defecto en durable es atípico.** En F1 ese brazo sacó 0,99 y 0,59. Cualquier "X supera al brazo por defecto" que dependa de durable con k=1 se apoya en ese run.
- **cph apenas discrimina:** 8 de 11 runs de Pi y 8 de 13 de murmur caen exactamente en 0,37. Solo c3 (0,50) y c5 (0,43) superan esa meseta, y en los dos todos los agentes acaban con el check en verde.
- **Tope de 3M:** 10 de 39 runs de murmur lo alcanzan (c2 tres veces; c1, c3, c4 y c5 dos). En esos runs el 3,0M es un suelo, no un coste, y el score está truncado.
- **Concurrencia (3 carriles):** no hay ningún timeout del grader en 74 runs.
- **`arms.mjs --across` no sirve con un Pi por campaña:** todos los Pi colapsan en la clave `|task|1`. Para esta criba hay que comparar con la media de Pi por tarea (Pi n=11–13 por tarea).
- **Coste:** 65,2M en total (murmur 59,1M, Pi 6,1M), frente a los 26M estimados al principio y ~40M después. Se debe a que hay 13 brazos, a los brazos pesados que tocan el tope y a llevar Pi en cada campaña.

### Hallazgos de las calibraciones de tareas hard (transcripciones de Pi, 24 runs)

- **Escritura por trozos que se pisa.** Pi escribe ~5–7 KB por `write`. Si el fichero no cabe, manda un segundo `write` que es la continuación (empieza con `def …` indentado o `# aggregation`) y sustituye al primero. Pasa en 7 runs: fih v2 r3, v3 r3, v4 r1 y r2, dah v1 r1, dah v2 r1 y r2. Seis de los siete sacan < 0,1; el otro (dah v2 r2) lo arregla reescribiendo y saca 1,0. La solución de fih tiene `service.py` de 27,8 KB: el salto v1 (0,87) → v2–v4 (0,05–0,40) lo explica sobre todo el tamaño del fichero mayor, no la dificultad del contrato.
- **Abandono temprano.** Pi corre el check 1–4 veces y para; 19 de 24 runs terminan admitiendo que falla o está incompleto.
- **Cuando no se rompe, la dificultad es real.** fih v4 r3 (0,68) aprueba todas las familias simples y falla `fuzz_long`, `fuzz_ops`, `replay_v2` y `replay_forged`, que son interacciones, igual que en v1.
- **Bimodalidad.** fih v4 y dah v2 tienen dos modos: (a) paquete o script roto por la sobrescritura, seguido de abandono; (b) trabajo completo con fallos en interacciones (fih) o techo de 1,0 (dah).
  → Idea: lección genérica en `systemPromptAppend`: `write` sustituye el fichero entero; los ficheros largos se construyen por módulos o añadiendo con `edit`; con el check en rojo se sigue, no se para. Ayudaría también a n=1, así que para atribuir el efecto al enjambre hace falta un brazo murmur n=1 con la misma lección.

## Criba 1 (fijada antes de medir, 2026-10-01)

- **Tareas:** las tres continuas y calibradas: `information_extraction_hard` (Pi 0,58), `constrained_planning_hard` (0,32) y `durable_workflow_engine` (~0,59). `feature_implementation_hard` v4 (0,29) y `data_analysis_hard` v2 (0,48) se quedan como están y no entran en la criba. Son bimodales: rotura por escritura en trozos y abandono.
- **Brazos (k=1):** pi n=1; murmur n=3 por defecto; no-messaging n=3; c1, c2 y c3 n=3; `c4-lessons` (c1 más lecciones: `write` sustituye el fichero y no se para con el check en rojo) en n=3 y en n=1. El de n=1 separa el efecto de la lección del efecto del enjambre.
- **Ejecución:** `experiments/criba1.json`. Una campaña por tarea, para que un corte por presupuesto solo afecte a esa tarea. La semilla 20261006 deja c3 para el final. Tope de 3M por run y 20M por campaña. Estimación: ~26M en total.
- **Cambio a mitad (2026-10-01 12:50).** c4 n=3 agotó los 3M en ieh (2,8M de cache read) y swarmtest paró la campaña después de 2/8 runs. A partir de ahí, cada brazo que falta corre en su propia campaña junto a un run de Pi (`experiments/criba1-driver.mjs`; swarmtest exige un brazo de un agente). Así un corte solo afecta a esa pareja y Pi acumula k≈8 por tarea. Se añade **c5** (`c5-attempts`): c1 + intentos en paralelo. Si el entregable es un solo fichero, cada agente hace su intento completo en `attempts/<nombre>/`, se instala el mejor y se sigue mejorando entre todos. Sale de las transcripciones: en cph y en ieh, dos de tres agentes ceden el fichero y llaman a `done` como "revisores". `arms.mjs --across` empareja runs de distintas campañas por tarea.
- **Objetivo con tres patas (2026-10-01):** (1) subir el score, (2) una comunicación que sirva a ese score y (3) bajar el coste en tokens. Datos a mitad de criba: en ieh, sin mensajes da 0,92 con 0,71M y el brazo por defecto 0,87 con 1,69M. Los turnos que solo coordinan se llevan el 33–62 % de los tokens y el cache read es > 85 %. El coste lo marcan los turnos, no lo que escriben los agentes.
- **Segunda tanda: mecanismos distintos para el mismo objetivo** (comunicación útil a menos coste; `criba1-driver2.mjs`, corre después de la primera; Pi en cada campaña):
  - **x1 `x1-attach`** (canal sin turnos): los posts nuevos se pegan al resultado de la siguiente herramienta (`delivery: "attach"`); no hay steers ni hace falta `inbox`. Se compara con el brazo por defecto. Predicción: score igual y −30–50 % de tokens.
  - **x2 `x2-files`** (estigmergia): sin tablero. Los agentes saben que tienen compañeros y coordinan por ficheros: `SWARM.md` como cuaderno compartido y `swarm_tests/`. Se compara con no-messaging (coste) y con el brazo por defecto (score).
  - **x3 `x3-notices`** (hechos automáticos): x1 más avisos que genera el sistema (quién escribe o edita qué fichero, cada check con PASS/FAIL), y `post` restringido a fallos con repro, interfaces y bloqueos. Se compara con x1. Predicción: menos posts, menos solapes y score ≥ x1.
  - **c5** (diversidad en vez de conversación; ya está en la primera tanda): intentos en paralelo y selección.
  - **x4 `x4-pull`** (tablero voluntario): hay tablero pero nadie interrumpe ni pega mensajes a los resultados (`delivery: "pull"`). El prompt pide mirar `inbox` y `team` antes de cada trabajo y publicar al acabarlo qué se hizo, qué se encontró y qué falta. Un agente que termina su turno con mensajes sin leer sigue recibiendo el `wake` de siempre. Se compara con el brazo por defecto (steer) y con x1 (attach). Predicción: menos turnos de coordinación que el brazo por defecto. El riesgo es que los hallazgos lleguen tarde.
  - **c6 `c6-silent-norms`** (control): las normas de c1 con la coordinación por ficheros de x2 y sin tablero. Separa el efecto de las normas del efecto del tablero en el 1,0 de c1.
  - **Ejecución en paralelo (13:47):** los dos drivers secuenciales se sustituyen por `criba1-lanes.mjs`, con 3 carriles en paralelo. Cada carril coge la siguiente combinación tarea × brazo que no esté hecha ni bloqueada (bloqueo en `criba1/locks/`). Los runs ya hechos se encuentran por la semilla de la criba. El run de cph de no-messaging que estaba en marcha sigue hasta acabar y queda bloqueado. Riesgo: con carga, los checks de rendimiento del grader podrían salir peor; si aparecen timeouts raros, hay que mirarlo.
  - Para comparar coste: tokens totales, turnos y tokens sin caché (input + output), con `traces.mjs` y los eventos `usage`.
- **Regla:** pasan a k=2 los 1–2 brazos de murmur con mejor delta medio frente a Pi en las tres tareas, siempre que sea > 0. La comparación descriptiva n=3 con mensajes frente a sin mensajes, y c4 n=3 frente a c4 n=1, sirve para mejorar el messaging, no para decidir.

## Criba 2: réplica (fijada antes de medir, 2026-10-01 16:20)

- **Pregunta:** ¿un brazo de 3 agentes supera a un solo agente con el mismo nivel de prompt (c4n1)?
- **Brazos:** c1, x1 y c5. Cada campaña lleva c4n1 junto al brazo de 3 agentes; no hace falta más Pi, que ya tiene k=11–13 por tarea.
- **Tareas:** ieh, cph y durable (con la criba 1 quedan en k=2), más `feature_implementation_hard` v4 (k=1), porque tiene margen: incluso el mejor run de Pi falla fuzz y replay.
- **Ejecución:** `experiments/criba2-lanes.mjs`, 3 carriles, semilla 20261007, tope 3M por run. Estimación: ~25M.
- **Regla:** un brazo supera a c4n1 si el Δ medio por tarea (media del brazo − media de c4n1, juntando criba 1 y 2) es ≥ +0,05 y gana en ≥ 3 de las 4 tareas. Se registra también Δ frente a la media de Pi y el coste. c1, x1 y c5 no se ordenan entre sí en durable ni en ieh, porque están en el techo (0,91–1,0).
- **Saturación, cambio de calibración aprobado (2026-10-01):** las tareas `*_hard2` se calibran contra Pi (k=3) y contra c4n1 (k=2, banda 0,3–0,6); detalle en `hard-tasks.md`. La primera es `information_extraction_hard2`, en construcción con un subagente.
- **Problema abierto: saturación.** La calibración usó a Pi como referencia y los brazos buenos tocan el techo en durable e ieh. Para ordenar candidatos hacen falta tareas con margen por encima de c4n1.

## Criba 3: mecanismos contra el fichero roto (fijada antes de medir, 2026-10-01 17:30)

- **Pregunta:** qué mecanismo evita el fichero compartido roto (y el abandono que viene después) sin pagar el coste de c5.
- **Brazos (n=3 salvo el control):**
  - c4g-guard: c4n1 con `writeGuard`; es el control de un solo agente.
  - x1g-guard: x1 con `writeGuard`, elegido por el usuario.
  - x1g-lock (A): x1g con claims que bloquean y caducan a los 120 s sin escribir.
  - x1g-stale (B): x1g con control de versiones; se rechaza un `write` sobre un fichero que cambió desde que el agente lo leyó.
  - x1g-parts (C): x1g con claims sobre partes de la tarea en lugar de ficheros.
  - c5: ganador de la criba 2, como referencia.
- **Tareas:** ieh v1, fih v4 y durable (control multi-fichero), con k=2. cph queda fuera: meseta en 0,37.
- **Ejecución:** `experiments/criba3-lanes.mjs`, 3 carriles, semilla 20261012, tope de 3M por run. Las cuatro variantes de x1g comparten campaña con c4g (x1 nunca llegó al tope); c5 va aparte, también con c4g. Estimación: ~48M.
- **Regla:**
  - un brazo n=3 es candidato si su media supera a la de c4g en ≥ +0,05 en el promedio de tareas y no saca ningún 0,00 en ieh;
  - entre candidatos, mejor score por M de tokens;
  - el mecanismo (A, B o C) aporta si supera a x1g-guard en ≥ +0,05 sin subir los tokens más de un 30 %.
- **Incidencia (17:40):** x1g-guard agota los 3M en fih (con score 1,0) y swarmtest para la campaña agrupada después del primer run. La suposición de que x1 no llega al tope era falsa en fih. Lo que falta se relanza con una campaña por brazo (`criba3-lanes.mjs <carril> --per-arm <tarea>`). La campaña agrupada de ieh también se cortó (5 de 10 runs) y a las 18:02 se lanzó su pasada por brazo (carril 5). La agrupada de durable terminó entera (10 de 10). Las de c5 se cortaron en ieh (2 runs) y en durable (3 runs) porque c5 llega al tope. A c5 le faltan repeticiones en esas dos tareas, y `--per-arm` no lo incluye: hay que relanzarlo con una campaña por repetición (repetitions 1), para que un corte no se lleve el resto.
- **Recarga (18:31–18:43).** c5 en durable ya tenía k=2: el corte de `e7029fb2` se llevó la segunda repetición de c4g, no la de c5. Solo faltaba c5 en ieh, y se lanzó una campaña con `repetitions: 1` (`criba3/c5-ieh-r1.json`, `ea037e72`): 0,54, otra vez cortada a 3M. `--per-arm` no completa lo que falta, sino que añade 2 repeticiones por brazo, así que fih x1g-guard queda con k=3 y c4g con k=3–7 por tarea. Para ieh lock, stale y parts (les faltaba 1 run a cada uno) se reservaron sus locks y se lanzaron tres campañas de 1 repetición (`criba3/topup-ieh.sh`), con OK del usuario. La media de control de c4g usa todos sus runs por tarea. Gasto de la criba a las 18:30: 47,3M.
- **Resultado y regla aplicada (19:00; media por tarea ieh / fih / durable, tokens por run):**
  - c4g-guard (control): 0,73 (k8) / 0,79 (k10) / 0,46 (k3), media 0,66, 0,37M.
  - c5: 0,76 / 1,00 / 0,96, media 0,91 (+0,25 frente a c4g), 2,69M; 3 de 6 runs cortados a 3M; score/M 0,34.
  - x1g-guard: 0,80 (k3) / 1,00 (k3) / 0,63, media 0,81 (+0,15), 1,52M; score/M 0,53.
  - x1g-lock (A): 0,80 / 0,73 / 0,98, media 0,84 (+0,18), 1,39M; score/M 0,60.
  - x1g-stale (B): 0,77 / 0,94 / 0,65, media 0,79 (+0,13), 1,31M; score/M 0,60.
  - x1g-parts (C): 0,15 / 1,00 / 0,92, media 0,69 (+0,03), 0,98M; saca 0,00 en ieh: los tres agentes ceden la implementación en 1 minuto.
  - **Candidatos:** c5, x1g-guard, x1g-lock y x1g-stale. parts no pasa: +0,03 y un 0,00 en ieh. **Mejor score/M entre candidatos:** lock y stale empatan (0,60), por delante de guard (0,53) y c5 (0,34).
  - **Mecanismos:** ninguno supera a x1g-guard en ≥ +0,05 (lock +0,03, stale −0,02, parts −0,12). Por la regla, A, B y C no aportan. La ventaja de lock depende de durable (0,98 frente a 0,63, k=2), y en fih pierde (0,73 frente a 1,00).
  - Gasto total: 59,1M en 15 campañas (estimación inicial 48M).
- **Ronda 4, preparada (sin lanzar; fusionada en la ronda 5A el 2026-10-01 19:40):** palancas `relay`/`relayContext`, `doneAfterGreen` y `clock`, y los perfiles x1g-relay, c4g-relay (n=1, control con cómputo equiparado), x1g-evidence (15 llamadas tras el verde y reloj) y x1g-select (intentos en `attempts/`, sondas por agente, matriz intento × sonda en SCORES.md, instalar el mejor, portar lo que falte). Prueba de humo: el relevo encontró y arregló un bug real que la primera instancia dio por bueno.
- **En paralelo:** `ledger_reconciliation_hard`, una tarea pequeña solo con las familias del ledger, para resolver la saturación.

### Hallazgos de la revisión adversarial (2026-10-01 19:00; código, SDK de Pi y 302 runs)

- **Falta la comparación que decide la tesis:** el mismo perfil a n=3 frente a n=1. La única pareja (c4 n=3 k=1 frente a c4n1 k=3) empata. Las palancas recientes (relay, doneAfterGreen, clock) también sirven a n=1. **Regla nueva:** cada perfil candidato corre también a n=1, con el mismo fichero y en la misma campaña.
- **Predicado del check (arreglado en `src/`):** antes, cualquier bash que contuviera el comando contaba como check. Daba falsos verdes en menciones entre comillas (`echo '... npm run test ...' >> SWARM.md`: 6 de 171 primeros verdes) y con el estado de salida enmascarado (`check; cp ...`: 1 confirmado). Ahora el check tiene que abrir una sentencia fuera de comillas y no puede ir seguido de `|`, `;` ni `||`. `traces.mjs` mantiene el predicado antiguo, así que los números históricos no cambian; el Spearman 0,72–0,80 aguanta (≤ 6 % de primeros verdes dudosos).
- **`arms.mjs` sesgado contra brazos caros:** un run que toca el tope para la campaña antes de que corra su pareja, y `arms.mjs` descarta la pareja incompleta como "skipped". Las tablas de las cribas usan medias agrupadas de Pi y no les afecta.
- **`/tmp` compartido entre carriles:** 212 llamadas escriben en `/tmp` con nombres fijos (`/tmp/wrenplan.json`), y los nombres de agente son los mismos en todos los runs. Puede haber contaminación entre runs concurrentes; sin verificar.
- **Pendientes, sin arreglar:**
  - si `end()` llega durante `open()`, un relevo arranca una sesión sin abortar, así que el presupuesto no es un tope duro en los brazos con relay;
  - `done` no devuelve `terminate: true` (14 agentes siguieron actuando tras `done`; 2 editaron);
  - no se registra la versión del código en cada run;
  - los graders son alcanzables desde el workspace (`../../../tasks/<t>/grader.py`) con bash sin sandbox (0 accesos observados).
- **DeepSWE:** ver la fila del registro. Además, la recompensa es binaria (`tests/test.sh`: 1 solo si pasan base y new), así que hace falta crédito parcial para que discrimine.

## Ronda 5: coordinación (fijada antes de medir, 2026-10-01 19:11)

Motivación: el enjambre del incidente de OpenAI de julio de 2026 ganó al juntar descubrimientos entre agentes con tareas distintas, al reasignar esfuerzo hacia los atascados y al pedir ayuda cuando se atascaba. No ganó repartiéndose un solo fichero. Aquí se prueban esas dos vías por separado. La ronda absorbe x1g-select de la ronda 4.

**Palancas nuevas** (desactivadas por defecto; smoke en el registro):
- `findings`: herramienta `finding(text, command)`. murmur ejecuta el comando y publica la afirmación con su salida y su código de salida reales.
- `helpAfter`: tras N llamadas con el check en rojo o sin ejecutar, y cuando un agente acaba sin pase, murmur publica en el tablón que puede necesitar ayuda.

### A: dentro de una tarea, fusionada con la ronda 4 (fijada antes de medir, 2026-10-01 19:40, código `46e756b`)

Fusiona la ronda 4 que propuso el análisis de la criba 3 con la 5A. La criba 3 deja dos fallos: **ceder** (agentes que hacen `done` con "X owns extract.py") y **parar en cuanto sale el verde** (durable: 2/2/2 llamadas tras el verde). El fichero roto ya está resuelto con el guard.

- **Teoría principal: coordinación frente a cómputo.** Tareas ieh v1 e `information_extraction_hard2` (las dos con margen; durable no entra porque select y c5 ya sacan ~0,96 ahí), k=3.
  - S3 = x1g-select n=3 (cada agente construye su intento: ataca el ceder);
  - S3c = x1g-coord n=3 (S3 + `findings` + `helpAfter: 25` + "un mensaje es información, no una orden");
  - R4 = c4g-relay4 n=1 (c4g-relay con 4 relevos en vez de 2, para que pueda gastar ~2M frente a los ~2,7M de S3).
- **Teoría secundaria: puerta de evidencia (lo que proponía la ronda 4).** Tareas ieh v1 y durable, k=2.
  - E3 = x1g-evidence n=3;
  - E1 = c4g-evidence n=1 (c4g-guard + `doneAfterGreen: 15` + `clock`), que va además como agente único de relleno en todas las campañas de S3, S3c y E3.
  - Referencias de la criba 3, sin repetir (su comportamiento no cambia con `46e756b`): x1g-guard y c4g-guard.
- **Fuera:** x1g-relay (siempre toca el tope; la idea queda medida con R4) y cph (meseta en 0,37 para todos).
- **Ejecución:** `experiments/criba5-lanes.mjs`, una campaña por tarea × brazo × repetición con `repetitions: 1`, semilla 20261015, tope de 3M por run. R4 va en campañas propias (si toca el tope solo se para a sí mismo). 3–4 carriles. **Lanzada 2026-10-01 19:23** (4 carriles, 22 campañas). swarmtest ejecuta el brazo n=3 antes que el relleno E1, así que si el n=3 toca el tope, E1 no corre en esa campaña (solo baja la k de E1). Estimación: S3 y S3c ~16M cada uno, R4 ~12M, E3 ~7M, relleno E1 ~8M: **~60M**.
- **Regla (fijada antes de medir):**
  - **la comunicación aporta** si S3c − S3 ≥ +0,05 en la media de ieh e ieh2 y gana en las dos, sin subir los tokens más de un 30 %;
  - **el enjambre aporta** si el mejor de S3/S3c supera a R4 en ≥ +0,05 y gana en las dos tareas. Si R4 gasta menos de la mitad de tokens que ese brazo y pierde, la conclusión es "no decidido por cómputo", no "gana la coordinación";
  - **la puerta aporta en el enjambre** si E3 supera a x1g-guard (criba 3) en ≥ +0,05 en la media de ieh y durable y no saca ningún 0,00 en ieh; **en un solo agente**, si E1 supera a c4g-guard (criba 3) en ≥ +0,05;
  - los runs cortados a 3M cuentan con su score (es un suelo) y se marcan; si un brazo tiene ≥ 1/3 de runs cortados, se dice explícitamente al comparar.
- **Riesgos a mirar en las trazas:** con la puerta, el que cede se queda parado hasta que alguien publica, y el rechazo le dice que acabe el turno sin `done`, lo que puede terminar en `quiescent` con trabajo a medias. Los turnos de solo tablero ya son el 31–45 % de los tokens en n=3: medir si `finding` los sube. A n=1, el prompt de x1g-* dice "Teammates: none"; no aplica aquí porque los controles n=1 son c4g-*.
- **Descriptivo:** número de `finding` y de avisos de ayuda (eventos `help`, no `post`), si tras un aviso otro agente tocó la zona que fallaba, y las llamadas tras el primer verde por brazo.

- **Resultado y regla aplicada (2026-10-01 22:00; medias por tarea, tokens por run, cortados a 3M):**

  | brazo | ieh | ieh2 | durable | tokens/run | cortados |
  |---|---|---|---|---|---|
  | S3 x1g-select n=3 | 0,60 (k3) | 0,32 (k3) | — | 1,5 / 2,3M | 0 / 2 |
  | S3c x1g-coord n=3 | 0,42 (k3) | 0,17 (k3) | — | 1,3 / 2,0M | 0 / 1 |
  | R4 c4g-relay4 n=1 | 0,92 (k3) | 0,62 (k3) | — | 1,2 / 1,1M | 0 / 0 |
  | E3 x1g-evidence n=3 | 0,36 (k2) | — | 0,99 (k2) | 3,0 / 2,9M | 2 / 1 |
  | E1 c4g-evidence n=1 | **0,995 (k6)** | **0,99 (k3)** | sin datos | 2,1 / 3,0M | 0 / 3 |

  - **La comunicación no aporta:** S3c − S3 = −0,18 en ieh y −0,15 en ieh2; pierde en las dos. Apenas usaron `finding` (4 veces en 6 runs); hubo 19 avisos de ayuda.
  - **El enjambre no aporta:** el mejor n=3 (S3) queda 0,32 y 0,30 por debajo de R4, que además gasta menos tokens. Lo que se concluye es lo contrario: un agente solo con relevos gana al enjambre.
  - **La puerta en el enjambre no aporta:** E3 en ieh/durable da 0,67 de media frente a 0,715 de x1g-guard (criba 3), y saca 0,03 en ieh.
  - **En un solo agente, E1 supera a c4g-guard** (criba 3: ieh 0,73, k8) por +0,27 en ieh. En ieh2 saca 0,99, frente a 0,18 de c4n1 en la calibración. Cuesta 5–8 veces más tokens (los 3 runs de ieh2 llegan al tope sin llamar a `done`).
  - **Atención, la causa no es la puerta:** E1 tiene **0 eventos `done_refused`**, así que la puerta nunca actuó. La otra diferencia con c4g-guard es `clock` (minutos que quedan, añadidos a cada resultado de herramienta). Hipótesis: el reloj hace que el agente siga trabajando porque ve que le sobra tiempo. Hace falta un brazo c4g-clock (solo el reloj) para separarlo.
  - durable no tiene E1: los dos runs de E3 acabaron por timeout o presupuesto y swarmtest paró la campaña antes del relleno.
- **Conclusión de la ronda A:** lo que más mueve la nota sigue siendo la persistencia de un solo agente (reloj o relevos), no la coordinación. Los brazos n=3 pierden incluso con el mismo prompt de partida.

### B: varias tareas a la vez (lote)

- **Pregunta:** con M tareas a la vez y un presupuesto total fijo, ¿la coordinación mejora a agentes aislados con el mismo presupuesto?
- **Brazos:**
  - I (aislado): un agente fijo por tarea, sin tablón;
  - R (reasignación): cada agente elige tarea con claim y, al terminar, pasa a otra sin resolver; sin mensajes;
  - E (enjambre): R + tablón + `findings` + `helpAfter` + la línea de mensajes como datos.
  - Nadie asigna tareas: en R y E las eligen los agentes.
- **Lotes:**
  - L1 con tareas existentes (ieh v1, durable, `ledger_reconciliation_hard`, ieh2). Son dispares, así que mide sobre todo la reasignación.
  - L2 con la familia `fam_*` (4 tareas del mismo tipo, en construcción en `swarmtest/staging/`), que mide la transferencia de conocimiento.
- **Unidad de medida:** el lote. Score = media de los scores por tarea; k=3 lotes por brazo y familia; el tablón empieza vacío en cada lote.
- **Regla:**
  - E supera a I si el Δ medio es ≥ +0,05 y gana en ≥ 2 de 3 parejas de lotes, en cada familia por separado;
  - R − I (reasignación) y E − R (comunicación) son descriptivos.
- **Requisitos antes del primer run:**
  - un driver de lotes en `experiments/`: un workspace por tarea y puntuación con `swarmtest.grading.grade` importado, sin tocar swarmtest;
  - soporte en murmur para varias tareas (un check por tarea para la evidencia y la ayuda);
  - **aislamiento obligatorio** (Docker, red solo hacia la API del modelo, graders fuera del alcance de los agentes), porque B reproduce la estructura del incidente;
  - L2 validada offline y calibrada con I (0,3–0,6 por tarea).
- **Parámetros (fijados 2026-10-01 20:00, antes del primer run de B; petición del usuario: agentes y tokens proporcionales al lote):**
  - M = 4 tareas por lote; B = 1,5M tokens por tarea; 20 min de reloj en todos los brazos (los agentes trabajan en paralelo).
  - I: 4 runs de un agente (`c4g-guard`), uno por tarea, a la vez, con B cada uno.
  - R: `b-realloc` (c4g-guard + claim/release/team, sin mensajes), 4 agentes, 4×B compartidos.
  - E: `b-swarm` (R + post + `finding` + `helpAfter: 25` + "información, no órdenes"), 4 agentes, 4×B.
  - Las dos últimas reciben un objetivo neutro: 4 subcarpetas con su TASK.md y un check por tarea (`npm run test:<id>`, que murmur conoce por el campo `checks` de la tarea).
  - L1 = ieh, durable, `ledger_reconciliation_hard`, ieh2. L2 = `fam_billing`, `fam_shipments`, `fam_clinic`, `fam_payouts` (validadas offline: solución 1,0, stub 0,0, sonda de transferencia 0,24–0,64; leídas desde `staging/`, sin pasar por `tasks/`).
  - k=3 lotes por brazo y familia.
  - **Calibración de L2 antes de medir R/E:** el primer lote I de L2 hace de calibración. Si alguna tarea saca < 0,1 o > 0,9, se ajusta antes de seguir y ese lote no cuenta.
  - **Driver:** `experiments/batch/run-batch.mjs <lote> <brazo> <rep> <imagen>`. Carril: `experiments/batch/lane.sh <lote> <imagen>` (I, R y E intercalados por repetición). **L1 lanzado 2026-10-01 19:31** con `murmur-batch:a5a95a58e2`, un carril, en paralelo con la ronda A. Revisión de ambigüedad de L2 (agente independiente, solo lectura): las 4 listas, sin ambigüedad con peso oculto; se aplicaron 11 aclaraciones de una frase a los contratos (la mayor, en payouts: "una venta descartada por falta de fx no es una venta conservada", ~15–20 % del peso). Re-verificado: stub 0,0, solución 1,0. **Calibración L2 (I r0) lanzada 2026-10-01 19:40.** **Resultado (19:43): saturada.** c4g-guard aislado saca billing 0,94, shipments 1,0, clinic 1,0 y payouts 1,0, con 9–15 llamadas y ~66k tokens por tarea, en 1,9 min. Sin fuga: stub de 17 líneas y solución propia de 150–190 líneas. Por la regla, L2 v1 no se mide y este lote no cuenta. Confirma lo de AGENTS.md: las tareas de contrato se saturan. **Sustituta: L3, familia de optimización** (`opt_*`: rutas con ventanas, taller, empaquetado, turnos; score = (naive − coste)/(naive − best_known), sin techo práctico), en construcción en `staging/` con un subagente. Encaja mejor con B: una tarea de optimización nunca está acabada, así que los agentes libres siempre pueden ayudar, y las técnicas de búsqueda se transfieren. Mismos parámetros que L1/L2, y se calibra igual (I r0; banda 0,1–0,9 por tarea). **L3 validada offline (20:15):** stub 0,0; greedy 0,26–0,37; solution/ 0,84–0,87 (lo verifiqué con `grade`); best_known sale del mismo SA con 10–100 veces más iteraciones, así que el margen real está entre 0,85 y 1,0 y un algoritmo mejor puede tocar 1,0. Sonda de transferencia: el esqueleto SA de rutas adaptado a empaquetado con ~30 líneas saca 0,89. Hay transferencia, y también riesgo de saturar cerca de 0,9. Límite de 10 s por instancia: sensible a la carga. **Calibración L3 (I r0) lanzada 20:16.** **Resultado:** routing 0,33, shop 0,81, packing 0,07, roster 0,89 (media 0,52; 0,25M tokens; 1,6 min; los 4 terminan con done). packing queda por debajo de 0,1, así que se aplica la regla. No es un defecto del contrato: la solución es factible en las 4 instancias y solo un 1–4 % mejor que naive (heurística de 64 líneas en 11 llamadas, y el agente para). Remedio de `hard-tasks.md` para tareas por debajo de banda (pasar información a `public_check`): en las 4 tareas, `npm run test` imprime también la puntuación de la instancia visible con la misma fórmula y un best_known propio. Pasa/falla no cambia. Este lote no cuenta; se recalibra con I r0 tras el cambio. **Recalibración (20:45):** routing 0,16, shop 0,35, packing 0,56, roster 0,89 (media 0,49; 0,25M; los 4 con done en 1,5 min). Las cuatro en banda, así que cuenta como I r0. Varianza alta entre las dos calibraciones (shop 0,81→0,35, packing 0,07→0,56), lo que justifica k=3. **Carril L3 lanzado 20:46** (`lane.sh L3`). **Fallo de infraestructura en L1 r2:** el contenedor de E r2 y el de durable en I r2 se mataron al llegar a 28 min sin resultado. Causa probable: el check final de la CLI (10 min) más carga alta; 20 + 10 pasaban del límite, y `runs/` solo se copiaba al terminar. Arreglo en el driver (21:50): `runSwarm` directo con 2 min de check final, `timeout` dentro del contenedor y copia de `runs/` siempre. Smoke S OK. E r2 e I r2 se repiten enteros (la decisión depende solo del fallo, no del score); los fallidos quedan en `*-infrafail`.
- **Resultado L3 (k=3, regla aplicada 22:00):** I 0,526 (0,24M/lote), R 0,439 (0,48M), E 0,452 (0,51M). E − I = −0,07, pierde las 3 parejas: **E no supera a I en L3**. Descriptivo: R − I = −0,09, E − R = +0,01. **Hallazgo:** todos los brazos acaban en ~2 min con < 10 % del presupuesto. El check público pasa en cuanto se supera a naive, así que no hay avisos de ayuda ni motivo para reasignar: los mecanismos de B se activan con checks en rojo, y en optimización el check está verde enseguida. En routing, E saca 0,02–0,03 en 2 de 3 lotes (por mirar en las trazas: ¿salida infactible?).
- **Resultado L1 (k=3, regla aplicada 22:40; r2 repetido tras el fallo de infraestructura):** I 0,419 (1,62M/lote), R 0,338 (1,49M), E 0,593 (4,94M). E − I por repetición: +0,41, +0,19, −0,08; media +0,17, gana 2 de 3. **E supera a I en L1.** Por tarea (E / I): ieh 0,73 / 0,78, ieh2 0,19 / 0,16, durable 0,64 / 0,53, ledger 0,81 / 0,22 (ledger es bimodal: persistir lleva a ~1,0). Descriptivo: R − I = −0,08; E − R = +0,26.
- **Veredicto B por familia:** sí en L1 (tareas con check en rojo), no en L3 (optimización, check verde enseguida). **Mecanismo, según las trazas:** R y E reasignan igual (2–4 carpetas por agente). E se distingue por el tablón: ~5 avisos de ayuda y 10–18 posts por lote en L1, frente a 0–1 avisos en L3; `finding` 1–2 veces por lote. E gasta 3 veces más tokens que I con el mismo presupuesto disponible: los aislados paran y dejan el ~75 % sin usar. **Lectura:** la ventaja de E en L1 encaja con "el tablón mantiene a los agentes trabajando" (persistencia inducida por los demás), no con transferencia de conocimiento. El control que falta es I con persistencia propia (reloj), por lo que se vio en la ronda A.
- **Dos trazas que matizan (22:50):**
  - **routing en L3 E:** en r1 la solución es factible pero apenas mejora a naive (poco esfuerzo). En r2 la coordinación hace daño: robin escribe `solve.py`, lo libera, y 5 min después finch lo reescribe entero; el resultado es peor que naive en 2 instancias y pasa de 10 s en otra. Es el fallo de pisar el trabajo, ahora inducido por la reasignación. `writeGuard` no lo para porque es un fichero completo.
  - **x1g-evidence en ieh (0,03 y 0,68):** 0 rechazos de la puerta y 0 `done`. Los 3 agentes agotan los 3M con un 39–47 % de llamadas al tablón (88 de trabajo en total). No es la trampa de la puerta: es sobrecoste de coordinación con agentes que no paran.
- **Los tres mecanismos del incidente, contra los datos:**
  - **ayuda al atascado:** solo se dispara con check en rojo (5 por lote en L1, 0–1 en L3, 19 en la ronda A); en L1 mantiene a los agentes trabajando;
  - **reasignación:** ocurre igual en R y E, y por sí sola **resta** (R − I = −0,08 en L1 y −0,09 en L3), además de pisar trabajo;
  - **transferencia de conocimiento:** no se observa (`finding` 1–2 veces por lote).
- **Calibración del lenguaje:** "coord < select" es una estimación puntual negativa con k=3 y mucha varianza, no un efecto establecido; la regla falla igual. Lo robusto es que R4 > todos los n=3 en ieh (sus 3 runs ≥ 0,87). En L1, la repetición por infraestructura movió el resultado en contra de E (el I r2 fallido no cambia mucho; el E r2 repetido es su peor lote): E cumple la regla, pero la regla es débil (k=3, +0,17, 3 veces los tokens).
- **Aislamiento real (más débil que lo pre-registrado; anotarlo al interpretar):**
  - cada run va en Docker (`murmur-batch:<hash de src>`) y solo ve su carpeta, más una copia filtrada de las credenciales (solo `openai-codex`);
  - los graders, las demás tareas y las demás ejecuciones quedan fuera de su alcance;
  - la red **no** está restringida a la API del modelo;
  - la puntuación se hace después, en el host, con `swarmtest.grading.grade`.

## Registro de campañas

| Fecha | Fase | Brazos | Tareas × k | Tokens | Resultado | Decisión |
|---|---|---|---|---:|---|---|
| 2026-09-30 | smoke adapter | murmur n=3, n=1 | bug_fixing × 1 | 148k | 1,0 / 1,0 (grader oculto) | adapter válido |
| 2026-09-30 | F0 smoke | relay n=2 (wake forzado) | relay × 1 | 37k | all_done, check OK | ruta idle→wake verificada |
| 2026-09-30 | F0 smoke | quiet n=1 | hello × 1 | 1k | quiescent | fin por quiescencia verificado |
| 2026-09-30 | F0 smoke | swarmtest murmur n=1 ± no-messaging | bug_fixing × 1 | 35k | 1,0 / 1,0 | variantes y hash de perfil OK |
| 2026-09-30 | F0 smoke | autotuner murmur n=1 (Docker) | toy_001 × 1 | 17k | passed, patch limpio | adapter OK; toy da 10 s por tarea, usar timeoutMs propio |
| 2026-09-30 | F1 (parada) | pi n=1, murmur n=1, n=3, n=3 sin mensajes | 8 × 2 (6/64 hechos) | ~0,5M | bug_fixing satura (1,0 todos); Pi durable 0,48 | parada: demasiados runs para buscar efectos gordos |
| 2026-09-30 | F1a criba (`20260930T185151Z-58c677b9`) | pi n=1 vs murmur n=3 | 3 workflow × 1 | 2,73M | durable 0,05 → 0,99; incremental 0,83 → 0,95; complex 0,885 = 0,885 (mismos 3 casos fallidos); delta +0,35, IC90 [+0,04, +0,66]; tokens ×7,8 | señal por la regla (durable ≥ 0,85). Pi durable 0,05 = paró tras 9 llamadas sin tocar engine.py. En durable el prompt dice "The solo Pi run implements all modules itself": murmur lo leyó como un implementador + dos revisores |
| 2026-09-30 | F1b (`20260930T193821Z-04146f7e`) | pi n=1, murmur n=3, murmur n=3 sin mensajes | 3 workflow × 1 | 3,87M | durable 0,44 / 0,59 / 0,65; incremental 0,918 / 0,962 / 0,887; complex 0,885 los tres (mismos 3 casos, igual que F1a: techo o contrato ambiguo). F1a+F1b pi vs murmur n=3: delta +0,21, IC90 [+0,03, +0,39], 2 ganadas 1 empate, tokens ×8,4. n3 vs sin mensajes: +0,006 [−0,04, +0,05] | el 0,987 de durable no se repite; el tablero no muestra efecto con k=1; complex no discrimina: fuera de las cribas. Transcripciones completas desde esta campaña |
| 2026-09-30 | F1c (`20260930T211945Z-1ede12d2`, parada en 2/8) | pi n=1, murmur n=3 c1/c2/c3 | 2 × 1 | 1,59M | incremental: Pi 0,805; c3 0,962 cortado por presupuesto (1,5M, 1,33M de cache read; 41 steers, 4 revividos) | swarmtest para la campaña si un run acaba por presupuesto; se sube a 3M y se encolan steers en modo `all` |
| 2026-10-01 | calibración (`20261001T064603Z-8fda3442`) | pi n=1, murmur n=3 | 4 tareas nuevas × 1 | ~0,7M | constrained_planning, data_analysis, feature_implementation, information_extraction: 1,0 en todo (Pi 10–20k tokens, 20–30 s) | saturadas. En swarmtest solo `durable` discrimina |
| 2026-10-01 | DeepSWE (lectura de trazas, sin coste) | — | — | 0 | Pi 0/12: harness OK, para tras 4–15 turnos declarando trabajo incompleto; reward binario; ArcSwarm 9/12 bloqueado en arranque | sin señal hoy; usable con crédito parcial + adapter murmur para pier |
| 2026-10-01 | calibración `data_analysis_hard` v1 (`20261001T075538Z-291d75ce`) | pi n=1 | 1 × 3 | 0,43M | 0,0 / 1,0 / 0,937 (el 0,0: Pi se rinde sin escribir salida) | demasiado fácil cuando Pi persiste → v2 con familias nuevas |
| 2026-10-01 | calibración `feature_implementation_hard` v1 (`20261001T080642Z-ccca7e96`) | pi n=1 | 1 × 3 | 0,39M | 0,821 / 0,875 / 0,903 (media 0,866); falla sobre todo fuzz y replay (interacciones) | demasiado fácil → v2 con operaciones nuevas que interactúan y más peso en escenarios largos |
| 2026-10-01 | calibración `data_analysis_hard` v2 (`20261001T081433Z-f7132825`) | pi n=1 | 1 × 3 | 0,47M | 0,04 / 1,0 / 0,413 (media 0,48). Los dos bajos: Pi se rinde tras 13 y 6 llamadas ("I wasn't able to complete", "the report is incomplete"); cuando persiste saca 1,0 | en banda por la media, pero bimodal: mide persistencia ante volumen, no razonamiento difícil; techo 1,0 para un sistema que persiste |
| 2026-10-01 | calibración `information_extraction_hard` v1 (`20261001T082033Z-ee8d2860`) | pi n=1 | 1 × 3 | 1,16M | 0,679 / 0,296 / 0,765 (media 0,58), continuo; Pi para tras 12–20 llamadas con el check público aún en rojo | calibrada |
| 2026-10-01 | calibración `constrained_planning_hard` v1 (`20261001T082842Z-5001af2c`) | pi n=1 | 1 × 3 | 0,29M | 0,391 / 0,361 / 0,202 (media 0,32), continuo; Pi para tras 8–11 llamadas sin plan factible y con el check público en rojo | calibrada (parte baja de la banda) |
| 2026-10-01 | calibración `feature_implementation_hard` v2 (`20261001T084457Z-bf8603a4`) | pi n=1 | 1 × 3 | 0,46M | 0,096 / 0,268 / 0,055 (media 0,14); Pi se rinde tras 10–16 llamadas ("not complete") con un contrato de 28 KB | demasiado difícil → v3: quitar unidades y commit parcial, mantener traslados y recalls |
| 2026-10-01 | calibración `feature_implementation_hard` v3 (`20261001T085954Z-91efd0c5`) | pi n=1 | 1 × 3 | 0,45M | 0,227 / 0,405 / 0,0 (media 0,21); contrato 25 KB; Pi se rinde tras 11–13 llamadas | justo bajo la banda → v4 sin recalls (~21 KB) |
| 2026-10-01 | calibración `feature_implementation_hard` v4 (`20261001T091411Z-ba74e288`) | pi n=1 | 1 × 3 | 0,51M | 0,099 / 0,076 / 0,682 (media 0,29); contrato 21,9 KB; dos runs se rinden tras 13–14 llamadas con el paquete roto, uno persiste | en banda por poco, bimodal como data_analysis_hard |
| 2026-10-01 | criba 1 (`20261001T101927Z-f44c2308` → `20261001T130110Z-80b74b2c`, semilla 20261006; un brazo + Pi por campaña desde las 12:46, 3 carriles desde las 13:47) | pi n=1 (k=11–13 por tarea); murmur n=3 por defecto, nomsg, c1–c6, x1–x4; c4 n=1 | 3 tareas (ieh, cph, durable) × 1 | 65,2M | Δ medio frente a la media de Pi (ieh 0,26, cph 0,35, durable 0,50): c5 +0,43 (2,46M), c1 +0,42 (2,04M), x1 +0,39 (1,37M), c3 +0,37 (2,56M), c2 +0,27, c4n1 +0,25 (0,36M), c4 +0,22, x4 +0,21 (0,91M), nomsg +0,21 (0,51M), x3 +0,15, por defecto +0,10 (1,19M), c6 +0,06, x2 −0,08. 10 de 39 runs de murmur cortados a 3M | la regla elige c5 y c1 para k=2; x1 está empatado dentro del ruido y es el más barato de los cuatro primeros; c4n1 es el control de atribución imprescindible. Pendiente de OK del usuario |
| 2026-10-01 | criba 2, réplica (`20261001T141956Z-895b323f` → `20261001T144902Z-3b8cf33c`, semilla 20261007, 3 carriles; 9 campañas fallaron al arrancar por una tarea a medio construir en `tasks/` y se relanzaron) | c1, x1 y c5 (n=3), cada uno con c4n1 | ieh, cph, durable (k=2 con la criba 1) + fih v4 × 1 | 26,0M | Δ frente a c4n1: c5 +0,22 (gana 4 de 4), c1 +0,09 (2 de 4), x1 −0,04 (1 de 4). c1 y x1 sacan 0,00 en ieh por un fichero roto | pasa c5. Siguiente paso: mecanismos contra el fichero roto (aislamiento frente a `writeGuard`) y más barato que c5, sobre ieh2 cuando esté calibrada |
| 2026-10-01 | calibración `information_extraction_hard2` v1 (`20261001T145854Z-eaf8ca35` Pi, `20261001T145858Z-d9c26c9f` c4n1) | pi n=1, c4n1 | 1 × 3 | ~2,3M | Pi 0,00 / 0,11 / 0,15 (media 0,09); c4n1 0,00 / 0,29 / 0,26 (media 0,18). Nadie suma ni un punto en las familias del ledger y ni siquiera se llega al nivel de ieh v1. El 0,00 de c4n1 es una sobrescritura accidental. Todos paran a los 3–6 min de 20 admitiendo que no han terminado. Contrato de 31,7 KB y solución de 34 KB en un fichero | demasiado difícil por volumen, no por razonamiento (lo mismo que fih v2–v4). Por debajo de la banda de c4n1 (0,3–0,6) |
| 2026-10-01 | calibración `ledger_reconciliation_hard` v1 (`20261001T154556Z-815af3aa` Pi, `20261001T154559Z-2d624144` c4n1) | pi n=1, c4n1 | 1 × 3 | ~1,4M | Pi 0,88 / 0,22 / 0,26 (media 0,45); c4n1 1,00 / 0,32 / 0,99 (media 0,77). Bimodal: quien insiste llega a ~1,0 y quien para pronto se queda en ~0,25 | por encima de la banda de c4n1 (0,3–0,6). Sirve para separar Pi de un agente persistente, no para ordenar candidatos fuertes. Mismo patrón que el resto: las tareas de contrato se saturan en cuanto se insiste. cph es la única con margen abierto (meseta en 0,37 por factibilidad y escalones de calidad frente a la referencia) |
| 2026-10-01 | criba 3, mecanismos contra el fichero roto (15 campañas `20261001T153217Z-2833b805` → `20261001T165207Z-cc8a515c`, semilla 20261012; agrupadas, luego por brazo, y recarga de 1 repetición) | c4g-guard n=1 (control, k=3–10 por tarea, media con todos sus runs); x1g-guard, x1g-lock, x1g-stale, x1g-parts y c5 (n=3) | ieh v1, fih v4 y durable × 2 (x1g-guard k=3 en ieh y fih) | 59,1M | media de las 3 tareas: c5 0,91 (2,69M), lock 0,84 (1,39M), guard 0,81 (1,52M), stale 0,79 (1,31M), parts 0,69 (0,98M; 0,00 en ieh), c4g 0,66 (0,37M). 5 runs cortados a 3M (c5 ×3: 2 en ieh y 1 en durable; guard en fih; stale en ieh) | candidatos: c5, guard, lock y stale; por score/M, lock = stale (0,60) > guard (0,53) > c5 (0,34). Ningún mecanismo supera a guard en +0,05, así que A, B y C no aportan por la regla. La base de la ronda 4 queda pendiente del OK del usuario |
| 2026-10-01 | smoke ronda 5 (`runs/20261001-170848-f6f1`, `-0eda`) | murmur n=2 con `findings` + `helpAfter: 3` (guionizada); trio n=3 por defecto | smoke × 1, trio × 1 | 35k + 155k | `finding` publica `[exit 0]` con la salida real; ayuda a las 3 llamadas sin check y al hacer `done` sin pase, entregada por attach; trio pasa con all_done | palancas OK; predicado del check: 21/21 casos (falsos verdes reales, envoltorios `time`/`timeout`/`env`/`VAR=`, check con comillas → contención exacta) |
| 2026-10-01 | smoke ronda 5b (`runs/20261001-171406-ebef`) | murmur n=2, el check ejecutado vía `finding` | smoke × 1 | 34k | sin avisos de ayuda: un check verde vía `finding` cuenta como ejecución del check | arreglo verificado (antes, x1g-coord habría pedido ayuda para agentes en verde) |
| 2026-10-01 | smoke ronda 5B (lote S = bug_fixing + data_analysis, Docker `murmur-batch:a5a95a58e2`) | b-swarm (4→2 agentes), c4g-guard × 2 aislados; guionizada de `checks` con `helpAfter: 3` | 1 lote E, 1 lote I, 1 guionizada | 111k + 51k + 34k | E: 1,0/1,0, reparto por claim, quiescent; I: 1,0/1,0 en paralelo; aviso de ayuda con la parte (`test -f part_a.txt`) | driver y `checks` OK. Arreglo: `cpSync` de Node falla en montajes de macOS → el run va en el disco del contenedor y `runs/` se copia de vuelta |
| 2026-10-01 | ronda 5A (22 campañas `20261001T172348Z-2db1b717` → `20261001T182345Z-f27c7ed5`, semilla 20261015, código `46e756b`) | x1g-select, x1g-coord, x1g-evidence (n=3); c4g-relay4, c4g-evidence (n=1) | ieh, ieh2 × 3; ieh, durable × 2 | 61,7M | coord < select (−0,15/−0,18); R4 > mejor n=3 (+0,3); E1 c4g-evidence 0,995 ieh (k6) / 0,99 ieh2 (k3) con 0 `done_refused` (¿el reloj?) | comunicación y enjambre no aportan; persistencia de un solo agente sí; probar c4g-clock |
| 2026-10-01 | ronda 5B (Docker `murmur-batch:a5a95a58e2`, lotes de 4 tareas, 4 agentes, 4×1,5M) | I (c4g-guard ×4 aislados), R (b-realloc), E (b-swarm) | L1 × 3, L3 × 3 (+ calibraciones de L2, saturada, y L3) | 28,3M | L1: E 0,593 / I 0,419 / R 0,338 (E gana 2/3); L3: I 0,526 / E 0,452 / R 0,439 (todos paran a los ~2 min) | E supera a I solo donde el check está en rojo; falta el control I + reloj |
