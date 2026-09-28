import type { Course, TrainingGoal } from "./training-types";

// A student need not choose a call before discovering preparation for a recommended career.
export function matchesCourseProfile(course: Pick<Course, "type" | "profileId" | "profileVersion">, goal: Partial<TrainingGoal>) {
  return course.type !== "admission" || !goal.profileId ||
    (course.profileId === goal.profileId && course.profileVersion === goal.profileVersion);
}

export function courseUniversityProblem(institutions: unknown, careerIds: string[], careers: {id: string; offers: {institution: string}[]}[]) {
  if (institutions === undefined) return ""; // Existing course snapshots remain valid.
  if (!Array.isArray(institutions) || institutions.some(i => typeof i !== "string")) return "Selecciona universidades válidas.";
  if (institutions.some(i => !careers.some(c => careerIds.includes(c.id) && c.offers.some(o => o.institution === i))))
    return "Cada universidad debe ofrecer al menos una de las carreras seleccionadas en el catálogo.";
  return "";
}
