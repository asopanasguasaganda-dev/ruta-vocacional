import { NextResponse } from 'next/server';
import { db, document } from '@/lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  try {
    db.prepare('SELECT 1').get();
    const platform = document('system', 'rv360:platform');
    const registrationReady = !!platform?.institutionId && !!db.prepare('SELECT id FROM institutions WHERE id=?').get(platform.institutionId);
    return NextResponse.json({ ok: true, mode: 'server', registrationReady }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ ok: false, error: 'El almacenamiento no está disponible.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
