import { useEffect, useRef, useState } from 'react'
import { createIntroTimeline } from '../../animations/intro'
import GalaxyScene from '../three/GalaxyScene'
const INTRO_KEY='galaxy-studios-intro-seen'
export default function Preloader({onComplete}){
  const root=useRef(null); const [progress,setProgress]=useState(0)
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const fullExperience=!reducedMotion&&!sessionStorage.getItem(INTRO_KEY)
  useEffect(()=>{const timeline=createIntroTimeline({root:root.current,fullExperience,onProgress:setProgress,onComplete:()=>{sessionStorage.setItem(INTRO_KEY,'true');onComplete()}});return()=>timeline.kill()},[fullExperience,onComplete])
  return <section ref={root} className="preloader" aria-label="Galaxy Studios cinematic introduction">
    {!reducedMotion&&<GalaxyScene fullExperience={fullExperience}/>}<div className="preloader__vignette"/><div className="preloader__flash"/>
    <div className="preloader__content"><div className="preloader__brand-lockup"><p className="preloader__wordmark">Galaxy studio</p><p className="preloader__presents">presents</p></div>
    <div className="preloader__status" aria-live="polite"><div className="preloader__progress"><i style={{transform:`scaleX(${progress/100})`}}/></div><span>Loading&nbsp;&nbsp;{String(progress).padStart(3,'0')}%</span></div></div>
  </section>
}
