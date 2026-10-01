/** Bound actual bytes even when Content-Length is absent or forged. */
export async function readBoundedBody(request: Request, limit: number) {
  const reject = (message: string, status: number): never => {
    throw Object.assign(new Error(message), { status });
  };
  if (Number(request.headers.get('content-length') || 0) > limit)
    reject('Solicitud demasiado grande.', 413);
  const reader = request.body?.getReader();
  if (!reader) reject('Falta el contenido.', 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader!.cancel();
        reject('Solicitud demasiado grande.', 413);
      }
      chunks.push(value);
    }
  } finally { reader!.releaseLock(); }
  return Buffer.concat(chunks);
}
export async function readJsonObject(request: Request, limit = 2_000_000) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || ''))
    throw Object.assign(new Error('Utiliza contenido JSON.'), { status: 415 });
  const bytes = await readBoundedBody(request, limit);
  try {
    const value = JSON.parse(bytes.toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error();
    return value;
  } catch {
    throw Object.assign(new Error('Contenido JSON no válido.'), { status: 400 });
  }
}
