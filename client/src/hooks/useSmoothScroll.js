import { useEffect } from 'react'
import Lenis from 'lenis'

export default function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis()

    let frame
    const raf = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }

    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])
}
