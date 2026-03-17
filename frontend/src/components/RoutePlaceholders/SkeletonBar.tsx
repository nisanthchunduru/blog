type SkeletonBarProps = {
  className: string
}

export default function SkeletonBar({ className }: SkeletonBarProps) {
  return <div className={`animate-pulse rounded-full bg-violet-100 dark:bg-violet-900/40 ${className}`} />
}
