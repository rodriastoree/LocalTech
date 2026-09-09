'use client';
import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import type { Product } from '../types';
import { statusOf } from '../context/Store';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.dialog
          ref={ref}
          aria-labelledby={titleId}
          onCancel={(e) => {
            e.preventDefault();
            onClose();
          }}
          onClick={(e) => {
            if (e.target !== e.currentTarget) return;
            const rect = e.currentTarget.getBoundingClientRect();
            if (
              e.clientX < rect.left ||
              e.clientX > rect.right ||
              e.clientY < rect.top ||
              e.clientY > rect.bottom
            )
              onClose();
          }}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className={`prototype-dialog m-auto max-h-[90dvh] w-[calc(100%-2rem)] overflow-auto rounded-2xl border-0 bg-white p-6 text-[#172033] shadow-2xl ${size}`}
        >
          <header className="mb-5 flex items-center justify-between gap-4">
            <h2 id={titleId} className="text-xl font-extrabold">
              {title}
            </h2>
            <button
              aria-label="Cerrar"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100"
            >
              <X size={18} />
            </button>
          </header>
          {children}
        </motion.dialog>
      )}
    </AnimatePresence>
  );
}
export function StatusBadge({ product }: { product: Product }) {
  const s = statusOf(product);
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${s === 'Disponible' ? 'bg-green-50 text-green-700' : s === 'Stock bajo' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}
    >
      {s}
    </span>
  );
}
export function Empty({
  text,
  onClear,
}: {
  text: string;
  onClear?: () => void;
}) {
  return (
    <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div>
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
          <Check />
        </div>
        <p className="font-bold">{text}</p>
        {onClear && (
          <button
            onClick={onClear}
            className="mt-3 text-sm font-bold text-blue-600"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
export const Field = ({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) => (
  <label className="block text-sm font-semibold text-slate-700">
    <span className="mb-1.5 block">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);
export const inputClass =
  'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
