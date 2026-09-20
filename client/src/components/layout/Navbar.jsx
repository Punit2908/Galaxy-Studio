import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { navigation } from '../../data/navigation'

function InstagramIcon() {
  return (
    <svg className="instagram-icon" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#feda75" />
          <stop offset="35%" stopColor="#fa7e1e" />
          <stop offset="68%" stopColor="#d62976" />
          <stop offset="100%" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" fill="none" stroke="url(#ig-gradient)" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.15" fill="none" stroke="url(#ig-gradient)" strokeWidth="2" />
      <circle cx="17.55" cy="6.55" r="1.15" fill="url(#ig-gradient)" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M5 15 15 5M7 5h8v8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [scrolled, setScrolled] = useState(false)

  const links = navigation.map((item) => (
    <a key={item.label} className="nav__link" href={item.href} onClick={() => setOpen(false)}>
      {item.label}
    </a>
  ))

  useEffect(() => {
    const updateTheme = () => {
      setScrolled(window.scrollY > 34)
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
    <header className={`site-header site-header--${theme} ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="nav__utility shell-wide">
        <div className="nav__utility-contact">
          <span className="nav__utility-symbol" aria-hidden="true">+</span>
          <a href="tel:+919815102663">+91 98151 02663</a>
          <span className="nav__utility-divider" />
          <a href="mailto:hello@galaxyphotography.com">hello@galaxyphotography.com</a>
        </div>

        <div className="nav__utility-social">
          <a href="/login">Login</a>
          <a href="/signup">Sign up</a>
          <span className="nav__utility-follow">Follow</span>
          <a
            className="nav__instagram"
            href="https://www.instagram.com/galaxyphotography3392/"
            target="_blank"
            rel="noreferrer"
            aria-label="Galaxy Photography on Instagram"
          >
            <InstagramIcon />
          </a>
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
            <i aria-hidden="true"><span className="material-symbols-outlined">north_east</span></i>
          </a>
          <button className="nav__menu" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
            <span className="material-symbols-outlined nav__menu-icon">menu_open</span><b className="sr-only">Toggle menu</b>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" className="nav__mobile" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
            <div>{links}</div>
            <a className="nav__mobile-cta" href="/contact" onClick={() => setOpen(false)}>Book a Consultation <span className="material-symbols-outlined">north_east</span></a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
