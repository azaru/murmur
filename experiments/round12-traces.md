| run | task | arm | score | tokens | min | end | agent | calls | board % | checks | green at | after green | last check | overwrites | nudges |
|---|---|---|---:|---:|---:|---|---|---:|---:|---:|---:|---:|---|---:|---:|
| eb5e6f59/0001 | information_extraction_hard_blind | pi/n=1 | 0.515 | 0.18M | 3.6 | succeeded | pi | 14 | 0 | 4 | 14 | 0 | green | 1 | 0 |
| eb5e6f59/0002 | information_extraction_hard_blind | murmur[solo-clock]/n=1 | 0.758 | 0.40M | 4.2 | all_done | wren | 24 | 4 | 4 | 6 | 18 | green | 0 | 0 |
| eb5e6f59/0003 | information_extraction_hard_blind | murmur[solo-clock-tools]/n=1 | 0.797 | 0.56M | 7.7 | all_done | wren | 29 | 3 | 3 | 8 | 21 | green | 0 | 0 |
| eb5e6f59/0004 | information_extraction_hard_blind | murmur[solo-clock-tools-noguard]/n=1 | 0.926 | 1.37M | 9.8 | all_done | wren | 53 | 2 | 0 | - | - | none | 0 | 0 |
| eb5e6f59/0005 | information_extraction_hard_blind | murmur[solo-clock-append]/n=1 | 1.000 | 1.54M | 12.6 | all_done | wren | 48 | 2 | 7 | 18 | 30 | green | 0 | 0 |
| d6a79cc8/0001 | information_extraction_hard_blind | pi/n=1 | 0.463 | 0.09M | 3.7 | succeeded | pi | 9 | 0 | 2 | 9 | 0 | green | 0 | 0 |
| d6a79cc8/0002 | information_extraction_hard_blind | murmur[solo-clock]/n=1 | 0.912 | 1.27M | 10.1 | all_done | wren | 46 | 2 | 5 | 9 | 37 | green | 1 | 0 |
| d6a79cc8/0003 | information_extraction_hard_blind | murmur[solo-clock-tools]/n=1 | 0.543 | 1.11M | 9.8 | all_done | wren | 45 | 2 | 8 | 7 | 38 | green | 0 | 0 |
| d6a79cc8/0004 | information_extraction_hard_blind | murmur[solo-clock-tools-noguard]/n=1 | 0.965 | 2.01M | 10.1 | all_done | wren | 52 | 2 | 6 | 14 | 38 | green | 0 | 0 |
| d6a79cc8/0005 | information_extraction_hard_blind | murmur[solo-clock-append]/n=1 | 0.402 | 1.21M | 8.4 | quiescent | wren | 44 | 0 | 7 | 8 | 36 | green | 0 | 0 |
| 91dce613/0001 | information_extraction_hard_blind | pi/n=1 | 0.526 | 0.08M | 2.7 | succeeded | pi | 8 | 0 | 1 | 8 | 0 | green | 0 | 0 |
| 91dce613/0002 | information_extraction_hard_blind | murmur[solo-clock]/n=1 | 1.000 | 1.27M | 9.8 | all_done | wren | 44 | 2 | 4 | 14 | 30 | green | 2 | 0 |
| 91dce613/0003 | information_extraction_hard_blind | murmur[solo-clock-tools]/n=1 | 0.920 | 0.53M | 6.3 | quiescent | wren | 27 | 0 | 4 | 9 | 18 | green | 0 | 0 |
| 91dce613/0004 | information_extraction_hard_blind | murmur[solo-clock-tools-noguard]/n=1 | 0.999 | 0.91M | 8.9 | all_done | wren | 38 | 3 | 3 | 7 | 31 | green | 0 | 0 |
| 91dce613/0005 | information_extraction_hard_blind | murmur[solo-clock-append]/n=1 | 1.000 | 1.91M | 11.1 | all_done | wren | 62 | 2 | 10 | 14 | 48 | green | 0 | 0 |
| b6187a74/0001 | information_extraction_hard_blind | pi/n=1 | 0.270 | 0.28M | 2.7 | succeeded | pi | 20 | 0 | 4 | 20 | 0 | green | 0 | 0 |
| b6187a74/0002 | information_extraction_hard_blind | murmur[solo-clock]/n=1 | 0.965 | 0.85M | 8.4 | quiescent | wren | 38 | 0 | 3 | 9 | 29 | green | 1 | 0 |
| b6187a74/0003 | information_extraction_hard_blind | murmur[solo-clock-tools]/n=1 | 0.727 | 0.80M | 6.0 | quiescent | wren | 37 | 0 | 4 | 9 | 28 | green | 0 | 0 |
| b6187a74/0004 | information_extraction_hard_blind | murmur[solo-clock-tools-noguard]/n=1 | 1.000 | 1.07M | 8.8 | all_done | wren | 46 | 2 | 5 | 17 | 29 | green | 0 | 0 |
| b6187a74/0005 | information_extraction_hard_blind | murmur[solo-clock-append]/n=1 | 0.971 | 1.26M | 8.4 | all_done | wren | 53 | 2 | 3 | 9 | 44 | green | 0 | 0 |

