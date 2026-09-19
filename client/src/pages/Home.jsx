import Navbar from '../components/layout/Navbar'
import Hero from '../components/sections/Hero'
import Preloader from '../components/common/Preloader'
import { useCallback, useState } from 'react'
import useSmoothScroll from '../hooks/useSmoothScroll'

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)
  const finishIntro = useCallback(() => setIntroComplete(true), [])
  useSmoothScroll()
  return (
    <>
      {!introComplete && <Preloader onComplete={finishIntro} />}
      <div className={introComplete ? 'site site--visible' : 'site'}>
      <Navbar />
      <main id="main-content">
        <Hero />
      </main>
      </div>
    </>
  )
}
