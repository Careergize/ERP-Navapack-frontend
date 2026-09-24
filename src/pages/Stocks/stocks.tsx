import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownToLine, ArrowUpFromLine, Download, Printer, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category = "raw" | "finished" | "granules";
type Direction = "in" | "out";
type Tab = "levels" | "movements" | "report";
type GroupBy = "item" | "model";

interface ItemMaster {
  category: Category;
  unit: string;
  minLevel?: number;
}

// One ledger line. Every stock figure on this page is calculated from these lines,
// so stock-in and stock-out always add up: opening + inward − outward = closing.
interface Movement {
  id: string;
  date: string; // YYYY-MM-DD
  category: Category;
  item: string;
  model?: string; // finished goods only
  type: Direction;
  qty: number;
  ref: string; // Supplier bill, Job Card, Sales Order, recycling batch or granules sale
  party: string;
  price?: number; // inward raw material only, per unit
  currency?: "INR" | "USD";
  rate?: number; // USD to INR rate entered at purchase
}

interface Row {
  key: string;
  unit: string;
  current: number;
  opening: number;
  inward: number;
  outward: number;
  closing: number;
  minLevel?: number;
  avgCost?: number;
}

// ---------------------------------------------------------------------------
// Demo-mode placeholder data — replace with the real stock ledger once the backend is live.
// ---------------------------------------------------------------------------

const ITEMS: Record<string, ItemMaster> = {
  "HDPE resin": { category: "raw", unit: "kg", minLevel: 1000 },
  "LDPE resin": { category: "raw", unit: "kg", minLevel: 800 },
  "Master batch": { category: "raw", unit: "kg", minLevel: 100 },
  "Printing ink": { category: "raw", unit: "kg", minLevel: 50 },
  "Stitching thread": { category: "raw", unit: "kg", minLevel: 30 },
  "Woven sack 50 kg": { category: "finished", unit: "pcs" },
  "Woven sack 25 kg": { category: "finished", unit: "pcs" },
  "Laminated bag": { category: "finished", unit: "pcs" },
  "Non-woven carry bag": { category: "finished", unit: "pcs" },
  "Recycled granules": { category: "granules", unit: "kg" },
};

const MODEL_OF: Record<string, string> = {
  "Woven sack 50 kg": "Model A",
  "Woven sack 25 kg": "Model A",
  "Laminated bag": "Model B",
  "Non-woven carry bag": "Model C",
};

let seq = 0;
const mv = (
  date: string,
  item: string,
  type: Direction,
  qty: number,
  ref: string,
  party: string,
  cost?: { price: number; currency: "INR" | "USD"; rate?: number },
): Movement => ({
  id: `m${++seq}`,
  date,
  category: ITEMS[item].category,
  item,
  model: MODEL_OF[item],
  type,
  qty,
  ref,
  party,
  ...cost,
});

const inr = (price: number) => ({ price, currency: "INR" as const });
const usd = (price: number, rate: number) => ({ price, currency: "USD" as const, rate });

