import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LocalTech — Gestión simple para tu librería',
  description: 'Inventario, ventas y reportes simples para Librería CLIP.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
