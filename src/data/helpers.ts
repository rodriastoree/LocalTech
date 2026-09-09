import type { Product, Sale } from '../types';

export const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
export const matchesProduct = (product: Product, query: string) =>
  normalize(`${product.name} ${product.code} ${product.category}`).includes(
    normalize(query),
  );

export function dayKey(value: string | Date = new Date()) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function periodStart(period: string, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === 'Este mes') start.setDate(1);
  else
    start.setDate(
      start.getDate() - (period === 'Hoy' ? 0 : period === '7 días' ? 6 : 29),
    );
  return start;
}

export function dailySales(sales: Sale[], start: Date, end = new Date()) {
  const totals = new Map<string, number>();
  for (const sale of sales)
    totals.set(
      dayKey(sale.date),
      (totals.get(dayKey(sale.date)) || 0) + sale.total,
    );
  const data = [];
  for (
    const date = new Date(start);
    dayKey(date) <= dayKey(end);
    date.setDate(date.getDate() + 1)
  ) {
    data.push({
      day: date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
      ventas: totals.get(dayKey(date)) || 0,
    });
  }
  return data;
}
