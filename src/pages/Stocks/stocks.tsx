import { ITEMS, type Direction, type Movement } from '@/lib/stockData';
import { SalesOrderDemand } from './SalesOrderDemand';
import { useMemo, useState } from "react";
import { useInventory } from '@/context/InventoryContext';
import { InventoryMovementModal } from '@/components/ui/InventoryMovementModal';
import { ArrowDownToLine, ArrowUpFromLine, Download, Printer, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "levels" | "movements" | "report";
type GroupBy = "item" | "model";

interface Row {
  key: string;
  unit: string;
  current: number;
  opening: number;
  inward: number;
  outward: number;
  closing: number;
  minLevel?: number;
}

// ---------------------------------------------------------------------------
// Demo-mode placeholder data — replace with the real stock ledger once the backend is live.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Calculations
// ---------------------------------------------------------------------------

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const currentMonth = () => new Date().toLocaleDateString('en-CA').slice(0, 7);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const monthLabel = (ym: string) =>
  new Date(`${ym}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

// Item-wise or model-wise rows for a category. `month` (YYYY-MM) drives opening / inward / outward / closing.
function buildRows(movements: Movement[], groupBy: GroupBy, month: string): Row[] {
  const rows = new Map<string, Row>();
  const monthStart = `${month}-01`;

  for (const m of movements.filter((x) => x.category === 'finished')) {
    const byModel = groupBy === "model";
    const key = byModel ? (m.model ?? "No model") : m.item;
    const master = ITEMS[m.item];
    const row =
      rows.get(key) ??
      { key, unit: master.unit, current: 0, opening: 0, inward: 0, outward: 0, closing: 0, minLevel: byModel ? undefined : master.minLevel };
    const sign = m.type === "in" ? 1 : -1;

    row.current += sign * m.qty;
    if (m.date < monthStart) row.opening += sign * m.qty;
    else if (m.date.startsWith(month)) m.type === "in" ? (row.inward += m.qty) : (row.outward += m.qty);
    rows.set(key, row);

  }

  return [...rows.values()]
    .map((r) => {
      return { ...r, closing: r.opening + r.inward - r.outward };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
}

function downloadCsv(filename: string, header: string[], lines: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const blob = new Blob([[header, ...lines].map((l) => l.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------


const TH = "px-4 py-3 font-medium";
const INPUT =
  "rounded-card border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-card bg-gray-100 p-1">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
            value === v ? "bg-white text-navy shadow-sm" : "text-gray-600 hover:text-navy"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

function StockStatus({ row }: { row: Row }) {
  const [label, style] =
    row.current <= 0
      ? ["Out of stock", "bg-red-50 text-red-700 ring-red-600/20"]
      : row.minLevel !== undefined && row.current < row.minLevel
        ? ["Below minimum", "bg-amber-50 text-amber-700 ring-amber-600/20"]
        : ["In stock", "bg-emerald-50 text-emerald-700 ring-emerald-600/20"];
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}>{label}</span>;
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function LevelsTab() {
  const { finishedMovements } = useInventory();

  const [groupBy, setGroupBy] = useState<GroupBy>("item");
  const rows = useMemo(() => buildRows(finishedMovements, groupBy, currentMonth()), [finishedMovements, groupBy]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented label="Group finished goods" value={groupBy} onChange={setGroupBy} options={[["item", "Item-wise"], ["model", "Model-wise"]]} />
      </div>

      <div className="overflow-x-auto rounded-card border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className={TH}>{groupBy === "model" ? "Model" : "Item"}</th>
              <th className={`${TH} text-right`}>In stock</th>
              <th className={TH}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.key} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{r.key}</td>
                <td className="px-4 py-3 text-right tabular-nums text-navy">
                  <span className="font-semibold">{fmt(r.current)}</span> <span className="text-gray-400">{r.unit}</span>
                </td>
                <td className="px-4 py-3">
                  <StockStatus row={r} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MovementsTab() {
  const { finishedMovements } = useInventory();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<Direction | "all">("all");
  const [limit, setLimit] = useState(12);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return finishedMovements.filter(
      (m) =>
        (type === "all" || m.type === type) &&
        (!q || [m.item, m.ref, m.party].some((s) => s.toLowerCase().includes(q))),
    ).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [finishedMovements, query, type]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Finished goods Stock IN and Stock OUT are frontend simulations. Sales Order Demand does not deduct physical stock.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="mv-search" className="sr-only">Search movements</label>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input id="mv-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by item, reference or party" className={`${INPUT} w-full pl-9`} />
        </div>
        <select aria-label="Direction" value={type} onChange={(e) => setType(e.target.value as Direction | "all")} className={INPUT}>
          <option value="all">Stock IN and OUT</option>
          <option value="in">Stock IN only</option>
          <option value="out">Stock OUT only</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-card border border-gray-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className={TH}>Date</th>
              <th className={TH}>Item</th>
              <th className={TH}>Type</th>
              <th className={`${TH} text-right`}>Quantity</th>
              <th className={TH}>Reference</th>
              <th className={TH}>Supplier / department / customer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">No movements match your filters.</td>
              </tr>
            )}
            {rows.slice(0, limit).map((m) => {

              return (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(m.date)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{m.item}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${m.type === "in" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-amber-50 text-amber-700 ring-amber-600/20"}`}>
                      {m.type === "in" ? <ArrowDownToLine size={12} /> : <ArrowUpFromLine size={12} />}
                      {m.type === "in" ? "Stock IN" : "Stock OUT"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-900">{fmt(m.qty)} <span className="text-gray-400">{ITEMS[m.item].unit}</span></td>
                  <td className="px-4 py-3 text-gray-600">{m.ref}</td>
                  <td className="px-4 py-3 text-gray-600">{m.party}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
          <p aria-live="polite">Showing {Math.min(limit, rows.length)} of {rows.length}</p>
          {limit < rows.length && (
            <button type="button" onClick={() => setLimit(limit + 12)} className="font-medium text-navy hover:underline focus:outline-none focus-visible:underline">
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportTab() {
  const { finishedMovements } = useInventory();
  const [month, setMonth] = useState(currentMonth());

  const [groupBy, setGroupBy] = useState<GroupBy>("item");

  const rows = useMemo(() => buildRows(finishedMovements, groupBy, month), [finishedMovements, groupBy, month]);
  const sameUnit = new Set(rows.map((r) => r.unit)).size === 1;
  const totals = rows.reduce((t, r) => ({ opening: t.opening + r.opening, inward: t.inward + r.inward, outward: t.outward + r.outward, closing: t.closing + r.closing }), { opening: 0, inward: 0, outward: 0, closing: 0 });
  const title = `Finished goods stock report, ${monthLabel(month)}`;

  const exportCsv = () =>
    downloadCsv(
      `stock-report-finished-${month}.csv`,
      [groupBy === "model" ? "Model" : "Item", "Unit", "Opening stock", "Stock IN", "Stock OUT", "Closing stock"],
      rows.map((r) => [r.key, r.unit, r.opening, r.inward, r.outward, r.closing]),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="rep-month" className="block text-sm text-gray-500">Month</label>
            <input id="rep-month" type="month" value={month} max={currentMonth()} onChange={(e) => e.target.value && setMonth(e.target.value)} className={`${INPUT} mt-1`} />
          </div>
          <Segmented label="Group finished goods" value={groupBy} onChange={setGroupBy} options={[["item", "Item-wise"], ["model", "Model-wise"]]} />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportCsv} className="flex items-center gap-2 rounded-card border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy">
            <Download size={16} /> Export CSV
          </button>
          <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-card bg-navy px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2">
            <Printer size={16} /> Print report
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-card border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-4">
          <h2 className="text-base font-semibold text-navy">{title}</h2>
          <p className="mt-0.5 text-xs text-gray-500">Closing stock = opening stock + Stock IN − Stock OUT</p>
        </div>
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className={TH}>{groupBy === "model" ? "Model" : "Item"}</th>
              <th className={`${TH} text-right`}>Opening stock</th>
              <th className={`${TH} text-right`}>Stock IN</th>
              <th className={`${TH} text-right`}>Stock OUT</th>
              <th className={`${TH} text-right`}>Closing stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="px-4 py-3 font-medium text-gray-900">{r.key} <span className="font-normal text-gray-400">({r.unit})</span></td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-600">{fmt(r.opening)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-emerald-700">{r.inward ? `+${fmt(r.inward)}` : "0"}</td>
                <td className="px-4 py-3 text-right tabular-nums text-amber-700">{r.outward ? `-${fmt(r.outward)}` : "0"}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-navy">{fmt(r.closing)}</td>
              </tr>
            ))}
          </tbody>
          {sameUnit && (
            <tfoot className="border-t border-gray-200 bg-gray-50 font-semibold text-navy">
              <tr>
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmt(totals.opening)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmt(totals.inward)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmt(totals.outward)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmt(totals.closing)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TABS: [Tab, string][] = [["levels", "Stock levels"], ["movements", "Movements"], ["report", "Monthly report"]];

export function StockPage() {
  const [tab, setTab] = useState<Tab>("levels");

  const { finishedMovements, addFinishedMovement } = useInventory();
  const [direction, setDirection] = useState<"IN" | "OUT" | null>(null);
  const [notice, setNotice] = useState("");
  const finishedRows = buildRows(finishedMovements, "item", currentMonth());
  const kpis = [
    { label: "Finished goods", value: `${fmt(finishedRows.reduce((s, r) => s + r.current, 0))} pcs`, hint: "Across all models", alert: false },
    { label: "Finished goods items", value: String(finishedRows.length), hint: "Items with recorded movements", alert: false },
    { label: "Out of stock", value: String(finishedRows.filter(r => r.current <= 0).length), hint: "Finished goods with no available stock", alert: finishedRows.some(r => r.current <= 0) },
    { label: "Stock movements", value: String(finishedMovements.length), hint: "Finished goods Stock IN and OUT", alert: false },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Stock</h1>
          <p className="mt-1 text-sm text-gray-500">Finished goods inventory, stock movements and monthly reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setDirection("IN")} className="flex items-center gap-2 rounded-card border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy">
            <ArrowDownToLine size={16} /> Stock IN
          </button>
          <button type="button" onClick={() => setDirection("OUT")} className="flex items-center gap-2 rounded-card bg-navy px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2">
            <ArrowUpFromLine size={16} /> Stock OUT
          </button>
        </div>
      </header>

      <section aria-label="Stock summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4 print:hidden">
        {kpis.map((k) => (
          <Card key={k.label}>
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className={`mt-1 text-2xl font-semibold tracking-tight ${k.alert ? "text-amber-600" : "text-navy"}`}>{k.value}</p>
            <p className="mt-1 text-xs text-gray-500">{k.hint}</p>
          </Card>
        ))}
      </section>

      {notice && <p role="status" className="rounded-card bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p>}
      <SalesOrderDemand />
      <div role="tablist" aria-label="Stock views" className="flex gap-6 border-b border-gray-200 print:hidden">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition focus:outline-none focus-visible:text-navy ${
              tab === id ? "border-navy text-navy" : "border-transparent text-gray-500 hover:text-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {direction && <InventoryMovementModal direction={direction} title="Finished Goods" categories={[["finished", "Finished Goods"]]} initialCategory="finished"
        options={Object.entries(ITEMS).filter(([, item]) => item.category === "finished").map(([name, item]) => ({ id: name, name, category: "finished", unit: item.unit, available: finishedRows.find(r => r.key === name)?.current ?? 0 }))}
        onClose={() => setDirection(null)} onSave={entry => {
          const model = finishedMovements.find(m => m.item === entry.materialId)?.model;
          addFinishedMovement({ date: entry.date, category: "finished", item: entry.materialId, model, type: direction === "IN" ? "in" : "out", qty: entry.quantity, ref: entry.reference, party: entry.remarks });
          setNotice(`Stock ${direction} recorded for ${entry.materialId}.`);
        }} />}
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "levels" && <LevelsTab />}
        {tab === "movements" && <MovementsTab />}
        {tab === "report" && <ReportTab />}
      </div>
    </div>
  );
}
