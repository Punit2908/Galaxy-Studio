import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Albums from './pages/Albums'
import WeddingStory from './pages/WeddingStory'
import Contact from './pages/Contact'
import Auth from './pages/Auth'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  useEffect(() => {
    const api = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    let cancelled = false

    fetch(`${api}/media/slots`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (cancelled) return
        const faviconSlot = data?.slots?.find((item) => item.slot === 'site.favicon')
        const faviconMedia = faviconSlot?.mediaItems?.[0] || faviconSlot?.media
        const favicon = faviconMedia?.publicUrl
        if (!favicon) return

        let link = document.querySelector('link[rel="icon"]')
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = favicon
        if (faviconMedia?.mimeType) link.type = faviconMedia.mimeType
      })
      .catch(() => {})
    
    return () => { cancelled = true }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/albums" element={<Albums />} />
      <Route path="/wedding/:slug" element={<WeddingStory />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
