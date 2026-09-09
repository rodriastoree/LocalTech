import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = process.env.BASE_URL || 'http://127.0.0.1:5173/';
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  timezoneId: 'America/Argentina/Buenos_Aires',
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
const issues = [],
  results = [];
function attach(p) {
  p.on('console', (m) => {
    if (['error', 'warning'].includes(m.type()))
      issues.push(`${m.type()}: ${m.text()}`);
  });
  p.on('pageerror', (e) => issues.push(e.message));
}
attach(page);
fs.mkdirSync('outputs', { recursive: true });
const name = 'Cuaderno Éxito A4 rayado';
const row = () => page.locator('tbody tr').filter({ hasText: name });
const dialog = () => page.getByRole('dialog').last();
const button = (n, root = page) =>
  root.getByRole('button', { name: n, exact: true });
const close = async () => {
  await button('Cerrar', dialog()).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
};
const nav = async (n) => {
  if (await button('Abrir menú').isVisible())
    await button('Abrir menú').click();
  await page.getByRole('link', { name: n, exact: true }).click();
  await page
    .getByRole('heading', {
      name: n === 'Inicio' ? 'Hola, Martina' : n,
      exact: true,
    })
    .waitFor();
};
const stored = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem('localtech-demo-state')));
const capture = async (options) => {
  // Motion animates through requestAnimationFrame; wait for it before visual evidence.
  await page.waitForTimeout(1800);
  return page.screenshot(options);
};
async function test(n, run) {
  await run();
  results.push({ name: n, status: 'PASS' });
  console.log(`PASS ${n}`);
}
async function findGlobal() {
  await page.getByRole('textbox', { name: 'Búsqueda global' }).fill('CUA-001');
  await page
    .getByRole('button', { name: new RegExp(name) })
    .first()
    .click();
  await dialog().getByRole('heading', { name }).waitFor();
}
async function sell() {
  await page
    .getByRole('heading', { name: 'Registrar venta', exact: true })
    .waitFor();
  await page
    .getByPlaceholder('Buscar por nombre, categoría o código…')
    .fill('CUA-001');
  await button('Agregar', page.locator('article')).click();
  const mobileCart = page.getByRole('button', { name: /Ver venta ·/ });
  if (await mobileCart.isVisible()) await mobileCart.click();
  await page.getByRole('button', { name: /Revisar venta/ }).click();
  assert.ok(
    (await dialog().innerText()).replace(/\s/g, ' ').includes('$ 8.450'),
  );
  await button('Efectivo', dialog()).click();
  await button('Confirmar venta', dialog()).click();
  await page
    .getByRole('heading', { name: 'Venta registrada correctamente' })
    .waitFor();
}
try {
  await page.goto(base);
  await button('Omitir guía').click();
  await page.getByRole('heading', { name: 'Hola, Martina' }).waitFor();
  await test('1 — Consultar stock desde el inicio', async () => {
    await findGlobal();
    await dialog().getByText('6', { exact: true }).waitFor();
    await dialog().getByText('Disponible', { exact: true }).waitFor();
    await close();
  });
  await test('2 — Encontrar todos los productos con stock bajo', async () => {
    await nav('Inicio');
    await page.getByRole('button', { name: /Stock bajo.*6 productos/ }).click();
    await page.locator('tbody tr').first().waitFor();
    assert.equal(await page.locator('tbody tr').count(), 6);
    await page
      .locator('tbody tr')
      .filter({ hasText: 'Témpera Alba roja' })
      .getByText('Stock bajo', { exact: true })
      .waitFor();
    await page
      .locator('tbody tr')
      .filter({ hasText: 'Parker' })
      .getByText('Sin stock', { exact: true })
      .waitFor();
  });
  await test('3 — Registrar venta simulada y total correcto', async () => {
    await nav('Inicio');
    await button('Registrar venta').click();
    await sell();
    await dialog().getByText('Venta #V-1048').waitFor();
  });
  await test('4 — Descuento automático y alerta al alcanzar el mínimo', async () => {
    await button('Ver stock actualizado', dialog()).click();
    await page
      .getByRole('textbox', { name: 'Buscar productos' })
      .fill('CUA-001');
    assert.equal(await row().locator('td').nth(3).innerText(), '5');
    await row().getByText('Stock bajo', { exact: true }).waitFor();
    await button('Notificaciones').click();
    await page
      .getByRole('button', { name: /Stock bajo.*Cuaderno Éxito/ })
      .click();
    await dialog().getByText('5', { exact: true }).waitFor();
    await close();
  });
  await test('5 — Accesos principales y navegación', async () => {
    for (const [link, heading] of [
      ['Inicio', 'Hola, Martina'],
      ['Ventas', 'Ventas'],
      ['Inventario', 'Inventario'],
      ['Productos', 'Productos'],
      ['Proveedores', 'Proveedores'],
      ['Reportes', 'Reportes'],
      ['Guía rápida', 'Guía rápida'],
      ['Configuración', 'Configuración'],
    ]) {
      await nav(link);
      await page.getByRole('heading', { name: heading, exact: true }).waitFor();
      assert.ok(
        (await page.locator('body').innerText()).includes('Martina Ferrero'),
      );
    }
  });
  await test('6 — Reportes y ranking calculados desde ventas', async () => {
    await nav('Reportes');
    const state = await stored(),
      quantities = {};
    for (const sale of state.sales)
      for (const item of sale.items)
        quantities[item.name] = (quantities[item.name] || 0) + item.quantity;
    await button('30 días').click();
    assert.equal(
      Number(
        await page.locator('tbody tr').first().locator('td').nth(1).innerText(),
      ),
      Math.max(...Object.values(quantities)),
    );
    assert.equal(
      await page.locator('tbody tr').first().locator('td').last().innerText(),
      '1',
    );
    for (const period of ['Hoy', '7 días', '30 días', 'Este mes']) {
      await button(period).click();
      assert.ok(await page.locator('tbody tr').count());
    }
    await button('Hoy').click();
    const dateKey = (d) =>
      new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Argentina/Buenos_Aires',
      }).format(new Date(d));
    const total = state.sales
      .filter((s) => dateKey(s.date) === dateKey(new Date()))
      .reduce((sum, s) => sum + s.total, 0);
    const money = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    })
      .format(total)
      .replace(/\s/g, ' ');
    assert.ok(
      (
        await page
          .getByText('Ventas totales', { exact: true })
          .locator('..')
          .innerText()
      )
        .replace(/\s/g, ' ')
        .includes(money),
    );
    await capture({
      path: 'outputs/reportes-desktop.png',
      fullPage: true,
      animations: 'disabled',
    });
  });
  await test('7 — Consultar proveedor desde el producto', async () => {
    await findGlobal();
    await button('Distribuidora Escolar SRL', dialog()).click();
    await dialog().getByText('pedidos@escolar.example').waitFor();
    await dialog()
      .getByRole('button', { name: new RegExp(name) })
      .click();
    await dialog().getByRole('heading', { name }).waitFor();
    await close();
    await nav('Proveedores');
    await page
      .getByRole('textbox', { name: 'Buscar proveedores o productos' })
      .fill('CUA-001');
    assert.equal(await page.locator('article').count(), 1);
  });
  await test('8 — Búsquedas por nombre, categoría, código y sin resultados', async () => {
    for (const section of ['Inventario', 'Productos']) {
      await nav(section);
      const input = page.getByRole('textbox', { name: 'Buscar productos' });
      for (const query of ['cuaderno exito', 'CUA-001', 'Cuadernos']) {
        await input.fill(query);
        await page.getByText(name, { exact: true }).waitFor();
      }
      await input.fill('no-existe-999');
      await page
        .getByText('No encontramos productos con estos filtros.')
        .waitFor();
      await button('Limpiar filtros').click();
    }
    await page
      .getByRole('textbox', { name: 'Búsqueda global' })
      .fill('no-existe-999');
    await page
      .getByText('Sin resultados. Probá otro nombre, código o categoría.')
      .waitFor();
    await page
      .getByRole('textbox', { name: 'Búsqueda global' })
      .press('Escape');
  });
  await test('9 — Guía breve, cierre y uso posterior', async () => {
    await nav('Guía rápida');
    for (const guide of [
      'Consultar stock',
      'Buscar productos',
      'Registrar una venta',
      'Identificar stock bajo',
      'Consultar reportes',
      'Encontrar proveedores',
      'Agregar un producto',
      'Reponer stock',
    ]) {
      await page.getByRole('button', { name: new RegExp(guide) }).click();
      assert.ok((await dialog().locator('li').count()) >= 3);
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
    }
    await button('Volver al inicio').click();
    await page.getByRole('heading', { name: 'Hola, Martina' }).waitFor();
  });
  await test('10 — Jornada completa sin recargar', async () => {
    await findGlobal();
    await dialog().getByText('5', { exact: true }).waitFor();
    await button('Registrar venta', dialog()).click();
    await sell();
    await button('Ver comprobante', dialog()).click();
    await dialog()
      .getByRole('heading', { name: 'Venta #V-1049', exact: true })
      .waitFor();
    await close();
    await nav('Inicio');
    await button('Ver todas las alertas').click();
    assert.equal(await row().locator('td').nth(3).innerText(), '4');
    await row().getByText('Stock bajo', { exact: true }).waitFor();
    await button('Ver detalle', row()).click();
    await dialog().getByText('Venta #V-1049', { exact: true }).waitFor();
    await button('Distribuidora Escolar SRL', dialog()).click();
    await dialog().getByText('pedidos@escolar.example').waitFor();
    await close();
    await nav('Reportes');
    await page
      .getByRole('heading', { name: 'Productos más vendidos' })
      .waitFor();
  });
  await test('Extra — Cancelación, límites, reposición y ajuste', async () => {
    await nav('Inicio');
    await button('Registrar venta').click();
    await page
      .getByPlaceholder('Buscar por nombre, categoría o código…')
      .fill('ESC-021');
    await button('Agregar', page.locator('article')).click();
    assert.ok(await button('Sumar cantidad').isDisabled());
    await button('Agregar', page.locator('article')).click();
    await page.getByText('Solo hay 1 unidades disponibles.').waitFor();
    await button('Cancelar venta').click();
    await button('Sí, cancelar venta', dialog()).click();
    assert.equal((await stored()).sales.length, 42);
    assert.equal((await stored()).products.find((p) => p.id === 'p6').stock, 1);
    await findGlobal();
    await button('Registrar ingreso', dialog()).click();
    await dialog().getByLabel('Cantidad recibida *').fill('1.5');
    assert.ok(await button('Guardar ingreso', dialog()).isDisabled());
    await dialog().getByLabel('Cantidad recibida *').fill('10');
    await button('Guardar ingreso', dialog()).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    assert.equal(await row().locator('td').nth(3).innerText(), '14');
    await row().getByText('Disponible', { exact: true }).waitFor();
    await button('Ver detalle', row()).click();
    await button('Ajustar stock', dialog()).click();
    await dialog().getByLabel('Nuevo stock').fill('-1');
    await button('Guardar ajuste', dialog()).click();
    assert.equal(
      (await stored()).products.find((p) => p.id === 'p1').stock,
      14,
    );
    await dialog().getByLabel('Nuevo stock').fill('5');
    await button('Guardar ajuste', dialog()).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await row().getByText('Stock bajo', { exact: true }).waitFor();
  });
  await test('Extra — Alta, edición, eliminación y sincronización de alertas', async () => {
    await nav('Productos');
    await button('Nuevo producto').click();
    await dialog()
      .getByLabel('Nombre *', { exact: true })
      .fill('Cuaderno de prueba');
    await dialog().getByLabel('Código *').fill('CUA-001');
    await dialog().getByLabel('Precio *').fill('2500');
    await button('Guardar producto', dialog()).click();
    await dialog().getByText('Este código ya está en uso.').waitFor();
    await dialog().getByLabel('Código *').fill('TEST-001');
    await dialog().getByLabel('Stock inicial *').fill('2');
    await dialog().getByLabel('Stock mínimo *').fill('2');
    await button('Guardar producto', dialog()).click();
    const card = page
      .locator('article')
      .filter({ hasText: 'Cuaderno de prueba' });
    await card.getByText('Stock bajo', { exact: true }).waitFor();
    await button('Editar', card).click();
    await dialog().getByLabel('Stock inicial *').fill('8');
    await button('Guardar producto', dialog()).click();
    await card.getByText('Disponible', { exact: true }).waitFor();
    const state = await stored(),
      id = state.products.find((p) => p.code === 'TEST-001').id;
    assert.ok(!state.notifications.some((n) => n.productId === id));
    await button('Eliminar producto', card).click();
    await button('Eliminar producto', dialog()).click();
    await card.waitFor({ state: 'detached' });
  });
  await test('Extra — Persistencia, migración del nombre y reinicio', async () => {
    await nav('Configuración');
    await page
      .getByLabel('Nombre', { exact: true })
      .fill('Librería CLIP — prueba');
    await page.getByLabel('Activar alertas de stock bajo').uncheck();
    await button('Guardar cambios').click();
    await nav('Inicio');
    await page
      .getByText('Así está Librería CLIP — prueba hoy.', { exact: true })
      .waitFor();
    assert.equal(await button('Notificaciones').locator('span').count(), 0);
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('localtech-demo-state'));
      state.settings.owner = 'Propietaria anterior';
      localStorage.setItem('localtech-demo-state', JSON.stringify(state));
    });
    await page.reload();
    await page.getByText('Martina Ferrero', { exact: true }).waitFor();
    assert.equal((await stored()).sales.length, 42);
    await nav('Configuración');
    await button('Restablecer datos de demostración').click();
    await button('Sí, restablecer', dialog()).click();
    await findGlobal();
    await dialog().getByText('6', { exact: true }).waitFor();
    await close();
  });
  await test('Extra — Móvil: venta completa y navegación responsive', async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await nav('Inicio');
    await capture({
      path: 'outputs/inicio-mobile.png',
      fullPage: true,
      animations: 'disabled',
    });
    await findGlobal();
    await capture({
      path: 'outputs/stock-mobile.png',
      fullPage: true,
      animations: 'disabled',
    });
    await button('Registrar venta', dialog()).click();
    await sell();
    await button('Ver stock actualizado', dialog()).click();
    await page
      .getByRole('textbox', { name: 'Buscar productos' })
      .fill('CUA-001');
    assert.equal(await row().locator('td').nth(3).innerText(), '5');
    for (const width of [390, 320, 768]) {
      await page.setViewportSize({ width, height: 900 });
      for (const section of [
        'Inicio',
        'Ventas',
        'Inventario',
        'Productos',
        'Proveedores',
        'Reportes',
        'Guía rápida',
        'Configuración',
      ]) {
        await nav(section);
        await page.locator('h1').waitFor();
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${section} overflows at ${width}px`,
        );
      }
      await nav('Inicio');
      await button('Registrar venta').click();
      await page
        .getByRole('heading', { name: 'Registrar venta', exact: true })
        .waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `Registrar venta overflows at ${width}px`,
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await nav('Inicio');
    await capture({
      path: 'outputs/inicio-desktop.png',
      fullPage: true,
      animations: 'disabled',
    });
  });
  await test('Extra — Ruta desconocida y almacenamiento no disponible', async () => {
    await page.goto(`${base}#/ruta-inexistente`);
    await page.getByRole('heading', { name: 'Hola, Martina' }).waitFor();
    const isolated = await browser.newContext(),
      p = await isolated.newPage();
    attach(p);
    await p.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('Storage unavailable');
        },
      });
    });
    await p.goto(base);
    await p.getByRole('button', { name: 'Omitir guía' }).click();
    await p.getByRole('heading', { name: 'Hola, Martina' }).waitFor();
    await isolated.close();
  });
  assert.deepEqual(issues, []);
  console.log(JSON.stringify({ ok: true, results, issues }, null, 2));
} catch (error) {
  await page
    .screenshot({ path: 'outputs/test-failure.png', fullPage: true })
    .catch(() => {});
  console.error(error);
  console.error(JSON.stringify({ results, issues }, null, 2));
  process.exitCode = 1;
} finally {
  fs.writeFileSync(
    'outputs/functional-tests.json',
    JSON.stringify({ results, issues, success: !process.exitCode }, null, 2),
  );
  await browser.close();
}
