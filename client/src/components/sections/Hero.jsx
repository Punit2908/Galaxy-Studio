import { useRef } from 'react'
import { motion } from 'framer-motion'
import { siteContent } from '../../data/content'
import GalaxyHeroScene from '../three/GalaxyHeroScene'

export default function Hero() {
  const stage = useRef(null)
  const { hero } = siteContent

  const move = (event) => {
    if (!stage.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const x = (event.clientX / window.innerWidth - 0.5) * 5
    const y = (event.clientY / window.innerHeight - 0.5) * 3
    stage.current.style.setProperty('--pointer-x', x + 'px')
    stage.current.style.setProperty('--pointer-y', y + 'px')
  }

  return (
    <>
      <section id="home" ref={stage} className="hero" onPointerMove={move}>
        <GalaxyHeroScene />
        <div className="hero__veil" />
        <div className="hero__content shell">
          <motion.p className="hero__eyebrow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>Galaxy Studio</motion.p>
          <h1 className="display hero__title">Galaxy Studio</h1>
          <p className="hero__copy">{hero.statement}</p>
          <div className="hero__actions">
            <a className="button button--solid" href="#gallery">Book Now</a>
            <a className="button button--line" href="/portfolio">View More</a>
          </div>
        </div>
      </section>

      <section id="gallery" className="gallery">
        <div className="gallery__intro">
          <h2>Galaxy of Rhuses</h2>
          <p>Galaxy Studio captures unforgettable moments, stories and emotions through cinematic wedding photography.</p>
        </div>
        <div className="gallery__grid">
          <figure className="gallery__item gallery__item--tall"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=88" alt="Portrait photography" /></figure>
          <figure className="gallery__item"><img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=88" alt="Editorial portrait photography" /></figure>
          <figure className="gallery__item"><img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=88" alt="Wedding couple in the mountains" /></figure>
          <figure className="gallery__item"><img src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=900&q=88" alt="Wedding details" /></figure>
          <figure className="gallery__item"><img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=88" alt="Wedding celebration" /></figure>
        </div>
      </section>
    </>
  )
}
