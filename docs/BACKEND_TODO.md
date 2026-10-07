# Backend Integration TODO

Planned work, not implemented APIs or database design. Check items only after verified integration.

## Sales Orders

- [ ] Durable order/header/line persistence and authoritative order numbers.
- [ ] Shared customer, employee/marketing and finished-goods master integration.
- [ ] Persist requisition references, validate totals/units and define order status lifecycle.
- [ ] Link orders to job cards; decide whether external accounting export is required.

## Finished Goods Stock

- [ ] Authoritative variant master retaining source provenance and repeated identities.
- [ ] Confirm and persist optional pieces-per-package metadata independently of ledger quantities and units.
- [ ] Transactional Stock IN/OUT, validation, balances and movement audit history.
- [ ] Monthly reports and server-side demand projection.
- [ ] Reconcile unknown Packing openings/dates and ambiguous source records before import.
- [ ] Define cumulative reservations/allocation across competing orders.

## Consumables

- [ ] Persist consumable masters, categories, units, opening balances and stock movement audit history.
- [ ] Validate dates, positive quantities and posted unit/opening immutability server-side.

## Raw Material

- [ ] Master with specific Virgin Material grades, Recycled Granules and Ink.
- [ ] Durable Stock IN/OUT, balances, movement history and monthly reports.
- [ ] Confirm unknown openings, minimum levels and treatment of legacy demo granules.
- [ ] Link confirmed store issues/production consumption and recycling output to movements.

## Job Cards and Production

- [ ] Verify existing frontend read/stage-write expectations with actual server contracts.
- [ ] Persist per-card model/points routing, requiredMaterials, dynamic productionStages, approvals, handovers and stage waste.
- [ ] Supply authoritative BOM/points requirements and availability; define partial issue and replenishment rules.
- [ ] Enforce role permissions, chronology, immutable completed stages, units/conversions and transactional lifecycle transitions server-side.
- [ ] Persist durable activity history and prevent duplicate/replayed material issues or stock transfers.
- [ ] Resolve finished-goods variant references and post accepted quantity as Stock IN with job/sales-order/customer/model/product/batch references.
- [ ] Connect stage waste/recycling quantities to real Recycling transactions; keep quantities and units reconciled.

## Recycling

- [ ] Durable waste intake, collection, granule production and disposition records.
- [ ] Confirm restock/external sale rules and reconcile batch quantities with raw inventory.
- [ ] Supply accurate filtered summaries.

## Costing

- [ ] Durable costing records and manually entered exchange-rate history.
- [ ] Confirm local currency, cost/rate effective dates and authoritative calculation rules.
- [ ] Report write failures accurately; decide how rate changes affect existing records.

## Masters, Dashboard, Trace and Authentication

- [ ] Shared durable item/model/customer/supplier/department/user masters and validated relationships.
- [ ] Live role-scoped dashboard metrics; remove independent demo values.
- [ ] Trace history linked to real order/job/material/granule events.
- [ ] Verify real authentication, session restoration, token expiry/refresh and complete 401 cleanup.
- [ ] Enforce permissions server-side; navigation filtering is insufficient.
- [ ] Replace fallback/local success paths with explicit production error handling.

## Important Inventory Decision

Confirm the authoritative workflow before implementation:
Sales Order -> Job Card -> Production -> Store Issue -> Finished Goods -> Dispatch.

This is a decision checklist, not a proven posting sequence. Determine event ordering, exactly when demand becomes reservation, when raw materials are deducted, when finished goods are received/deducted, and how cancellation/reversal avoids duplicate posting.
Sales Order creation itself must not deduct stock. Current demand comparison creates no reservations.
