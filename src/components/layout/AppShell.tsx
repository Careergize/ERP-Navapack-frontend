import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Boxes,
  Recycle,
  Calculator,
  Search,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["receptionist", "production_manager", "store_keeper", "production_operator", "recycling_operator", "accounts", "admin"] },
  { to: "/sales-orders", label: "Sales Orders", icon: FileText, roles: ["receptionist", "admin"] },
  { to: "/job-cards", label: "Job Cards", icon: ClipboardList, roles: ["receptionist", "production_manager", "store_keeper", "production_operator", "admin"] },
  { to: "/stock", label: "Stock", icon: Boxes, roles: ["store_keeper", "admin"] },
  { to: "/recycling", label: "Recycling", icon: Recycle, roles: ["recycling_operator", "admin"] },
  { to: "/costing", label: "Costing", icon: Calculator, roles: ["accounts", "admin"] },
  { to: "/track-trace", label: "Track & Trace", icon: Search, roles: ["receptionist", "production_manager", "store_keeper", "production_operator", "recycling_operator", "accounts", "admin"] },
  { to: "/masters", label: "Masters", icon: Settings, roles: ["admin"] },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const items = NAV_ITEMS.filter((item) => !user || item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="flex w-60 flex-col border-r border-gray-100 bg-white">
        <div className="flex items-center gap-2 px-5 py-6">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-navy via-teal to-green" />
          <span className="text-lg font-semibold text-navy">Nava Pack</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-card px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-navy/10 text-navy" : "text-ink hover:bg-surface"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-sm font-medium text-navy">{user?.name}</p>
          <p className="text-xs capitalize text-gray-500">{user?.role.replace("_", " ")}</p>
          <button
            onClick={logout}
            className="mt-3 flex items-center gap-2 text-sm text-gray-500 hover:text-navy"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
