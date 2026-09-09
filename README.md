# LocalTech — prototipo de librería

Prototipo de interfaz para una prueba de usabilidad con **Martina Ferrero**, propietaria ficticia de Librería CLIP. Funciona con React y Vite, sin backend, API, base de datos, autenticación ni pagos reales.

## Ejecutar

Requiere Node.js 22.13 o posterior.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Abrir la dirección que muestra Vite. Para validar:

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

`npm test` necesita la aplicación en ejecución. Utiliza `playwright-core`, ya incluido, y Chrome instalado. Por defecto espera `http://127.0.0.1:5173/` y Chrome en `C:\Program Files\Google\Chrome\Application\chrome.exe`. Se pueden configurar `BASE_URL` y `CHROME_PATH`. Las evidencias se guardan en `outputs/`, excluido de Git. `node tests/smoke.mjs` conserva el acceso a la misma suite.

## Preparar el testeo

1. Abrir **Configuración → Restablecer datos de demostración → Sí, restablecer**.
2. Leer **Guía rápida** y volver al inicio.
3. Buscar **CUA-001**: Cuaderno Éxito A4 rayado, stock **6**, mínimo **5**.
4. Desde el detalle, abrir **Registrar venta**, agregar una unidad y presionar **Revisar venta**.
5. Elegir cualquier medio de pago simulado y confirmar. Total: **$8.450**.
6. Abrir **Ver stock actualizado**: quedan **5** y aparece **Stock bajo** automáticamente.
7. Consultar **Distribuidora Escolar SRL** desde el detalle del producto.
8. Abrir **Reportes** y consultar **Productos más vendidos**. La venta nueva se incorpora al período correspondiente.

Puede repetirse la venta para demostrar un stock por debajo del mínimo. Reponer diez unidades elimina la alerta si se supera el mínimo.

## Datos y estado

- 32 productos, 7 categorías, 5 proveedores ficticios y 40 ventas iniciales. Seis productos comienzan con stock bajo o agotado.
- `src/data/seed.ts` define los datos; las ventas iniciales se ubican en los últimos ocho días al cargar la aplicación.
- `src/context/Store.tsx` comparte el estado con Context y `useReducer`. Confirmar una venta actualiza ventas, stock, movimientos, actividad y alertas en la misma transición.
- `localStorage` conserva el escenario en ese navegador. Se migra el nombre guardado a Martina Ferrero sin borrar las ventas ni las existencias. Si el almacenamiento está bloqueado, se conserva el estado en memoria hasta cerrar la pestaña.
- Dashboard y Reportes calculan totales y gráficos desde las ventas del estado. Las búsquedas admiten nombre, código y categoría, sin distinguir mayúsculas ni tildes.
- Las alertas activas corresponden a `stock <= minimumStock`, incluido stock cero. Leer un aviso no elimina la necesidad de reposición. La preferencia de avisos controla el contador de notificaciones; los estados del inventario permanecen visibles.

## Alcance

Los datos pertenecen al navegador y al origen utilizado: no se comparten entre dispositivos ni pestañas abiertas. Al salir de Registrar venta, un carrito pendiente no se guarda. Las ventas confirmadas sí se conservan. Los contactos y comprobantes son ficticios; no se envían pedidos, cobran pagos ni emiten facturas. Las tablas se desplazan horizontalmente en pantallas pequeñas.

No se agregaron dependencias ni integraciones externas. El build produce archivos estáticos en `dist/`. El repositorio conserva su configuración previa de alojamiento sin registrar ni publicar servicios nuevos.

La auditoría y los resultados están documentados en `docs/validacion.md`.
