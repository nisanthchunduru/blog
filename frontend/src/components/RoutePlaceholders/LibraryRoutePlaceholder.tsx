import SkeletonBar from './SkeletonBar'

export default function LibraryRoutePlaceholder() {
  return (
    <div className="container mx-auto px-4 pb-24 md:pb-16" style={{ flex: 1 }}>
      <SkeletonBar className="h-12 w-40 mx-auto mt-8 mb-10 md:mt-16 md:mb-16" />
      <div className="max-w-[720px] mx-auto space-y-5">
        {[0, 1, 2, 3, 4].map((placeholderIndex) => (
          <div key={placeholderIndex} className="rounded-2xl border border-gray-200 dark:border-gray-700 px-5 py-5">
            <SkeletonBar className="h-6 w-2/3 mb-3" />
            <SkeletonBar className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