Why each agent stopped:
- eb5e6f59/0001 pi/n=1 pi: last text: Implemented `extract.py` and confirmed `npm run test` passes. The smoke check verifies execution and output format, not extracted values.
- eb5e6f59/0002 murmur[solo-clock]/n=1 wren: done: Implemented extract.py according to SCHEMA.md using only the Python standard library. Verified it runs under python3 -I, compiles, and passes npm run test.
- eb5e6f59/0003 murmur[solo-clock-tools]/n=1 wren: done: Implemented extract.py with standard-library parsing, normalization, grouping, event/deduplication logic, invoice calculations, and JSON output. `python3 -m py_compile extract.py` and `npm run test` p
- eb5e6f59/0004 murmur[solo-clock-tools-noguard]/n=1 wren: done: Implemented the standard-library-only extractor in extract.py, including document parsing, normalization, grouping, event ordering, deduplication, and financial entries. Verified it compiles and passe
- eb5e6f59/0005 murmur[solo-clock-append]/n=1 wren: done: Implemented the standard-library-only extractor in extract.py, covering document parsing, normalization, grouping, deduplication, event ordering, and record output. Verified with npm run test and targ
- d6a79cc8/0001 pi/n=1 pi: last text: Implemented `extract.py` to parse the supported document types, normalize fields, group cases, and write JSON output. `npm run test` passes.
- d6a79cc8/0002 murmur[solo-clock]/n=1 wren: done: Implemented extract.py for corpus discovery, normalization, mail/chat/form/invoice parsing, case grouping and merging, event ordering, deduplication, financial entries, and normalized JSON output. Ver
- d6a79cc8/0003 murmur[solo-clock-tools]/n=1 wren: done: Implemented extract.py according to SCHEMA.md, including document parsing, normalization, grouping, event ordering/deduplication, financial entries, and JSON output. Verified it runs under python3 -I 
- d6a79cc8/0004 murmur[solo-clock-tools-noguard]/n=1 wren: done: Implemented extract.py according to SCHEMA.md, including document parsing, normalization, case grouping, event ordering, deduplication, and JSON output. Verified it with python3 -I and npm run test.
- d6a79cc8/0005 murmur[solo-clock-append]/n=1 wren: last text: Implemented `extract.py` to parse and normalize the documented support documents, group them into cases, and write the JSON output. `npm run test` passes.
- 91dce613/0001 pi/n=1 pi: last text: Implemented `extract.py` to parse the supported document types, normalize fields, group cases, and write JSON records. `npm run test` passes.
- 91dce613/0002 murmur[solo-clock]/n=1 wren: done: Implemented `extract.py` to discover and parse supported documents, normalize fields and money/dates, group documents through case/order references, deduplicate messages, and emit ordered case records
- 91dce613/0003 murmur[solo-clock-tools]/n=1 wren: last text: Implemented `extract.py` to parse and normalize the supported document types, group documents into cases, and write the JSON output. `npm run test` passes.
- 91dce613/0004 murmur[solo-clock-tools-noguard]/n=1 wren: done: Implemented extract.py according to SCHEMA.md, including document parsing, normalization, grouping, event ordering, deduplication, and JSON output. Verified with py_compile and npm run test.
- 91dce613/0005 murmur[solo-clock-append]/n=1 wren: done: Implemented extract.py per SCHEMA.md, including document parsing, normalization, grouping, deduplication, event ordering, and JSON output. Verified with `npm run test` and a chat timezone smoke test.
- b6187a74/0001 pi/n=1 pi: last text: Implemented `extract.py` and verified that `npm run test` passes. The smoke test confirms the output format, but does not validate extracted values.
- b6187a74/0002 murmur[solo-clock]/n=1 wren: last text: Implemented `extract.py` to parse the supported document types, normalize and group case data, and write the documented JSON format. `npm run test` passes.
- b6187a74/0003 murmur[solo-clock-tools]/n=1 wren: last text: Implemented `extract.py` to parse the documented document types, normalize and group case data, and write the requested JSON records. `npm run test` and an isolated-mode run both pass.
- b6187a74/0004 murmur[solo-clock-tools-noguard]/n=1 wren: done: Implemented extract.py to parse the documented document types, normalize fields and timestamps, group cases through references, apply ordered updates and corrections, deduplicate messages, and emit sc
- b6187a74/0005 murmur[solo-clock-append]/n=1 wren: done: Implemented the standard-library-only extractor in extract.py, including document parsing, normalization, grouping, deduplication, event ordering, and JSON output. Verified it with `npm run test` and 
