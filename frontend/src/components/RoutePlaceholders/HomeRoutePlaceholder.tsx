import SkeletonBar from './SkeletonBar'

export default function HomeRoutePlaceholder() {
  return (
    <div className="container mx-auto px-4 mt-4 md:mt-12 pb-24 md:pb-16" style={{ flex: 1 }}>
      <div className="mx-auto max-w-[720px]">
        <SkeletonBar className="h-8 w-40 mx-auto" />
        <div className="mt-6 space-y-4">
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-11/12" />
          <SkeletonBar className="h-4 w-10/12" />
          <SkeletonBar className="h-4 w-9/12" />
        </div>
      </div>
      <section className="mx-auto max-w-[720px] mt-14 md:mt-16">
        <SkeletonBar className="h-8 w-48 mb-8" />
        {[0, 1, 2].map((placeholderIndex) => (
          <article key={placeholderIndex} className="py-5 border-b border-gray-200 dark:border-gray-700">
            <SkeletonBar className="h-7 w-4/5 mb-3" />
            <SkeletonBar className="h-4 w-full mb-2" />
            <SkeletonBar className="h-4 w-3/4 mb-4" />
            <SkeletonBar className="h-3 w-40" />
          </article>
        ))}
      </section>
      <section className="mx-auto max-w-[600px] mt-14 md:mt-16">
        <SkeletonBar className="h-8 w-48 mb-8" />
        {[0, 1, 2].map((placeholderIndex) => (
          <div key={placeholderIndex} className="relative grid grid-cols-[48px_1fr] gap-4 pb-5">
            <SkeletonBar className="h-8 w-8 mt-1 justify-self-center rounded-full" />
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4">
              <SkeletonBar className="h-4 w-full mb-2" />
              <SkeletonBar className="h-4 w-11/12 mb-2" />
              <SkeletonBar className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
