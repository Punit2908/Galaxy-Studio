import gsap from 'gsap'

export function createIntroTimeline({ root, onComplete }) {
  const query = gsap.utils.selector(root)
  const wordmark = query('.preloader__wordmark')
  const flash = query('.preloader__flash')

  return gsap.timeline({ onComplete })
    .set(wordmark, { autoAlpha: 0, y: -10, scale: 0.92, filter: 'blur(8px)' })
    .set(flash, { autoAlpha: 0, scale: 0.45 })
    .to(wordmark, { autoAlpha: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.35, ease: 'power3.out' }, 0.45)
    .to(wordmark, { scale: 1.025, duration: 5.8, ease: 'sine.inOut' }, 1.4)
    .to(wordmark, { scale: 1.08, filter: 'blur(2px)', duration: 1.05, ease: 'power4.in' }, 7.15)
    .to(flash, { autoAlpha: 1, scale: 1.55, duration: 0.72, ease: 'power4.in' }, 8.05)
    .to(root, { autoAlpha: 0, duration: 0.82, ease: 'power2.inOut' }, 8.75)
}
