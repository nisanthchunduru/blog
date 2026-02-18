import { useEffect, useState, useRef } from 'react'
import { useNavigation } from 'react-router-dom'

export default function TopLoadingBar() {
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isLoading) {
      setVisible(true)
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
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (visible) {
        setProgress(100)
        setTimeout(() => {
          setVisible(false)
          setProgress(0)
        }, 200)
      }
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [isLoading, visible])

  if (!visible && progress === 0) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-[4px] z-[100]">
      <div
        className="h-full bg-violet-600 dark:bg-violet-400 transition-all duration-200 ease-out"
        style={{
          width: `${Math.min(progress, 100)}%`,
        }}
      />
    </div>
  )
}
