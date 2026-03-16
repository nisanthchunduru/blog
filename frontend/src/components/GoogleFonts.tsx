import { useEffect } from 'react'

const GOOGLE_FONTS_STYLESHEET_ID = 'google-fonts-stylesheet'
const GOOGLE_FONTS_STYLESHEET_URL = 'https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,300..700;1,300..700&display=swap'

export default function GoogleFonts() {
  useEffect(() => {
    if (document.getElementById(GOOGLE_FONTS_STYLESHEET_ID)) return
    const googleFontsStylesheet = document.createElement('link')
    googleFontsStylesheet.id = GOOGLE_FONTS_STYLESHEET_ID
    googleFontsStylesheet.rel = 'preload'
    googleFontsStylesheet.as = 'style'
    googleFontsStylesheet.href = GOOGLE_FONTS_STYLESHEET_URL
    googleFontsStylesheet.onload = () => {
      googleFontsStylesheet.rel = 'stylesheet'
    }
    document.body.appendChild(googleFontsStylesheet)
  }, [])

  return null
}
