import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Plus, X } from 'lucide-react';
import { MOCK_CUSTOMERS, MOCK_ITEMS } from '@/lib/mockData';
import { lineTotal, orderTotal, today, validateOrder, type SalesOrderDraft } from '@/lib/salesOrders';
import { useSalesOrders } from '@/context/SalesOrdersContext';
import type { CustomerType, SalesOrderItem } from '@/types';

const INPUT = 'mt-1 block w-full rounded-card border border-gray-200 px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy';
const newItem = (): SalesOrderItem => ({ id: crypto.randomUUID(), itemName: '', quantity: NaN, unit: '', unitPrice: NaN, totalPrice: 0 });
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="block text-sm text-gray-600">{label}{children}{error && <span role="alert" className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}
export function NewSalesOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: (number: string) => void }) {
  const { createSalesOrder } = useSalesOrders();
  const [draft, setDraft] = useState<SalesOrderDraft>(() => ({ customerName: '', date: today(), marketingPersonName: '', customerType: '', requisitionOrder: '', items: [newItem()] }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const locked = useRef(false);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLInputElement>('input')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'Tab') {
        const elements = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select') ?? []);
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [onClose]);
  const updateItem = (id: string, change: Partial<SalesOrderItem>) => setDraft(current => ({ ...current, items: current.items.map(item => item.id === id ? { ...item, ...change } : item) }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (locked.current) return;
    const validation = validateOrder(draft);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    locked.current = true;
    setSubmitting(true);
    try { const order = createSalesOrder(draft); onCreated(order.orderNumber); }
    catch (error) { setErrors({ form: error instanceof Error ? error.message : 'Unable to create order.' }); locked.current = false; setSubmitting(false); }
  };
  const money = (value: number) => (Number.isFinite(value) ? value : 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/30 p-4" role="dialog" aria-modal="true" aria-labelledby="new-order-title">
    <div ref={dialog} className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-card bg-white p-5 shadow-xl">
      <div className="flex items-center justify-between"><h2 id="new-order-title" className="text-lg font-semibold text-navy">New Sales Order</h2><button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1 text-gray-400 hover:bg-gray-100"><X size={18} /></button></div>
      <form onSubmit={submit} noValidate className="mt-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer Name *" error={errors.customerName}><input required list="order-customers" value={draft.customerName} onChange={e => setDraft({ ...draft, customerName: e.target.value })} className={INPUT} /><datalist id="order-customers">{MOCK_CUSTOMERS.map(c => <option key={c.id} value={c.name} />)}</datalist></Field>
          <Field label="Order Date" error={errors.date}><input type="date" readOnly value={draft.date} className={`${INPUT} bg-gray-50`} /></Field>
          <Field label="Marketing Person Name *" error={errors.marketingPersonName}><input required value={draft.marketingPersonName} onChange={e => setDraft({ ...draft, marketingPersonName: e.target.value })} className={INPUT} /></Field>
          <Field label="Customer Type *" error={errors.customerType}><select required value={draft.customerType} onChange={e => setDraft({ ...draft, customerType: e.target.value as CustomerType })} className={INPUT}><option value="">Select customer type</option><option>B2B</option><option>B2C</option></select></Field>
          <Field label="Requisition Order"><input value={draft.requisitionOrder} onChange={e => setDraft({ ...draft, requisitionOrder: e.target.value })} className={INPUT} /></Field>
        </div>
        <div className="space-y-3"><h3 className="font-medium text-navy">Items</h3>
          {draft.items.map((item, i) => <fieldset key={item.id} className="rounded-card border border-gray-200 p-3"><legend className="px-1 text-sm text-gray-500">Item {i + 1}</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Item *" error={errors[`${i}.item`]}><select required value={item.itemId ?? ''} onChange={e => { const selected = MOCK_ITEMS.find(value => value.id === e.target.value); updateItem(item.id, { itemId: selected?.id, itemName: selected?.name ?? '', unit: selected?.unit ?? '' }); }} className={INPUT}><option value="">Select item</option>{MOCK_ITEMS.map(value => <option key={value.id} value={value.id}>{value.name}</option>)}</select></Field>
            <Field label="Quantity *" error={errors[`${i}.quantity`]}><input required type="number" step="any" min="0" value={Number.isNaN(item.quantity) ? '' : item.quantity} onChange={e => updateItem(item.id, { quantity: e.target.valueAsNumber })} className={INPUT} /></Field>
            <Field label="Unit *" error={errors[`${i}.unit`]}><select required value={item.unit} onChange={e => updateItem(item.id, { unit: e.target.value })} className={INPUT}><option value="">Select unit</option>{[...new Set(MOCK_ITEMS.map(value => value.unit))].map(unit => <option key={unit}>{unit}</option>)}</select></Field>
            <Field label="Per Unit Price *" error={errors[`${i}.price`]}><input required type="number" min="0" step="0.01" value={Number.isNaN(item.unitPrice) ? '' : item.unitPrice} onChange={e => updateItem(item.id, { unitPrice: e.target.valueAsNumber })} className={INPUT} /></Field>
            <Field label="Total Price"><output className={`${INPUT} bg-gray-50`} aria-live="polite">{money(lineTotal(item.quantity, item.unitPrice))}</output></Field>
          </div><button type="button" disabled={draft.items.length === 1} onClick={() => setDraft({ ...draft, items: draft.items.filter(value => value.id !== item.id) })} className="mt-3 text-sm text-red-600 disabled:opacity-40">Remove Item</button></fieldset>)}
          <button type="button" onClick={() => setDraft({ ...draft, items: [...draft.items, newItem()] })} className="inline-flex items-center gap-1 rounded-card border border-gray-200 px-3 py-2 text-sm text-navy"><Plus size={16} /> Add Item</button>
          {errors.items && <p role="alert" className="text-sm text-red-600">{errors.items}</p>}
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-4 font-semibold text-navy"><span>Order Total</span><output aria-live="polite">{money(orderTotal(draft.items))}</output></div>
        {errors.form && <p role="alert" className="text-sm text-red-600">{errors.form}</p>}
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-card border border-gray-200 px-4 py-2 text-sm text-gray-600">Cancel</button><button type="submit" disabled={submitting} className="rounded-card bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{submitting ? 'Creating…' : 'Create Order'}</button></div>
      </form>
    </div>
  </div>;
}