const MOVEMENTS: Movement[] = [
  // Raw material inward and outward
  mv("2026-07-28", "HDPE resin", "in", 1800, "Opening balance", "Store", inr(96)),
  mv("2026-08-05", "HDPE resin", "in", 2500, "PO-2208", "Reliance Polymers", usd(1.15, 82.9)),
  mv("2026-08-12", "HDPE resin", "out", 1200, "JC-0310", "Extrusion"),
  mv("2026-08-20", "HDPE resin", "out", 1000, "JC-0312", "Extrusion"),
  mv("2026-09-02", "HDPE resin", "in", 2500, "PO-2214", "Reliance Polymers", usd(1.18, 83.1)),
  mv("2026-09-09", "HDPE resin", "out", 1100, "JC-0316", "Extrusion"),
  mv("2026-09-16", "HDPE resin", "out", 900, "JC-0317", "Extrusion"),
  mv("2026-09-20", "HDPE resin", "out", 350, "JC-0316", "Extrusion"),
  mv("2026-07-25", "LDPE resin", "in", 900, "Opening balance", "Store", inr(105)),
  mv("2026-08-10", "LDPE resin", "in", 600, "PO-2209", "Supreme Traders", inr(106)),
  mv("2026-08-18", "LDPE resin", "out", 700, "JC-0311", "Lamination"),
  mv("2026-09-04", "LDPE resin", "out", 450, "JC-0315", "Lamination"),
  mv("2026-09-15", "LDPE resin", "out", 300, "JC-0316", "Lamination"),
  mv("2026-07-25", "Master batch", "in", 210, "Opening balance", "Store", inr(240)),
  mv("2026-08-15", "Master batch", "out", 80, "JC-0311", "Extrusion"),
  mv("2026-09-06", "Master batch", "in", 150, "PO-2215", "Colour Chem India", inr(245)),
  mv("2026-09-10", "Master batch", "out", 60, "JC-0316", "Extrusion"),
  mv("2026-09-18", "Master batch", "out", 50, "JC-0317", "Extrusion"),
  mv("2026-07-25", "Printing ink", "in", 85, "Opening balance", "Store", inr(620)),
  mv("2026-08-20", "Printing ink", "out", 20, "JC-0312", "Printing"),
  mv("2026-09-12", "Printing ink", "in", 40, "PO-2216", "Inkart Supplies", inr(640)),
  mv("2026-09-14", "Printing ink", "out", 62, "JC-0316", "Printing"),
  mv("2026-07-25", "Stitching thread", "in", 45, "Opening balance", "Store", inr(450)),
  mv("2026-09-05", "Stitching thread", "out", 12, "JC-0314", "Bag making"),
  // Finished goods, moved in from production and out on dispatch
  mv("2026-08-14", "Woven sack 50 kg", "in", 2500, "JC-0310", "Stock keeping"),
  mv("2026-08-28", "Woven sack 50 kg", "out", 1800, "SO-1038", "Apex Packaging"),
  mv("2026-09-05", "Woven sack 50 kg", "in", 3000, "JC-0314", "Stock keeping"),
  mv("2026-09-12", "Woven sack 50 kg", "out", 2600, "SO-1041", "Kaveri Traders"),
  mv("2026-08-20", "Woven sack 25 kg", "in", 1500, "JC-0311", "Stock keeping"),
  mv("2026-09-08", "Woven sack 25 kg", "out", 900, "SO-1040", "Kaveri Traders"),
  mv("2026-09-19", "Woven sack 25 kg", "in", 1200, "JC-0316", "Stock keeping"),
  mv("2026-08-25", "Laminated bag", "in", 2000, "JC-0312", "Stock keeping"),
  mv("2026-09-11", "Laminated bag", "out", 1500, "SO-1041", "Apex Packaging"),
  mv("2026-09-03", "Non-woven carry bag", "in", 1800, "JC-0313", "Stock keeping"),
  mv("2026-09-17", "Non-woven carry bag", "out", 1000, "SO-1042", "Apex Packaging"),
  // Recycled granules: produced from waste, then sold or transferred
  mv("2026-07-30", "Recycled granules", "in", 260, "Opening balance", "Recycling"),
  mv("2026-09-04", "Recycled granules", "in", 400, "W-089", "Recycling"),
  mv("2026-09-11", "Recycled granules", "in", 450, "W-090", "Recycling"),
  mv("2026-09-19", "Recycled granules", "in", 390, "W-091", "Recycling"),
  mv("2026-09-15", "Recycled granules", "out", 600, "GS-014", "Shree Polymers"),
  mv("2026-09-22", "Recycled granules", "out", 400, "GS-015", "Deccan Plastics"),
];

