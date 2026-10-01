const fields = [
  "students",
  "active",
  "started",
  "completed",
  "reports",
  "pendingReports",
  "days",
  "current",
  "previous",
] as const;
export function validateAnalyticsBrief(input: any) {
  if (
    !input ||
    fields.some(
      (k) =>
        !Number.isSafeInteger(input[k]) || input[k] < 0 || input[k] > 10000000,
    ) ||
    ![7, 14, 30].includes(input.days) ||
    input.active > input.students ||
    input.started > input.students ||
    input.completed > input.started ||
    input.reports > input.students ||
    input.pendingReports > input.completed
  )
    throw Object.assign(Error("Indicadores no válidos."), { status: 400 });
  return Object.fromEntries(fields.map((k) => [k, input[k]]));
}
export async function generateAnalyticsInsights(
  input: unknown,
  env = process.env,
  request = fetch,
) {
  const metrics = validateAnalyticsBrief(input);
  if (!env.GEMINI_API_KEY)
    throw Object.assign(
      Error("Configura Gemini en el servidor para activar el análisis con IA."),
      { status: 503, code: "AI_CONFIG" },
    );
  const send = async (url: string, options: RequestInit) => {
    let response = await request(url, options);
    for (
      let attempt = 0;
      attempt < 2 && [500, 502, 503, 504].includes(response.status);
      attempt++
    ) {
      await response.body?.cancel();
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
      options.signal?.throwIfAborted();
      response = await request(url, options);
    }
    return response;
  };
  const response = await send(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL || "gemini-3.1-flash-lite")}:generateContent`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "Eres un analista de operaciones educativas. Si students=0, explica que no hay una base de estudiantes en este alcance y propone pasos de puesta en marcha; nunca inventes actividad ni tasas con denominador cero. Responde en español con un resumen breve y tres acciones concretas como máximo. Usa SOLO los conteos suministrados. students, active (acceso habilitado), started (respuestas guardadas), completed (batería vigente completa), reports (estudiantes con informe), pendingReports (completaron y no tienen informe) son existencias actuales, no eventos del periodo. current y previous son entregas en dos periodos consecutivos de days días; incluyen reintentos. No confundas entregas con personas. No inventes causas, metas, predicciones, tendencias si previous=0, rendimiento, aptitudes, diagnósticos ni perfiles individuales. Identifica incertidumbre y formula acciones como sugerencias revisables por administración. Cada acción debe incluir evidencia numérica de los conteos y una prioridad alta, media o baja. Devuelve JSON: summary string, actions array de {title,evidence,action,priority}. Sin HTML.",
            },
          ],
        },
        contents: [
          { role: "user", parts: [{ text: JSON.stringify(metrics) }] },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1600,
          responseMimeType: "application/json",
        },
      }),
    },
  );
  if (!response.ok) {
    const failure = await response.json().catch(() => null);
    console.warn("analytics-provider-failure", {
      status: response.status,
      code: failure?.error?.status || "UNKNOWN",
    });
    if (
      [401, 403].includes(response.status) ||
      (response.status === 400 &&
        /api.key/i.test(failure?.error?.message || ""))
    ) {
      throw Object.assign(
        Error(
          "La credencial de Gemini no es válida o no tiene acceso. Revisa GEMINI_API_KEY en el servidor.",
        ),
        { status: 503, code: "AI_CONFIG" },
      );
    }
    throw Object.assign(
      Error(
        response.status === 429
          ? "La IA alcanzó su límite temporal. Vuelve a intentar en unos minutos."
          : "El servicio de IA no está disponible. Intenta nuevamente.",
      ),
      { status: response.status === 429 ? 429 : 503 },
    );
  }
  const payload = await response.json(),
    candidate = payload.candidates?.[0];
  if (candidate?.finishReason !== "STOP")
    throw Object.assign(
      Error("La respuesta de IA quedó incompleta. Intenta nuevamente."),
      { status: 502 },
    );
  const result = JSON.parse(
    candidate.content.parts
      .filter((p: any) => !p.thought)
      .map((p: any) => p.text || "")
      .join(""),
  );
  const validText = (s: any, max: number) =>
    typeof s === "string" && s.trim().length > 0 && s.length <= max;
  if (
    !validText(result?.summary, 1600) ||
    !Array.isArray(result.actions) ||
    !result.actions.length ||
    result.actions.length > 3 ||
    result.actions.some(
      (a: any) =>
        !validText(a.title, 160) ||
        !validText(a.evidence, 600) ||
        !validText(a.action, 800) ||
        !["alta", "media", "baja"].includes(a.priority),
    )
  )
    throw Object.assign(
      Error("La IA devolvió un análisis no válido. Intenta nuevamente."),
      { status: 502 },
    );
  return {
    summary: result.summary,
    actions: result.actions.map((a: any) => ({
      title: a.title,
      evidence: a.evidence,
      action: a.action,
      priority: a.priority,
    })),
    generatedAt: new Date().toISOString(),
    source: "gemini",
  };
}
