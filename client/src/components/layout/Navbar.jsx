import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { navigation } from '../../data/navigation'
import { siteContent } from '../../data/content'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const links = navigation.map((item) => <a key={item.label} className="nav__link depth-link" href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)
  return (
    <header className="site-header">
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="nav__brand" href="/#home" aria-label={`${siteContent.brand} home`}>Galaxy <span>Studios</span></a>
        <div className="nav__links">{links}</div>
        <button className="nav__menu" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}><span /><span /> <b className="sr-only">Toggle menu</b></button>
      </nav>
      <AnimatePresence>{open && <motion.div id="mobile-menu" className="nav__mobile" initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}><div>{links}</div></motion.div>}</AnimatePresence>
    </header>
  )
}
