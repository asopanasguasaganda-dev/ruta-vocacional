import 'server-only';
import { cookies } from 'next/headers';
import type { SessionUser } from '@/components/kit/lib/session';

/** Page guards use the same persistent session service as the browser. */
export async function currentPageUser(): Promise<SessionUser | null> {
  const origin = process.env.API_ORIGIN?.replace(/\/$/, '');
  if (origin) {
    const token = (await cookies()).get('rv360_session')?.value;
    if (!token) return null;
    try {
      const response = await fetch(`${origin}/api/session`, {
        headers: { Cookie: `rv360_session=${encodeURIComponent(token)}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return null;
      return (await response.json()).user ?? null;
    } catch {
      return null;
    }
  }
  if (process.env.VERCEL) return null;
  const { currentUser } = await import('./store');
  return currentUser();
}
