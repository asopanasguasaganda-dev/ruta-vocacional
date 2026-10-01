const { buildSync } = require("esbuild");
const assert = require("node:assert/strict");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const directory = mkdtempSync(join(tmpdir(), "rv360-analytics-"));
function load(file, name) {
  const out = join(directory, name + ".cjs");
  buildSync({
    entryPoints: [file],
    outfile: out,
    bundle: true,
    platform: "node",
    format: "cjs",
    logLevel: "silent",
  });
  return require(out);
}
(async () => {
  const { summarizeAnalytics, analyticsBrief } = load(
    "components/kit/lib/admin-analytics.ts",
    "metrics",
  );
  const { generateAnalyticsInsights, validateAnalyticsBrief } = load(
    "lib/server/analytics-insights.ts",
    "ai",
  );
  const input = {
    source: "server",
    generatedAt: "2026-09-30T14:00:00Z",
    studentProgress: [
      {
        id: "a",
        name: "Private Name",
        group: "A",
        status: "Activo",
        started: true,
        completed: true,
        report: false,
      },
      {
        id: "b",
        name: "Other Name",
        group: "B",
        status: "Suspendido",
        started: false,
        completed: false,
        report: false,
      },
      {
        id: "c",
        name: "Third Name",
        group: "A",
        status: "Activo",
        started: true,
        completed: false,
        report: true,
      },
    ],
    events: [
      {
        id: "1",
        studentId: "a",
        testId: "test:1",
        title: "Test v1",
        date: "2026-09-30T04:59:00Z",
      },
      {
        id: "2",
        studentId: "a",
        testId: "test:2",
        title: "Test v2",
        date: "2026-09-30T05:00:00Z",
      },
      {
        id: "3",
        studentId: "c",
        testId: "test:1",
        title: "Test v1",
        date: "2026-09-24T05:00:00Z",
      },
      {
        id: "4",
        studentId: "c",
        testId: "test:1",
        title: "Test v1",
        date: "2026-09-24T04:59:00Z",
      },
      {
        id: "5",
        studentId: "unrelated",
        testId: "test:1",
        title: "Test v1",
        date: "2026-09-30T12:00:00Z",
      },
    ],
  };
  const d = summarizeAnalytics(input, "A", 7);
  assert.equal(d.students, 2);
  assert.equal(d.current, 3);
  assert.equal(d.periodStudents, 2);
  assert.equal(d.dailyAverage, 0.4);
  assert.equal(d.periodStart, "2026-09-24");
  assert.equal(d.periodEnd, "2026-09-30");
  assert.equal(
    d.previousActivity.reduce((n, day) => n + day.count, 0),
    d.previous,
  );
  assert.equal(d.peakDay.count, 1);
  assert.equal(d.previous, 1);
  assert.equal(d.change, 200);
  assert.equal(d.activity.at(-1).count, 1);
  assert.equal(d.activity.at(-2).count, 1);
  assert.equal(d.byTest.length, 2);
  assert.equal(d.pendingReports, 1);
  assert.equal(d.active, 2);
  assert.equal(d.recent.length, 3);
  const empty = summarizeAnalytics(
    { ...input, studentProgress: [], events: [] },
    "",
    30,
  );
  assert.equal(empty.activity.length, 30);
  assert.equal(empty.current, 0);
  assert.equal(empty.periodStudents, 0);
  assert.equal(empty.peakDay, null);
  assert.equal(empty.change, null);
  assert.deepEqual(empty.groups, []);
  assert.equal(summarizeAnalytics(input, "B", 7).current, 0);
  const brief = analyticsBrief(d);
  assert(!JSON.stringify(brief).includes("Private"));
  assert(!("groups" in brief));
  assert.throws(() => validateAnalyticsBrief({ ...brief, completed: 99 }));
  assert.throws(() => validateAnalyticsBrief({ ...brief, days: 999 }));
  let calls = 0;
  const mock = async (url, options) => {
    calls++;
    const prompt = JSON.parse(options.body);
    assert(!JSON.stringify(prompt).includes("Private"));
    assert.equal(JSON.parse(prompt.contents[0].parts[0].text).students, 2);
    return Response.json({
      candidates: [
        {
          finishReason: "STOP",
          content: {
            parts: [
              {
                text: JSON.stringify({
                  summary: "Dos estudiantes en el alcance.",
                  actions: [
                    {
                      title: "Revisar informes",
                      evidence: "Una batería sin informe.",
                      action: "Revisar su publicación.",
                      priority: "media",
                    },
                  ],
                }),
              },
            ],
          },
        },
      ],
    });
  };
  const result = await generateAnalyticsInsights(
    brief,
    { GEMINI_API_KEY: "test-only" },
    mock,
  );
  assert.equal(result.source, "gemini");
  assert.equal(calls, 1);
  const startup = await generateAnalyticsInsights(
    analyticsBrief(empty),
    { GEMINI_API_KEY: "test-only" },
    async (_url, options) => {
      const prompt = JSON.parse(options.body);
      assert.equal(JSON.parse(prompt.contents[0].parts[0].text).students, 0);
      assert(prompt.systemInstruction.parts[0].text.includes("students=0"));
      return Response.json({
        candidates: [
          {
            finishReason: "STOP",
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    summary: "Sin estudiantes en este alcance.",
                    actions: [
                      {
                        title: "Preparar acceso",
                        evidence: "0 estudiantes.",
                        action: "Registrar las primeras cuentas.",
                        priority: "media",
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      });
    },
  );
  assert.equal(startup.source, "gemini");
  let retries = 0;
  const recovered = await generateAnalyticsInsights(
    brief,
    { GEMINI_API_KEY: "test" },
    async (...args) => {
      retries++;
      return retries === 1 ? new Response("", { status: 503 }) : mock(...args);
    },
  );
  assert.equal(retries, 2);
  assert.equal(recovered.source, "gemini");
  await assert.rejects(
    generateAnalyticsInsights(brief, {}, mock),
    /Configura Gemini/,
  );
  await assert.rejects(
    generateAnalyticsInsights(
      brief,
      { GEMINI_API_KEY: "test" },
      async () => new Response("", { status: 429 }),
    ),
    /límite temporal/,
  );
  await assert.rejects(
    generateAnalyticsInsights(brief, { GEMINI_API_KEY: "test" }, async () =>
      Response.json({ candidates: [{ finishReason: "MAX_TOKENS" }] }),
    ),
    /incompleta/,
  );
  await assert.rejects(
    generateAnalyticsInsights(brief, { GEMINI_API_KEY: "test" }, async () =>
      Response.json(
        { error: { message: "API key not valid." } },
        { status: 400 },
      ),
    ),
    /credencial de Gemini/,
  );
  console.log(
    "PASS: date boundaries, previous period, groups, versions, empty data, aggregate privacy, AI success/errors.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => rmSync(directory, { recursive: true, force: true }));
