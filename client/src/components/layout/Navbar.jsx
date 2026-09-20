import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { navigation } from '../../data/navigation'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState('dark')

  const links = navigation.map((item) => (
    <a key={item.label} className="nav__link" href={item.href} onClick={() => setOpen(false)}>
      {item.label}
    </a>
  ))

  useEffect(() => {
    const updateTheme = () => {
      const navLine = 92
      const sections = [...document.querySelectorAll('[data-nav-theme]')]
      const active = sections.find((section) => {
        const rect = section.getBoundingClientRect()
        return rect.top <= navLine && rect.bottom > navLine
      })
      setTheme(active?.dataset.navTheme || 'dark')
    }

    updateTheme()
    window.addEventListener('scroll', updateTheme, { passive: true })
    window.addEventListener('resize', updateTheme)
    return () => {
      window.removeEventListener('scroll', updateTheme)
      window.removeEventListener('resize', updateTheme)
    }
  }, [])

  return (
    <header className={`site-header site-header--${theme}`}>
      <div className="nav__utility shell-wide">
        <div className="nav__utility-contact">
          <span>☎</span><a href="tel:+919815102663">+91 98151 02663</a>
          <span className="nav__utility-divider">|</span>
          <span>✉</span><a href="mailto:hello@galaxyphotography.com">hello@galaxyphotography.com</a>
        </div>
        <div className="nav__utility-social">
          <span>Follow Us</span>
          <a href="#" aria-label="Instagram">◎</a>
          <a href="#" aria-label="YouTube">▶</a>
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Pinterest">p</a>
        </div>
      </div>

      <nav className="nav shell-wide" aria-label="Primary navigation">
        <a className="nav__brand" href="/#home" aria-label="Galaxy Photography home">
          <span className="nav__brand-mark" aria-hidden="true">✦</span>
          <span className="nav__brand-copy">
            <strong>Galaxy Photography</strong>
            <small>CAPTURING FOREVER</small>
          </span>
        </a>

        <div className="nav__links">{links}</div>

        <div className="nav__actions">
          <a className="nav__contact" href="/contact">
            <span>Book a Consultation</span>
            <i aria-hidden="true">↗</i>
          </a>
          <button className="nav__menu" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
            <span /><span /><b className="sr-only">Toggle menu</b>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" className="nav__mobile" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
            <div>{links}</div>
            <a className="nav__mobile-cta" href="/contact" onClick={() => setOpen(false)}>Book a Consultation ↗</a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
