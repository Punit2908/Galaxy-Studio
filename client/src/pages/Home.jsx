import Navbar from '../components/layout/Navbar'
import Hero from '../components/sections/Hero'
import FeaturedWork from '../components/sections/FeaturedWork'
import About from '../components/sections/About'
import Services from '../components/sections/Services'
import Testimonials from '../components/sections/Testimonials'
import ContactCTA from '../components/sections/ContactCTA'
import Footer from '../components/layout/Footer'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedWork />
        <About />
        <Services />
        <Testimonials />
        <ContactCTA />
      </main>
      <Footer />
    </>
  )
}
