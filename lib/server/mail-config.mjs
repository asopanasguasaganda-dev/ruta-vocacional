// Shared by the server and deployment checks; never import in client components.
export function mailConfig(env = process.env) {
  const errors = [];
  const fields = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM', 'APP_URL'];
  for (const key of fields) {
    if (!env[key]?.trim() || /REEMPLAZAR|CHANGE.?ME|TU-DOMINIO/i.test(env[key])) errors.push('Configura ' + key + '.');
  }
  const port = Number(env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.push('SMTP_PORT no es válido.');
  if (env.SMTP_SECURE && !['true', 'false'].includes(env.SMTP_SECURE)) errors.push('SMTP_SECURE debe ser true o false.');
  const secure = env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465;
  if ((port === 465 && !secure) || (port === 587 && secure)) errors.push('Usa SMTP_SECURE=true con 465 o false con 587 (STARTTLS).');
  if (env.SMTP_FROM && !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(env.SMTP_FROM)) errors.push('SMTP_FROM debe ser una dirección de correo sin nombre ni saltos de línea.');
  let origin = '';
  try {
    const url = new URL(env.APP_URL);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw Error();
    origin = url.origin;
  } catch { errors.push('APP_URL debe ser el origen HTTPS del sitio.'); }
  return {
    errors, origin, from: env.SMTP_FROM,
    transport: {
      host: env.SMTP_HOST, port, secure, requireTLS: !secure,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
      tls: { minVersion: /** @type {import('node:tls').SecureVersion} */ ('TLSv1.2'), rejectUnauthorized: true },
    },
  };
}
export function mailConfigured(env = process.env) {
  return mailConfig(env).errors.length === 0;
}
