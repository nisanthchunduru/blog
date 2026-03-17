import SkeletonBar from './SkeletonBar'

export default function ChirpsRoutePlaceholder() {
  return (
    <div className="container mx-auto px-4 pb-24 md:pb-16" style={{ flex: 1, maxWidth: '600px' }}>
      <SkeletonBar className="h-12 w-36 mx-auto mt-8 mb-10 md:mt-16 md:mb-16" />
      {[0, 1, 2, 3].map((placeholderIndex) => (
        <div key={placeholderIndex} className="relative grid grid-cols-[48px_1fr] gap-4 pb-5">
          <SkeletonBar className="h-8 w-8 mt-1 justify-self-center rounded-full" />
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4">
            <SkeletonBar className="h-4 w-full mb-2" />
            <SkeletonBar className="h-4 w-11/12 mb-2" />
            <SkeletonBar className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
