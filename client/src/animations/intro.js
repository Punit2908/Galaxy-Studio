import gsap from 'gsap'

const logoFonts = [
  "'Cormorant Garamond', Georgia, serif",
  "'Bodoni Moda', 'Times New Roman', serif",
  "'Cinzel', Georgia, serif",
  "'Playfair Display', Georgia, serif",
  "'DM Serif Display', Georgia, serif",
  "'Libre Baskerville', Georgia, serif",
]

export function createIntroTimeline({ root, fullExperience, onProgress, onComplete }) {
  const query = gsap.utils.selector(root)
  const state = { progress: 0 }
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete })
  const wordmark = query('.preloader__wordmark')

  if (!fullExperience) {
    timeline
      .set(wordmark, { autoAlpha: 1, y: 0 })
      .to(state, {
        progress: 100,
        duration: 0.7,
        ease: 'none',
        onUpdate: () => onProgress(Math.round(state.progress)),
      })
      .to(query('.preloader__content'), { autoAlpha: 0, duration: 0.2 })
      .to(query('.preloader__flash'), { autoAlpha: 1, duration: 0.18, ease: 'power2.in' })
      .to(query('.preloader'), { autoAlpha: 0, duration: 0.3, ease: 'power2.inOut' })
    return timeline
  }

  timeline
    .set(wordmark, {
      y: 34,
      autoAlpha: 0,
      scale: 0.88,
      filter: 'blur(14px)',
      fontFamily: logoFonts[0],
    })
    .set(query('.preloader__presents'), { y: 18, autoAlpha: 0, filter: 'blur(8px)' })
    .set(query('.preloader__status'), { y: 14, autoAlpha: 0 })
    .to(wordmark, {
      y: 0,
      autoAlpha: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 1.15,
      ease: 'power4.out',
    }, 0.3)
    .to(query('.preloader__presents'), {
      y: 0,
      autoAlpha: 1,
      filter: 'blur(0px)',
      duration: 0.9,
      ease: 'power3.out',
    }, 1.0)
    .to(query('.preloader__status'), {
      y: 0,
      autoAlpha: 1,
      duration: 0.5,
    }, 1.15)

    // The logo changes typeface once per second, but the motion stays restrained.
    .set(wordmark, { fontFamily: logoFonts[1] }, 1.35)
    .to(wordmark, { scale: 1.035, letterSpacing: '0.012em', duration: 0.45, ease: 'sine.inOut' }, 1.35)
    .set(wordmark, { fontFamily: logoFonts[2] }, 2.35)
    .to(wordmark, { scale: 0.99, letterSpacing: '0.035em', duration: 0.45, ease: 'sine.inOut' }, 2.35)
    .set(wordmark, { fontFamily: logoFonts[3] }, 3.35)
    .to(wordmark, { scale: 1.025, letterSpacing: '0.018em', duration: 0.45, ease: 'sine.inOut' }, 3.35)
    .set(wordmark, { fontFamily: logoFonts[4] }, 4.35)
    .to(wordmark, { scale: 1.0, letterSpacing: '0.028em', duration: 0.45, ease: 'sine.inOut' }, 4.35)

    .to(state, {
      progress: 100,
      duration: 5.45,
      ease: 'none',
      onUpdate: () => onProgress(Math.round(state.progress)),
    }, 0.4)

    .to(wordmark, {
      scale: 1.12,
      filter: 'blur(2px)',
      autoAlpha: 0.18,
      duration: 0.8,
      ease: 'power2.in',
    }, 4.85)
    .to(query('.preloader__presents'), {
      scale: 1.08,
      filter: 'blur(2px)',
      autoAlpha: 0.08,
      duration: 0.65,
      ease: 'power2.in',
    }, 4.95)
    .to(query('.preloader__status'), {
      autoAlpha: 0,
      y: -12,
      duration: 0.35,
    }, 5.0)
    .to(query('.preloader__flash'), {
      autoAlpha: 1,
      scale: 1.22,
      duration: 0.65,
      ease: 'power4.in',
    }, 5.35)
    .to(query('.preloader'), {
      autoAlpha: 0,
      duration: 0.72,
      ease: 'power2.inOut',
    }, 5.55)

  return timeline
}
