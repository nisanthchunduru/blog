import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTheme } from '../contexts/ThemeContext'

const SCRIPT_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js'
const LIGHT_STYLE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css'
const DARK_STYLE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css'

export default function Highlight() {
  const { theme } = useTheme()
  useEffect(() => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.onload = () => {
      (window as any).hljs?.highlightAll()
    }
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])
  useEffect(() => {
    const hljsDark = document.getElementById('hljs-dark')
    const hljsLight = document.getElementById('hljs-light')
    if (hljsDark && hljsLight) {
      if (theme === 'dark') {
        hljsDark.setAttribute('media', '')
        hljsLight.setAttribute('media', 'none')
      } else {
        hljsDark.setAttribute('media', 'none')
        hljsLight.setAttribute('media', '')
      }
    }
  }, [theme])
  return (
    <Helmet>
      <link id="hljs-light" rel="stylesheet" href={LIGHT_STYLE_URL} />
      <link id="hljs-dark" rel="stylesheet" href={DARK_STYLE_URL} media="none" />
    </Helmet>
  )
}
