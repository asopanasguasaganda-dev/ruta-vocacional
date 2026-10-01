import nextEnv from '@next/env';
import nodemailer from 'nodemailer';
import { mailConfig } from '../lib/server/mail-config.mjs';

nextEnv.loadEnvConfig(process.cwd());
const config = mailConfig();
if (config.errors.length) {
  console.error(config.errors.join('\n'));
  process.exitCode = 1;
} else {
  const transport = nodemailer.createTransport(config.transport);
  try {
    await transport.verify();
    console.log('SMTP: conexión, TLS y autenticación correctos. No se envió ningún correo. Prueba después /recuperar con una cuenta tuya.');
  } catch (error) {
    const code = ['EAUTH', 'ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EDNS'].includes(error.code) ? error.code : 'SMTP_ERROR';
    console.error('Falló la comprobación SMTP (' + code + '). Revisa host, puerto, cifrado y credenciales en hPanel.');
    process.exitCode = 1;
  } finally { transport.close(); }
}
