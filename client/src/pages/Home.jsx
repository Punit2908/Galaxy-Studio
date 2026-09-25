import { useEffect, useRef } from 'react'
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

      const hero = document.querySelector('.home-hero')
      const heroImage = document.querySelector('.home-hero__image')
      const orb = document.querySelector('.home-hero__orb')
      const floral = document.querySelector('.home-hero__floral')

      if (hero && heroImage && orb) {
        gsap.to(heroImage, {
          yPercent: 11,
          scale: 1.1,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 },
        })

        // The orbit now physically rolls through the hero as the page moves.
        gsap.to(orb, {
          yPercent: -42,
          rotation: 105,
          scale: .96,
          transformOrigin: '50% 50%',
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.2 },
        })

        gsap.to(floral, {
          rotation: -105,
          scale: 1.04,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.2 },
        })

        gsap.to('.home-hero__orb img', {
          scale: 1.08,
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.5 },
        })
      }
      gsap.utils.toArray('.home-hero__floral .flower').forEach((el, index) => {
        gsap.to(el, {
          y: index % 2 ? -8 : 8,
          x: index % 3 ? 4 : -4,
          duration: 2.4 + index * .18,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: index * .08,
        })
      })

      // Story sections stay visually grounded. Only the section and copy move on scroll.
      gsap.utils.toArray('[data-story-scenario]').forEach((section) => {
        const media = section.querySelector('[data-story-media]')
        const stack = section.querySelector('[data-media-stack]')
        const copy = section.querySelector('.story-scenario__copy')
        const number = section.querySelector('.story-scenario__number')
        if (!media || !stack || !copy) return

        const reverse = section.classList.contains('story-scenario--reverse')

        // Never fade the whole section while scrolling. Fading the parent also fades
        // every image/video inside it, which makes the media appear transparent mid-scroll.
        gsap.fromTo(section, { y: 60 }, {
          y: 0, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top 90%', end: 'top 30%', scrub: 1.1 },
        })

        gsap.fromTo(copy, { x: reverse ? -50 : 50, opacity: 0 }, {
          x: 0, opacity: 1, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 78%', end: 'top 42%', scrub: 1 },
        })

        gsap.to(media, {
          yPercent: reverse ? -2 : -1,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.4 },
        })

        if (number) {
          gsap.to(number, {
            y: -24, rotate: reverse ? -8 : 8, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 },
          })
        }

        const onMove = (event) => {
          const rect = stack.getBoundingClientRect()
          const x = (event.clientX - rect.left) / rect.width - .5
          const y = (event.clientY - rect.top) / rect.height - .5
          gsap.to(stack, {
            rotateY: x * 1.5, rotateX: -y * 1.2,
            duration: .5, ease: 'power2.out', overwrite: true,
          })
        }
        const onLeave = () => gsap.to(stack, { rotateX: 0, rotateY: 0, duration: .6, ease: 'power2.out' })

        stack.addEventListener('pointermove', onMove)
        stack.addEventListener('pointerleave', onLeave)

        return () => {
          stack.removeEventListener('pointermove', onMove)
          stack.removeEventListener('pointerleave', onLeave)
        }
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
