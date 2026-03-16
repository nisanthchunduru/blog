import { useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'
const LIGHT_STYLE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css'
const DARK_STYLE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css'
const HIGHLIGHT_SCRIPT_ID = 'highlightjs-script'
const HIGHLIGHT_LIGHT_STYLE_ID = 'hljs-light'
const HIGHLIGHT_DARK_STYLE_ID = 'hljs-dark'
const ACTIVE_STYLESHEET_MEDIA = 'all'
const INACTIVE_STYLESHEET_MEDIA = 'not all'

type HighlightJsApi = {
  highlightElement: (codeElement: Element) => void
}

type HighlightProps = {
  articleHtml: string
}

let highlightScriptLoader: Promise<HighlightJsApi | null> | null = null

function getHighlightJsApi(): HighlightJsApi | null {
  return (window as Window & { hljs?: HighlightJsApi }).hljs ?? null
}

function createAsyncStylesheetLink(stylesheetId: string, stylesheetUrl: string, media: string): HTMLLinkElement {
  const stylesheetLink = document.createElement('link')
  stylesheetLink.id = stylesheetId
  stylesheetLink.rel = 'preload'
  stylesheetLink.as = 'style'
  stylesheetLink.href = stylesheetUrl
  stylesheetLink.media = media
  stylesheetLink.onload = () => {
    stylesheetLink.rel = 'stylesheet'
    stylesheetLink.media = stylesheetLink.dataset.targetMedia ?? ACTIVE_STYLESHEET_MEDIA
  }
  return stylesheetLink
}

function ensureHighlightStyles(activeTheme: string) {
  if (!document.getElementById(HIGHLIGHT_LIGHT_STYLE_ID)) {
    const lightThemeStylesheet = createAsyncStylesheetLink(
      HIGHLIGHT_LIGHT_STYLE_ID,
      LIGHT_STYLE_URL,
      activeTheme === 'dark' ? INACTIVE_STYLESHEET_MEDIA : ACTIVE_STYLESHEET_MEDIA
    )
    lightThemeStylesheet.dataset.targetMedia = activeTheme === 'dark' ? INACTIVE_STYLESHEET_MEDIA : ACTIVE_STYLESHEET_MEDIA
    document.body.appendChild(lightThemeStylesheet)
  }
  if (!document.getElementById(HIGHLIGHT_DARK_STYLE_ID)) {
    const darkThemeStylesheet = createAsyncStylesheetLink(
      HIGHLIGHT_DARK_STYLE_ID,
      DARK_STYLE_URL,
      activeTheme === 'dark' ? ACTIVE_STYLESHEET_MEDIA : INACTIVE_STYLESHEET_MEDIA
    )
    darkThemeStylesheet.dataset.targetMedia = activeTheme === 'dark' ? ACTIVE_STYLESHEET_MEDIA : INACTIVE_STYLESHEET_MEDIA
    document.body.appendChild(darkThemeStylesheet)
  }
}

function applyHighlightTheme(activeTheme: string) {
  const darkThemeStylesheet = document.getElementById(HIGHLIGHT_DARK_STYLE_ID) as HTMLLinkElement | null
  const lightThemeStylesheet = document.getElementById(HIGHLIGHT_LIGHT_STYLE_ID) as HTMLLinkElement | null
  if (!darkThemeStylesheet || !lightThemeStylesheet) return
  if (activeTheme === 'dark') {
    darkThemeStylesheet.dataset.targetMedia = ACTIVE_STYLESHEET_MEDIA
    lightThemeStylesheet.dataset.targetMedia = INACTIVE_STYLESHEET_MEDIA
    darkThemeStylesheet.media = ACTIVE_STYLESHEET_MEDIA
    lightThemeStylesheet.media = INACTIVE_STYLESHEET_MEDIA
    return
  }
  darkThemeStylesheet.dataset.targetMedia = INACTIVE_STYLESHEET_MEDIA
  lightThemeStylesheet.dataset.targetMedia = ACTIVE_STYLESHEET_MEDIA
  darkThemeStylesheet.media = INACTIVE_STYLESHEET_MEDIA
  lightThemeStylesheet.media = ACTIVE_STYLESHEET_MEDIA
}

function loadHighlightScript(): Promise<HighlightJsApi | null> {
  const loadedHighlightJsApi = getHighlightJsApi()
  if (loadedHighlightJsApi) return Promise.resolve(loadedHighlightJsApi)
  if (highlightScriptLoader) return highlightScriptLoader
  highlightScriptLoader = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(HIGHLIGHT_SCRIPT_ID) as HTMLScriptElement | null
    const resolveHighlightJsApi = () => resolve(getHighlightJsApi())
    const handleLoadFailure = () => {
      highlightScriptLoader = null
      reject(new Error('Unable to load highlight.js'))
    }
    if (existingScript) {
      existingScript.addEventListener('load', resolveHighlightJsApi, { once: true })
      existingScript.addEventListener('error', handleLoadFailure, { once: true })
      return
    }
    const highlightScript = document.createElement('script')
    highlightScript.id = HIGHLIGHT_SCRIPT_ID
    highlightScript.src = SCRIPT_URL
    highlightScript.async = true
    highlightScript.addEventListener('load', resolveHighlightJsApi, { once: true })
    highlightScript.addEventListener('error', handleLoadFailure, { once: true })
    document.body.appendChild(highlightScript)
  })
  return highlightScriptLoader
}

export default function Highlight({ articleHtml }: HighlightProps) {
  const { theme } = useTheme()

  useEffect(() => {
    ensureHighlightStyles(theme)
    applyHighlightTheme(theme)
  }, [theme])

  useEffect(() => {
    let isCancelled = false
    void loadHighlightScript().then((highlightJsApi) => {
      if (isCancelled || !highlightJsApi) return
      document.querySelectorAll('.article pre code').forEach((codeElement) => {
        codeElement.removeAttribute('data-highlighted')
        highlightJsApi.highlightElement(codeElement)
      })
    })
    return () => {
      isCancelled = true
    }
  }, [articleHtml])

  return null
}
