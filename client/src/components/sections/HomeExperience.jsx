import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const images = {
  hero: 'https://images.pexels.com/photos/27273675/pexels-photo-27273675.jpeg?auto=compress&cs=tinysrgb&w=2200',
  hands: 'https://images.pexels.com/photos/18628263/pexels-photo-18628263.jpeg?auto=compress&cs=tinysrgb&w=1200',
  couple: 'https://images.pexels.com/photos/31002333/pexels-photo-31002333.jpeg?auto=compress&cs=tinysrgb&w=1800',
  bride: 'https://images.pexels.com/photos/32325264/pexels-photo-32325264.jpeg?auto=compress&cs=tinysrgb&w=1400',
  details: 'https://images.pexels.com/photos/12200847/pexels-photo-12200847.jpeg?auto=compress&cs=tinysrgb&w=1400',
  portrait: 'https://images.pexels.com/photos/30184675/pexels-photo-30184675.jpeg?auto=compress&cs=tinysrgb&w=1500',
  celebration: 'https://images.pexels.com/photos/27273675/pexels-photo-27273675.jpeg?auto=compress&cs=tinysrgb&w=1800',
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
    <section ref={hero} className="home-hero" data-nav-theme="dark">
      <div className="home-hero__image-wrap"><img className="home-hero__image" src={images.hero} alt="Indian bride and groom in traditional wedding attire" /></div>
      <div className="home-hero__wash" />
      <div className="home-hero__orb">
        <img src={images.hands} alt="Bride and groom holding hands during an Indian wedding ceremony" />
        <span>THE MOMENT<br />BEFORE FOREVER</span>
      </div>
      <div className="home-hero__grain" />
      <div className="home-hero__content shell-wide">
        <motion.p className="micro-label" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.15}}>WEDDING PHOTOGRAPHY · NORTH INDIA</motion.p>
        <motion.h1 initial={{opacity:0,y:35}} animate={{opacity:1,y:0}} transition={{duration:1,delay:.25}}>Stories that<br /><em>stay</em> with you.</motion.h1>
        <motion.p className="home-hero__lead" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1,delay:.75}}>Cinematic wedding imagery for couples who want more than photographs.</motion.p>
        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.9}}><MagneticButton href="#stories">Explore our work</MagneticButton></motion.div>
      </div>
      <div className="home-hero__counter">01 <span>/</span> 05</div>
    </section>

    <section className="manifesto section-light" data-nav-theme="light"><div className="shell-wide manifesto__grid">
      <div data-reveal><p className="section-kicker">THE GALAXY PHOTOGRAPHY APPROACH</p><h2>Not just a wedding.<br /><em>A whole universe.</em></h2></div>
      <div className="manifesto__copy" data-reveal><p>We photograph the quiet glances, the chaos before the ceremony, the hands that tremble, the friends who dance too hard and the little details nobody else notices.</p><p>Our work blends editorial composition with honest documentary moments, creating wedding stories that feel cinematic without ever feeling staged.</p><a className="text-link" href="/portfolio">Discover the studio <span>↗</span></a></div>
    </div></section>

    <section id="stories" className="stories section-dark" data-nav-theme="dark"><div className="shell-wide">
      <div className="section-heading" data-reveal><div><p className="section-kicker">SELECTED INDIAN STORIES</p><h2>Moments,<br /><em>in motion.</em></h2></div><p>From North India and across the country, every celebration has its own rhythm.</p></div>
      <div className="stories__grid">
        <ParallaxCard src={images.couple} className="story-card--large" label="Aarav & Meera" number="01" />
        <ParallaxCard src={images.bride} label="Rhea & Kabir" number="02" />
        <ParallaxCard src={images.details} label="The details" number="03" />
        <ParallaxCard src={images.portrait} className="story-card--wide" label="An evening in India" number="04" />
      </div>
      <div className="stories__footer"><MagneticButton href="/portfolio">View complete portfolio</MagneticButton></div>
    </div></section>

    <section className="film-section" data-nav-theme="dark"><div className="film-section__image"><img src={images.celebration} alt="Indian wedding celebration" data-image-reveal /></div>
      <div className="film-section__panel" data-reveal><p className="section-kicker">THE FILM</p><h2>Some stories<br /><em>need sound.</em></h2><p>Our wedding films bring movement, voices and atmosphere into the story, so years from now you remember not only how it looked, but how it felt.</p><a className="circle-link" href="/portfolio" aria-label="Watch films">↗</a></div>
    </section>

    <section className="services section-light" data-nav-theme="light"><div className="shell-wide"><div className="services__top" data-reveal><div><p className="section-kicker">WHAT WE DO</p><h2>Made for<br /><em>your story.</em></h2></div><p>Based in North India, we work across India for selected celebrations and destination stories.</p></div>
      <div className="services__list">{['Wedding Photography','Cinematic Films','Destination Weddings','Editorial Portraits'].map((item,i)=><a className="service-row" href="/contact" key={item}><span>0{i+1}</span><h3>{item}</h3><i>↗</i></a>)}</div>
    </div></section>

    <section className="closing-cta" data-nav-theme="dark"><div className="closing-cta__backdrop"><img src={images.hero} alt="" /></div><div className="closing-cta__veil" />
      <div className="closing-cta__content" data-reveal><p className="section-kicker">YOUR STORY STARTS HERE</p><h2>Let's make<br /><em>something timeless.</em></h2><MagneticButton href="/contact">Plan your wedding</MagneticButton></div>
      <div className="closing-cta__footer shell-wide"><span>GALAXY PHOTOGRAPHY</span><span>KAITHAL · CHANDIGARH · INDIA</span><span>© 2026</span></div>
    </section>
  </>
}
