'use client';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { toast } from 'sonner';
import { initialState } from '../data/seed';
import type { DemoState, PaymentMethod, Product, Settings } from '../types';

const KEY = 'localtech-demo-state';
const fresh = () => JSON.parse(JSON.stringify(initialState)) as DemoState;
type Action =
  | {
      type: 'SALE';
      payload: {
        cart: { product: Product; quantity: number }[];
        paymentMethod: PaymentMethod;
      };
    }
  | {
      type: 'RESTOCK';
      payload: {
        productId: string;
        quantity: number;
        supplierId: string;
        note?: string;
      };
    }
  | { type: 'ADJUST'; payload: { productId: string; stock: number } }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'READ_NOTIFICATION'; payload: string }
  | { type: 'SAVE_SETTINGS'; payload: Settings }
  | { type: 'RESET' };
type Ctx = {
  state: DemoState;
  dispatch: React.Dispatch<Action>;
  sale: (
    cart: { product: Product; quantity: number }[],
    method: PaymentMethod,
  ) => string;
  restock: (id: string, qty: number, supplierId: string, note?: string) => void;
  reset: () => void;
};

const Context = createContext<Ctx | null>(null);
const atRisk = (p: Product) => p.stock <= p.minimumStock;
const notificationFor = (p: Product, date: string) => ({
  id: `n-${Date.now()}-${p.id}`,
  productId: p.id,
  title: p.stock === 0 ? 'Sin stock' : 'Stock bajo',
  message:
    p.stock === 0
      ? 'No quedan unidades disponibles.'
      : `Quedan ${p.stock} unidades. El mínimo configurado es ${p.minimumStock}.`,
  read: false,
  createdAt: date,
});
function syncAlerts(state: DemoState): DemoState {
  return {
    ...state,
    notifications: state.products.filter(atRisk).map((p) => {
      const previous = state.notifications.find((n) => n.productId === p.id);
      const current = notificationFor(p, new Date().toISOString());
      return previous
        ? {
            ...current,
            id: previous.id,
            createdAt: previous.createdAt,
            read:
              previous.message === current.message &&
              previous.title === current.title
                ? previous.read
                : false,
          }
        : current;
    }),
  };
}
export function saleError(
  state: DemoState,
  cart: { product: Product; quantity: number }[],
) {
  if (!cart.length) return 'Agregá al menos un producto.';
  const totals = new Map<string, number>();
  for (const item of cart) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1)
      return 'La cantidad debe ser un número entero mayor a cero.';
    totals.set(
      item.product.id,
      (totals.get(item.product.id) || 0) + item.quantity,
    );
  }
  for (const [id, quantity] of totals) {
    const product = state.products.find((p) => p.id === id);
    if (!product) return 'Un producto ya no está en el catálogo.';
    if (quantity > product.stock)
      return `Stock insuficiente: ${product.name} tiene ${product.stock} unidades.`;
  }
  return null;
}
const nextSaleId = (state: DemoState) =>
  `V-${Math.max(1047, ...state.sales.map((s) => Number(s.id.replace('V-', '')) || 0)) + 1}`;
