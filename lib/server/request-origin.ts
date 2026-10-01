/** Accept only the request origin and the explicitly configured public site. */
export function trustedMutationOrigin(request: Request, requireOrigin = true) {
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  if (!origin) return !requireOrigin;
  try {
    const allowed = new URL(process.env.APP_URL || request.url).origin;
    return origin === allowed;
  } catch { return false; }
}
