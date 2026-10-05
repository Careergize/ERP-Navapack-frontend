import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { MOCK_SALES_ORDERS } from '@/lib/mockData';
import { buildSalesOrder, type SalesOrderDraft } from '@/lib/salesOrders';
import type { SalesOrder } from '@/types';

interface OrdersContextValue {
  orders: SalesOrder[];
  createSalesOrder: (draft: SalesOrderDraft) => SalesOrder;
}
const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);
export function SalesOrdersProvider({ children }: { children: ReactNode }) {
  // Temporary frontend-only store: survives navigation, resets on browser refresh.
  // TODO: Load orders and replace createSalesOrder with backend API calls.
  const [orders, setOrders] = useState<SalesOrder[]>(MOCK_SALES_ORDERS);
  const current = useRef(orders);
  const createSalesOrder = (draft: SalesOrderDraft) => {
    const order = buildSalesOrder(draft, current.current);
    current.current = [order, ...current.current];
    setOrders(current.current);
    return order;
  };
  return <OrdersContext.Provider value={{ orders, createSalesOrder }}>{children}</OrdersContext.Provider>;
}
export function useSalesOrders() {
  const value = useContext(OrdersContext);
  if (!value) throw new Error('SalesOrdersProvider is required');
  return value;
}
