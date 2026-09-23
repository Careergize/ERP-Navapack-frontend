import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { MOCK_SALES_ORDERS } from "@/lib/mockData";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { SalesOrder } from "@/types";

export function SalesOrderList() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<SalesOrder[]>("/sales-orders/")
      .then(({ data }) => setOrders(data))
      // No backend yet in demo mode — fall back to mock data instead of an empty screen.
      .catch(() => setOrders(MOCK_SALES_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy">Sales Orders</h1>
        <Link
          to="/sales-orders/new"
          className="flex items-center gap-2 rounded-card bg-navy px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={16} /> New order
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-gray-500">Loading orders…</p>}

        {!loading && orders.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500">
              No sales orders yet. Create one to generate its first Job Card.
            </p>
          </Card>
        )}

        {orders.map((order) => (
          <Card key={order.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-navy">{order.orderNumber}</p>
              <p className="text-sm text-gray-500">{order.customerName} · {order.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {order.jobCardIds.length} job card{order.jobCardIds.length === 1 ? "" : "s"}
              </span>
              <StatusBadge status={order.status} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
