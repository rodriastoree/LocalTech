'use client';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  PackagePlus,
  RotateCcw,
  Save,
  Store,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { matchesProduct, normalize } from '../data/helpers';
import { useStore } from '../context/Store';
import { Field, inputClass, Modal } from '../components/UI';

export function Suppliers() {
  const { state } = useStore();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(
    params.get('proveedor'),
  );
  const suppliers = state.suppliers.filter(
    (s) =>
      normalize(s.name).includes(normalize(query)) ||
      state.products.some(
        (p) => p.supplierId === s.id && matchesProduct(p, query),
      ),
  );
  const s = state.suppliers.find((x) => x.id === selected);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="mb-6">
        <p className="text-sm font-bold text-blue-600">CONTACTOS CLAVE</p>
        <h1 className="text-3xl font-extrabold">Proveedores</h1>
        <p className="mt-1 text-slate-500">
          Datos útiles para reponer sin perder tiempo.
        </p>
      </header>
      <input
        aria-label="Buscar proveedores o productos"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar proveedor, producto, categoría o código..."
        className={`${inputClass} mb-5`}
      />
      {!suppliers.length && (
        <output className="rounded-xl border bg-white p-6 text-center">
          Sin resultados para esta búsqueda.
        </output>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {suppliers.map((x) => {
          const prod = state.products.filter((p) => p.supplierId === x.id);
          const low = prod.filter((p) => p.stock <= p.minimumStock);
          return (
            <article
              key={x.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <Truck />
                </div>
                {low.length > 0 && (
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                    {low.length} para reponer
                  </span>
                )}
              </div>
              <h2 className="text-lg font-extrabold">{x.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Productos asociados: {prod.length}
              </p>
              <div className="my-4 space-y-1 text-sm">
                <p>{x.phone}</p>
                <p className="text-slate-500">
                  Última reposición:{' '}
                  {new Date(x.lastRestock).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelected(x.id)}
                className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-bold"
              >
                Ver productos <ChevronRight size={17} />
              </button>
            </article>
          );
        })}
      </div>
      <Modal open={!!s} onClose={() => setSelected(null)} title={s?.name || ''}>
        {s && (
          <>
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-bold">{s.phone}</p>
              <p>{s.email}</p>
              <p className="mt-1 text-slate-500">{s.address}</p>
            </div>
            <h3 className="mb-3 mt-5 font-extrabold">Productos asociados</h3>
            <div className="max-h-64 space-y-2 overflow-auto">
              {state.products
                .filter((p) => p.supplierId === s.id)
                .map((p) => (
                  <button
                    onClick={() => nav(`/inventario?producto=${p.id}`)}
                    key={p.id}
                    className="flex w-full justify-between gap-3 rounded-lg border p-3 text-left text-sm"
                  >
                    <span className="font-semibold">{p.name}</span>
                    <span
                      className={
                        p.stock <= p.minimumStock
                          ? 'font-bold text-amber-700'
                          : 'text-slate-500'
                      }
                    >
                      {p.stock} u.
                    </span>
                  </button>
                ))}
            </div>
          </>
        )}
      </Modal>
    </motion.div>
  );
}
const guides = [
  {
    t: 'Consultar stock',
    icon: BookOpen,
    steps: [
      'Entrá en “Inventario” o usá el buscador del inicio.',
      'Buscá un producto y abrí “Ver detalle”.',
      'Revisá el stock actual y el mínimo.',
    ],
  },
  {
    t: 'Buscar productos',
    icon: BookOpen,
    steps: [
      'Usá el buscador del inicio, Inventario, Productos o Registrar venta.',
      'Escribí un nombre, categoría o código; por ejemplo, CUA-001.',
      'Los resultados se actualizan al escribir.',
    ],
  },
  {
    t: 'Registrar una venta',
    icon: ClipboardList,
    steps: [
      'Entrá en “Registrar venta” desde el inicio.',
      'Buscá y agregá el producto. Ajustá la cantidad con + o −.',
      'Presioná “Revisar venta”, elegí cómo pagó el cliente y confirmá.',
      'Abrí “Ver stock actualizado” para comprobar el descuento automático.',
    ],
  },
  {
    t: 'Identificar stock bajo',
    icon: PackagePlus,
    steps: [
      'En el inicio, presioná “Stock bajo” o “Ver todas las alertas”.',
      'Los productos con stock igual o menor al mínimo necesitan reposición.',
      'Abrí el detalle del producto para consultar su proveedor.',
    ],
  },
  {
    t: 'Consultar reportes',
    icon: CircleHelp,
    steps: [
      'Entrá en “Reportes” y elegí un período.',
      'Consultá el total y la cantidad de ventas.',
      'En “Productos más vendidos”, la posición 1 indica el producto con más unidades vendidas.',
    ],
  },
  {
    t: 'Encontrar proveedores',
    icon: Truck,
    steps: [
      'Buscá el producto en Inventario y abrí su detalle.',
      'Presioná el nombre del proveedor para ver sus datos de contacto.',
      'También podés buscar por producto o proveedor en “Proveedores”.',
    ],
  },
  {
    t: 'Agregar un producto',
    icon: BookOpen,
    steps: [
      'Abrí “Productos” y presioná “Nuevo producto”.',
      'Completá nombre, código, precio, stock, mínimo y proveedor.',
      'Presioná “Guardar producto”.',
    ],
  },
  {
    t: 'Reponer stock',
    icon: PackagePlus,
    steps: [
      'Abrí “Inventario” y buscá el producto.',
      'Presioná “Reponer” e ingresá la cantidad recibida.',
      'Guardá el ingreso. El stock y las alertas se actualizan solos.',
    ],
  },
];
export function Help() {
  const nav = useNavigate();
  const [guide, setGuide] = useState<(typeof guides)[number] | null>(null);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="mb-6">
        <p className="text-sm font-bold text-blue-600">APRENDÉ A TU RITMO</p>
        <h1 className="text-3xl font-extrabold">Guía rápida</h1>
        <p className="mt-1 text-slate-500">
          Guías cortas para resolver las tareas de todos los días.
        </p>
        <button
          onClick={() => nav('/inicio')}
          className="mt-3 text-sm font-bold text-blue-600"
        >
          Volver al inicio
        </button>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((g) => (
          <button
            key={g.t}
            onClick={() => setGuide(g)}
            className="group flex items-center gap-4 rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <g.icon />
            </div>
            <div className="flex-1">
              <h2 className="font-extrabold">{g.t}</h2>
              <p className="text-sm text-slate-500">
                Guía de {g.steps.length} pasos
              </p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-600" />
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#0f2f5f] to-[#312e81] p-6 text-white">
        <h2 className="text-xl font-extrabold">LocalTech acompaña tu rutina</h2>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          No necesitás aprender un sistema enorme. Empezá por una tarea y seguí
          cuando te sientas cómoda. Tus cambios quedan guardados en este
          dispositivo.
        </p>
      </div>
      <Modal
        open={!!guide}
        onClose={() => setGuide(null)}
        title={guide?.t || ''}
      >
        {guide && (
          <ol className="space-y-4">
            {guide.steps.map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 font-extrabold text-white">
                  {i + 1}
                </span>
                <p className="pt-2 font-semibold">{s}</p>
              </li>
            ))}
          </ol>
        )}
      </Modal>
    </motion.div>
  );
}
export function Settings() {
  const { state, dispatch, reset } = useStore();
  const [form, setForm] = useState(state.settings);
  const [confirm, setConfirm] = useState(false);
  const save = () => {
    if (!form.storeName.trim() || !form.location.trim()) {
      toast.error('Completá el nombre y la ubicación de la librería.');
      return;
    }
    dispatch({ type: 'SAVE_SETTINGS', payload: form });
    toast.success('Configuración guardada');
  };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="mb-6">
        <p className="text-sm font-bold text-blue-600">PREFERENCIAS</p>
        <h1 className="text-3xl font-extrabold">Configuración</h1>
        <p className="mt-1 text-slate-500">
          Solo lo esencial para tu librería.
        </p>
      </header>
      <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Store />
            </div>
            <h2 className="font-extrabold">Mi librería</h2>
          </div>
          <div className="space-y-4">
            <Field label="Nombre">
              <input
                value={form.storeName}
                onChange={(e) =>
                  setForm({ ...form, storeName: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Propietaria">
              <input readOnly value={form.owner} className={inputClass} />
            </Field>
            <Field label="Ubicación">
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputClass}
              />
            </Field>
            <button
              onClick={save}
              className="h-11 w-full rounded-xl bg-blue-600 font-bold text-white"
            >
              <Save className="mr-2 inline" size={18} />
              Guardar cambios
            </button>
          </div>
        </section>
        <section className="space-y-6">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="font-extrabold">Preferencias de inventario</h2>
            <label className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-sm font-bold">Alertas de stock bajo</p>
                <p className="text-xs text-slate-500">
                  Mostrar el contador de avisos sin leer. Los indicadores del
                  inventario siguen visibles.
                </p>
              </div>
              <input
                aria-label="Activar alertas de stock bajo"
                type="checkbox"
                checked={form.lowStockAlerts}
                onChange={(e) =>
                  setForm({ ...form, lowStockAlerts: e.target.checked })
                }
                className="h-5 w-5 accent-blue-600"
              />
            </label>
          </div>
          <div className="rounded-2xl border border-red-100 bg-white p-6">
            <h2 className="font-extrabold">Datos de demostración</h2>
            <p className="mt-2 text-sm text-slate-500">
              Restaurá productos, ventas y stock para repetir la presentación
              desde cero.
            </p>
            <button
              onClick={() => setConfirm(true)}
              className="mt-4 h-11 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-600"
            >
              <RotateCcw className="mr-2 inline" size={17} />
              Restablecer datos de demostración
            </button>
          </div>
        </section>
      </div>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="¿Restablecer la demostración?"
      >
        <p className="text-sm text-slate-500">
          Se borrarán las modificaciones locales y volverá el escenario inicial,
          incluido Cuaderno Éxito A4 con 6 unidades.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setConfirm(false)}
            className="h-11 rounded-xl border px-4 font-bold"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              reset();
              setForm({
                ...state.settings,
                storeName: 'Librería CLIP',
                owner: 'Martina Ferrero',
                location: 'Sunchales, Santa Fe',
                lowStockAlerts: true,
              });
              setConfirm(false);
            }}
            className="h-11 rounded-xl bg-red-600 px-4 font-bold text-white"
          >
            Sí, restablecer
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
