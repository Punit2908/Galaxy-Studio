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

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [scrolled, setScrolled] = useState(false)

  const [activeLink, setActiveLink] = useState('Home')

  useEffect(() => {
    const updateActiveLink = () => {
      const path = window.location.pathname
      const hash = window.location.hash

      if (path === '/contact') {
        setActiveLink('Contact')
      } else if (path === '/portfolio') {
        setActiveLink('Features')
      } else if (path === '/albums') {
        setActiveLink('Albums')
      } else if (hash === '#stories') {
        setActiveLink('Explore Us')
      } else {
        setActiveLink('Home')
      }
    }

    updateActiveLink()
    window.addEventListener('hashchange', updateActiveLink)
    window.addEventListener('popstate', updateActiveLink)

    return () => {
      window.removeEventListener('hashchange', updateActiveLink)
      window.removeEventListener('popstate', updateActiveLink)
    }
  }, [])

  const links = navigation.map((item) => (
    <a
      key={item.label}
      className={`nav__link ${activeLink === item.label ? 'nav__link--active' : ''}`}
      href={item.href}
      onClick={() => {
        setActiveLink(item.label)
        setOpen(false)
      }}
    >
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
          <a href="tel:+917206889227">+91 72068 89227</a>
          <span className="nav__utility-divider" />
          <a href="mailto:harishjangra8361@gmail.com">harishjangra8361@gmail.com</a>
        </div>

        <div className="nav__utility-social">
          <a href="/login">Login</a>
          <a href="/signup">Sign up</a>
          <span className="nav__utility-follow">Follow</span>
          <a className="nav__instagram" href="https://www.instagram.com/galaxyphotography3392/" target="_blank" rel="noreferrer" aria-label="Galaxy Photography on Instagram">
            <InstagramIcon />
          </a>
        </div>
      </div>

      <nav className="nav shell-wide" aria-label="Primary navigation">
        <a className="nav__brand" href="/#home" aria-label="Galaxy Photography home">
          <img className="nav__brand-logo" src="/logo.png" alt="Galaxy Photography" />
        </a>

        <div className="nav__links">{links}</div>

        <div className="nav__actions">
          <a className="nav__contact" href="/contact">
            <span>Book a Consultation</span>
          </a>

          <button className="nav__menu" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
            <span className="material-symbols-outlined nav__menu-icon">menu_open</span>
            <b className="sr-only">Toggle menu</b>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" className="nav__mobile" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
            <div>{links}</div>
            <a className="nav__mobile-cta" href="/contact" onClick={() => setOpen(false)}>
              Book a Consultation
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
