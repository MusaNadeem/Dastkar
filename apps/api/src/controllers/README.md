# Controllers

Business logic per resource, one file per route group (e.g. `productController.js`, `orderController.js`, `customOrderController.js`, `ipReportController.js`, `adminController.js`).

Rules (CLAUDE.md §7):
- Validate input with zod **before** touching the DB.
- Enforce ownership (seller A ≠ seller B) in addition to RLS.
- Call `auditService.logMoneyEvent()` on every money-adjacent mutation.
- Translate snake_case (DB) ↔ camelCase (JS) at this layer / the `db` layer.

Keep controllers thin: validate → authorize → call db/services → shape response.
