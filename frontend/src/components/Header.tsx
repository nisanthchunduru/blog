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
    <div className="pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4 relative border-b border-brand/20">
      <div className="container mx-auto px-4 max-w-[768px] flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-heading text-2xl sm:text-3xl text-gray-900 hover:text-brand transition-colors"
        >
          <svg className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 3L37 12.5L20 22L3 12.5Z" fill="#E8470C"/>
            <path d="M3 19.5L20 29L37 19.5" stroke="#E8470C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
            <path d="M3 27L20 36.5L37 27" stroke="#E8470C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
          </svg>
          Nisanth Chunduru
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <ul className="flex items-center">
            {navLinks.map(({ label, to }) => (
              <li key={to} className="mr-4">
                <Link
                  className={`inline-block px-4 py-3 text-lg transition-colors ${isActive(to) ? activeLinkClass : inactiveLinkClass}`}
                  to={to}
                >
                  {label}
                </Link>
              </li>
            ))}
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
