import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { navigation } from '../../data/navigation'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const links = navigation.map((item) => (
    <a key={item.label} className="nav__link" href={item.href} onClick={() => setOpen(false)}>
      {item.label}
    </a>
  ))

  return (
    <header className="site-header">
      <div className="nav__utility shell">
        <span>☰ &nbsp; +91 98151 02663 &nbsp; | &nbsp; Galaxy Studio.com</span>
        <div>
          <a href="#signup">Sign Up</a><span>|</span><a href="#login">Log In</a>
          <button type="button">Search</button><span aria-hidden="true">⌕</span>
        </div>
      </div>

      <nav className="nav shell" aria-label="Primary navigation">
        <a className="nav__brand" href="/#home">Galaxy Studio</a>
        <div className="nav__links">{links}</div>
        <div className="nav__actions">
          <a className="nav__contact" href="/contact">Contact Us</a>
          <button className="nav__search" type="button" aria-label="Search">⌕</button>
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
