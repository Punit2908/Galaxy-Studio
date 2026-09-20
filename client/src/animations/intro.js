import gsap from 'gsap'
export function createIntroTimeline({ root, fullExperience, onProgress, onComplete }) {
  const query=gsap.utils.selector(root), state={progress:0}
  const timeline=gsap.timeline({defaults:{ease:'power3.out'},onComplete})
  if(!fullExperience){timeline.set(query('.preloader__wordmark'),{autoAlpha:1,y:0}).to(state,{progress:100,duration:.7,ease:'none',onUpdate:()=>onProgress(Math.round(state.progress))}).to(query('.preloader__content'),{autoAlpha:0,duration:.2}).to(query('.preloader__flash'),{autoAlpha:1,duration:.18,ease:'power2.in'}).to(query('.preloader'),{autoAlpha:0,duration:.3,ease:'power2.inOut'});return timeline}
  timeline.set(query('.preloader__wordmark'),{y:26,autoAlpha:0,scale:.96,filter:'blur(10px)'})
    .set(query('.preloader__presents'),{y:14,autoAlpha:0,filter:'blur(7px)'})
    .set(query('.preloader__status'),{y:12,autoAlpha:0})
    .to(query('.preloader__wordmark'),{y:0,autoAlpha:1,scale:1,filter:'blur(0px)',duration:1.05,ease:'power3.out'},.4)
    .to(query('.preloader__presents'),{y:0,autoAlpha:1,filter:'blur(0px)',duration:.8,ease:'power3.out'},1.05)
    .to(query('.preloader__status'),{y:0,autoAlpha:1,duration:.5},1.2)
    .to(state,{progress:100,duration:5.45,ease:'none',onUpdate:()=>onProgress(Math.round(state.progress))},.4)
    .to(query('.preloader__wordmark'),{scale:1.08,filter:'blur(2px)',autoAlpha:.16,duration:.8,ease:'power2.in'},4.85)
    .to(query('.preloader__presents'),{scale:1.08,filter:'blur(2px)',autoAlpha:.08,duration:.65,ease:'power2.in'},4.95)
    .to(query('.preloader__status'),{autoAlpha:0,y:-12,duration:.35},5)
    .to(query('.preloader__flash'),{autoAlpha:1,scale:1.18,duration:.65,ease:'power4.in'},5.35)
    .to(query('.preloader'),{autoAlpha:0,duration:.72,ease:'power2.inOut'},5.55)
  return timeline
}
