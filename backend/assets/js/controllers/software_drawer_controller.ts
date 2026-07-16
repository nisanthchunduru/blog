import { Controller } from '@hotwired/stimulus'

export default class SoftwareDrawerController extends Controller {
  static targets = ['dialog', 'readme', 'status', 'statusMessage', 'repositoryLink', 'scrollContainer']
  declare readonly dialogTarget: HTMLDialogElement
  declare readonly readmeTarget: HTMLElement
  declare readonly statusTarget: HTMLElement
  declare readonly statusMessageTarget: HTMLElement
  declare readonly repositoryLinkTarget: HTMLAnchorElement
  declare readonly scrollContainerTarget: HTMLElement
  private readmeRequest?: AbortController

  disconnect() {
    this.readmeRequest?.abort()
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

  close() {
    this.readmeRequest?.abort()
    this.dialogTarget.close()
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
