import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const images = {
  hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=90',
  couple: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1600&q=88',
  bride: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1300&q=88',
  details: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1300&q=88',
  portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1300&q=88',
  celebration: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1500&q=88',
}

function MagneticButton({ children, href = '#' }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 18 })
  const sy = useSpring(y, { stiffness: 180, damping: 18 })
  return (
    <motion.a href={href} className="luxury-button" style={{ x: sx, y: sy }}
      onMouseMove={(e) => { const r=e.currentTarget.getBoundingClientRect(); x.set((e.clientX-r.left-r.width/2)*.18); y.set((e.clientY-r.top-r.height/2)*.18) }}
      onMouseLeave={() => { x.set(0); y.set(0) }}>
      <span>{children}</span><i>↗</i>
    </motion.a>
  )
}

function ParallaxCard({ src, className = '', label, number }) {
  return <figure className={'story-card ' + className} data-image-reveal>
    <img src={src} alt="" loading="lazy" />
    <figcaption><span>{number}</span><strong>{label}</strong></figcaption>
  </figure>
}

export default function HomeExperience() {
  const hero = useRef(null)
  return <>
    <section ref={hero} className="home-hero">
      <div className="home-hero__image-wrap"><img className="home-hero__image" src={images.hero} alt="Wedding couple embracing" /></div>
      <div className="home-hero__wash" /><div className="home-hero__orb" /><div className="home-hero__grain" />
      <div className="home-hero__content shell-wide">
        <motion.p className="micro-label" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.15}}>WEDDING PHOTOGRAPHY · INDIA & BEYOND</motion.p>
        <motion.h1 initial={{opacity:0,y:35}} animate={{opacity:1,y:0}} transition={{duration:1,delay:.25}}>Stories that<br /><em>stay</em> with you.</motion.h1>
        <motion.p className="home-hero__lead" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1,delay:.75}}>Cinematic wedding imagery for people who want more than photographs.</motion.p>
        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.9}}><MagneticButton href="#stories">Explore our work</MagneticButton></motion.div>
      </div>
      <div className="home-hero__side-note">SCROLL TO DISCOVER <span>↓</span></div><div className="home-hero__counter">01 <span>/</span> 05</div>
    </section>

    <section className="manifesto section-light"><div className="shell-wide manifesto__grid">
      <div data-reveal><p className="section-kicker">THE GALAXY STUDIO APPROACH</p><h2>Not just a wedding.<br /><em>A whole universe.</em></h2></div>
      <div className="manifesto__copy" data-reveal><p>We photograph the quiet glances, the chaos before the ceremony, the hands that tremble, the friends who dance too hard and the little details nobody else notices.</p><p>Our work blends editorial composition with honest documentary moments, creating wedding stories that feel cinematic without ever feeling staged.</p><a className="text-link" href="/portfolio">Discover the studio <span>↗</span></a></div>
    </div></section>

    <section id="stories" className="stories section-dark"><div className="shell-wide">
      <div className="section-heading" data-reveal><div><p className="section-kicker">SELECTED STORIES</p><h2>Moments,<br /><em>in motion.</em></h2></div><p>Every celebration has its own rhythm. We follow it.</p></div>
      <div className="stories__grid">
        <ParallaxCard src={images.couple} className="story-card--large" label="Aarav & Meera" number="01" />
        <ParallaxCard src={images.bride} label="Rhea & Kabir" number="02" />
        <ParallaxCard src={images.details} label="The details" number="03" />
        <ParallaxCard src={images.portrait} className="story-card--wide" label="An evening in Jaipur" number="04" />
      </div>
      <div className="stories__footer"><MagneticButton href="/portfolio">View complete portfolio</MagneticButton></div>
    </div></section>

    <section className="film-section"><div className="film-section__image"><img src={images.celebration} alt="Wedding celebration" data-image-reveal /></div>
      <div className="film-section__panel" data-reveal><p className="section-kicker">THE FILM</p><h2>Some stories<br /><em>need sound.</em></h2><p>Our wedding films bring movement, voices and atmosphere into the story, so years from now you remember not only how it looked, but how it felt.</p><a className="circle-link" href="/portfolio" aria-label="Watch films">↗</a></div>
    </section>

    <section className="services section-light"><div className="shell-wide"><div className="services__top" data-reveal><div><p className="section-kicker">WHAT WE DO</p><h2>Made for<br /><em>your story.</em></h2></div><p>From intimate ceremonies to full-scale destination celebrations, our team builds a visual language around you.</p></div>
      <div className="services__list">{['Wedding Photography','Cinematic Films','Destination Weddings','Editorial Portraits'].map((item,i)=><a className="service-row" href="/contact" key={item}><span>0{i+1}</span><h3>{item}</h3><i>↗</i></a>)}</div>
    </div></section>

    <section className="closing-cta"><div className="closing-cta__backdrop"><img src={images.hero} alt="" /></div><div className="closing-cta__veil" />
      <div className="closing-cta__content" data-reveal><p className="section-kicker">YOUR STORY STARTS HERE</p><h2>Let's make<br /><em>something timeless.</em></h2><MagneticButton href="/contact">Plan your wedding</MagneticButton></div>
      <div className="closing-cta__footer shell-wide"><span>GALAXY STUDIO</span><span>KAITHAL · CHANDIGARH · INDIA</span><span>© 2026</span></div>
    </section>
  </>
}
