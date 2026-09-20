import { useEffect, useRef, useState } from 'react'
import { createIntroTimeline } from '../../animations/intro'
import '../../styles/reference-intro.css'

const LOGO_STYLES = [
  ['Playfair Display', 'Playfair Display'],
  ['Cinzel', 'Cinzel'],
  ['DM Serif Display', 'DM Serif Display'],
  ['Great Vibes', 'Playfair Display'],
  ['Cormorant Garamond', 'Cormorant Garamond'],
  ['Libre Baskerville', 'Libre Baskerville'],
]

const GALAXY_FALLBACK_URL = 'https://www.10wallpaper.com/wallpaper/1920x1440/1305/Galaxy-Space_Universe_Photography_Wallpaper_1920x1440.jpg'

export default function Preloader({ onComplete }) {
  const root = useRef(null)
  const [logoStyle, setLogoStyle] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLogoStyle((value) => (value + 1) % LOGO_STYLES.length)
    }, 1000)

    const timeline = createIntroTimeline({ root: root.current, onComplete })

    return () => {
      window.clearInterval(interval)
      timeline.kill()
    }
  }, [onComplete])

  const [galaxyFont, studioFont] = LOGO_STYLES[logoStyle]

  return (
    <section ref={root} className="preloader" aria-label="Galaxy Studio introduction">
      <img
        className="preloader__reference-galaxy"
        src="/galaxy-reference-clean.jpg"
        alt=""
        draggable="false"
        onError={(event) => {
          event.currentTarget.onerror = null
          event.currentTarget.src = GALAXY_FALLBACK_URL
        }}
      />
      <div className="preloader__reference-stars" />
      <div className="preloader__vignette" />
      <div className="preloader__flash" />
      <div className="preloader__brand-lockup">
        <p
          className="preloader__wordmark"
          style={{ '--logo-galaxy-font': galaxyFont, '--logo-studio-font': studioFont }}
        >
          <span className="logo-galaxy">Galaxy</span>
          <span className="logo-studio">Studio</span>
        </p>
      </div>
      <div className="preloader__intro-grain" />
    </section>
  )
}
