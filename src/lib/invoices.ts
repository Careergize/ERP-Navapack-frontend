import type { SalesOrder } from '../types';
import type { Dispatch } from './fulfillment';
export interface Invoice { id: string; number: string; orderId: string; orderNumber: string; date: string; dispatchIds: string[]; dispatchNumbers?: string[]; seller: string; sellerAddress: string; sellerTax: string; email: string; contact: string; buyer: string; billingAddress: string; deliveryAddress: string; buyerTax: string; po: string; paymentTerms: string; destination: string; challans: string; currency: string; discount: number; taxRate: number; subtotal: number; tax: number; total: number; fiscalNumber?: string; verificationCode?: string; items: { itemId: string; description: string; quantity: number; unit: string; rate: number; amount: number }[] }
export type InvoiceDraft = Omit<Invoice, 'id' | 'orderId' | 'orderNumber' | 'buyer' | 'po' | 'challans' | 'items' | 'subtotal' | 'tax' | 'total'>;
const money = (value: number) => Math.round(value * 100) / 100;
export function createInvoice(draft: InvoiceDraft, order: SalesOrder, dispatches: Dispatch[], existing: Invoice[]): Invoice {
  if (!draft.number.trim() || existing.some(i => i.number === draft.number) || !draft.seller.trim() || !draft.currency.trim() || !draft.billingAddress.trim() || !draft.date || !Number.isFinite(Date.parse(draft.date))) throw new Error('Complete unique invoice number, seller, currency, date and billing address.');
  if (!Number.isFinite(draft.taxRate) || draft.taxRate < 0 || draft.taxRate > 100 || !Number.isFinite(draft.discount) || draft.discount < 0) throw new Error('Invalid tax rate or discount.');
  if (order.currency && draft.currency !== order.currency) throw new Error('Invoice currency must match the order; currency conversion is not configured.');
  const selected = dispatches.filter(d => draft.dispatchIds.includes(d.id));
  if (!selected.length || selected.length !== new Set(draft.dispatchIds).size || selected.some(d => d.orderId !== order.id || d.status !== 'Confirmed' || d.date > draft.date || existing.some(i => i.dispatchIds.includes(d.id)))) throw new Error('Select confirmed, uninvoiced dispatches dated on or before the invoice.');
  const items = (order.items ?? []).flatMap(item => { const quantity = selected.filter(d => d.itemId === item.id).reduce((sum, d) => sum + d.quantity, 0); return quantity ? [{ itemId: item.id, description: item.itemName, quantity, unit: item.unit, rate: item.unitPrice, amount: money(quantity * item.unitPrice) }] : []; });
  const subtotal = money(items.reduce((sum, i) => sum + i.amount, 0));
  if (draft.discount > subtotal) throw new Error('Discount exceeds subtotal.');
  const tax = money((subtotal - draft.discount) * draft.taxRate / 100), total = money(subtotal - draft.discount + tax);
  if (![subtotal, tax, total].every(Number.isFinite)) throw new Error('Invoice amounts exceed the supported range.');
  return { ...draft, id: crypto.randomUUID(), orderId: order.id, orderNumber: order.orderNumber, buyer: order.customerName, dispatchNumbers: selected.map(d => d.number), po: order.requisitionOrder ?? '', challans: selected.map(d => d.challan).join(', '), items, subtotal, tax, total };
}
export function amountInWords(amount: number, currency: string) {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const words = (n: number): string => n < 20 ? ones[n] : n < 100 ? tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : '') : n < 1000 ? `${ones[Math.floor(n / 100)]} hundred${n % 100 ? ` ${words(n % 100)}` : ''}` : [...[[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million'], [1000, 'thousand']] as [number, string][]].filter(([v]) => n >= v).slice(0, 1).map(([v, label]) => `${words(Math.floor(n / v))} ${label}${n % v ? ` ${words(n % v)}` : ''}`).join('');
  if (amount >= 1e15) return 'Amount exceeds supported words range';
  const cents = Math.round(amount * 100); return `${currency} ${words(Math.floor(cents / 100))} and ${String(cents % 100).padStart(2, '0')}/100 only`;
}
