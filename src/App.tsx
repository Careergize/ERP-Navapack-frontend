import { SalesOrdersProvider } from '@/context/SalesOrdersContext';
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { SalesOrderList } from "@/pages/SalesOrders/SalesOrderList";
import { JobCardList } from "@/pages/JobCards/JobCardList";
import { JobCardDetail } from "@/pages/JobCards/JobCardDetail";
import { TrackTrace } from "@/pages/TrackTrace/TrackTrace";
import { StockPage } from "@/pages/Stocks/stocks";
import { RawMaterialPage } from "@/pages/RawMaterials/RawMaterialPage";
import { InventoryProvider } from "@/context/InventoryContext";
import { ConsumablesProvider } from "@/context/ConsumablesContext";
import { ConsumablesPage } from "@/pages/Consumables/ConsumablesPage";

import { RecyclingPage } from "@/pages/Recycling/RecyclingPage";
import { CostingPage } from "@/pages/Costing/CostingPage";
import { MastersPage } from "@/pages/Masters/MastersPage";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/sales-orders" element={<SalesOrderList />} />
        <Route path="/sales-orders/new" element={<SalesOrderList />} />
        <Route path="/job-cards" element={<JobCardList />} />
        <Route path="/job-cards/:id" element={<JobCardDetail />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/raw-materials" element={<RawMaterialPage />} />
        <Route path="/consumables" element={<ConsumablesPage />} />
        <Route path="/recycling" element={<RecyclingPage />} />
        <Route path="/costing" element={<CostingPage />} />
        <Route path="/masters" element={<MastersPage />} />
        <Route path="/track-trace" element={<TrackTrace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <SalesOrdersProvider><InventoryProvider><ConsumablesProvider><AppRoutes /></ConsumablesProvider></InventoryProvider></SalesOrdersProvider>
    </AuthProvider>
  );
}
