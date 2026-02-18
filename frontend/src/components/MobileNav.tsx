import { Link } from 'react-router-dom'

export default function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-4 pt-2">
      <div className="container mx-auto px-2 max-w-[768px] flex justify-center">
        <nav className="flex justify-center items-center bg-violet-100/30 dark:bg-violet-900/20 backdrop-blur-md rounded-3xl px-4 py-2">
          <ul className="flex items-center gap-2">
            <li>
              <Link className="inline-block text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900 rounded-full px-3 py-2 text-sm transition-colors" to="/">Home</Link>
            </li>
            <li>
              <Link className="inline-block text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900 rounded-full px-3 py-2 text-sm transition-colors" to="/posts">Posts</Link>
            </li>
            <li>
              <Link className="inline-block text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900 rounded-full px-3 py-2 text-sm transition-colors" to="/chirps">Chirps</Link>
            </li>
            {/* <li>
              <Link className="inline-block text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900 rounded-full px-3 py-2 text-sm transition-colors" to="/library">Library</Link>
            </li> */}
            <li>
              <button
                id="dark-mode-toggle-mobile"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).toggleDarkMode) {
                    (window as any).toggleDarkMode()
                  }
                }}
                type="button"
                role="switch"
                aria-checked="false"
                aria-label="Toggle dark mode"
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none"
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
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
