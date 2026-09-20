import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/layout/Navbar'
import useSmoothScroll from '../hooks/useSmoothScroll'

const images = [
  { src: '/Anita%20and%20Sunil.png', title: 'Anita & Sunil', type: 'Wedding Story' },
  { src: '/Ashwani%20and%20Tarun.jpeg', title: 'Ashwani & Tarun', type: 'Wedding Story' },
  { src: '/Ashwani.jpeg', title: 'Ashwani', type: 'Wedding Portrait' },
  { src: '/Drone%20Shot%201.png', title: 'Aerial Story 01', type: 'Drone' },
  { src: '/Drone%20%20Shot%202.png', title: 'Aerial Story 02', type: 'Drone' },
  { src: '/image.png', title: 'Galaxy Archive', type: 'Wedding Story' },
]

const videos = [
  { src: '/Cinematic%20Shot.mp4', title: 'Cinematic Shot', type: 'Cinematic' },
  { src: '/Drone%20Shot%203.mp4', title: 'Drone Shot 03', type: 'Drone' },
  { src: '/Prewedding%20Shot.mp4', title: 'Pre-Wedding Shot', type: 'Pre-Wedding' },
  { src: '/Video%201.mp4', title: 'Wedding Film 01', type: 'Cinematic' },
  { src: '/Video%202.mp4', title: 'Wedding Film 02', type: 'Cinematic' },
  { src: '/Video%203.mp4', title: 'Wedding Film 03', type: 'Cinematic' },
  { src: '/Video%204.mp4', title: 'Wedding Film 04', type: 'Cinematic' },
]

function AlbumVideoCard({ video, index, onOpen }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {})
      else { el.pause(); el.currentTime = 0 }
    }, { threshold: .2 })
    observer.observe(el)
    return () => { observer.disconnect(); el.pause() }
  }, [])

  return (
    <motion.button
      ref={ref}
      type="button"
      className={`album-media-card album-video-card album-video-card--${index % 3}`}
      onClick={() => onOpen(video)}
      whileHover={{ y: -10, rotateX: 2, rotateY: index % 2 ? -2 : 2 }}
      whileTap={{ scale: .98 }}
    >
      <div className="album-media-card__frame">
        <video src={video.src} muted playsInline loop preload="metadata" />
        <span className="album-media-card__grain" />
        <span className="album-media-card__play material-symbols-outlined">motion_play</span>
        <span className="album-media-card__index">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <span className="album-media-card__meta"><small>{video.type}</small><strong>{video.title}</strong></span>
    </motion.button>
  )
}

function ImageCard({ image, index }) {
  return (
    <motion.figure
      className={`album-media-card album-image-card album-image-card--${index % 4}`}
      whileHover={{ y: -12, rotateZ: index % 2 ? -1 : 1, scale: 1.018 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
    >
      <div className="album-media-card__frame">
        <img src={image.src} alt={image.title} loading="lazy" />
        <span className="album-media-card__grain" />
        <span className="album-media-card__index">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <figcaption className="album-media-card__meta"><small>{image.type}</small><strong>{image.title}</strong></figcaption>
    </motion.figure>
  )
}

function VideoPlayer({ video, onClose }) {
  const playerRef = useRef(null)
  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    player.currentTime = 0
    player.play().catch(() => {})
    document.body.classList.add('album-player-open')
    return () => document.body.classList.remove('album-player-open')
  }, [video])

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div className="album-player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="album-player__backdrop" onClick={onClose} />
      <motion.div className="album-player__window" initial={{ y: -90, scale: .94, rotateX: -5 }} animate={{ y: 0, scale: 1, rotateX: 0 }} exit={{ y: -60, scale: .96 }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}>
        <div className="album-player__top">
          <div><span>{video.type}</span><strong>{video.title}</strong></div>
          <button type="button" onClick={onClose} aria-label="Close video player"><span className="material-symbols-outlined">close</span></button>
        </div>
        <video ref={playerRef} src={video.src} controls playsInline />
      </motion.div>
    </motion.div>
  )
}

export default function Albums() {
  const page = useRef(null)
  const [player, setPlayer] = useState(null)
  useSmoothScroll()

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-album-reveal]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 90, rotateX: 8 }, { opacity: 1, y: 0, rotateX: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      })
      gsap.utils.toArray('[data-album-section]').forEach((section) => {
        const stage = section.querySelector('.album-stage')
        const cards = section.querySelectorAll('.album-media-card')
        if (!stage) return
        gsap.to(stage, { yPercent: -7, rotateY: 2.5, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.5 } })
        cards.forEach((card, index) => {
          gsap.to(card, { y: index % 2 ? -35 : 28, x: index % 3 === 0 ? -12 : index % 3 === 1 ? 8 : 18, rotation: index % 2 ? 1.5 : -1.2, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.2 + index * .06 } })
        })
      })
      gsap.to('.albums-hero__orb', { y: -100, rotate: 25, ease: 'none', scrollTrigger: { trigger: '.albums-hero', start: 'top top', end: 'bottom top', scrub: 1.3 } })
    }, page)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={page} className="albums-page">
      <Navbar />
      <main>
        <section className="albums-hero" data-nav-theme="dark">
          <div className="albums-hero__orb" /><div className="albums-hero__grid" />
          <div className="shell-wide albums-hero__inner">
            <p className="section-kicker" data-album-reveal>GALAXY PHOTOGRAPHY · THE ARCHIVE</p>
            <h1 data-album-reveal>Frames of<br /><em>forever.</em></h1>
            <p className="albums-hero__lead" data-album-reveal>A living collection of wedding photographs, cinematic films, aerial perspectives and pre-wedding stories.</p>
            <div className="albums-hero__line" data-album-reveal><span>PHOTOGRAPHY</span><i /><span>FILMS</span><i /><span>DRONE</span><i /><span>PRE-WEDDING</span></div>
          </div>
        </section>

        <section className="album-section album-section--images" data-album-section data-nav-theme="dark">
          <div className="album-bg album-bg--images" />
          <div className="shell-wide">
            <div className="album-section__heading" data-album-reveal>
              <div><span className="album-section__number">01</span><p className="section-kicker">OUR ALBUM SHOTS</p><h2>Moments that<br /><em>stay still.</em></h2></div>
              <p>Photographs from the Galaxy archive, arranged like physical prints across a cinematic gallery wall.</p>
            </div>
            <div className="album-stage album-stage--images">{images.map((image, index) => <ImageCard key={image.src} image={image} index={index} />)}</div>
          </div>
        </section>

        <section className="album-section album-section--videos" data-album-section data-nav-theme="dark">
          <div className="album-bg album-bg--videos" />
          <div className="shell-wide">
            <div className="album-section__heading album-section__heading--reverse" data-album-reveal>
              <div><span className="album-section__number">02</span><p className="section-kicker">CINEMATIC · DRONE · PRE-WEDDING</p><h2>Stories that<br /><em>move.</em></h2></div>
              <p>Moving images created to advertise the full Galaxy experience, from cinematic wedding films to aerial and pre-wedding stories.</p>
            </div>
            <div className="album-stage album-stage--videos">{videos.map((video, index) => <AlbumVideoCard key={video.src} video={video} index={index} onOpen={setPlayer} />)}</div>
            <div className="album-section__footer"><span>CLICK ANY FRAME TO WATCH</span><span>{String(videos.length).padStart(2, '0')} FILMS · SOUND ENABLED IN PLAYER</span></div>
          </div>
        </section>
      </main>
      <AnimatePresence>{player && <VideoPlayer video={player} onClose={() => setPlayer(null)} />}</AnimatePresence>
    </div>
  )
}
