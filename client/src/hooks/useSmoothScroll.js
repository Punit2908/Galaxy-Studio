import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.85 })
    const update = (time) => { lenis.raf(time * 1000) }
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])
}
