import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

export default function useSiteMedia() {
  const [media, setMedia] = useState([])
  const [slots, setSlots] = useState([])

  useEffect(() => {
    let cancelled = false

    const loadMedia = async () => {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      try {
        const [mediaResponse, slotsResponse] = await Promise.all([
          axios.get(`${API}/media`),
          axios.get(`${API}/media/slots`),
        ])
        if (!cancelled) {
          setMedia(mediaResponse.data.media || [])
          setSlots(slotsResponse.data.slots || [])
        }
      } catch (error) {
        console.error('Could not load site media:', error)
        if (!cancelled) {
          setMedia([])
          setSlots([])
        }
      }
    }

    loadMedia()
    return () => { cancelled = true }
  }, [])

  const mediaByFilename = useMemo(
    () => Object.fromEntries(media.map((item) => [item.filename, item.publicUrl]).filter(([, url]) => url)),
    [media],
  )

  const slotByName = useMemo(
    () => Object.fromEntries(slots.map((slot) => [slot.slot, slot])),
    [slots],
  )

  const mediaBySlot = useMemo(
    () => Object.fromEntries(
      slots.map((slot) => [
        slot.slot,
        (slot.mediaItems?.length ? slot.mediaItems : (slot.media ? [slot.media] : []))
          .filter((item) => item?.isPublished !== false && item?.publicUrl),
      ]),
    ),
    [slots],
  )

  return { media, slots, slotByName, mediaByFilename, mediaBySlot }
}
