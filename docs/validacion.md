# Auditoría y validación de LocalTech

## Base auditada

La aplicación activa utiliza `src/main.tsx` y Vite. Ya existían Inicio, Ventas, Nueva venta, Inventario, Productos, Reportes, Proveedores, Ayuda y Configuración, con navegación mediante HashRouter y carga diferida. También había bienvenida, notificaciones, modales, edición de productos, reposición, ajustes y reinicio de la demostración.

Se conservaron el diseño azul/violeta, la navegación lateral con menú móvil, tarjetas, tablas, gráficos Recharts, animaciones Motion y notificaciones Sonner. La base ya contaba con Context, reducer, localStorage y datos propios de una librería. No fue necesario reconstruirla.

## Correcciones y ampliaciones

- Identidad visual consistente: Matías Ferrero, saludo, iniciales MF y configuración. Migración del nombre almacenado sin perder el escenario.
- Búsqueda común por nombre, categoría y código; tolerancia a tildes y mayúsculas; respuesta sin resultados. El buscador global muestra existencias y permite abrir todos los resultados.
- Acceso directo del indicador de stock bajo al inventario filtrado. Incluye productos agotados y los que están exactamente en el mínimo.
- Alertas sincronizadas al vender, reponer, ajustar, crear, editar o eliminar productos.
- Venta con límite de unidades, total, revisión, confirmación, cancelación explícita y acceso al stock actualizado o al comprobante exacto.
- Totales y gráficos obtenidos del estado local: sin fechas de corte fijas, porcentajes de crecimiento inventados ni series desconectadas de las ventas.
- Acceso del producto a su proveedor, búsqueda de proveedores por producto y regreso al inventario.
- Ayuda para consultar stock, buscar, vender, identificar faltantes, consultar reportes y encontrar proveedores. Se mantienen las guías de alta y reposición.
- Modales nativos con nombre accesible, Escape, control del foco, bloqueo del fondo y cierre funcional; se conservan sus animaciones.
- Validación de códigos duplicados, cantidades enteras, existencias y mínimos no negativos. Manejo de almacenamiento no disponible.
- Corrección del desborde móvil en Reportes, ranking del inicio y catálogo de venta.
- Acceso fijo al carrito y al total en móvil para confirmar una venta sin recorrer todo el catálogo.

## Diez escenarios

La suite `tests/usability.mjs` opera botones, formularios y navegación real en Chrome. Las verificaciones del stock, las alertas y los comprobantes se realizan desde la interfaz; también contrasta los reportes y la persistencia con el estado almacenado.

**Resultado:** los diez escenarios y los cinco grupos adicionales aprobaron en Chrome, tanto sobre Vite como sobre el build estático. TypeScript, lint y build finalizaron correctamente; no se registraron errores ni advertencias de consola durante los recorridos. El acceso móvil al carrito también se verificó después del último ajuste.

| N.º | Escenario | Evidencia esperada |
| --- | --- | --- |
| 1 | Consultar stock | Inicio → búsqueda CUA-001 → detalle con 6 unidades |
| 2 | Stock bajo | Seis productos iniciales, incluidos agotados y stock igual al mínimo |
| 3 | Registrar venta | Una unidad, total $8.450, confirmación V-1048 |
| 4 | Descuento automático | Stock 6 → 5, estado Stock bajo y notificación |
| 5 | Facilidad de acceso | Todas las secciones accesibles; nombre consistente |
| 6 | Reportes | Ranking ordenado, posiciones, períodos y totales que incluyen la venta |
| 7 | Proveedor | Producto → Distribuidora Escolar SRL → productos asociados |
| 8 | Buscador | Nombre sin tildes, categoría, código, limpieza y sin resultados |
| 9 | Capacitación | Apertura y cierre de las ocho guías, regreso al inicio |
| 10 | Jornada completa | Consulta → venta → comprobante → stock 5 → 4 → alerta → proveedor → reporte |

Además se prueban límites de venta, cancelación sin afectar stock, reposición, ajustes inválidos, alta/edición/eliminación de productos, migración del nombre, reinicio, uso sin almacenamiento, rutas desconocidas y navegación en anchos de 320, 390, 768 y 1440 px. Se capturan errores y advertencias de consola, así como excepciones de página.

La salida reproducible de la última ejecución se encuentra en `outputs/functional-tests.json`; las capturas están en la misma carpeta. Ejecutar `npm test` vuelve a generarlas en un contexto de navegador aislado, sin alterar los datos de la pestaña del usuario.

## Archivos principales

- `src/context/Store.tsx`: estado, ventas, validaciones y alertas.
- `src/data/seed.ts`, `src/data/helpers.ts`: mocks, búsquedas y fechas.
- `src/views/Dashboard.tsx`, `Inventory.tsx`, `POS.tsx`, `Products.tsx`, `Reports.tsx`, `Sales.tsx`, `Secondary.tsx`: comportamiento de las pantallas.
- `src/components/AppShell.tsx`, `UI.tsx`, `src/App.tsx`, `src/styles.css`: navegación, buscador global, identidad, bienvenida, modales y responsive.
- `tests/usability.mjs`, `tests/smoke.mjs`, `package.json`: suite funcional y ejecución.

## Límites de la demostración

Todo se simula en frontend. No hay backend, autenticación, base de datos, pagos, facturación ni integración con Odoo. El historial inicial es ilustrativo; no pretende reconstruir cada movimiento histórico. Los datos guardados no se sincronizan entre dispositivos. Para comenzar una nueva sesión se recomienda restablecer la demostración desde Configuración.
