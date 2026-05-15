import { renderToString } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import { routes } from './routes'
import { setApiBaseUrl } from './routing/pageDataLoaders'

export interface RenderResult {
  html: string
  helmet: HelmetServerState
  statusCode: number
  redirect?: string
}

export async function render(url: string, apiBaseUrl: string): Promise<RenderResult> {
  setApiBaseUrl(apiBaseUrl)
  const handler = createStaticHandler(routes)
  const fetchRequest = createFetchRequest(url, apiBaseUrl)
  const context = await handler.query(fetchRequest)
  if (context instanceof Response) {
    const location = context.headers.get('Location')
    return {
      html: '',
      helmet: {} as HelmetServerState,
      statusCode: context.status,
      redirect: location || undefined,
    }
  }
  const router = createStaticRouter(handler.dataRoutes, context)
  const helmetContext: { helmet?: HelmetServerState } = {}
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouterProvider router={router} context={context} />
    </HelmetProvider>
  )
  const is404 = context.matches.some(match => match.route.path === '*')
  return {
    html,
    helmet: helmetContext.helmet!,
    statusCode: is404 ? 404 : 200,
  }
}

function createFetchRequest(url: string, apiBaseUrl: string): Request {
  const fullUrl = new URL(url, apiBaseUrl)
  return new Request(fullUrl.href, {
    method: 'GET',
    headers: {
      'Accept': 'text/html',
    },
  })
}
