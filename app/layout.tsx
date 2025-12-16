import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import Header from './components/Header'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: 'Nisanth Chunduru',
  description: 'Nisanth Chunduru\'s Blog',
  viewport: 'width=device-width, initial-scale=1.0',
  verification: {
    google: 'CIGnBZCqH2WX_UMtk5WQP3UJg6UIk_2HNNlBAnLFatA',
  },
  icons: {
    icon: '/images/square-profile-photo.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/amazon-fonts@1.0.1/fonts/stylesheet.css" />
        <link rel="stylesheet" href="https://cdn.statically.io/gh/nisanthchunduru/fonts/master/fonts.css" />
        <link id="hljs-light" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css" />
        <link id="hljs-dark" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css" media="none" />
      </head>
      <body className="flex flex-col bg-white dark:bg-gray-900" style={{ minHeight: '100vh' }}>
        <Header />
        {children}
        <Footer />
        <Script id="dark-mode-init" strategy="beforeInteractive">
          {`
            (function() {
              const stored = localStorage.getItem('theme');
              const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              const theme = stored || (prefersDark ? 'dark' : 'light');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              }
            })();
          `}
        </Script>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js" />
        <Script id="highlight-init">
          {`hljs.highlightAll();`}
        </Script>
        <Script src="/js/dark-mode.js" />
      </body>
    </html>
  )
}
