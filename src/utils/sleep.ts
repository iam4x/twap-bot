export const sleep = (ms: number = 100): Promise<void> =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
