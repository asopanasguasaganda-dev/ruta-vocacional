export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_PUBLIC_DESIGN_PREVIEW !== "true"
  ) {
    const { expireTraining } = await import("./lib/server/training");
    expireTraining();
  }
}
