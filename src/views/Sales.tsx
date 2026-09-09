'use client';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, Plus, Search } from 'lucide-react';
import { dayKey } from '../data/helpers';
import { fmt, useStore } from '../context/Store';
import { Modal } from '../components/UI';
import type { Sale } from '../types';
export default function Sales() {
  const { state } = useStore();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [detail, setDetail] = useState<Sale | null>(null);
  useEffect(() => {
    const id = params.get('venta');
    if (id) {
      setDetail(state.sales.find((s) => s.id === id) || null);
      setParams({});
    }
  }, [params, setParams, state.sales]);
  const filtered = state.sales.filter((s) =>
    (s.id + s.paymentMethod + s.items.map((i) => i.name).join(''))
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  const today = state.sales.filter((s) => dayKey(s.date) === dayKey());
  const total = today.reduce((a, s) => a + s.total, 0);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <p className="text-sm font-bold text-blue-600">REGISTRO CLARO</p>
          <h1 className="text-3xl font-extrabold">Ventas</h1>
          <p className="mt-1 text-slate-500">
            Todo lo vendido queda guardado automáticamente.
          </p>
        </div>
        <button
          onClick={() => nav('/nueva-venta')}
          className="h-12 rounded-xl bg-blue-600 px-5 font-bold text-white"
        >
          <Plus className="mr-2 inline" size={19} />
          Nueva venta
        </button>
      </header>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          ['Ventas de hoy', fmt(total)],
          ['Operaciones', `${today.length} ventas`],
          ['Ticket promedio', fmt(total / Math.max(1, today.length))],
        ].map(([a, b]) => (
          <div key={a} className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-slate-500">{a}</p>
            <p className="mt-1 text-2xl font-extrabold">{b}</p>
          </div>
        ))}
      </div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar venta, producto o medio de pago..."
          className="h-11 w-full rounded-xl border bg-white pl-10 pr-3"
        />
      </div>
      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {[
                  'Nº venta',
                  'Fecha',
                  'Productos',
                  'Medio de pago',
                  'Total',
                  'Estado',
                  '',
                ].map((x) => (
                  <th key={x} className="px-4 py-3">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm font-extrabold">#{s.id}</td>
                  <td className="px-4 py-4 text-sm">
                    {new Date(s.date).toLocaleString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="max-w-xs px-4 py-4 text-sm">
                    <p className="truncate">
                      {s.items
                        .map((i) => `${i.quantity}× ${i.name}`)
                        .join(', ')}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm">{s.paymentMethod}</td>
                  <td className="px-4 py-4 font-extrabold">{fmt(s.total)}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
                      Completada
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setDetail(s)}
                      aria-label="Ver venta"
                      className="grid h-9 w-9 place-items-center rounded-lg border"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <output className="p-8 text-center text-slate-500">
              No encontramos ventas con esa búsqueda.
            </output>
          )}
        </div>
      </div>
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={`Venta #${detail?.id || ''}`}
      >
        {detail && (
          <>
            <div className="mb-4 flex justify-between rounded-xl bg-slate-50 p-4 text-sm">
              <div>
                <p className="text-slate-500">Fecha</p>
                <p className="font-bold">
                  {new Date(detail.date).toLocaleString('es-AR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Medio de pago</p>
                <p className="font-bold">{detail.paymentMethod}</p>
              </div>
            </div>
            <div className="space-y-3">
              {detail.items.map((i) => (
                <div
                  key={i.productId}
                  className="flex justify-between border-b pb-3"
                >
                  <div>
                    <p className="text-sm font-bold">{i.name}</p>
                    <p className="text-xs text-slate-500">
                      {i.quantity} × {fmt(i.price)}
                    </p>
                  </div>
                  <p className="font-extrabold">{fmt(i.quantity * i.price)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-between text-xl font-extrabold">
              <span>Total</span>
              <span>{fmt(detail.total)}</span>
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  );
}
