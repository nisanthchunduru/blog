import { Controller } from '@hotwired/stimulus'

const DRAWER_ANIMATION_DURATION = 180

export default class SoftwareDrawerController extends Controller {
  static targets = ['dialog', 'readme', 'status', 'statusMessage', 'repositoryLink', 'scrollContainer']
  declare readonly dialogTarget: HTMLDialogElement
  declare readonly readmeTarget: HTMLElement
  declare readonly statusTarget: HTMLElement
  declare readonly statusMessageTarget: HTMLElement
  declare readonly repositoryLinkTarget: HTMLAnchorElement
  declare readonly scrollContainerTarget: HTMLElement
  private readmeRequest?: AbortController
  private closeAnimationTimer?: number

  disconnect() {
    this.readmeRequest?.abort()
    window.clearTimeout(this.closeAnimationTimer)
    document.body.classList.remove('overflow-hidden')
  }

  async open(event: Event) {
    const softwareButton = event.currentTarget as HTMLButtonElement
    const repository = softwareButton.dataset.repository
    const repositoryUrl = softwareButton.dataset.repositoryUrl
    if (!repository || !repositoryUrl) return

    this.readmeRequest?.abort()
    this.repositoryLinkTarget.href = repositoryUrl
    this.readmeTarget.replaceChildren()
    this.scrollContainerTarget.scrollTop = 0
    this.showStatus('', true)
    this.dialogTarget.classList.remove('is-closing')
    this.dialogTarget.showModal()
    document.body.classList.add('overflow-hidden')

    this.readmeRequest = new AbortController()
    try {
      const response = await fetch(`/software/${encodeURIComponent(repository)}/readme`, {
        signal: this.readmeRequest.signal,
      })
      if (!response.ok) throw new Error(`README request failed: ${response.status}`)

      this.readmeTarget.innerHTML = await response.text()
      this.prepareReadmeLinks()
      this.statusTarget.hidden = true
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      this.showStatus('The README could not be loaded. You can still view it on GitHub.')
    }
  }

  close(event?: Event) {
    event?.preventDefault()
    if (this.dialogTarget.classList.contains('is-closing')) return

    this.readmeRequest?.abort()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.dialogTarget.close()
      return
    }

    this.dialogTarget.classList.add('is-closing')
    this.closeAnimationTimer = window.setTimeout(() => {
      this.dialogTarget.close()
    }, DRAWER_ANIMATION_DURATION)
  }

  closeFromBackdrop(event: MouseEvent) {
    if (event.target !== this.dialogTarget) return
    const bounds = this.dialogTarget.getBoundingClientRect()
    const isInsideDialog = event.clientX >= bounds.left
      && event.clientX <= bounds.right
      && event.clientY >= bounds.top
      && event.clientY <= bounds.bottom
    if (!isInsideDialog) this.close()
  }

  restorePageScroll() {
    window.clearTimeout(this.closeAnimationTimer)
    this.dialogTarget.classList.remove('is-closing')
    document.body.classList.remove('overflow-hidden')
  }

  private showStatus(message: string, isLoading = false) {
    this.statusMessageTarget.textContent = message
    this.statusMessageTarget.hidden = isLoading
    this.statusTarget.classList.toggle('is-loading', isLoading)
    if (isLoading) {
      this.statusTarget.setAttribute('aria-label', 'Loading repository README')
    } else {
      this.statusTarget.removeAttribute('aria-label')
    }
    this.statusTarget.hidden = false
  }

  private prepareReadmeLinks() {
    this.readmeTarget.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
      if (link.getAttribute('href')?.startsWith('#')) return
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
    })
  }
}
