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

      // Cinematic alternating story spreads with a stronger 3D scroll camera.
      gsap.utils.toArray('[data-story-scenario]').forEach((section) => {
        const media = section.querySelector('[data-story-media]')
        const stack = section.querySelector('[data-media-stack]')
        const cards = section.querySelectorAll('.story-media-card')
        const copy = section.querySelector('.story-scenario__copy')
        const number = section.querySelector('.story-scenario__number')
        if (!media || !stack || !cards.length || !copy) return

        const reverse = section.classList.contains('story-scenario--reverse')

        gsap.fromTo(section, {
          opacity: .3,
          y: 100,
          rotateX: 8,
          scale: .965,
          transformPerspective: 1800,
        }, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 92%',
            end: 'top 18%',
            scrub: 1.3,
          },
        })

        gsap.to(media, {
          yPercent: reverse ? -9 : -6,
          xPercent: reverse ? 2 : -2,
          rotateY: reverse ? -6 : 6,
          rotateZ: reverse ? -1.2 : 1.2,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.6,
          },
        })

        gsap.fromTo(copy, {
          x: reverse ? -95 : 95,
          y: 45,
          opacity: 0,
          rotateY: reverse ? -9 : 9,
        }, {
          x: 0,
          y: 0,
          opacity: 1,
          rotateY: 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 34%',
            scrub: 1.15,
          },
        })

        cards.forEach((card, index) => {
          const direction = index % 2 ? 1 : -1
          gsap.fromTo(card, {
            y: 80 + index * 20,
            x: direction * (32 + index * 12),
            rotateY: direction * (10 + index * 2),
            scale: .86,
            opacity: .2,
          }, {
            y: 0,
            x: 0,
            rotateY: 0,
            scale: 1,
            opacity: 1,
            ease: 'power3.out',
            delay: index * .025,
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              end: 'top 42%',
              scrub: 1.1,
            },
          })

          gsap.to(card, {
            y: direction * (7 + index * 3),
            rotateY: direction * (index % 2 ? 1.5 : -1.5),
            ease: 'sine.inOut',
            scrollTrigger: {
              trigger: section,
              start: 'top 70%',
              end: 'bottom 25%',
              scrub: 1.4,
            },
          })
        })

        if (number) {
          gsap.to(number, {
            y: -55,
            rotate: reverse ? -28 : 28,
            scale: 1.14,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.15,
            },
          })
        }

        const onMove = (event) => {
          const rect = stack.getBoundingClientRect()
          const x = (event.clientX - rect.left) / rect.width - .5
          const y = (event.clientY - rect.top) / rect.height - .5
          gsap.to(stack, {
            rotateY: x * 6,
            rotateX: -y * 5,
            duration: .65,
            ease: 'power3.out',
            overwrite: true,
          })
        }

        const onLeave = () => {
          gsap.to(stack, { rotateX: 0, rotateY: 0, duration: .8, ease: 'power3.out' })
        }

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
