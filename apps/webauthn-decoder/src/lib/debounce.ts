export function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  const cancel = () => clearTimeout(timer);
  const debounced = (...args: Parameters<T>) => {
    cancel();
    timer = setTimeout(() => fn(...args), ms);
  };
  return Object.assign(debounced, { cancel });
}
