import gsap from 'gsap'

export function createIntroTimeline({ root, onComplete }) {
  const query = gsap.utils.selector(root)
  const galaxy = query('.preloader__reference-galaxy')
  const stars = query('.preloader__reference-stars')
  const wordmark = query('.preloader__wordmark')
  const flash = query('.preloader__flash')

  return gsap.timeline({ onComplete })
    .set(wordmark, { autoAlpha: 0, y: -16, scale: 0.92, filter: 'blur(6px)' })
    .set(flash, { autoAlpha: 0, scale: 0.35 })
    .set(galaxy, { scale: 1.06, x: 0, y: '3%', rotation: 0, filter: 'saturate(1.08) contrast(1.08) brightness(.88) blur(0px)' })
    .to(wordmark, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.85,
      ease: 'power3.out',
    }, 0.35)
    .to(galaxy, {
      scale: 1.13,
      y: '1%',
      duration: 3.8,
      ease: 'sine.inOut',
    }, 0.35)
    .to(galaxy, {
      scale: 1.28,
      y: '-1%',
      duration: 2.5,
      ease: 'power1.inOut',
    }, 4.15)
    .to(galaxy, {
      scale: 1.72,
      y: '-4%',
      duration: 1.55,
      ease: 'power2.inOut',
    }, 6.65)
    .to(wordmark, {
      scale: 1.08,
      filter: 'blur(1.5px)',
      duration: 0.9,
      ease: 'power2.in',
    }, 7.15)
    .to(galaxy, {
      scale: 3.65,
      x: '-0.5%',
      y: '-8%',
      filter: 'saturate(1.15) contrast(1.12) brightness(1.05) blur(1.5px)',
      duration: 1.35,
      ease: 'power4.in',
    }, 8.2)
    .to(stars, {
      opacity: 0.95,
      scale: 1.08,
      duration: 1.15,
      ease: 'power2.in',
    }, 8.2)
    .to(wordmark, {
      autoAlpha: 0,
      duration: 0.35,
      ease: 'power2.in',
    }, 8.65)
    .to(galaxy, {
      scale: 5.8,
      filter: 'saturate(1.2) contrast(1.16) brightness(1.28) blur(4px)',
      duration: 0.72,
      ease: 'power4.in',
    }, 9.0)
    .to(flash, {
      autoAlpha: 1,
      scale: 1.8,
      duration: 0.62,
      ease: 'power4.in',
    }, 9.15)
    .to(root, {
      autoAlpha: 0,
      duration: 0.55,
      ease: 'power2.inOut',
    }, 9.45)
}
