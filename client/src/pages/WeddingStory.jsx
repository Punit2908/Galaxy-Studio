import { useParams } from 'react-router-dom'

export default function WeddingStory() {
  const { slug } = useParams()
  return <main><h1>Wedding Story: {slug}</h1></main>
}
