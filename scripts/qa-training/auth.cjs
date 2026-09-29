// Isolated credentials and data only; never read the production database.
const { chromium, request } = require(require('node:path').resolve('.qa-tools/node_modules/playwright'));
const { DatabaseSync } = require('node:sqlite');
const { randomUUID, randomBytes, scryptSync } = require('node:crypto');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.QA_BASE_URL || 'http://localhost:3006';
const db = new DatabaseSync('.qa-tools/constructor-qa.sqlite');
const id = randomUUID(), institutionId = randomUUID();
const adminEmail = `admin-${id}@example.test`, email = `student-${id}@example.test`;
const password = randomBytes(24).toString('base64url');
const salt = randomBytes(16).toString('hex');
db.prepare('INSERT INTO institutions VALUES(?,?,?)').run(institutionId, 'Plataforma de acceso QA', id);
db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?,?)').run(id, 'Admin de acceso QA', adminEmail, salt + ':' + scryptSync(password, salt, 64).toString('hex'), 'admin', institutionId, '', 'Activo');
db.prepare('INSERT INTO documents(owner,key,value) VALUES(?,?,?) ON CONFLICT(owner,key) DO UPDATE SET value=excluded.value').run('system', 'rv360:platform', JSON.stringify({ institutionId }));

(async () => {
  const client = await request.newContext();
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    assert.equal((await client.get(base + '/api/health')).status(), 200);
    const registration = await client.post(base + '/api/auth/register', { data: { name: 'Estudiante de acceso QA', email, password } });
    assert.equal(registration.status(), 200, 'Registro real disponible');
    assert.equal((await (await client.get(base + '/api/session')).json()).user.email, email);
    assert.equal((await client.post(base + '/api/auth/logout', { data: {} })).status(), 200);
    assert.equal((await (await client.get(base + '/api/session')).json()).user, null);
    assert.equal((await client.post(base + '/api/auth/login', { data: { email, password: 'incorrecta' } })).status(), 401);
    assert.equal((await client.post(base + '/api/auth/login', { headers: { Origin: 'https://untrusted.example' }, data: { email, password } })).status(), 403);

    for (const admin of [false, true]) {
      const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
      const page = await context.newPage();
      await page.goto(base + (admin ? '/admin/login' : '/ingresar'));
      await page.getByLabel('Correo electrónico', { exact: true }).fill(admin ? adminEmail : email);
      await page.getByLabel('Contraseña', { exact: true }).fill(password);
      await page.getByRole('button', { name: /Ingresar|Acceder/, exact: true }).click();
      await page.waitForURL(admin ? '**/admin' : '**/mi-ruta', { timeout: 30000 });
      await page.reload();
      const session = await context.request.get(base + '/api/session');
      assert.equal((await session.json()).user.role, admin ? 'admin' : 'student');
      await page.goto(base + (admin ? '/admin/cursos' : '/mi-ruta/cursos'));
      await page.getByRole('button', { name: admin ? 'Crear curso' : 'Explorar', exact: true }).waitFor();
      await context.close();
    }
    const page = await browser.newPage();
    fs.mkdirSync('evidencia/cursos', { recursive: true });
    for (const width of [360, 768, 1366]) {
      await page.setViewportSize({ width, height: 768 });
      await page.goto(base + '/ingresar');
      await page.getByRole('button', { name: 'Ingresar', exact: true }).waitFor();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      const photo = page.locator('.auth-photo img');
      if (width > 700) {
        await photo.evaluate(image => image.decode());
        assert(await photo.evaluate(image => image.naturalWidth === 1200));
      }
      await page.screenshot({ path: `evidencia/cursos/acceso-${width}.png`, fullPage: true });
    }
    console.log('Registro, ingreso administrativo/estudiante, sesión tras recarga, rechazo de contraseña y origen incorrectos, cursos y acceso responsive: OK');
  } finally {
    await client.dispose();
    await browser.close();
    db.close();
  }
})().catch(error => { console.error(error.message.replace(/rv360_session=[^\s]+/g, 'rv360_session=[redacted]')); process.exitCode = 1; });
