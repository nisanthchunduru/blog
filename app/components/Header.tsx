'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  useEffect(() => {
    const backButton = document.getElementById('back-button')
    const backButtonContainer = document.getElementById('back-button-container')
    const rightSpacer = document.getElementById('right-spacer')
    
    if (backButton && backButtonContainer && rightSpacer) {
      if (pathname !== '/' && pathname !== '/about') {
        backButton.classList.add('back-button-visible')
        backButtonContainer.classList.remove('flex-none')
        backButtonContainer.classList.add('flex-1')
        rightSpacer.classList.remove('flex-none')
        rightSpacer.classList.add('flex-1')
      } else {
        backButton.classList.remove('back-button-visible')
        backButtonContainer.classList.remove('flex-1')
        backButtonContainer.classList.add('flex-none')
        rightSpacer.classList.remove('flex-1')
        rightSpacer.classList.add('flex-none')
      }
    }
  }, [pathname])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-6 md:pt-8 pb-4">
      <div className="container mx-auto px-2 sm:px-4 max-w-[768px] flex items-center">
        <div id="back-button-container" className="hidden md:flex flex-none justify-start">
          <Link
            id="back-button"
            href="/"
            className="items-center justify-center w-10 h-10 bg-violet-100/30 dark:bg-violet-900/20 backdrop-blur-md rounded-full border border-violet-200/50 dark:border-violet-800/30 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900 transition-colors mr-2.5"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </Link>
        </div>
        <div className="flex-1 md:flex-1 flex justify-center w-full md:w-auto">
          <nav className="flex w-full sm:inline-flex sm:w-auto justify-center items-center gap-1 sm:gap-0 bg-violet-100/30 dark:bg-violet-900/20 backdrop-blur-md rounded-3xl sm:rounded-full px-4 py-2 border border-violet-200/50 dark:border-violet-800/30">
            <div className="sm:flex">
              <ul className="flex items-center flex-wrap sm:flex-nowrap justify-center">
                <li className="mr-1 md:mr-4">
                  <Link className="inline-block text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900 rounded-l-full rounded-r-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg transition-colors" href="/">Home</Link>
                </li>
                <li className="mr-1 md:mr-4">
                  <Link className="inline-block text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900 rounded-l-full rounded-r-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg transition-colors" href="/posts">Posts</Link>
                </li>
                <li className="mr-1 md:mr-4">
                  <Link className="inline-block text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900 rounded-l-full rounded-r-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg transition-colors" href="/chirps">Chirps</Link>
                </li>
                <li className="mr-1 md:mr-4">
                  <Link className="inline-block text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900 rounded-l-full rounded-r-full px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg transition-colors" href="/library">Library</Link>
                </li>
              </ul>
            </div>
            <button
              id="dark-mode-toggle"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).toggleDarkMode) {
                  (window as any).toggleDarkMode()
                }
              }}
              type="button"
              role="switch"
              aria-checked="false"
              aria-label="Toggle dark mode"
              className="ml-2 sm:ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span className="sr-only">Toggle dark mode</span>
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 dark:translate-x-5"></span>
              <svg className="sun-icon absolute left-0.5 top-0.5 h-4 w-4 text-yellow-500 opacity-0 dark:opacity-100 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path>
              </svg>
              <svg className="moon-icon absolute right-0.5 top-0.5 h-4 w-4 text-gray-400 opacity-100 dark:opacity-0 transition-opacity duration-200" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            </button>
          </nav>
        </div>
        <div id="right-spacer" className="hidden md:block flex-none"></div>
      </div>
    </div>
  )
}
