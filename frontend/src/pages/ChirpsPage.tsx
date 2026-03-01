import { useLoaderData } from 'react-router-dom'
import { Chirp } from '../types'
import { sortBy } from '../utils'
import Tags from '../components/Tags'

export default function ChirpsPage() {
  const data = useLoaderData() as Chirp[]
  const chirps = sortBy(data.filter(chirp => !chirp.draft), 'publishedDate', 'desc')
  const chirpsByMonthAndYear = chirps.reduce<{ monthAndYear: string; chirps: Chirp[] }[]>((groups, chirp) => {
    const monthAndYear = new Date(chirp.publishedDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
    const currentGroup = groups[groups.length - 1]
    if (currentGroup?.monthAndYear === monthAndYear) {
      currentGroup.chirps.push(chirp)
      return groups
    }
    return [...groups, { monthAndYear, chirps: [chirp] }]
  }, [])
  return (
    <div className="container mx-auto px-4 pb-24 md:pb-0" style={{ flex: 1, maxWidth: '600px' }}>
      <h1 className="text-center text-5xl font-light mt-8 md:mt-16 mb-16 text-gray-900 dark:text-gray-100">Chirps</h1>
      <div>
        {chirpsByMonthAndYear.map(({ monthAndYear, chirps }) => (
          <section key={monthAndYear} className="mb-8 last:mb-0">
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 px-1 mb-4">{monthAndYear}</h2>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
              {chirps.map((chirp) => (
                <article key={chirp.id} className="relative grid grid-cols-[48px_1fr] gap-4 pb-5 last:pb-0">
                  <span className="justify-self-center mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-medium text-brand dark:border-gray-700 dark:bg-gray-900">
                    {new Date(chirp.publishedDate).toLocaleDateString('en-US', { day: '2-digit' })}
                  </span>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
                    <div
                      className="text-gray-900 dark:text-gray-100 leading-relaxed"
                      style={{ wordWrap: 'break-word', lineHeight: 1.6 }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: chirp.html }} />
                    </div>
                    {chirp.tags && chirp.tags.length > 0 && (
                      <div className="mt-2">
                        <Tags tags={chirp.tags} />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
