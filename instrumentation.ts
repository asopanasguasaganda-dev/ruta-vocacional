export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_PUBLIC_DESIGN_PREVIEW !== "true" &&
    !process.env.API_ORIGIN &&
    !process.env.VERCEL
  ) {
    const { expireTraining } = await import("./lib/server/training");
    expireTraining();
  }
}
