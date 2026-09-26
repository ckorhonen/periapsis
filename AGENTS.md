# Repository agent guide

## Repository workflow and completion

The Next.js app keeps UI/demos under `src/`, orbital calculations in `src/lib/orbital/`, and uses Canvas/Three.js/KaTeX rendering. Use `npm ci` with the lockfile, then dev/build/start/lint scripts as relevant. No test script is defined. Match actual package versions rather than assuming the README framework label is current.

Physics edits need unit/coordinate checks and known analytical cases; rendering edits need inspection of diagrams, labels, controls, and several animation times. A build or nonblank canvas does not establish orbital correctness. Preserve educational scope and report remaining numerical/browser gaps.

Continue the authorized change through relevant validation and repair of failures it causes; preserve unrelated work. Report checks actually run, commands only inspected, and exact missing prerequisites. Ask only when a material decision, missing authorization, or required input blocks progress; continue independent reversible work. Existing mandatory contribution and validation gates still apply.
