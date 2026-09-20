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

      // Each story behaves like a layered 3D editorial spread while scrolling.
      gsap.utils.toArray('[data-story-scenario]').forEach((section) => {
        const media = section.querySelector('[data-story-media]')
        const stack = section.querySelector('[data-media-stack]')
        const cards = section.querySelectorAll('.story-media-card')
        const copy = section.querySelector('.story-scenario__copy')
        const number = section.querySelector('.story-scenario__number')

        if (!media || !stack || !cards.length || !copy) return

        const reverse = section.classList.contains('story-scenario--reverse')

        gsap.fromTo(section, {
          opacity: .2,
          y: 120,
          rotateX: 10,
          scale: .96,
          transformPerspective: 1500,
        }, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 96%',
            end: 'top 22%',
            scrub: 1.4,
          },
        })

        gsap.to(media, {
          yPercent: reverse ? -11 : -6,
          rotateY: reverse ? -5 : 5,
          rotateZ: reverse ? -1 : 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        })

        gsap.fromTo(copy, {
          x: reverse ? -80 : 80,
          y: 35,
          opacity: 0,
          rotateY: reverse ? -7 : 7,
        }, {
          x: 0,
          y: 0,
          opacity: 1,
          rotateY: 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 78%',
            end: 'top 38%',
            scrub: 1.2,
          },
        })

        cards.forEach((card, index) => {
          const direction = index % 2 ? 1 : -1
          gsap.fromTo(card, {
            y: 90 + index * 18,
            x: direction * (40 + index * 10),
            rotateZ: direction * (index * 4 + 8),
            rotateY: direction * 12,
            scale: .82,
            opacity: .15,
          }, {
            y: 0,
            x: 0,
            rotateZ: index === 0 ? -6 : index === 1 ? 3 : index === 2 ? 7 : -3,
            rotateY: 0,
            scale: 1,
            opacity: 1,
            ease: 'power3.out',
            delay: index * .035,
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              end: 'top 40%',
              scrub: 1.15,
            },
          })

          gsap.to(card, {
            y: direction * (8 + index * 3),
            rotateZ: direction * (1.5 + index * .5),
            ease: 'sine.inOut',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'bottom 25%',
              scrub: 1.3,
            },
          })
        })

        if (number) {
          gsap.to(number, {
            y: -45,
            rotate: reverse ? -25 : 25,
            scale: 1.16,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.1,
            },
          })
        }

        // Tiny pointer-driven camera movement makes the stack feel physical.
        const onMove = (event) => {
          const rect = stack.getBoundingClientRect()
          const x = (event.clientX - rect.left) / rect.width - .5
          const y = (event.clientY - rect.top) / rect.height - .5
          gsap.to(stack, {
            rotateY: x * 5,
            rotateX: -y * 4,
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
