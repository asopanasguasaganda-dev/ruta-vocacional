/** Accept only the request origin and the explicitly configured public site. */
export function trustedMutationOrigin(request: Request, requireOrigin = false) {
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  if (!origin) return !requireOrigin;
  const allowed = new Set([new URL(request.url).origin]);
  if (process.env.APP_URL) allowed.add(new URL(process.env.APP_URL).origin);
  return allowed.has(origin);
}
