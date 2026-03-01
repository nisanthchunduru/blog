import { useLoaderData } from 'react-router-dom'
import { Chirp } from '../types'
import ChirpsFeed from '../components/ChirpsFeed'

export default function ChirpsPage() {
  const chirps = useLoaderData() as Chirp[]
  return (
    <div className="container mx-auto px-4 pb-24 md:pb-0" style={{ flex: 1, maxWidth: '600px' }}>
      <ChirpsFeed chirps={chirps} />
    </div>
  )
}
