import { createContext, useContext, useState, useRef, type ReactNode } from 'react';
import { FINISHED_MOVEMENTS, FINISHED_BY_ID, type FinishedGoodsMovement } from '@/lib/finishedGoodsData';
import { allocate, confirmDispatch, reverseDispatch, reserved, physical, batchPhysical, type FulfillmentLedger } from '@/lib/fulfillment';
import type { SalesOrder, SalesOrderItem } from '@/types';
import { RAW_MATERIALS, RAW_MOVEMENTS, type RawMaterialMovement } from '@/lib/rawMaterialData';

interface InventoryContextValue {
  ledger: FulfillmentLedger;
  allocateStock: (order: SalesOrder, item: SalesOrderItem, quantity: number, batch: string, requestId?: string) => void;
  dispatch: (draft: Parameters<typeof confirmDispatch>[1]) => void;
  reverse: (id: string, date: string, reason: string) => void;
  postReceipt: (movement: FinishedGoodsMovement) => void;
  finishedMovements: FinishedGoodsMovement[];
  finishedPieces: Record<string, number>;
  updateFinishedPieces: (productId: string, pieces: number) => void;
  rawMovements: RawMaterialMovement[];
  addFinishedMovement: (movement: Omit<FinishedGoodsMovement, 'id'>) => void;
  addRawMovement: (movement: Omit<RawMaterialMovement, 'id'>) => void;
}
const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);
export function InventoryProvider({ children }: { children: ReactNode }) {
  // Same lifecycle as SalesOrdersContext: navigation-safe frontend simulation,
  // reset on refresh. Replace seed loading and add methods with API adapters later.
  const [ledger, setLedger] = useState<FulfillmentLedger>({ movements: FINISHED_MOVEMENTS, allocations: [], dispatches: [] });
  const current = useRef(ledger);
  const publish = (next: FulfillmentLedger) => { current.current = next; setLedger(next); };
  const finishedMovements = ledger.movements;
  const postReceipt = (movement: FinishedGoodsMovement) => {
    if (current.current.movements.some(m => m.id === movement.id)) return;
    const product = FINISHED_BY_ID.get(movement.productId);
    if (!product || movement.type !== 'IN' || !movement.id || !Number.isFinite(Date.parse(movement.date)) || product.unit !== movement.unit || movement.quantity <= 0 || !Number.isFinite(movement.quantity) || movement.date < product.openingDate) throw new Error('Receipt product, unit, quantity or date is invalid.');
    publish({ ...current.current, movements: [...current.current.movements, movement] });
  };
  const [finishedPieces, setFinishedPieces] = useState<Record<string, number>>({});
  const updateFinishedPieces = (productId: string, pieces: number) => {
    if (!FINISHED_BY_ID.has(productId) || !Number.isSafeInteger(pieces) || pieces <= 0) throw new Error('Invalid pieces');
    setFinishedPieces(current => ({ ...current, [productId]: pieces }));
  };
  const [rawMovements, setRaw] = useState(RAW_MOVEMENTS);
  const addFinishedMovement = (movement: Omit<FinishedGoodsMovement, 'id'>) => {
    const product = FINISHED_BY_ID.get(movement.productId);
    if (!product || product.unit !== movement.unit || !Number.isFinite(movement.quantity) || movement.quantity <= 0) throw new Error('Invalid finished goods movement');
    if (movement.date < product.openingDate) throw new Error('Movement precedes reference opening.');
    if (movement.type === 'OUT') { const balance = physical(current.current, product.id); if (balance === null || movement.quantity > balance - reserved(current.current, product.id) || movement.quantity > (batchPhysical(current.current, product.id, 'reference-stock') ?? 0) - reserved(current.current, product.id, 'reference-stock')) throw new Error('Stock OUT exceeds known unreserved stock.'); }
    publish({ ...current.current, movements: [...current.current.movements, { ...movement, batch: 'reference-stock', id: crypto.randomUUID() }] });
  };
  const addRawMovement = (movement: Omit<RawMaterialMovement, 'id'>) => {
    const material = RAW_MATERIALS.find(m => m.id === movement.materialId);
    if (!material || material.category !== movement.category || material.unit !== movement.unit || !Number.isFinite(movement.quantity) || movement.quantity <= 0) throw new Error('Invalid raw material movement');
    setRaw(current => [...current, { ...movement, materialName: material.name, id: crypto.randomUUID() }]);
  };
  return <InventoryContext.Provider value={{ ledger, postReceipt, allocateStock: (order, item, quantity, batch, requestId) => publish(allocate(current.current, order, item, quantity, batch, requestId)), dispatch: draft => publish(confirmDispatch(current.current, draft)), reverse: (id, date, reason) => publish(reverseDispatch(current.current, id, date, reason)), finishedMovements, finishedPieces, updateFinishedPieces, rawMovements, addFinishedMovement, addRawMovement }}>{children}</InventoryContext.Provider>;
}
export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('InventoryProvider is required');
  return context;
}
