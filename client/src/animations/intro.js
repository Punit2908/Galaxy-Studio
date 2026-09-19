import gsap from 'gsap'

export function createIntroTimeline({ root, fullExperience, onProgress, onComplete }) {
  const query = gsap.utils.selector(root)
  const state = { progress: 0 }
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete })
  const short = !fullExperience
  timeline.set(query('.preloader__wordmark'), { y: 22, autoAlpha: 0 }).set(query('.preloader__status'), { y: 10, autoAlpha: 0 })
    .to(query('.preloader__wordmark'), { autoAlpha: 1, y: 0, duration: short ? .25 : .7 })
    .to(query('.preloader__status'), { autoAlpha: 1, y: 0, duration: short ? .18 : .3 }, short ? '-=.08' : '+=.35')
    .to(state, { progress: 100, duration: short ? .28 : 1.55, ease: 'none', onUpdate: () => onProgress(Math.round(state.progress)) }, short ? '-=.08' : '+=.14')
    .to(query('.preloader__content'), { autoAlpha: 0, scale: .98, duration: short ? .18 : .4 }, short ? '+=.02' : '+=1.85')
    .to(query('.preloader__flash'), { autoAlpha: 1, duration: short ? .2 : .48, ease: 'power2.in' }, short ? '-=.05' : '+=.25')
    .to(query('.preloader'), { autoAlpha: 0, duration: short ? .3 : .7, ease: 'power2.inOut' })
  return timeline
}
