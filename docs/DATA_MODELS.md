# Frontend Data Models

These are current TypeScript/frontend or mock models, not database schemas. API consumer types are not proof of implemented backend contracts.

## Sales orders (src/types/index.ts; src/lib/salesOrders.ts)

SalesOrder: id, orderNumber, customerName, date, Open/Completed status and jobCardIds; optional customerId, marketingPersonName, B2B/B2C customerType, requisitionOrder, items and orderTotal support legacy seed records.
SalesOrderItem: id, optional itemId (finished-goods variant reference), itemName, quantity, unit, unitPrice and totalPrice.
SalesOrderDraft contains form customer/date/marketing/type/requisition fields and items; customerType temporarily permits an empty value.
New orders get a UUID-derived ID and locally generated SO number (maximum numeric suffix + 1).
totalPrice = round(quantity x unitPrice, 2); orderTotal = round(sum of rounded line totals, 2). orderSummary currently returns identical subtotal/total, without tax or discount calculation.

## Finished goods (src/lib/finishedGoodsData.ts)

FinishedGood identifies a variant with id, category (carrier-bags/flat-bags/packing), subgroup, customer, itemDetails, size, brand, packingSize and unit.
openingStock is number or null; openingDate anchors the reference ledger. sourceSheet, sourceRow, sourceCustomer, customerInherited, sourceUnit, sourceClosingStock and dataNotes preserve provenance and ambiguity.

FinishedGoodsMovement: id, productId -> FinishedGood.id, date, type (IN/OUT), quantity, unit; optional customer, reference and remarks.
InventoryContext validates product existence, matching unit and positive finite quantity on additions.

## Raw material (src/lib/rawMaterialData.ts)

RawMaterial: id, name, family, category (virgin/recycled/ink), unit, nullable openingStock and openingDate; optional minLevel, sourceRow and nullable sourceClosingStock.
RawMaterialMovement: id, date, materialId -> RawMaterial.id, materialName, category, movementType (IN/OUT), quantity, unit, reference and remarks.
InventoryContext validates material/category/unit and positive finite quantity; it takes materialName from the master.

Both balance helpers return openingStock, stockIn, stockOut and currentStock. For known openings, currentStock = openingStock + stockIn - stockOut (six-decimal rounding).
Monthly opening adds signed movements before month start; monthly totals use dates starting with the selected month.
Unknown reference opening or a month before openingDate returns null opening/current balances while retaining movement totals.

## Demand projection (src/pages/Stocks/SalesOrderDemand.tsx)

There is no named SalesOrderDemand interface. A derived row extends an open SalesOrderItem with product, available, required, status, orderNumber and customer.
Product links by variant ID, with unique legacy-name/unit fallback. available is null if unlinked, mismatched or unrecorded.
required = max(0, quantity - max(0, available)) when available is known. Rows independently compare physical stock; no reservation ledger exists.

## Production and trace (src/types/index.ts)

JobCard: id, jobCardNumber, salesOrderId -> SalesOrder.id, modelName, qty, status, department and stages.
JobCardStatus is Draft/PendingApproval/Approved/Issued/InProduction/Completed; these values do not imply implemented transitions.
JobCardStageEntry: stage, sequenceOrder, required and Pending/InProgress/Complete status.
Stage enumerates Extrusion/Printing/Packaging/Stock/Ready to Sale.
TraceResult: traceId, SalesOrder/JobCard/MaterialBatch/GranulesBatch type, currentStatus, optional currentStage and label/timestamp history. Lookup results are API/mock data, not computed from Context records.

## Recycling and costing (src/types/index.ts)

WasteEntry: id, jobCardNumber (text reference), stage, wasteQty, kg unit, wasteType, sentToRecycling and date.
GranulesBatch: id, batchNumber, date, inputWasteQty, granulesProducedKg and destination; optional reEnteredQty, soldQty, soldTo. These fields do not automatically change inventory.
Recycling summaries sum unsent wasteQty and all loaded granulesProducedKg; despite month labels, there is no month filter.

CostingRecord: id, itemOrModel, rawMaterialCost, productionCost, otherCost, USD/NGN/GHS/ZAR currency, exchangeRateUsed, totalCostLocal and lastUpdated. totalCostLocal is supplied data; CostingPage does not calculate it.
ExchangeRate: id, currency, rate, date, enteredBy. New local entries prepend to history; existing costs are unchanged.

## Masters and user (src/types/index.ts)

Item: id, name, unit, category. This generic demo master is separate from FinishedGood.
Model: id, name, billOfMaterials (text), stages.
Customer: id, name, contactPerson, phone.
Supplier: id, name, materialSupplied, phone.
Department: id, name, assignedProductionManager (text).
MasterUser: id, name, email, role, optional department.
User: id, name, role, optional department; held by AuthContext.
Role: receptionist, production_manager, store_keeper, production_operator, recycling_operator, accounts or admin.
Master page edits are page-local; name fields are not enforced foreign-key relationships.
