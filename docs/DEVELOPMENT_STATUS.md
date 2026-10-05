# Development Status

Repository baseline: routed frontend pages exist for all nine modules. No backend source or verified end-to-end persistence is present. API attempts with mock fallback are not marked Integrated.

## Module status

- Dashboard: frontend/mock role-specific widgets and navigation; static metrics, not synchronized with orders/inventory. Backend pending.
- Sales Orders: frontend/mock fast-entry multi-line form, validation, filters, sorting, pagination and CSV export; shared navigation-safe Context. Backend pending.
- Job Cards: list/detail, stage display and Receptionist/Admin required-stage toggles; API reads/writes with mock/local fallback. Backend pending; lifecycle and persistence need review.
- Stock: frontend/reference variant inventory, Stock IN/OUT, history, monthly reporting/export and open-order demand comparison. Backend pending.
- Raw Material: frontend/reference category/family views, Stock IN/OUT, balances, movement history and monthly CSV reports. Backend pending.
- Recycling: waste/granule read views and summaries; API/mock fallback. No intake/production posting workflow. Backend pending.
- Costing: cost/rate read views and rate entry; API/mock/local fallback. No cost recalculation. Backend pending.
- Track & Trace: search and history display; API lookup with seeded examples on failure. Backend pending.
- Masters: mock item/model/customer/supplier/department/user add/edit; page-local state. Backend pending; shared master integration absent.

## Recently Completed

Available in the inspected baseline (not a claim about implementation dates): multi-line sales entry, separate finished-goods/raw-material ledgers, workbook-derived reference loading and finished-goods demand comparison.
Documentation baseline now records actual architecture, models and integration gaps.

## Currently In Progress

Overall phase: frontend workflow validation. No separate active implementation task is inferred from this snapshot.

## Next Priorities

- Confirm authoritative inventory reservation/issue/production/dispatch rules and source-data ambiguities.
- Plan durable orders, masters and inventory integration at the existing state boundaries.
- Replace silent mock/local write fallback with explicit success/failure behavior during integration.
- Connect dashboard/recycling/master data flows and verify server permissions.

## Review limitations

Local orders and inventory reset on refresh; page-local master edits reset on remount. Job-card stage and costing-rate writes may appear updated after an API failure.
Authentication is not restored from stored tokens. Role-filtered navigation is not server access control.
Recycling and costing summary month labels do not filter loaded rows by month; Dashboard uses separate demo currency/metrics.

## Verification

Documentation-only changes do not change application behavior. Use README commands for typecheck, build and the finished-goods data check; no lint setup exists.

Baseline checks passed: TypeScript without emit, Vite production build to a temporary directory, finished-goods checks, Markdown links and Git whitespace checks. Standard npm run build could not write the existing tsconfig.tsbuildinfo (EPERM); the separate checks avoid that file. Vite reported a bundle-size warning.
