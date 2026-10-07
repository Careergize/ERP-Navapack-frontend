# Business Rules

This separates verified frontend behavior from decisions still needing confirmation.

## Sales Orders

- Customer name and marketing person are required. Marketing Person identifies who brought the customer; it is currently recorded as a name.
- Customer type must be B2B or B2C; order date defaults to the browser's local current date and must parse as a valid date.
- Multiple items are supported; at least one selected item with ID/name and unit is required.
- Quantity must be finite and greater than zero. Editable unit price must be finite and nonnegative; zero is allowed.
- Line total = quantity x unit price, rounded to two decimals. Order total sums rounded line totals and rounds to two decimals.
- Requisition order is optional text. New orders start Open with no job-card links.
- The form warns when requested quantity exceeds stock; this does not block an order.

## Inventory terminology and posting

Stock means Finished Goods only. Raw Material is separate production input inventory, classified as Virgin Material, Recycled Granules or Ink.
Stock IN/OUT belongs to the module where it is recorded.

Creating a Sales Order creates demand only: no physical Stock OUT and no actual reservation. Never double-deduct stock.
Each open line compares independently with the full current stock; competing lines are not cumulatively allocated.
Required Qty = max(0, ordered quantity - max(0, available stock)).
Unknown stock, unlinked items and unit mismatches have no calculated shortage.

Balances = opening + IN - OUT, with six-decimal rounding. Monthly opening carries forward earlier movements; monthly IN/OUT use the selected month. Unknown opening or a month before the reference opening date produces an unknown balance, not zero. Do not add incompatible units.

Movement entry requires a selected product/material, date and positive finite quantity. The UI disallows dates before its reference opening date and fixes the unit from the selected record. Stock OUT exceeding the known balance warns but is currently allowed, so negative balances are possible. This is a simulation behavior; production enforcement needs a business decision.

Finished Goods Pieces means optional pieces per package in this frontend. It is positive whole-number metadata, initially unrecorded, edited on Stock IN and read-only on Stock OUT. It does not multiply stock quantities or infer counts from packaging dimensions. Raw Material uses Stock in Hand only as a display label; balances and stored categories are unchanged.

## Finished Goods and source fidelity

Categories are Carrier Bags, Flat Bags and Packing. Identity includes category, subgroup, customer, item details, size, brand, packing size and unit. Preserve stable IDs and source provenance; repeated identities must not be silently merged.
Legacy name matching is accepted only when unique for the unit. See [source interpretation](finished-goods-reference.md) for customer inheritance, inferred units and unknown Packing balances.

## Consumables

Categories are Imported Spare and Local Spare; units are Each, Both, Litres and Kilos. New records require a name, opening date and nonnegative opening balance. Minimum level is optional and nonnegative. Balances use opening + IN - OUT, separately per item/unit. After movements exist, edits cannot change unit, opening balance or opening date. Stock OUT over balance warns and remains allowed, matching the existing inventory simulation.

## Raw Material

Preserve specific client grades rather than replacing them with generic names such as HDPE Resin.
The extractor maps HDPE, PP, LDPE, LLDPE, MASTER BATCH and ADDITIVES to Virgin Material; INKS & SOLVENTS to Ink; RECYCLE MATERIAL and CRUSHED MATERIAL to Recycled Granules.
Workbook references supply input inventory; legacy recycled-granule demo records remain separately identified. Blank/unrecorded balances stay unknown.

## Production and other modules

Job-card stage choices are Extrusion, Printing, Packaging, Stock and Ready to Sale. Receptionist/Admin can toggle required stages on a particular card without editing model defaults. The detail page displays a fixed stage order; a drag icon does not implement reordering.
Recycling currently displays waste and granule records; it does not post raw-material movements.
Costing displays supplied totals; entering an exchange rate does not recalculate existing costing records.
Confirm reservation, store issue, production completion and dispatch posting rules before backend work; the full inventory lifecycle is not implemented.
