export type StudentProgress = {
  id: string;
  name: string;
  group: string;
  status: string;
  started: boolean;
  completed: boolean;
  report: boolean;
};
export type AnalyticsEvent = {
  id: string;
  studentId: string;
  testId: string;
  title: string;
  date: string;
};
export type AnalyticsInput = {
  studentProgress: StudentProgress[];
  events: AnalyticsEvent[];
  source: "browser" | "server";
  generatedAt: string;
};
export const ecuadorDay = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil" }).format(
    date,
  );
export const percentage = (value: number, total: number) =>
  total ? Math.round((value / total) * 100) : 0;
export function summarizeAnalytics(
  input: AnalyticsInput,
  group = "",
  days = 14,
) {
  const rows = input.studentProgress.filter((s) => !group || s.group === group),
    ids = new Set(rows.map((s) => s.id));
  const events = input.events.filter(
    (e) => ids.has(e.studentId) && Number.isFinite(Date.parse(e.date)),
  );
  const today = ecuadorDay(new Date(input.generatedAt));
  const dates = Array.from({ length: days * 2 }, (_, i) =>
    ecuadorDay(
      new Date(
        Date.parse(today + "T12:00:00-05:00") - (days * 2 - 1 - i) * 86400000,
      ),
    ),
  );
  const counts = new Map<string, number>();
  for (const e of events) {
    const key = ecuadorDay(new Date(e.date));
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const activity = dates
    .slice(-days)
    .map((date) => ({ date, count: counts.get(date) || 0 }));
  const previous = dates
      .slice(0, days)
      .reduce((n, d) => n + (counts.get(d) || 0), 0),
    current = activity.reduce((n, d) => n + d.count, 0);
  const currentDates = new Set(dates.slice(-days)),
    periodEvents = events.filter((e) =>
      currentDates.has(ecuadorDay(new Date(e.date))),
    );
  const tests = new Map<string, { id: string; title: string; count: number }>();
  for (const e of periodEvents) {
    const t = tests.get(e.testId) || { id: e.testId, title: e.title, count: 0 };
    t.count++;
    tests.set(e.testId, t);
  }
  const started = rows.filter((s) => s.started || s.completed).length,
    completed = rows.filter((s) => s.completed).length,
    reports = rows.filter((s) => s.report).length;
  const groups = [...new Set(rows.map((s) => s.group))].map((name) => {
    const members = rows.filter((s) => s.group === name);
    return {
      name,
      total: members.length,
      completed: members.filter((s) => s.completed).length,
      started: members.filter((s) => s.started || s.completed).length,
    };
  });
  return {
    students: rows.length,
    active: rows.filter((s) => s.status === "Activo").length,
    started,
    completed,
    reports,
    withoutActivity: rows.length - started,
    pendingReports: rows.filter((s) => s.completed && !s.report).length,
    studentProgress: rows,
    activity,
    current,
    previous,
    periodStudents: new Set(periodEvents.map((e) => e.studentId)).size,
    dailyAverage: Number((current / days).toFixed(1)),
    peakDay: current
      ? activity.reduce((best, day) => (day.count > best.count ? day : best))
      : null,
    periodStart: dates[days],
    periodEnd: today,
    previousActivity: dates
      .slice(0, days)
      .map((date) => ({ date, count: counts.get(date) || 0 })),
    change: previous
      ? Math.round(((current - previous) / previous) * 100)
      : null,
    byTest: [...tests.values()].sort((a, b) => b.count - a.count),
    groups,
    recent: [...periodEvents]
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
      .slice(0, 5)
      .map((e) => ({
        ...e,
        student: rows.find((s) => s.id === e.studentId)?.name,
      })),
    days,
    generatedAt: input.generatedAt,
    source: input.source,
  };
}
export type AnalyticsSummary = ReturnType<typeof summarizeAnalytics>;
// Only aggregate counts leave the dashboard. Names, groups, answers and scores stay out.
export function analyticsBrief(d: AnalyticsSummary) {
  return {
    students: d.students,
    active: d.active,
    started: d.started,
    completed: d.completed,
    reports: d.reports,
    pendingReports: d.pendingReports,
    days: d.days,
    current: d.current,
    previous: d.previous,
  };
}
