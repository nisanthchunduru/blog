import SkeletonBar from './SkeletonBar'

export default function PostsRoutePlaceholder() {
  return (
    <div className="container mx-auto px-4 max-w-none pb-24 md:pb-16" style={{ flex: 1 }}>
      <SkeletonBar className="h-12 w-40 mx-auto mt-8 mb-10 md:mt-16 md:mb-16" />
      {[0, 1].map((yearIndex) => (
        <section key={yearIndex} className="mb-16">
          <SkeletonBar className="h-10 w-24 mb-8" />
          {[0, 1, 2].map((postIndex) => (
            <div key={postIndex} className="mt-10">
              <SkeletonBar className="h-8 w-3/4 mb-3" />
              <SkeletonBar className="h-4 w-full mb-2" />
              <SkeletonBar className="h-4 w-4/5 mb-3" />
              <SkeletonBar className="h-3 w-40" />
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
