import { readJsonObject } from "@/lib/server/request-body";
import { NextRequest, NextResponse } from "next/server";
import { requireUser, fail, rateLimit } from "@/lib/server/store";
import { trustedMutationOrigin } from "@/lib/server/request-origin";
import { summarizeInstrument } from "@/lib/server/import-presentation";
import { suggestSimulatorFields } from "@/lib/server/simulator-autofill";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(true);
    if (!trustedMutationOrigin(req)) fail("Origen no permitido.", 403);
    await rateLimit("ai-editor:" + user.id);
    const body = await readJsonObject(req, 300000);
    if (body?.operation === "simulator") {
      if (
        !Array.isArray(body.questions) ||
        !body.questions.length ||
        body.questions.length > 20 ||
        !Array.isArray(body.careers) ||
        body.careers.length > 2500 ||
        typeof body.title !== "string" ||
        body.title.length > 500
      )
        fail("Contenido del simulador no válido.");
      return NextResponse.json(
        { suggestions: await suggestSimulatorFields(body) },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (
      !body ||
      typeof body.title !== "string" ||
      typeof body.description !== "string" ||
      body.title.length > 500 ||
      body.description.length > 12000
    )
      fail("Contenido no válido.");
    return NextResponse.json(
      {
        presentation: await summarizeInstrument({
          title: body.title,
          description: body.description,
        }),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e.status
          ? e.message
          : "No se pudo generar la sugerencia. Vuelve a intentar.",
      },
      { status: e.status || 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
