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
      <div className="nav__utility shell">
        <span>☰ &nbsp; +91 98151 02663 &nbsp; | &nbsp; Galaxy Studio.com</span>
        <div>
          <a href="/signup">Sign Up</a><span>|</span><a href="/login">Log In</a>
        </div>
      </div>

      <nav className="nav shell" aria-label="Primary navigation">
        <a className="nav__brand" href="/#home">Galaxy Studio</a>
        <div className="nav__links">{links}</div>
        <div className="nav__actions">
          <a className="nav__contact" href="/contact">Contact Us</a>
          <button className="nav__menu" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
            <span /><span /><b className="sr-only">Toggle menu</b>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" className="nav__mobile" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
            <div>{links}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
