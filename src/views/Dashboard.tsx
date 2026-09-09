'use client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  Package,
  Plus,
  ShoppingCart,
  TriangleAlert,
  WalletCards,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { dayKey } from '../data/helpers';
import { fmt, friendlyTime, statusOf, useStore } from '../context/Store';

export default function Dashboard() {
  const { state } = useStore();
  const nav = useNavigate();
  const today = state.sales.filter((s) => dayKey(s.date) === dayKey());
  const total = today.reduce((a, s) => a + s.total, 0);
  const low = state.products.filter((p) => statusOf(p) !== 'Disponible');
  const units = state.products.reduce((a, p) => a + p.stock, 0);
  const chart = Array.from({ length: 24 }, (_, hour) => ({
    h: `${hour} h`,
    v: today
      .filter((s) => new Date(s.date).getHours() === hour)
      .reduce((sum, s) => sum + s.total, 0),
  }));
  const rank = Object.entries(
    state.sales
      .flatMap((s) => s.items)
      .reduce(
        (a, i) => ((a[i.name] = (a[i.name] || 0) + i.quantity), a),
        {} as Record<string, number>,
      ),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-1 text-sm font-bold text-blue-600">MI NEGOCIO HOY</p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Hola, {state.settings.owner.split(' ')[0]}
          </h1>
          <p className="mt-2 text-slate-500">
            Así está {state.settings.storeName} hoy.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => nav('/productos?nuevo=1')}
            className="h-12 rounded-xl border bg-white px-4 text-sm font-bold"
          >
            <Plus className="mr-2 inline" size={18} />
            Agregar producto
          </button>
          <button
            onClick={() => nav('/nueva-venta')}
            className="h-12 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-200"
          >
            <ShoppingCart className="mr-2 inline" size={18} />
            Registrar venta
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            WalletCards,
            'Ventas de hoy',
            fmt(total),
            'Ventas registradas hoy',
            'blue',
          ],
          [
            ShoppingCart,
            'Operaciones',
            `${today.length} ventas`,
            'El stock se actualiza solo',
            'violet',
          ],
          [
            TriangleAlert,
            'Stock bajo',
            `${low.length} productos`,
            'Necesitan atención',
            'amber',
          ],
          [
            Package,
            'Inventario',
            `${units} unidades`,
            `${state.products.length} productos`,
            'cyan',
          ],
        ].map(([Icon, label, value, note, color], i) => (
          <motion.button
            type="button"
            onClick={() =>
              nav(
                i === 2
                  ? '/inventario?estado=bajo'
                  : i === 3
                    ? '/inventario'
                    : '/ventas',
              )
            }
            whileHover={{ y: -3 }}
            key={label as string}
            className="rounded-2xl border bg-white p-5 text-left shadow-sm"
          >
            <div
              className={`mb-5 grid h-10 w-10 place-items-center rounded-xl ${color === 'amber' ? 'bg-amber-50 text-amber-700' : color === 'violet' ? 'bg-violet-50 text-violet-600' : color === 'cyan' ? 'bg-cyan-50 text-cyan-700' : 'bg-blue-50 text-blue-600'}`}
            >
              <Icon size={20} />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {label as string}
            </p>
            <p className="mt-1 text-2xl font-extrabold">{value as string}</p>
            <p
              className={`mt-2 text-xs font-bold ${i === 2 ? 'text-amber-700' : 'text-green-700'}`}
            >
              {note as string}
            </p>
          </motion.button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Necesitan tu atención</h2>
              <p className="text-sm text-slate-500">
                Productos que conviene reponer pronto.
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              {low.length} alertas
            </span>
          </div>
          <div className="space-y-3">
            {low.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex gap-3">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}
                  >
                    <TriangleAlert size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {p.name} —{' '}
                      {p.stock === 0
                        ? 'sin stock'
                        : `quedan ${p.stock} unidades`}
                    </p>
                    <p className="text-xs text-slate-500">
                      Mínimo configurado: {p.minimumStock}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => nav(`/inventario?producto=${p.id}`)}
                    className="rounded-lg px-3 py-2 text-xs font-bold text-blue-600"
                  >
                    Ver producto
                  </button>
                  <button
                    onClick={() => nav(`/inventario?reponer=${p.id}`)}
                    className="rounded-lg bg-white px-3 py-2 text-xs font-bold shadow-sm"
                  >
                    Reponer
                  </button>
                </div>
              </div>
            ))}
            {!low.length && (
              <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                Todos los productos tienen stock suficiente.
              </p>
            )}
          </div>
          <button
            onClick={() => nav('/inventario?estado=bajo')}
            className="mt-4 text-sm font-bold text-blue-600"
          >
            Ver todas las alertas
          </button>
        </section>
        <section className="rounded-2xl bg-gradient-to-br from-[#0f2f5f] to-[#4c1d95] p-6 text-white shadow-sm">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-200">Ventas de hoy</p>
              <h2 className="text-2xl font-extrabold">{fmt(total)}</h2>
            </div>
            <ArrowUpRight className="text-cyan-300" />
          </div>
          <div className="h-52">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              initialDimension={{ width: 500, height: 280 }}
            >
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#67e8f9" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#67e8f9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="h"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#bfdbfe', fontSize: 11 }}
                />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#67e8f9"
                  strokeWidth={3}
                  fill="url(#sales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="min-w-0 rounded-2xl border bg-white p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-extrabold">Productos más vendidos</h2>
            <button
              onClick={() => nav('/reportes')}
              className="text-sm font-bold text-blue-600"
            >
              Ver reporte
            </button>
          </div>
          <div className="space-y-3">
            {rank.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-sm font-extrabold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{name}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500"
                      style={{
                        width: `${(count / (rank[0]?.[1] || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {count} u.
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="mb-5 text-lg font-extrabold">Actividad reciente</h2>
          <div className="space-y-4">
            {state.activity.slice(0, 5).map((a) => (
              <div key={a.id} className="flex gap-3">
                <div
                  className={`mt-1 grid h-8 w-8 place-items-center rounded-full ${a.type === 'sale' ? 'bg-green-50 text-green-600' : a.type === 'alert' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}
                >
                  {a.type === 'sale' ? (
                    <ShoppingCart size={15} />
                  ) : a.type === 'product' ? (
                    <BookOpen size={15} />
                  ) : (
                    <Clock size={15} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{a.text}</p>
                  <p className="text-xs text-slate-500">
                    {friendlyTime(a.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
