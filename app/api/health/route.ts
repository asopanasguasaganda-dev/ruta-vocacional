import { NextResponse } from "next/server";
import { db, document } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.prepare("SELECT 1").get();
    const platform = await document("system", "rv360:platform");
    const registrationReady =
      !!platform?.institutionId &&
      !!(await db
        .prepare("SELECT id FROM institutions WHERE id=?")
        .get(platform.institutionId));
    return NextResponse.json(
      { ok: true, mode: "server", database: db.driver, registrationReady },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "El almacenamiento no está disponible." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
