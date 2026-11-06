/** Resolve links against Vite's deployment base, including project Pages sites. */
export function appPath(path = ''): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

export function routePath(pathname: string): string {
  const base = import.meta.env.BASE_URL;
  if (base === '/') return pathname;
  return pathname.startsWith(base) ? `/${pathname.slice(base.length)}` : '/';
}
