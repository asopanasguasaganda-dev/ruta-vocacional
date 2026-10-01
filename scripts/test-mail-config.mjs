import assert from 'node:assert/strict';
import { mailConfig, mailConfigured } from '../lib/server/mail-config.mjs';
const valid = { APP_URL: 'https://ruta.example/', SMTP_HOST: 'smtp.hostinger.com', SMTP_PORT: '465', SMTP_USER: 'cuentas@ruta.example', SMTP_PASSWORD: 'synthetic-only', SMTP_FROM: 'cuentas@ruta.example' };
assert(mailConfigured(valid));
assert.equal(mailConfig(valid).origin, 'https://ruta.example');
assert.equal(mailConfig(valid).transport.secure, true);
assert.equal(mailConfig(valid).transport.tls.rejectUnauthorized, true);
const starttls = mailConfig({ ...valid, SMTP_HOST: 'mail.other.example', SMTP_PORT: '587', SMTP_SECURE: 'false' });
assert.equal(starttls.errors.length, 0);
assert.equal(starttls.transport.secure, false);
assert.equal(starttls.transport.requireTLS, true);
for (const change of [
  { SMTP_PORT: '0' }, { SMTP_PORT: 'NaN' }, { SMTP_PORT: '65536' },
  { SMTP_SECURE: 'false' }, { SMTP_PORT: '587', SMTP_SECURE: 'true' }, { SMTP_SECURE: 'yes' },
  { SMTP_USER: '' }, { SMTP_PASSWORD: '' }, { SMTP_FROM: '' }, { SMTP_PASSWORD: 'REEMPLAZAR' },
  { SMTP_FROM: 'bad\r\nBcc: other@example.test' }, { APP_URL: 'https://ruta.example/path' },
  { APP_URL: 'http://ruta.example' }, { APP_URL: 'https://user:pass@ruta.example' },
]) assert(!mailConfigured({ ...valid, ...change }), JSON.stringify(Object.keys(change)));
assert(!mailConfigured({ SMTP_HOST: 'smtp.hostinger.com' }));
console.log('PASS SMTP: Hostinger 465, STARTTLS 587, complete credentials, canonical links, invalid ports and TLS combinations rejected.');
