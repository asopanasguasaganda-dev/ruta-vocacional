import { NextRequest, NextResponse } from 'next/server';

// Publish the real UI even before the persistent API has been connected.
// Never create accounts or save data to the ephemeral Vercel filesystem.
export function proxy(request: NextRequest) {
  if (!process.env.VERCEL || process.env.API_ORIGIN) return NextResponse.next();

  const headers = { 'Cache-Control': 'no-store' };
  if (request.nextUrl.pathname.replace(/\/$/, '') === '/api/session' && request.method === 'GET') {
    return NextResponse.json({ user: null, values: {}, revisions: {}, mailConfigured: false, serviceAvailable: false }, { headers });
  }
  return NextResponse.json({
    ok: false,
    code: 'SERVICE_UNAVAILABLE',
    error: 'El acceso y los cursos están temporalmente fuera de servicio. Vuelve a intentarlo más tarde.',
  }, { status: 503, headers });
}

export const config = { matcher: '/api/:path*' };
