import { useSalesOrders } from '@/context/SalesOrdersContext';

export function SalesOrderDemand() {
  const { orders } = useSalesOrders();
  // TODO: Replace this demand projection with backend inventory requirements.
  // Demand is deliberately separate from physical stock movements and balances.
  const requirements = orders.flatMap(order => (order.items ?? []).map(item => ({ ...item, orderNumber: order.orderNumber, customer: order.customerName, date: order.date })));
  return <section className="overflow-hidden rounded-card border border-gray-200 bg-white" aria-label="Sales Order Demand">
    <div className="border-b border-gray-200 p-4"><h2 className="font-semibold text-navy">Sales Order Demand</h2><p className="mt-1 text-xs text-gray-500">Pending issue · frontend simulation. Physical stock is unchanged.</p></div>
    {requirements.length === 0 ? <p className="p-6 text-sm text-gray-500">Create a sales order to see its stock requirements here.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
      <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500"><tr>{['Order', 'Customer', 'Item', 'Quantity', 'Unit', 'Per-unit price', 'Total price', 'Date', 'Status'].map(label => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead>
      <tbody className="divide-y divide-gray-100">{requirements.map(item => <tr key={`${item.orderNumber}-${item.id}`} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium text-navy">{item.orderNumber}</td><td className="px-4 py-3">{item.customer}</td><td className="px-4 py-3">{item.itemName}</td><td className="px-4 py-3">{item.quantity}</td><td className="px-4 py-3">{item.unit}</td><td className="px-4 py-3">{item.unitPrice.toFixed(2)}</td><td className="px-4 py-3">{item.totalPrice.toFixed(2)}</td><td className="px-4 py-3">{item.date}</td><td className="px-4 py-3 text-amber-700">Pending Issue</td></tr>)}</tbody>
    </table></div>}
  </section>;
}
