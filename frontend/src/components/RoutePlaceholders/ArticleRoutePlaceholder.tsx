import SkeletonBar from './SkeletonBar'

export default function ArticleRoutePlaceholder() {
  return (
    <div className="container mx-auto mt-8 px-4 max-w-none pb-24 md:pb-16" style={{ flex: 1 }}>
      <div className="article mt-6">
        <SkeletonBar className="h-10 w-3/4 mx-auto mb-4" />
        <SkeletonBar className="h-6 w-2/3 mx-auto mb-4" />
        <SkeletonBar className="h-4 w-40 mx-auto mb-12" />
        <div className="space-y-5">
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-11/12" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-10/12" />
          <SkeletonBar className="h-32 w-full rounded-3xl" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  )
}