// ---------------------------------------------------------------------------
// Calculations
// ---------------------------------------------------------------------------

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const money = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const toLocal = (m: Movement) => (m.price === undefined ? undefined : m.currency === "USD" ? m.price * (m.rate ?? 1) : m.price);
const currentMonth = () => new Date().toISOString().slice(0, 7);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const monthLabel = (ym: string) =>
  new Date(`${ym}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

// Item-wise or model-wise rows for a category. `month` (YYYY-MM) drives opening / inward / outward / closing.
function buildRows(movements: Movement[], category: Category, groupBy: GroupBy, month: string): Row[] {
  const rows = new Map<string, Row>();
  const cost = new Map<string, { value: number; qty: number }>();
  const monthStart = `${month}-01`;

  for (const m of movements.filter((x) => x.category === category)) {
    const byModel = category === "finished" && groupBy === "model";
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

    const local = toLocal(m);
    if (m.type === "in" && local !== undefined) {
      const c = cost.get(key) ?? { value: 0, qty: 0 };
      c.value += local * m.qty;
      c.qty += m.qty;
      cost.set(key, c);
    }
  }

  return [...rows.values()]
    .map((r) => {
      const c = cost.get(r.key);
      return { ...r, closing: r.opening + r.inward - r.outward, avgCost: c ? c.value / c.qty : undefined };
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

const CATEGORY_LABEL: Record<Category, string> = { raw: "Raw materials", finished: "Finished goods", granules: "Recycled granules" };

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
  const [category, setCategory] = useState<Category>("raw");
  const [groupBy, setGroupBy] = useState<GroupBy>("item");
  const rows = useMemo(() => buildRows(MOVEMENTS, category, groupBy, currentMonth()), [category, groupBy]);
  const isRaw = category === "raw";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Stock category"
          value={category}
          onChange={setCategory}
          options={[["raw", "Raw materials"], ["finished", "Finished goods"], ["granules", "Granules"]]}
        />
        {category === "finished" && (
          <Segmented label="Group finished goods" value={groupBy} onChange={setGroupBy} options={[["item", "Item-wise"], ["model", "Model-wise"]]} />
        )}
      </div>

      <div className="overflow-x-auto rounded-card border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className={TH}>{category === "finished" && groupBy === "model" ? "Model" : "Item"}</th>
              <th className={`${TH} text-right`}>In stock</th>
              {isRaw && <th className={`${TH} text-right`}>Minimum</th>}
              {isRaw && <th className={`${TH} text-right`}>Avg cost</th>}
              {isRaw && <th className={`${TH} text-right`}>Stock value</th>}
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
                {isRaw && <td className="px-4 py-3 text-right tabular-nums text-gray-500">{r.minLevel !== undefined ? fmt(r.minLevel) : "—"}</td>}
                {isRaw && <td className="px-4 py-3 text-right tabular-nums text-gray-600">{r.avgCost !== undefined ? `${money(r.avgCost)}/${r.unit}` : "—"}</td>}
                {isRaw && <td className="px-4 py-3 text-right tabular-nums text-gray-900">{r.avgCost !== undefined ? money(r.current * r.avgCost) : "—"}</td>}
                <td className="px-4 py-3">
                  <StockStatus row={r} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isRaw && <p className="text-xs text-gray-500">Average cost includes USD purchases converted at the exchange rate entered on each inward entry.</p>}
    </div>
  );
}

function MovementsTab() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [type, setType] = useState<Direction | "all">("all");
  const [limit, setLimit] = useState(12);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOVEMENTS.filter(
      (m) =>
        (category === "all" || m.category === category) &&
        (type === "all" || m.type === type) &&
        (!q || [m.item, m.ref, m.party].some((s) => s.toLowerCase().includes(q))),
    ).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [query, category, type]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Stock-in and stock-out are recorded automatically from inward entries, job card issues, production output and dispatches.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="mv-search" className="sr-only">Search movements</label>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input id="mv-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by item, reference or party" className={`${INPUT} w-full pl-9`} />
        </div>
        <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value as Category | "all")} className={INPUT}>
          <option value="all">All categories</option>
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>
        <select aria-label="Direction" value={type} onChange={(e) => setType(e.target.value as Direction | "all")} className={INPUT}>
          <option value="all">Inward and outward</option>
          <option value="in">Inward only</option>
          <option value="out">Outward only</option>
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
              <th className={`${TH} text-right`}>Cost per unit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">No movements match your filters.</td>
              </tr>
            )}
            {rows.slice(0, limit).map((m) => {
              const local = toLocal(m);
              return (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(m.date)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{m.item}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${m.type === "in" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-amber-50 text-amber-700 ring-amber-600/20"}`}>
                      {m.type === "in" ? <ArrowDownToLine size={12} /> : <ArrowUpFromLine size={12} />}
                      {m.type === "in" ? "Inward" : "Outward"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-900">{fmt(m.qty)} <span className="text-gray-400">{ITEMS[m.item].unit}</span></td>
                  <td className="px-4 py-3 text-gray-600">{m.ref}</td>
                  <td className="px-4 py-3 text-gray-600">{m.party}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                    {local === undefined ? "—" : (
                      <>
                        {money(local)}
                        {m.currency === "USD" && <span className="block text-xs text-gray-400">${m.price} × {m.rate}</span>}
                      </>
                    )}
                  </td>
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
  const [month, setMonth] = useState(currentMonth());
  const [category, setCategory] = useState<Category>("raw");
  const [groupBy, setGroupBy] = useState<GroupBy>("item");

  const rows = useMemo(() => buildRows(MOVEMENTS, category, groupBy, month), [category, groupBy, month]);
  const sameUnit = new Set(rows.map((r) => r.unit)).size === 1;
  const totals = rows.reduce((t, r) => ({ opening: t.opening + r.opening, inward: t.inward + r.inward, outward: t.outward + r.outward, closing: t.closing + r.closing }), { opening: 0, inward: 0, outward: 0, closing: 0 });
  const title = `${CATEGORY_LABEL[category]} stock report, ${monthLabel(month)}`;

  const exportCsv = () =>
    downloadCsv(
      `stock-report-${category}-${month}.csv`,
      [category === "finished" && groupBy === "model" ? "Model" : "Item", "Unit", "Opening stock", "Total inward", "Total outward", "Closing stock"],
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
          <Segmented label="Report category" value={category} onChange={setCategory} options={[["raw", "Raw materials"], ["finished", "Finished goods"], ["granules", "Granules"]]} />
          {category === "finished" && (
            <Segmented label="Group finished goods" value={groupBy} onChange={setGroupBy} options={[["item", "Item-wise"], ["model", "Model-wise"]]} />
          )}
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
          <p className="mt-0.5 text-xs text-gray-500">Closing stock = opening stock + total inward − total outward</p>
        </div>
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className={TH}>{category === "finished" && groupBy === "model" ? "Model" : "Item"}</th>
              <th className={`${TH} text-right`}>Opening stock</th>
              <th className={`${TH} text-right`}>Total inward</th>
              <th className={`${TH} text-right`}>Total outward</th>
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

  const summary = useMemo(() => {
    const month = currentMonth();
    const raw = buildRows(MOVEMENTS, "raw", "item", month);
    const finished = buildRows(MOVEMENTS, "finished", "item", month);
    const granules = buildRows(MOVEMENTS, "granules", "item", month);
    return {
      rawValue: raw.reduce((s, r) => s + (r.avgCost ? r.current * r.avgCost : 0), 0),
      low: raw.filter((r) => r.minLevel !== undefined && r.current < r.minLevel).length,
      finished: finished.reduce((s, r) => s + r.current, 0),
      granules: granules.reduce((s, r) => s + r.current, 0),
    };
  }, []);

  const kpis = [
    { label: "Raw material value", value: money(summary.rawValue), hint: "At average cost", alert: false },
    { label: "Below minimum level", value: String(summary.low), hint: summary.low ? "Reorder these raw materials" : "All raw materials are above minimum", alert: summary.low > 0 },
    { label: "Finished goods", value: `${fmt(summary.finished)} pcs`, hint: "Across all models", alert: false },
    { label: "Granules in stock", value: `${fmt(summary.granules)} kg`, hint: "Available to sell or transfer", alert: false },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Stock</h1>
          <p className="mt-1 text-sm text-gray-500">Raw materials, finished goods and recycled granules, with monthly reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/stock/inward/new" className="flex items-center gap-2 rounded-card border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy">
            <ArrowDownToLine size={16} /> Record inward
          </Link>
          <Link to="/stock/outward/new" className="flex items-center gap-2 rounded-card bg-navy px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2">
            <ArrowUpFromLine size={16} /> Record outward
          </Link>
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

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "levels" && <LevelsTab />}
        {tab === "movements" && <MovementsTab />}
        {tab === "report" && <ReportTab />}
      </div>
    </div>
  );
}