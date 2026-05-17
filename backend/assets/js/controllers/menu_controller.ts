import { Controller } from '@hotwired/stimulus'

export default class MenuController extends Controller {
  static targets = ['dropdown', 'backdrop']
  declare readonly dropdownTarget: HTMLElement
  declare readonly backdropTarget: HTMLElement

  toggle() {
    const isOpen = !this.dropdownTarget.classList.contains('hidden')
    if (isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  close() {
    this.dropdownTarget.classList.add('hidden')
    this.backdropTarget.classList.add('hidden')
    this.updateHamburgerIcon(false)
  }

  private open() {
    this.dropdownTarget.classList.remove('hidden')
    this.backdropTarget.classList.remove('hidden')
    this.updateHamburgerIcon(true)
  }

  private updateHamburgerIcon(isOpen: boolean) {
    const bars = this.element.querySelectorAll('[data-menu-bar]')
    bars[0]?.classList.toggle('rotate-45', isOpen)
    bars[0]?.classList.toggle('translate-y-[7px]', isOpen)
    bars[1]?.classList.toggle('opacity-0', isOpen)
    bars[2]?.classList.toggle('-rotate-45', isOpen)
    bars[2]?.classList.toggle('-translate-y-[7px]', isOpen)
  }
}
