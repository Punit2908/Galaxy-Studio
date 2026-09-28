import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import useSmoothScroll from '../hooks/useSmoothScroll'
import useSiteMedia from '../hooks/useSiteMedia'

function AlbumImageCard({ image, index }) {
  return (
    <figure className="album-grid-card album-grid-card--image">
      <div className="album-grid-card__media">
        <img src={image.src} alt={image.title} loading="lazy" />
        <span className="album-grid-card__shade" />
        <span className="album-grid-card__index">{String(index + 1).padStart(2, '0')}</span>
        <span className="album-grid-card__expand material-symbols-outlined">open_in_full</span>
      </div>
      <figcaption className="album-grid-card__meta">
        <span>{image.type}</span>
        <strong>{image.title}</strong>
      </figcaption>
    </figure>
  )
}

function AlbumVideoCard({ video, index, onOpen }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.play().catch(() => {})
      else { el.pause(); el.currentTime = 0 }
    }, { threshold: 0.15 })
    observer.observe(el)
    return () => { observer.disconnect(); el.pause() }
  }, [])

  return (
    <button
      type="button"
      className="album-grid-card album-grid-card--video"
      onClick={() => onOpen(video)}
    >
      <div className="album-grid-card__media">
        <video ref={videoRef} src={video.src} muted playsInline loop preload="metadata" />
        <span className="album-grid-card__shade" />
        <span className="album-grid-card__index">{String(index + 1).padStart(2, '0')}</span>
        <span className="album-grid-card__play material-symbols-outlined">play_arrow</span>
      </div>
      <span className="album-grid-card__meta">
        <span>{video.type}</span>
        <strong>{video.title}</strong>
      </span>
    </button>
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
      <motion.div
        className="album-player__window"
        initial={{ y: -90, scale: .94, rotateX: -5 }}
        animate={{ y: 0, scale: 1, rotateX: 0 }}
        exit={{ y: -60, scale: .96 }}
        transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="album-player__top">
          <div><span>{video.type}</span><strong>{video.title}</strong></div>
          <button type="button" onClick={onClose} aria-label="Close video player">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <video ref={playerRef} src={video.src} controls playsInline />
      </motion.div>
    </motion.div>
  )
}

export default function Albums() {
  const [media, setMedia] = useState([])
  const [player, setPlayer] = useState(null)
  const [loadingAlbums, setLoadingAlbums] = useState(true)
  useSmoothScroll()
  const { mediaByFilename } = useSiteMedia()

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const response = await axios.get(`${API}/media`)
        setMedia(response.data.media || [])
      } catch (error) {
        console.error('Could not load gallery media:', error)
        setMedia([])
      } finally {
        setLoadingAlbums(false)
      }
    }
    loadMedia()
  }, [])

  const galleryMedia = useMemo(() => ({
    images: media.filter((item) => item.mediaType === 'image' && item.publicUrl),
    videos: media.filter((item) => item.mediaType === 'video' && item.publicUrl),
  }), [media])

  return (
    <div className="albums-page home-page">
      <Navbar />

      <main>
        <section className="albums-hero" data-nav-theme="dark" style={{ "--albums-hero-bg": mediaByFilename["Anita and Sunil.png"] ? `url("${mediaByFilename["Anita and Sunil.png"]}")` : "none" }}>
          <div className="albums-hero__backdrop" />
          <div className="albums-hero__inner shell-wide">
            <div className="albums-hero__copy">
              <p className="section-kicker">GALAXY PHOTOGRAPHY · THE ARCHIVE</p>
              <h1>Stories,<br /><em>preserved.</em></h1>
              <p className="albums-hero__lead">
                A curated collection of Indian weddings, portraits, cinematic films,
                aerial frames and pre-wedding stories from the Galaxy archive.
              </p>
              <div className="albums-hero__actions">
                <a href="#album-photographs" className="albums-hero__action">
                  <span>01</span> PHOTOGRAPHS <span className="material-symbols-outlined">arrow_downward</span>
                </a>
                <a href="#album-films" className="albums-hero__action">
                  <span>02</span> FILMS <span className="material-symbols-outlined">arrow_downward</span>
                </a>
              </div>
            </div>
            <div className="albums-hero__side">
              <span className="albums-hero__side-line" />
              <span>INDIA · WEDDINGS · CINEMA</span>
              <p>Real moments. Quiet details. Big celebrations.</p>
            </div>
          </div>
        </section>

        <section id="album-photographs" className="album-section album-section--images" data-nav-theme="light">
          <div className="album-section__wash" />
          <div className="shell-wide">
            <header className="album-section__heading">
              <div>
                <span className="album-section__number">01</span>
                <p className="section-kicker">THE STILL ARCHIVE</p>
                <h2>Moments that<br /><em>stay still.</em></h2>
              </div>
              <div className="album-section__intro">
                <p>Wedding photographs selected from the live Galaxy media archive.</p>
                <span>{String(galleryMedia.images.length).padStart(2, '0')} PHOTOGRAPHS</span>
              </div>
            </header>

            <div className="album-grid album-grid--images">
              {loadingAlbums ? (
                <div className="album-section__loading">Loading the Galaxy archive…</div>
              ) : galleryMedia.images.length ? (
                galleryMedia.images.map((item, index) => (
                  <AlbumImageCard
                    key={item._id}
                    image={{ src: item.publicUrl, title: item.title || item.filename, type: item.contentType || 'Wedding Story' }}
                    index={index}
                  />
                ))
              ) : (
                <div className="album-section__loading">No published photographs in the archive yet.</div>
              )}
            </div>
          </div>
        </section>

        <section id="album-films" className="album-section album-section--videos" data-nav-theme="dark">
          <div className="album-section__wash" />
          <div className="shell-wide">
            <header className="album-section__heading album-section__heading--reverse">
              <div>
                <span className="album-section__number">02</span>
                <p className="section-kicker">THE MOVING ARCHIVE</p>
                <h2>Stories that<br /><em>move.</em></h2>
              </div>
              <div className="album-section__intro">
                <p>Cinematic wedding films, drone footage and pre-wedding stories. Click a frame to open the player.</p>
                <span>{String(galleryMedia.videos.length).padStart(2, '0')} FILMS · CLICK TO PLAY</span>
              </div>
            </header>

            <div className="album-grid album-grid--videos">
              {loadingAlbums ? (
                <div className="album-section__loading">Loading the Galaxy films…</div>
              ) : galleryMedia.videos.length ? (
                galleryMedia.videos.map((item, index) => (
                  <AlbumVideoCard
                    key={item._id}
                    video={{ src: item.publicUrl, title: item.title || item.filename, type: item.contentType || 'Cinematic' }}
                    index={index}
                    onOpen={setPlayer}
                  />
                ))
              ) : (
                <div className="album-section__loading">No published films in the archive yet.</div>
              )}
            </div>

            <div className="album-section__footer">
              <span>GALAXY PHOTOGRAPHY · NORTH INDIA</span>
              <span>CLICK ANY FILM TO OPEN THE PLAYER</span>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>{player && <VideoPlayer video={player} onClose={() => setPlayer(null)} />}</AnimatePresence>
    </div>
  )
}
