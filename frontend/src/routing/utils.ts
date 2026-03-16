export function normalizeRoutePath(routeHref: string): string {
  const routeUrl = new URL(routeHref, window.location.origin)
  if (routeUrl.pathname === '/') return '/'
  return routeUrl.pathname.replace(/\/+$/, '')
}
