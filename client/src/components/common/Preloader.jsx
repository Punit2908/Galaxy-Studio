import { useEffect, useRef } from 'react'
import { createIntroTimeline } from '../../animations/intro'
import GalaxyScene from '../three/GalaxyScene'

export default function Preloader({ onComplete }) {
  const root = useRef(null)

  useEffect(() => {
    const timeline = createIntroTimeline({ root: root.current, onComplete })
    return () => timeline.kill()
  }, [onComplete])

  return (
    <section ref={root} className="preloader" aria-label="Galaxy Studio introduction">
      <GalaxyScene fullExperience />
      <div className="preloader__vignette" />
      <div className="preloader__flash" />
      <div className="preloader__brand-lockup">
        <p className="preloader__wordmark">GALAXY STUDIO</p>
      </div>
      <div className="preloader__corner-mark" aria-hidden="true">✦</div>
    </section>
  )
}
