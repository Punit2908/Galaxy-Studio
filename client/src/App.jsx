import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import Albums from './pages/Albums'
import WeddingStory from './pages/WeddingStory'
import Contact from './pages/Contact'
import Auth from './pages/Auth'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/albums" element={<Albums />} />
      <Route path="/wedding/:slug" element={<WeddingStory />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/signup" element={<Auth mode="signup" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
