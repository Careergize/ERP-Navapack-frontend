import { createContext, useContext, useState, type ReactNode } from 'react';
import { FINISHED_MOVEMENTS, FINISHED_BY_ID, type FinishedGoodsMovement } from '@/lib/finishedGoodsData';
import { RAW_MATERIALS, RAW_MOVEMENTS, type RawMaterialMovement } from '@/lib/rawMaterialData';

interface InventoryContextValue {
  finishedMovements: FinishedGoodsMovement[];
  rawMovements: RawMaterialMovement[];
  addFinishedMovement: (movement: Omit<FinishedGoodsMovement, 'id'>) => void;
  addRawMovement: (movement: Omit<RawMaterialMovement, 'id'>) => void;
}
const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);
export function InventoryProvider({ children }: { children: ReactNode }) {
  // Same lifecycle as SalesOrdersContext: navigation-safe frontend simulation,
  // reset on refresh. Replace seed loading and add methods with API adapters later.
  const [finishedMovements, setFinished] = useState(FINISHED_MOVEMENTS);
  const [rawMovements, setRaw] = useState(RAW_MOVEMENTS);
  const addFinishedMovement = (movement: Omit<FinishedGoodsMovement, 'id'>) => {
    const product = FINISHED_BY_ID.get(movement.productId);
    if (!product || product.unit !== movement.unit || !Number.isFinite(movement.quantity) || movement.quantity <= 0) throw new Error('Invalid finished goods movement');
    setFinished(current => [...current, { ...movement, id: crypto.randomUUID() }]);
  };
  const addRawMovement = (movement: Omit<RawMaterialMovement, 'id'>) => {
    const material = RAW_MATERIALS.find(m => m.id === movement.materialId);
    if (!material || material.category !== movement.category || material.unit !== movement.unit || !Number.isFinite(movement.quantity) || movement.quantity <= 0) throw new Error('Invalid raw material movement');
    setRaw(current => [...current, { ...movement, materialName: material.name, id: crypto.randomUUID() }]);
  };
  return <InventoryContext.Provider value={{ finishedMovements, rawMovements, addFinishedMovement, addRawMovement }}>{children}</InventoryContext.Provider>;
}
export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('InventoryProvider is required');
  return context;
}
