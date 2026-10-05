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
        const favicon = data?.slots?.find((item) => item.slot === 'site.favicon')?.mediaItems?.[0]?.publicUrl
          || data?.slots?.find((item) => item.slot === 'site.favicon')?.media?.publicUrl
        if (!favicon) return

        let link = document.querySelector('link[rel="icon"]')
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = favicon
        link.type = 'image/png'
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
