'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function TopLoadingBar() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentPathnameRef = useRef(pathname)

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a')
      
      if (!link) return
      
      const href = link.getAttribute('href')
      if (!href) return
      
      const isExternal = href.startsWith('http') || href.startsWith('//')
      const isAnchor = href.startsWith('#')
      const isInternal = href.startsWith('/')
      
      if (isExternal || isAnchor || !isInternal) return
      
      if (link.getAttribute('target') === '_blank') return
      
      const nextPathname = href.split('?')[0]
      if (nextPathname === currentPathnameRef.current) return
      
      setIsLoading(true)
      setProgress(0)
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current)
            }
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 100)
    }

    document.addEventListener('click', handleLinkClick)
    
    return () => {
      document.removeEventListener('click', handleLinkClick)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (currentPathnameRef.current !== pathname) {
      currentPathnameRef.current = pathname
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }
  }, [pathname])

  if (!isLoading && progress === 0) {
    return null
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[1px] z-[100]"
    >
      <div
        className="h-full bg-violet-600 dark:bg-violet-400 transition-all duration-200 ease-out"
        style={{
          width: `${Math.min(progress, 100)}%`,
        }}
      />
    </div>
  )
}