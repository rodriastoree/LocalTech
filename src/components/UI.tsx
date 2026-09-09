'use client';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import type { Product } from '../types';
import { statusOf } from '../context/Store';

export function Modal({open,onClose,title,children,size='max-w-lg'}:{open:boolean;onClose:()=>void;title:string;children:React.ReactNode;size?:string}){
 return <AnimatePresence>{open&&<div className="fixed inset-0 z-[80] grid place-items-center p-4"><motion.button aria-label="Cerrar" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="absolute inset-0 bg-[#0f172a]/55 backdrop-blur-sm"/><motion.dialog open initial={{opacity:0,scale:.96,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.97}} className={`relative max-h-[90vh] w-full overflow-auto rounded-2xl bg-white p-6 shadow-2xl ${size}`}><header className="mb-5 flex items-center justify-between"><h2 className="text-xl font-extrabold">{title}</h2><button aria-label="Cerrar" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100"><X size={18}/></button></header>{children}</motion.dialog></div>}</AnimatePresence>
}
export function StatusBadge({product}:{product:Product}){const s=statusOf(product);return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${s==='Disponible'?'bg-green-50 text-green-700':s==='Stock bajo'?'bg-amber-50 text-amber-700':'bg-red-50 text-red-700'}`}>{s}</span>}
export function Empty({text,onClear}:{text:string;onClear?:()=>void}){return <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><div><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500"><Check/></div><p className="font-bold">{text}</p>{onClear&&<button onClick={onClear} className="mt-3 text-sm font-bold text-blue-600">Limpiar filtros</button>}</div></div>}
export const Field=({label,children,error}:{label:string;children:React.ReactNode;error?:string})=><label className="block text-sm font-semibold text-slate-700"><span className="mb-1.5 block">{label}</span>{children}{error&&<span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
export const inputClass='h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100';
