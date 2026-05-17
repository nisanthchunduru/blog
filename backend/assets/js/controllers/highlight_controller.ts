import { Controller } from '@hotwired/stimulus'

const SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'
const LIGHT_STYLE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css'
const DARK_STYLE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css'
const HIGHLIGHT_SCRIPT_ID = 'highlightjs-script'
const HIGHLIGHT_LIGHT_STYLE_ID = 'hljs-light'
const HIGHLIGHT_DARK_STYLE_ID = 'hljs-dark'

type HighlightJsApi = { highlightElement: (el: Element) => void }

let scriptLoader: Promise<HighlightJsApi | null> | null = null

function getApi(): HighlightJsApi | null {
  return (window as Window & { hljs?: HighlightJsApi }).hljs ?? null
}

function loadScript(): Promise<HighlightJsApi | null> {
  const existing = getApi()
  if (existing) return Promise.resolve(existing)
  if (scriptLoader) return scriptLoader
  scriptLoader = new Promise((resolve, reject) => {
    const script = document.getElementById(HIGHLIGHT_SCRIPT_ID) as HTMLScriptElement | null
    if (script) {
      script.addEventListener('load', () => resolve(getApi()), { once: true })
      script.addEventListener('error', () => { scriptLoader = null; reject() }, { once: true })
      return
    }
    const el = document.createElement('script')
    el.id = HIGHLIGHT_SCRIPT_ID
    el.src = SCRIPT_URL
    el.async = true
    el.addEventListener('load', () => resolve(getApi()), { once: true })
    el.addEventListener('error', () => { scriptLoader = null; reject() }, { once: true })
    document.head.appendChild(el)
  })
  return scriptLoader
}

function ensureStylesheets(theme: string) {
  if (!document.getElementById(HIGHLIGHT_LIGHT_STYLE_ID)) {
    const link = document.createElement('link')
    link.id = HIGHLIGHT_LIGHT_STYLE_ID
    link.rel = 'stylesheet'
    link.href = LIGHT_STYLE_URL
    link.media = theme === 'dark' ? 'not all' : 'all'
    document.head.appendChild(link)
  }
  if (!document.getElementById(HIGHLIGHT_DARK_STYLE_ID)) {
    const link = document.createElement('link')
    link.id = HIGHLIGHT_DARK_STYLE_ID
    link.rel = 'stylesheet'
    link.href = DARK_STYLE_URL
    link.media = theme === 'dark' ? 'all' : 'not all'
    document.head.appendChild(link)
  }
}

function applyTheme(theme: string) {
  const light = document.getElementById(HIGHLIGHT_LIGHT_STYLE_ID) as HTMLLinkElement | null
  const dark = document.getElementById(HIGHLIGHT_DARK_STYLE_ID) as HTMLLinkElement | null
  if (!light || !dark) return
  light.media = theme === 'dark' ? 'not all' : 'all'
  dark.media = theme === 'dark' ? 'all' : 'not all'
}

export default class HighlightController extends Controller {
  connect() {
    this.highlightCodeBlocks()
    document.addEventListener('turbo:load', this.highlightCodeBlocks)
    document.addEventListener('theme:changed', this.handleThemeChange as EventListener)
  }

  disconnect() {
    document.removeEventListener('turbo:load', this.highlightCodeBlocks)
    document.removeEventListener('theme:changed', this.handleThemeChange as EventListener)
  }

  private highlightCodeBlocks = () => {
    const codeBlocks = this.element.querySelectorAll('pre code')
    if (codeBlocks.length === 0) return
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    ensureStylesheets(theme)
    loadScript().then((api) => {
      if (!api) return
      codeBlocks.forEach((el) => {
        el.removeAttribute('data-highlighted')
        api.highlightElement(el)
      })
    })
  }

  private handleThemeChange = (event: CustomEvent) => {
    applyTheme(event.detail?.theme ?? 'light')
  }
}
