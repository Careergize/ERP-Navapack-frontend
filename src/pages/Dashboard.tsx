import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";

// Each role sees only the widgets relevant to what they need to act on today.
// Demo-mode placeholder numbers — replace with real aggregates once the backend is live.
const ROLE_WIDGETS: Record<string, { label: string; value: string }[]> = {
  receptionist: [
    { label: "Open sales orders", value: "2" },
    { label: "Job cards awaiting creation", value: "0" },
  ],
  production_manager: [
    { label: "Job cards awaiting my approval", value: "1" },
    { label: "In production, my department", value: "1" },
  ],
  store_keeper: [
    { label: "Approved, awaiting material issue", value: "1" },
    { label: "Low stock raw materials", value: "3" },
  ],
  production_operator: [
    { label: "My stages in progress", value: "1" },
  ],
  recycling_operator: [
    { label: "Waste awaiting recycling", value: "180 kg" },
    { label: "Granules produced this month", value: "1,240 kg" },
  ],
  accounts: [
    { label: "Costing pending review", value: "2" },
  ],
  admin: [
    { label: "Open sales orders", value: "2" },
    { label: "Job cards in production", value: "1" },
    { label: "Waste this month (kg)", value: "180" },
  ],
};

export function Dashboard() {
  const { user } = useAuth();
  const widgets = (user && ROLE_WIDGETS[user.role]) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">
        {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Dashboard"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Here's what needs your attention today.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map((w) => (
          <Card key={w.label}>
            <p className="text-sm text-gray-500">{w.label}</p>
            <p className="mt-2 text-3xl font-semibold text-navy">{w.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