function reduceAction(state: DemoState, action: Action): DemoState {
  if (action.type === 'RESET') return fresh();
  if (action.type === 'READ_NOTIFICATION')
    return {
      ...state,
      notifications: state.notifications.map((n) =>
        n.id === action.payload ? { ...n, read: true } : n,
      ),
    };
  if (action.type === 'SAVE_SETTINGS')
    return { ...state, settings: action.payload };
  if (action.type === 'DELETE_PRODUCT')
    return {
      ...state,
      products: state.products.filter((p) => p.id !== action.payload),
      notifications: state.notifications.filter(
        (n) => n.productId !== action.payload,
      ),
    };
  if (action.type === 'ADD_PRODUCT')
    return {
      ...state,
      products: [action.payload, ...state.products],
      activity: [
        {
          id: `a-${Date.now()}`,
          text: `Producto “${action.payload.name}” agregado.`,
          createdAt: new Date().toISOString(),
          type: 'product',
        },
        ...state.activity,
      ],
    };
  if (action.type === 'UPDATE_PRODUCT')
    return {
      ...state,
      products: state.products.map((p) =>
        p.id === action.payload.id ? action.payload : p,
      ),
    };
  if (action.type === 'ADJUST') {
    const now = new Date().toISOString();
    const before = state.products.find(
      (p) => p.id === action.payload.productId,
    );
    if (
      !before ||
      !Number.isSafeInteger(action.payload.stock) ||
      action.payload.stock < 0
    )
      return state;
    const updated = { ...before, stock: action.payload.stock };
    const keep = state.notifications.filter((n) => n.productId !== updated.id);
    return {
      ...state,
      products: state.products.map((p) => (p.id === updated.id ? updated : p)),
      notifications: atRisk(updated)
        ? [notificationFor(updated, now), ...keep]
        : keep,
      movements: [
        {
          id: `m-${Date.now()}`,
          productId: updated.id,
          quantity: updated.stock - before.stock,
          type: 'Ajuste',
          date: now,
          reference: 'Ajuste manual',
        },
        ...state.movements,
      ],
    };
  }
  if (action.type === 'RESTOCK') {
    const now = new Date().toISOString();
    const current = state.products.find(
      (p) => p.id === action.payload.productId,
    );
    if (
      !current ||
      !Number.isSafeInteger(action.payload.quantity) ||
      action.payload.quantity < 1
    )
      return state;
    const updated = {
      ...current,
      stock: current.stock + action.payload.quantity,
      supplierId: action.payload.supplierId,
    };
    const stillRisk = atRisk(updated);
    return {
      ...state,
      products: state.products.map((p) => (p.id === updated.id ? updated : p)),
      notifications: stillRisk
        ? [
            notificationFor(updated, now),
            ...state.notifications.filter((n) => n.productId !== updated.id),
          ]
        : state.notifications.filter((n) => n.productId !== updated.id),
      movements: [
        {
          id: `m-${Date.now()}`,
          productId: updated.id,
          quantity: action.payload.quantity,
          type: 'Ingreso',
          date: now,
          reference: action.payload.note || 'Ingreso de mercadería',
        },
        ...state.movements,
      ],
      activity: [
        {
          id: `a-${Date.now()}`,
          text: `Stock de ${updated.name} actualizado: ${updated.stock} unidades.`,
          createdAt: now,
          type: 'stock',
        },
        ...state.activity,
      ],
    };
  }
  if (action.type === 'SALE') {
    if (saleError(state, action.payload.cart)) return state;
    const now = new Date().toISOString();
    const id = nextSaleId(state);
    const sale = {
      id,
      date: now,
      items: action.payload.cart.map((x) => ({
        productId: x.product.id,
        name: x.product.name,
        quantity: x.quantity,
        price: x.product.price,
      })),
      paymentMethod: action.payload.paymentMethod,
      total: action.payload.cart.reduce(
        (s, x) => s + x.product.price * x.quantity,
        0,
      ),
      status: 'Completada' as const,
    };
    let notes = [...state.notifications];
    const moves = [...state.movements];
    const changed = new Map<string, Product>();
    action.payload.cart.forEach(({ product, quantity }) => {
      const updated = {
        ...state.products.find((p) => p.id === product.id)!,
        stock: Math.max(
          0,
          state.products.find((p) => p.id === product.id)!.stock - quantity,
        ),
      };
      changed.set(product.id, updated);
      const is = atRisk(updated);
      notes = notes.filter((n) => n.productId !== updated.id);
      if (is) notes.unshift(notificationFor(updated, now));
      moves.unshift({
        id: `m-${Date.now()}-${product.id}`,
        productId: product.id,
        quantity: -quantity,
        type: 'Venta',
        date: now,
        reference: `Venta #${id}`,
      });
    });
    return {
      ...state,
      products: state.products.map((p) => changed.get(p.id) || p),
      sales: [sale, ...state.sales],
      movements: moves,
      notifications: notes,
      activity: [
        {
          id: `a-${Date.now()}`,
          text: `Venta #${id} registrada por ${fmt(sale.total)}.`,
          createdAt: now,
          type: 'sale',
        },
        ...state.activity,
      ],
    };
  }
  return state;
}
function reducer(state: DemoState, action: Action): DemoState {
  const next = reduceAction(state, action);
  return next === state ? state : syncAlerts(next);
}
function loadState(): DemoState {
  if (typeof window === 'undefined') return syncAlerts(fresh());
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return syncAlerts(fresh());
    const value = JSON.parse(stored) as DemoState;
    if (
      !value.settings ||
      ![
        'products',
        'sales',
        'suppliers',
        'movements',
        'notifications',
        'activity',
      ].every((key) => Array.isArray(value[key as keyof DemoState]))
    )
      return syncAlerts(fresh());
    // Migrate the visual identity without losing this device's demonstration data.
    value.settings.owner = 'Matías Ferrero';
    return syncAlerts(value);
  } catch {
    return syncAlerts(fresh());
  }
}
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      toast.info(
        'Los cambios se conservarán mientras esta pestaña siga abierta.',
        { id: 'storage-unavailable' },
      );
    }
  }, [state]);
  useEffect(() => {
    const d = document as Document & {
      modelContext?: { registerTool: (t: unknown, o?: unknown) => unknown };
    };
    if (!d.modelContext?.registerTool) return;
    const ac = new AbortController();
    void Promise.resolve(
      d.modelContext.registerTool(
        {
          name: 'registrar_ingreso_stock',
          title: 'Registrar ingreso de stock',
          description:
            'Suma unidades a un producto existente y actualiza sus alertas.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              quantity: { type: 'number', minimum: 1 },
            },
            required: ['productId', 'quantity'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute: (input: unknown) => {
            const x = input as { productId?: string; quantity?: number };
            if (
              !x.productId ||
              !Number.isInteger(x.quantity) ||
              x.quantity! < 1
            )
              throw new Error('Datos de ingreso inválidos');
            const p = state.products.find((y) => y.id === x.productId);
            if (!p) throw new Error('Producto no encontrado');
            dispatch({
              type: 'RESTOCK',
              payload: {
                productId: p.id,
                quantity: x.quantity!,
                supplierId: p.supplierId,
              },
            });
            return { productId: p.id, newStock: p.stock + x.quantity! };
          },
        },
        { signal: ac.signal },
      ),
    ).catch(() => {});
    return () => ac.abort();
  }, [state.products]);
  const value = useMemo<Ctx>(
    () => ({
      state,
      dispatch,
      sale: (cart, method) => {
        const error = saleError(state, cart);
        if (error) throw new Error(error);
        const id = nextSaleId(state);
        dispatch({ type: 'SALE', payload: { cart, paymentMethod: method } });
        return id;
      },
      restock: (productId, quantity, supplierId, note) =>
        dispatch({
          type: 'RESTOCK',
          payload: { productId, quantity, supplierId, note },
        }),
      reset: () => {
        dispatch({ type: 'RESET' });
        toast.success('Datos de demostración restablecidos.');
      },
    }),
    [state],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useStore = () => {
  const c = useContext(Context);
  if (!c) throw new Error('StoreProvider faltante');
  return c;
};
export const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);
export const statusOf = (p: Product) =>
  p.stock === 0
    ? 'Sin stock'
    : p.stock <= p.minimumStock
      ? 'Stock bajo'
      : 'Disponible';
export const friendlyTime = (date: string) => {
  const min = Math.max(
    1,
    Math.round((Date.now() - new Date(date).getTime()) / 60000),
  );
  return min < 60
    ? `Hace ${min} min`
    : min < 1440
      ? `Hace ${Math.round(min / 60)} h`
      : `Hace ${Math.round(min / 1440)} días`;
};
