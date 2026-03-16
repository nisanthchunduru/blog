import { forwardRef, useEffect, useRef, type ComponentPropsWithoutRef } from 'react'
import { Link, useHref } from 'react-router-dom'
import { prefetchRouteModulesAndData } from '../routing/prefetch'

type PrefetchedLinkProps = ComponentPropsWithoutRef<typeof Link>

const PrefetchedLink = forwardRef<HTMLAnchorElement, PrefetchedLinkProps>(function PrefetchedLink(
  { onFocus, onMouseEnter, to, ...linkProps },
  forwardedRef
) {
  const linkElementRef = useRef<HTMLAnchorElement | null>(null)
  const href = useHref(to)

  useEffect(() => {
    const linkElement = linkElementRef.current
    if (!linkElement) return
    if (typeof IntersectionObserver === 'undefined') {
      void prefetchRouteModulesAndData(href)
      return
    }
    const routeObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        void prefetchRouteModulesAndData(href)
        routeObserver.disconnect()
      },
      { rootMargin: '160px 0px' }
    )
    routeObserver.observe(linkElement)
    return () => routeObserver.disconnect()
  }, [href])

  const handleMouseEnter: PrefetchedLinkProps['onMouseEnter'] = (event) => {
    void prefetchRouteModulesAndData(href)
    onMouseEnter?.(event)
  }

  const handleFocus: PrefetchedLinkProps['onFocus'] = (event) => {
    void prefetchRouteModulesAndData(href)
    onFocus?.(event)
  }

  const setLinkElement = (element: HTMLAnchorElement | null) => {
    linkElementRef.current = element
    if (typeof forwardedRef === 'function') {
      forwardedRef(element)
      return
    }
    if (forwardedRef) forwardedRef.current = element
  }

  return (
    <Link
      {...linkProps}
      ref={setLinkElement}
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
    />
  )
})

export default PrefetchedLink
