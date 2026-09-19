import { useRef } from 'react'
import { motion } from 'framer-motion'
import { siteContent } from '../../data/content'

export default function Hero() {
  const stage = useRef(null)
  const { hero, media } = siteContent
  const move = (event) => {
    if (!stage.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const x = (event.clientX / window.innerWidth - 0.5) * 8
    const y = (event.clientY / window.innerHeight - 0.5) * 6
    stage.current.style.setProperty('--pointer-x', `${x}px`)
    stage.current.style.setProperty('--pointer-y', `${y}px`)
  }
  return (
    <section id="home" ref={stage} className="hero" onPointerMove={move}>
      <video className="hero__video" autoPlay muted loop playsInline poster={media.heroPoster} aria-label="A wedding couple walking together at sunset"><source src={media.heroVideo} type="video/mp4" /></video>
      <div className="hero__fallback" aria-hidden="true" />
      <div className="hero__veil" />
      <div className="hero__content shell">
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.8 }}>{hero.eyebrow}</motion.p>
        <h1 className="display hero__title">{hero.title.split('\n').map((line) => <span key={line}>{line}</span>)}</h1>
        <div className="hero__bottom"><p>{hero.statement}</p><div className="hero__actions"><a className="button button--solid depth-button" href={hero.primaryCta.href}>{hero.primaryCta.label}<span>↗</span></a><a className="button button--line depth-button" href={hero.secondaryCta.href}>{hero.secondaryCta.label}</a></div></div>
      </div>
      <p className="hero__scroll" aria-hidden="true"><i /> Scroll to wander</p>
    </section>
  )
}
