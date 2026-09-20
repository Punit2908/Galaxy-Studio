import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/layout/Navbar'
import HomeExperience from '../components/sections/HomeExperience'
import useSmoothScroll from '../hooks/useSmoothScroll'

export default function Home() {
  const page = useRef(null)
  useSmoothScroll()

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.fromTo(el, { y: 70, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1.05, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        })
      })
      gsap.utils.toArray('[data-image-reveal]').forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(14% 8% 14% 8%)', scale: 1.08 }, {
          clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.35, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        })
      })
      gsap.to('.home-hero__image', {
        yPercent: 12, scale: 1.08, ease: 'none',
        scrollTrigger: { trigger: '.home-hero', start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.home-hero__orb', {
        yPercent: -45, rotation: 22, ease: 'none',
        scrollTrigger: { trigger: '.home-hero', start: 'top top', end: 'bottom top', scrub: true },
      })
    }, page)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={page} className="home-page">
      <Navbar />
      <main>
        <HomeExperience />
      </main>
    </div>
  )
}
