'use client';
import { lazy,Suspense,useState } from 'react';
import { HashRouter,Navigate,Route,Routes } from 'react-router-dom';
import { BookOpen,Check,Package,ShoppingCart,X } from 'lucide-react';
import { Toaster } from 'sonner';
import { AppShell } from './components/AppShell';
import { StoreProvider } from './context/Store';
const Dashboard=lazy(()=>import('./views/Dashboard'));
const POS=lazy(()=>import('./views/POS'));
const Inventory=lazy(()=>import('./views/Inventory'));
const Products=lazy(()=>import('./views/Products'));
const Sales=lazy(()=>import('./views/Sales'));
const Reports=lazy(()=>import('./views/Reports'));
const Suppliers=lazy(()=>import('./views/Secondary').then(m=>({default:m.Suppliers})));
const Help=lazy(()=>import('./views/Secondary').then(m=>({default:m.Help})));
const Settings=lazy(()=>import('./views/Secondary').then(m=>({default:m.Settings})));
function Onboarding(){
 const [step,setStep]=useState(()=>typeof window!=='undefined'&&localStorage.getItem('localtech-onboarding')?4:0);if(step>2)return null;const data=[{icon:BookOpen,title:'Todo lo importante, a la vista',text:'LocalTech muestra ventas, stock y alertas con palabras simples.'},{icon:ShoppingCart,title:'Vendé en pocos pasos',text:'Buscá el producto, agregalo y elegí cómo pagó el cliente.'},{icon:Package,title:'El stock se actualiza solo',text:'Cada venta descuenta unidades y te avisa cuándo conviene reponer.'}][step];const finish=()=>{localStorage.setItem('localtech-onboarding','done');setStep(4)};return <div className="fixed inset-0 z-[100] grid place-items-center bg-[#0f172a]/65 p-4 backdrop-blur-sm"><div className="relative w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl"><button onClick={finish} aria-label="Omitir bienvenida" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg bg-slate-100"><X size={17}/></button><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700"><data.icon size={30}/></div><p className="mt-5 text-xs font-bold uppercase tracking-wider text-blue-600">Bienvenida · {step+1} de 3</p><h2 className="mt-2 text-2xl font-extrabold">{data.title}</h2><p className="mt-2 text-slate-500">{data.text}</p><div className="mt-6 flex gap-2">{[0,1,2].map(i=><span key={i} className={`h-1.5 flex-1 rounded-full ${i<=step?'bg-blue-600':'bg-slate-200'}`}/>)}</div><button onClick={()=>step===2?finish():setStep(step+1)} className="mt-6 h-12 w-full rounded-xl bg-blue-600 font-bold text-white">{step===2?<><Check className="mr-2 inline" size={18}/>Empezar</>:'Siguiente'}</button><button onClick={finish} className="mt-3 text-sm font-bold text-slate-500">Omitir guía</button></div></div>}
function Routed(){return <AppShell><Suspense fallback={<div className="grid min-h-96 place-items-center text-sm font-bold text-slate-500">Cargando…</div>}><Routes><Route path="/inicio" element={<Dashboard/>}/><Route path="/nueva-venta" element={<POS/>}/><Route path="/ventas" element={<Sales/>}/><Route path="/inventario" element={<Inventory/>}/><Route path="/productos" element={<Products/>}/><Route path="/reportes" element={<Reports/>}/><Route path="/proveedores" element={<Suppliers/>}/><Route path="/ayuda" element={<Help/>}/><Route path="/configuracion" element={<Settings/>}/><Route path="*" element={<Navigate to="/inicio" replace/>}/></Routes></Suspense></AppShell>}
export default function App(){return <StoreProvider><HashRouter><Routed/></HashRouter><Onboarding/><Toaster richColors position="top-right" closeButton/></StoreProvider>}
