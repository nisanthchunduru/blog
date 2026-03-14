import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { label: 'Posts', to: '/posts' },
  { label: 'Chirps', to: '/chirps' },
]

export default function Header() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const activeLinkClass = 'text-brand'
  const inactiveLinkClass = 'text-gray-800 hover:text-brand'

  const isActive = (to: string) => pathname === to || (to !== '/' && pathname.startsWith(to))

  return (
    <div className="pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4 relative">
      <div className="container mx-auto px-4 max-w-[768px] flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-heading font-normal text-2xl sm:text-3xl text-gray-900 hover:text-brand transition-colors"
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
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-800 hover:text-brand transition-colors"
                href="https://www.linkedin.com/in/nisanthchunduru"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-800 hover:text-brand transition-colors"
                href="https://github.com/nisanthchunduru"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
        <button
          className="md:hidden p-2 text-gray-700 hover:text-brand transition-colors"
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
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="md:hidden absolute left-4 right-4 z-50 mt-2 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
            <ul>
              {navLinks.map(({ label, to }, index) => (
                <li key={to}>
                  {index > 0 && <div className="mx-4 border-t border-gray-100" />}
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
