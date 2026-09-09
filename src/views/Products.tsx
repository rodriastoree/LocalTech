'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { matchesProduct } from '../data/helpers';
import { fmt, statusOf, useStore } from '../context/Store';
import { Empty, Field, inputClass, Modal, StatusBadge } from '../components/UI';
import type { Category, Product } from '../types';
const blank = (): Product => ({
  id: `p-${Date.now()}`,
  code: '',
  name: '',
  category: 'Cuadernos',
  price: 0,
  stock: 0,
  minimumStock: 1,
  supplierId: 's1',
  description: '',
});
export default function Products() {
  const { state, dispatch } = useStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [status, setStatus] = useState('Todos');
  const [edit, setEdit] = useState<Product | null>(null);
  const [remove, setRemove] = useState<Product | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (params.get('nuevo')) {
      setEdit(blank());
      setParams({});
    }
  }, [params, setParams]);
  const categories = [
    'Todas',
    ...new Set(state.products.map((p) => p.category)),
  ];
  const filtered = state.products.filter(
    (p) =>
      matchesProduct(p, query) &&
      (category === 'Todas' || p.category === category) &&
      (status === 'Todos' ||
        (status === 'Stock bajo'
          ? p.stock <= p.minimumStock
          : statusOf(p) === status)),
  );
  const save = () => {
    if (!edit) return;
    const e: Record<string, string> = {};
    if (!edit.name.trim()) e.name = 'El nombre es obligatorio.';
    if (!edit.code.trim()) e.code = 'El código es obligatorio.';
    if (!Number.isFinite(edit.price) || edit.price <= 0)
      e.price = 'El precio debe ser mayor a 0.';
    if (!Number.isSafeInteger(edit.stock) || edit.stock < 0)
      e.stock = 'Usá un número entero igual o mayor a cero.';
    if (!Number.isSafeInteger(edit.minimumStock) || edit.minimumStock < 0)
      e.minimumStock = 'Usá un número entero igual o mayor a cero.';
    if (
      state.products.some(
        (p) =>
          p.id !== edit.id &&
          p.code.trim().toLowerCase() === edit.code.trim().toLowerCase(),
      )
    )
      e.code = 'Este código ya está en uso.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const exists = state.products.some((p) => p.id === edit.id);
    if (exists) dispatch({ type: 'UPDATE_PRODUCT', payload: edit });
    else dispatch({ type: 'ADD_PRODUCT', payload: edit });
    toast.success(
      exists
        ? 'Producto actualizado correctamente'
        : 'Producto agregado correctamente',
    );
    setEdit(null);
  };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-blue-600">CATÁLOGO</p>
          <h1 className="text-3xl font-extrabold">Productos</h1>
          <p className="mt-1 text-slate-500">
            Precios y datos del catálogo, sin complicaciones.
          </p>
        </div>
        <button
          onClick={() => {
            setEdit(blank());
            setErrors({});
          }}
          className="h-12 rounded-xl bg-blue-600 px-5 font-bold text-white"
        >
          <Plus className="mr-2 inline" size={19} />
          Nuevo producto
        </button>
      </header>
      <div className="mb-5 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[1fr_190px_190px]">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar productos"
            placeholder="Buscar por nombre, categoría o código..."
            className="h-11 w-full rounded-xl border bg-slate-50 pl-10 pr-3 text-sm"
          />
        </div>
        <select
          aria-label="Filtrar por categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Filtrar por estado"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={inputClass}
        >
          <option>Todos</option>
          <option>Disponible</option>
          <option>Stock bajo</option>
          <option>Sin stock</option>
        </select>
      </div>
      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <motion.article
              whileHover={{ y: -2 }}
              key={p.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-100 font-extrabold text-blue-700">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <StatusBadge product={p} />
              </div>
              <h2 className="font-extrabold">{p.name}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {p.code} · {p.category}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-xs text-slate-500">Precio</p>
                  <p className="font-extrabold">{fmt(p.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Stock</p>
                  <p className="font-extrabold">{p.stock} unidades</p>
                </div>
              </div>
              <p className="mt-3 truncate text-xs text-slate-500">
                {state.suppliers.find((s) => s.id === p.supplierId)?.name}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setEdit({ ...p });
                    setErrors({});
                  }}
                  className="flex-1 rounded-xl border py-2.5 text-sm font-bold"
                >
                  <Pencil className="mr-1 inline" size={16} />
                  Editar
                </button>
                <button
                  aria-label="Eliminar producto"
                  onClick={() => setRemove(p)}
                  className="grid w-11 place-items-center rounded-xl border text-red-600"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <Empty
          text="No encontramos productos con estos filtros."
          onClear={() => {
            setQuery('');
            setCategory('Todas');
            setStatus('Todos');
          }}
        />
      )}
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={
          state.products.some((p) => p.id === edit?.id)
            ? 'Editar producto'
            : 'Nuevo producto'
        }
        size="max-w-2xl"
      >
        {edit && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre *" error={errors.name}>
              <input
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Código *" error={errors.code}>
              <input
                value={edit.code}
                onChange={(e) => setEdit({ ...edit, code: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Categoría *">
              <select
                value={edit.category}
                onChange={(e) =>
                  setEdit({ ...edit, category: e.target.value as Category })
                }
                className={inputClass}
              >
                {[
                  'Libros',
                  'Cuadernos',
                  'Escritura',
                  'Papelería',
                  'Arte',
                  'Escolar',
                  'Oficina',
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Precio *" error={errors.price}>
              <input
                type="number"
                value={edit.price}
                onChange={(e) =>
                  setEdit({ ...edit, price: Number(e.target.value) })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Stock inicial *" error={errors.stock}>
              <input
                type="number"
                value={edit.stock}
                onChange={(e) =>
                  setEdit({ ...edit, stock: Number(e.target.value) })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Stock mínimo *" error={errors.minimumStock}>
              <input
                type="number"
                min="0"
                value={edit.minimumStock}
                onChange={(e) =>
                  setEdit({ ...edit, minimumStock: Number(e.target.value) })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Proveedor">
              <select
                value={edit.supplierId}
                onChange={(e) =>
                  setEdit({ ...edit, supplierId: e.target.value })
                }
                className={inputClass}
              >
                {state.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Descripción opcional">
              <input
                value={edit.description}
                onChange={(e) =>
                  setEdit({ ...edit, description: e.target.value })
                }
                className={inputClass}
              />
            </Field>
            <button
              onClick={save}
              className="h-12 rounded-xl bg-blue-600 font-bold text-white sm:col-span-2"
            >
              <BookOpen className="mr-2 inline" size={18} />
              Guardar producto
            </button>
          </div>
        )}
      </Modal>
      <Modal
        open={!!remove}
        onClose={() => setRemove(null)}
        title="¿Eliminar este producto?"
      >
        <p className="text-sm text-slate-500">
          Esta acción quitará el producto del catálogo de demostración.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setRemove(null)}
            className="h-11 rounded-xl border px-4 font-bold"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (remove) {
                dispatch({ type: 'DELETE_PRODUCT', payload: remove.id });
                toast.success('Producto eliminado');
                setRemove(null);
              }
            }}
            className="h-11 rounded-xl bg-red-600 px-4 font-bold text-white"
          >
            Eliminar producto
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
