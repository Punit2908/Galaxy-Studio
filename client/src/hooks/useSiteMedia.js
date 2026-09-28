import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

export default function useSiteMedia() {
  const [media, setMedia] = useState([])

  useEffect(() => {
    let cancelled = false

    const loadMedia = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const response = await axios.get(`${API}/media`)
        if (!cancelled) setMedia(response.data.media || [])
      } catch (error) {
        console.error('Could not load site media:', error)
        if (!cancelled) setMedia([])
      }
    }

    loadMedia()

    return () => {
      cancelled = true
    }
  }, [])

  const mediaByFilename = useMemo(
    () => Object.fromEntries(media.map((item) => [item.filename, item.publicUrl]).filter(([, url]) => url)),
    [media]
  )

  return { media, mediaByFilename }
}
