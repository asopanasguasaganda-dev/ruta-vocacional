const apiOrigin = process.env.API_ORIGIN?.replace(/\/$/, '');
if (apiOrigin) {
  const url = new URL(apiOrigin);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('API_ORIGIN debe ser el origen del servidor, sin ruta ni credenciales.');
  }
  if (process.env.VERCEL && url.protocol !== 'https:') throw new Error('API_ORIGIN debe usar HTTPS en Vercel.');
}
if (process.env.VERCEL && !apiOrigin) {
  throw new Error('Configura API_ORIGIN con un servidor persistente antes de desplegar en Vercel. SQLite no puede guardarse en funciones efímeras. Consulta docs/DESPLIEGUE.md.');
}
const nextConfig = {
  devIndicators: false,
  serverExternalPackages: ['pdfjs-dist','mammoth','tesseract.js','@napi-rs/canvas'],
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_DESIGN_PREVIEW: 'false' },
  async rewrites() {
    return { beforeFiles: apiOrigin ? [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }] : [] };
  },
};
export default nextConfig;
