import { Controller } from '@hotwired/stimulus'

const STORAGE_KEY = 'theme'

export default class ThemeController extends Controller {
  static targets = ['icon']
  declare readonly iconTarget: HTMLElement

  connect() {
    this.applyStoredTheme()
  }

  toggle() {
    const currentTheme = this.currentTheme()
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, newTheme)
    this.applyTheme(newTheme)
  }

  private currentTheme(): string {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }

  private applyStoredTheme() {
    const storedTheme = localStorage.getItem(STORAGE_KEY)
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    this.updateIcon()
  }

  private applyTheme(theme: string) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    this.updateIcon()
    this.dispatch('changed', { detail: { theme } })
  }

  private updateIcon() {
    const isDark = this.currentTheme() === 'dark'
    this.iconTarget.innerHTML = isDark ? this.sunIcon() : this.moonIcon()
    this.element.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`)
  }

  private moonIcon(): string {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" /></svg>'
  }

  private sunIcon(): string {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" /></svg>'
  }
}
