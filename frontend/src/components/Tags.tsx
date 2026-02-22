interface TagsProps {
  tags: string[]
}

export default function Tags({ tags }: TagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="text-brand dark:text-brand-light">
          #{tag}
        </span>
      ))}
    </div>
  )
}
