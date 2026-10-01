import { attempt, attemptView } from "./training";
import { fail } from "./store";
import { createTrainingReport } from "@/components/kit/lib/training-report-pdf";
export async function trainingPdf(user: any, id: string) {
  const a = await attemptView(user, await attempt(user, id));
  if (!a.result) fail("El resultado aún no está disponible.", 409);
  return createTrainingReport(a).output("arraybuffer");
}
