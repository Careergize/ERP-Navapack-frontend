import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

const DEMO_ROLES: { role: Role; label: string }[] = [
  { role: "receptionist", label: "Receptionist" },
  { role: "production_manager", label: "Production Manager" },
  { role: "store_keeper", label: "Store Keeper" },
  { role: "recycling_operator", label: "Recycling Operator" },
  { role: "accounts", label: "Accounts" },
  { role: "admin", label: "Admin" },
];

export function Login() {
  const { login, loginAsDemo, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleDemoLogin(role: Role) {
    loginAsDemo(role);
    navigate("/");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Email or password is incorrect.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy via-teal to-green px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-navy">Nava Pack</h1>
          <p className="mt-1 text-sm text-gray-500">Operations sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-card border border-gray-200 px-3 py-2 text-sm focus:border-blue focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-card border border-gray-200 px-3 py-2 text-sm focus:border-blue focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-card bg-navy py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="mb-3 text-center text-xs text-gray-400">
              Demo mode — sign in as a role, no backend required
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map(({ role, label }) => (
                <button
                  key={role}
                  onClick={() => handleDemoLogin(role)}
                  className="rounded-card border border-gray-200 py-2 text-xs font-medium text-ink hover:border-blue hover:text-blue"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
