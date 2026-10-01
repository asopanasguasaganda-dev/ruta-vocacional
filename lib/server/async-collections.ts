// Sequential helpers preserve transaction order and avoid using Promises as predicates.
export async function asyncFilter<T>(
  items: T[],
  test: (item: T, index: number) => unknown | Promise<unknown>,
): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < items.length; i++)
    if (await test(items[i], i)) out.push(items[i]);
  return out;
}
export async function asyncFind<T>(
  items: T[],
  test: (item: T, index: number) => unknown | Promise<unknown>,
): Promise<T | undefined> {
  for (let i = 0; i < items.length; i++)
    if (await test(items[i], i)) return items[i];
}
export async function asyncSome<T>(
  items: T[],
  test: (item: T, index: number) => unknown | Promise<unknown>,
): Promise<boolean> {
  for (let i = 0; i < items.length; i++)
    if (await test(items[i], i)) return true;
  return false;
}
export async function asyncEvery<T>(
  items: T[],
  test: (item: T, index: number) => unknown | Promise<unknown>,
): Promise<boolean> {
  for (let i = 0; i < items.length; i++)
    if (!(await test(items[i], i))) return false;
  return true;
}
export async function asyncForEach<T>(
  items: T[],
  fn: (item: T, index: number) => unknown | Promise<unknown>,
): Promise<void> {
  for (let i = 0; i < items.length; i++) await fn(items[i], i);
}
export async function asyncReduce<T, R>(
  items: T[],
  fn: (acc: R, item: T, index: number) => R | Promise<R>,
  initial: R,
): Promise<R> {
  let result = initial;
  for (let i = 0; i < items.length; i++) result = await fn(result, items[i], i);
  return result;
}
