export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { expireTraining } = await import('./lib/server/training');
    await expireTraining();
  }
}
