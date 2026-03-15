import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const navLinks = [
  { label: 'Posts', to: '/posts' },
  { label: 'Chirps', to: '/chirps' },
]

export default function Header() {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const activeLinkClass = 'text-brand dark:text-brand-light'
  const inactiveLinkClass = 'text-gray-800 dark:text-gray-200 hover:text-brand dark:hover:text-brand-light'

  const isActive = (to: string) => pathname === to || (to !== '/' && pathname.startsWith(to))

  return (
    <div className="pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4 relative">
      <div className="container mx-auto px-4 max-w-[768px] flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-heading font-normal text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 hover:text-brand dark:hover:text-brand-light transition-colors"
        >
          <img src="/images/logo.svg" alt="Logo" className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0" />
        </Link>
        <nav className="hidden md:flex items-center bg-violet-100 dark:bg-violet-900/30 px-4 py-1.5 rounded-lg">
          <ul className="flex items-center gap-2">
            {navLinks.map(({ label, to }) => (
              <li key={to}>
                <Link
                  className={`inline-block px-3 py-1 text-sm font-medium transition-colors ${isActive(to) ? activeLinkClass : inactiveLinkClass}`}
                  to={to}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-brand dark:hover:text-brand-light transition-colors"
                href="https://www.linkedin.com/in/nisanthchunduru"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-brand dark:hover:text-brand-light transition-colors"
                href="https://github.com/nisanthchunduru"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <button
            className="p-2 text-gray-700 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light transition-colors rounded-full bg-gray-100 dark:bg-gray-800"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
            )}
          </button>
          <button
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light transition-colors"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(open => !open)}
          >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </div>
        </button>
        </div>
      </div>
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="md:hidden absolute left-4 right-4 z-50 mt-2 rounded-2xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
            <ul>
              {navLinks.map(({ label, to }, index) => (
                <li key={to}>
                  {index > 0 && <div className="mx-4 border-t border-gray-100 dark:border-gray-700" />}
                  <Link
                    className={`flex items-center justify-center px-5 py-4 text-base font-medium transition-colors ${isActive(to) ? activeLinkClass : inactiveLinkClass}`}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
