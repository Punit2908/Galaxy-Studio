import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'

const images = {
  hero: 'https://images.pexels.com/photos/27273675/pexels-photo-27273675.jpeg?auto=compress&cs=tinysrgb&w=2200',
  hands: 'https://images.pexels.com/photos/18628263/pexels-photo-18628263.jpeg?auto=compress&cs=tinysrgb&w=1200',
  couple: 'https://images.pexels.com/photos/31002333/pexels-photo-31002333.jpeg?auto=compress&cs=tinysrgb&w=1800',
  bride: 'https://images.pexels.com/photos/32325264/pexels-photo-32325264.jpeg?auto=compress&cs=tinysrgb&w=1400',
  details: 'https://images.pexels.com/photos/12200847/pexels-photo-12200847.jpeg?auto=compress&cs=tinysrgb&w=1400',
  portrait: 'https://images.pexels.com/photos/30184675/pexels-photo-30184675.jpeg?auto=compress&cs=tinysrgb&w=1500',
  celebration: 'https://images.pexels.com/photos/27273675/pexels-photo-27273675.jpeg?auto=compress&cs=tinysrgb&w=1800',
}
const galleryData = {
  'Wedding Photography': [
    { type: 'image', src: images.couple, title: 'The celebration', meta: 'Wedding · 01' },
    { type: 'image', src: images.bride, title: 'The bride', meta: 'Wedding · 02' },
    { type: 'image', src: images.details, title: 'The details', meta: 'Wedding · 03' },
    { type: 'image', src: images.portrait, title: 'After the ceremony', meta: 'Wedding · 04' },
  ],
  'Cinematic Films': [
    { type: 'video', src: '/Video%201.mp4', title: 'A moving story', meta: 'Film · 01' },
    { type: 'video', src: '/Video%202.mp4', title: 'The atmosphere', meta: 'Film · 02' },
    { type: 'video', src: '/Video%203.mp4', title: 'The celebration', meta: 'Film · 03' },
    { type: 'image', src: images.celebration, title: 'Frame from the story', meta: 'Film · 04' },
  ],
  'Drone Stories': [
    { type: 'image', src: 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=1800', title: 'The venue from above', meta: 'Aerial · 01' },
    { type: 'image', src: 'https://images.pexels.com/photos/1531677/pexels-photo-1531677.jpeg?auto=compress&cs=tinysrgb&w=1800', title: 'A wider view', meta: 'Aerial · 02' },
    { type: 'image', src: images.hero, title: 'The destination', meta: 'Aerial · 03' },
    { type: 'image', src: images.couple, title: 'The gathering', meta: 'Aerial · 04' },
  ],
  'Pre-Wedding': [
    { type: 'image', src: images.portrait, title: 'Before the vows', meta: 'Pre-Wedding · 01' },
    { type: 'image', src: images.couple, title: 'Just us', meta: 'Pre-Wedding · 02' },
    { type: 'image', src: images.bride, title: 'An editorial morning', meta: 'Pre-Wedding · 03' },
    { type: 'image', src: images.details, title: 'Little moments', meta: 'Pre-Wedding · 04' },
  ],
}



function MagneticButton({ children, href = '#' }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 18 })
  const sy = useSpring(y, { stiffness: 180, damping: 18 })

  return (
    <motion.a
      href={href}
      className="luxury-button"
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * .18)
        y.set((e.clientY - r.top - r.height / 2) * .18)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      <span>{children}</span><i><span className="material-symbols-outlined">north_east</span></i>
    </motion.a>
  )
}

function GalleryMedia({ item, index }) {
  if (item.type === 'video') {
    return (
      <video
        src={item.src}
        muted
        playsInline
        loop
        preload="metadata"
        onMouseEnter={(event) => event.currentTarget.play().catch(() => {})}
        onMouseLeave={(event) => {
          event.currentTarget.pause()
          event.currentTarget.currentTime = 0
        }}
      />
    )
  }

  return <img src={item.src} alt="" loading="lazy" />
}

function CategoryGallery() {
  const categories = Object.keys(galleryData)
  const [activeCategory, setActiveCategory] = useState(categories[0])
  const items = galleryData[activeCategory]

  return (
    <div className="category-gallery">
      <div className="category-gallery__nav" role="tablist" aria-label="Portfolio categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={activeCategory === category}
            className={activeCategory === category ? 'is-active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            <span>{String(categories.indexOf(category) + 1).padStart(2, '0')}</span>
            {category}
          </button>
        ))}
      </div>

      <motion.div
        className="category-gallery__grid"
        key={activeCategory}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}
      >
        {items.map((item, index) => (
          <motion.figure
            key={item.meta}
            className={`category-gallery__item category-gallery__item--${index + 1}`}
            initial={{ opacity: 0, y: 24, scale: .985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: .55, delay: index * .07, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="category-gallery__media">
              <GalleryMedia item={item} index={index} />
              <span className="category-gallery__shade" />
              <span className="category-gallery__play">
                {item.type === 'video' ? 'motion_play' : 'north_east'}
              </span>
            </div>
            <figcaption>
              <span>{item.meta}</span>
              <strong>{item.title}</strong>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>

      <div className="category-gallery__footer">
        <p>Sample collection · each category supports unlimited future media.</p>
        <a className="text-link" href="/portfolio">Explore the full portfolio <span>↗</span></a>
      </div>
    </div>
  )
}

function StoryVideo({ src, poster, label }) {
  const ref = useRef(null)
  const [muted, setMuted] = useState(true)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting
      setActive(visible)

      if (visible) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    }, { threshold: 0.35 })

    observer.observe(video)
    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [])

  const toggleMute = () => {
    const video = ref.current
    if (!video) return
    const nextMuted = !video.muted
    video.muted = nextMuted
    setMuted(nextMuted)
    if (video.paused && active) video.play().catch(() => {})
  }

  return (
    <div className="story-video">
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted={muted}
        playsInline
        loop
        preload="metadata"
        aria-label={label}
      />
      <div className="story-video__shade" />
      <div className="story-video__topline">
        <span>GALAXY FILM</span>
        <span>{active ? 'PLAYING' : 'PAUSED'}</span>
      </div>
      <button
        type="button"
        className="story-video__sound"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute video' : 'Mute video'}
        title={muted ? 'Turn sound on' : 'Mute sound'}
      >
        <span className="material-symbols-outlined">{muted ? 'volume_off' : 'volume_up'}</span>
      </button>
      <span className="story-video__play material-symbols-outlined">motion_play</span>
    </div>
  )
}

function StoryMediaCard({ item, index, activeIndex, onActivate }) {
  const isVideo = item.type === 'video'

  return (
    <figure
      className={`story-media-card story-media-card--${index + 1} ${activeIndex === index ? 'is-front' : ''}`}
      onMouseEnter={() => onActivate(index)}
      onFocus={() => onActivate(index)}
      tabIndex={0}
    >
      <div className="story-media-card__frame">
        <div className="story-media-card__paper">
          {isVideo ? (
            <StoryVideo src={item.src} poster={item.poster} label={item.label} />
          ) : (
            <>
              <img src={item.src} alt={item.alt || ''} loading="lazy" />
              <div className="story-media-card__image-shade" />
            </>
          )}
          <span className="story-media-card__label">{item.type === 'video' ? 'VIDEO' : 'IMAGE'} · {String(index + 1).padStart(2, '0')}</span>
          {isVideo && <span className="story-media-card__duration">SOUND ON</span>}
        </div>
      </div>
      <figcaption>{item.caption}</figcaption>
    </figure>
  )
}

function StoryMediaStack({ items }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="story-media-stack" data-media-stack>
      {items.map((item, index) => (
        <StoryMediaCard
          key={`${item.src}-${index}`}
          item={item}
          index={index}
          activeIndex={activeIndex}
          onActivate={setActiveIndex}
        />
      ))}
    </div>
  )
}
function StoryScenario({ number, eyebrow, title, body, reason, items, reverse = false }) {
  return (
    <article className={`story-scenario ${reverse ? 'story-scenario--reverse' : ''}`} data-story-scenario>
      <div className="story-scenario__media" data-story-media>
        <StoryMediaStack items={items} />
        <span className="story-scenario__number">{number}</span>
      </div>

      <div className="story-scenario__copy" data-reveal>
        <p className="section-kicker">{eyebrow}</p>
        <h3>{title}</h3>
        <p className="story-scenario__body">{body}</p>
        <div className="story-scenario__reason">
          <span>WHY GALAXY</span>
          <p>{reason}</p>
        </div>
        <a className="text-link" href="/portfolio">
          Explore this story <span>↗</span>
        </a>
      </div>
    </article>
  )
}

function ParallaxCard({ src, className = '', label, number }) {
  return (
    <figure className={'story-card ' + className} data-image-reveal>
      <img src={src} alt="" loading="lazy" />
      <figcaption><span>{number}</span><strong>{label}</strong></figcaption>
    </figure>
  )
}

function HeroVideoBackground() {
  const videos = ['/Video%201.mp4', '/Video%202.mp4', '/Video%203.mp4']
  const [activeVideo, setActiveVideo] = useState(0)

  const showNextVideo = () => {
    setActiveVideo((index) => (index + 1) % videos.length)
  }

  const playVideo = (event) => {
    const video = event.currentTarget
    video.muted = true
    video.play().catch(() => {})
  }

  return (
    <div className="home-hero__video-wrap" aria-hidden="true">
      <div className="home-hero__video-fallback" />
      <AnimatePresence initial={false}>
        <motion.video
          key={videos[activeVideo]}
          className="home-hero__video"
          src={videos[activeVideo]}
          autoPlay
          muted
          playsInline
          preload="auto"
          onCanPlay={playVideo}
          onEnded={showNextVideo}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.35, ease: 'easeInOut' }}
        />
      </AnimatePresence>
    </div>
  )
}

function FloralOrbit() {
  const sparkles = Array.from({ length: 16 }, (_, index) => index)

  return (
    <div className="home-hero__floral" aria-hidden="true">
      <span className="flower flower--one" />
      <span className="flower flower--two" />
      <span className="flower flower--three" />
      <span className="flower flower--four" />
      <span className="flower flower--five" />
      <span className="flower flower--six" />
      <span className="flower flower--seven" />
      <span className="flower flower--eight" />
      <span className="flower flower--center" />
      <div className="home-hero__sparkles">
        {sparkles.map((index) => <span key={index} />)}
      </div>
    </div>
  )
}

const weddingLocations = [
  'HARYANA',
  'PUNJAB',
  'DELHI',
  'RAJASTHAN',
  'UTTAR PRADESH',
  'UTTARAKHAND',
  'HIMACHAL PRADESH',
  'JAMMU & KASHMIR',
  'CHANDIGARH',
  'MADHYA PRADESH',
  'GUJARAT',
  'MAHARASHTRA',
  'GOA',
  'KARNATAKA',
  'TELANGANA',
  'ANDHRA PRADESH',
  'TAMIL NADU',
  'KERALA',
  'ODISHA',
  'WEST BENGAL',
  'BIHAR',
  'JHARKHAND',
  'CHHATTISGARH',
  'ASSAM',
  'SIKKIM',
  'MEGHALAYA',
  'TRIPURA',
  'MIZORAM',
  'MANIPUR',
  'NAGALAND',
  'ARUNACHAL PRADESH',
];

export default function HomeExperience() {
  const [locationIndex, setLocationIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLocationIndex((index) => (index + 1) % weddingLocations.length)
    }, 2400)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <>
      <section id="home" className="home-hero" data-nav-theme="dark">
        <HeroVideoBackground />
        <div className="home-hero__image-wrap">
          <img className="home-hero__image" src={images.hero} alt="Indian bride and groom in traditional wedding attire" />
        </div>
        <div className="home-hero__wash" />

        <div className="home-hero__orb">
          <img src={images.hands} alt="Bride and groom holding hands during an Indian wedding ceremony" />
          <FloralOrbit />
        </div>

        <div className="home-hero__grain" />

        <div className="home-hero__content shell-wide">
          <motion.p className="micro-label home-hero__eyebrow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .15 }}>
            <span>WEDDING PHOTOGRAPHY ·</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={weddingLocations[locationIndex]}
                className="home-hero__location"
                initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                transition={{ duration: .42, ease: 'easeOut' }}
              >
                {weddingLocations[locationIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: .25 }}>
            Stories that<br /><em>stay with you.</em>
          </motion.h1>

          <motion.p className="home-hero__lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: .75 }}>
            Cinematic wedding imagery for couples who want more than photographs — moments, emotions and memories for a lifetime.
          </motion.p>

          <motion.div className="home-hero__actions" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .9 }}>
            <a className="home-hero__film" href="/portfolio"><span><span className="material-symbols-outlined">motion_play</span></span> WATCH OUR FILM</a>
            <MagneticButton href="#stories">Explore our work</MagneticButton>
          </motion.div>
        </div>

        <div className="home-hero__stats">
          <div><strong>1000+</strong><span>Happy Couples</span></div>
          <div><strong>5000+</strong><span>Moments Captured</span></div>
          <div><strong>10+</strong><span>Years of Stories</span></div>
        </div>

        <div className="home-hero__counter">01 <span>/</span> 05</div>
      </section>

      <section className="manifesto section-light" data-nav-theme="light">
        <div className="manifesto__bubble manifesto__bubble--left" aria-hidden="true">
          <img src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=700&q=85" alt="" />
          <span />
        </div>
        <div className="manifesto__bubble manifesto__bubble--right" aria-hidden="true">
          <img src="https://images.unsplash.com/photo-1495231916356-a86217efff12?auto=format&fit=crop&w=700&q=85" alt="" />
          <span />
        </div>

        <div className="shell-wide manifesto__grid">
          <div className="manifesto__heading" data-reveal>
            <p className="section-kicker">THE GALAXY PHOTOGRAPHY APPROACH</p>
            <h2>Not just a wedding.<br /><em>A whole universe.</em></h2>
            <p className="manifesto__intro">Photography, films and everything in between, crafted to preserve the atmosphere of your day.</p>
          </div>

          <div className="manifesto__copy" data-reveal>
            <p>We photograph the quiet glances, the chaos before the ceremony, the hands that tremble, the friends who dance too hard and the little details nobody else notices.</p>
            <p>Alongside photography, we create cinematic wedding films, pre-wedding stories and aerial drone imagery that gives the celebration a wider sense of place.</p>

            <div className="manifesto__services" aria-label="Galaxy Photography services">
              <a className="manifesto__service" href="/portfolio">
                <span className="manifesto__service-number">01</span>
                <span><strong>Photography</strong><small>Editorial + documentary</small></span>
                <i className="material-symbols-outlined">photo_camera</i>
              </a>
              <a className="manifesto__service" href="/portfolio">
                <span className="manifesto__service-number">02</span>
                <span><strong>Videography</strong><small>Cinematic wedding films</small></span>
                <i className="material-symbols-outlined">movie</i>
              </a>
              <a className="manifesto__service" href="/portfolio">
                <span className="manifesto__service-number">03</span>
                <span><strong>Pre-Wedding</strong><small>Couple stories before the day</small></span>
                <i className="material-symbols-outlined">favorite</i>
              </a>
              <a className="manifesto__service" href="/portfolio">
                <span className="manifesto__service-number">04</span>
                <span><strong>Drone Stories</strong><small>Aerial frames + venue scale</small></span>
                <i className="material-symbols-outlined">flight</i>
              </a>
            </div>

            <a className="text-link manifesto__discover" href="/portfolio">Discover the studio <span>↗</span></a>
          </div>
        </div>
      </section>

      <section id="stories" className="stories section-dark stories-experience" data-nav-theme="dark">
        <div className="shell-wide">
          <div className="section-heading stories-experience__heading" data-reveal>
            <div>
              <p className="section-kicker">THE GALAXY ARCHIVE</p>
              <h2>Stories,<br /><em>in every frame.</em></h2>
            </div>
            <p>A visual journey through the celebrations we photograph, film and elevate from above, with every scene built to feel like part of your story.</p>
          </div>

          <div className="story-scenarios">
            <StoryScenario
              number="01"
              eyebrow="WEDDING PHOTOGRAPHY"
              title="Every glance deserves its own frame."
              body="From the first ritual to the final dance, we look for quiet expressions, family energy and the details that make your celebration unmistakably yours."
              reason="Editorial composition meets honest moments, creating photographs that feel beautiful without feeling staged."
              items={[
                { type: 'image', src: '/Ashwani.jpeg', caption: 'Real moments · Ashwani', alt: 'Wedding portrait' },
                { type: 'image', src: '/image.png', caption: 'Image from the Galaxy archive', alt: 'Wedding detail' },
                { type: 'image', src: '/Ashwani%20and%20Tarun.jpeg', caption: 'Couple story · Ashwani & Tarun', alt: 'Wedding couple' },
                { type: 'video', src: '/Video%201.mp4', poster: '/Ashwani.jpeg', label: 'Wedding film sample', caption: 'Motion frame · Film 01' },
              ]}
            />

            <StoryScenario
              number="02"
              eyebrow="CINEMATIC WEDDING FILMS"
              title="Not just moments, whole stories."
              body="Our films bring back the rhythm of the celebration: voices, entrances, laughter, music, embraces and the seconds that still photographs cannot hear."
              reason="Two cinematic films, paired with supporting frames, show how we turn a wedding day into a story with movement and sound."
              items={[
                { type: 'video', src: '/Video%202.mp4', poster: '/Ashwani%20and%20Tarun.jpeg', label: 'Cinematic film 02', caption: 'Film frame · 02' },
                { type: 'video', src: '/Video%203.mp4', poster: '/Ashwani.jpeg', label: 'Cinematic film 03', caption: 'Film frame · 03' },
                { type: 'image', src: '/image.png', caption: 'Film still · Galaxy archive', alt: 'Wedding film still' },
                { type: 'image', src: '/Ashwani%20and%20Tarun.jpeg', caption: 'Editorial frame · Couple', alt: 'Wedding couple' },
              ]}
              reverse
            />

            <StoryScenario
              number="03"
              eyebrow="DRONE STORIES"
              title="A higher perspective, a grander story."
              body="Venues, processions, landscapes and the scale of the gathering become part of the story through elevated perspectives."
              reason="Aerial frames add context to intimate moments and let the location itself become part of your wedding film."
              items={[
                { type: 'image', src: 'https://images.pexels.com/photos/161853/wedding-dinner-restaurant-table-161853.jpeg?auto=compress&cs=tinysrgb&w=1800', caption: 'Venue from above', alt: 'Wedding venue' },
                { type: 'image', src: 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=1800', caption: 'Aerial celebration', alt: 'Aerial wedding venue' },
                { type: 'image', src: '/image.png', caption: 'Galaxy archive · Image 03', alt: 'Wedding location' },
                { type: 'image', src: 'https://images.pexels.com/photos/2088170/pexels-photo-2088170.jpeg?auto=compress&cs=tinysrgb&w=1800', caption: 'The wider setting', alt: 'Wedding landscape' },
              ]}
            />

            <StoryScenario
              number="04"
              eyebrow="PRE-WEDDING STORIES"
              title="More than a shoot, it is your story before the big day."
              body="Relaxed, natural and completely you. Pre-wedding sessions are designed around your connection, your locations and the mood you want to remember."
              reason="A personal pre-wedding chapter gives the final gallery and film a beginning that belongs to the two of you."
              items={[
                { type: 'image', src: '/Ashwani%20and%20Tarun.jpeg', caption: 'Before the vows', alt: 'Pre-wedding couple' },
                { type: 'image', src: '/Ashwani.jpeg', caption: 'A quiet chapter', alt: 'Couple portrait' },
                { type: 'video', src: '/Video%204.mp4', poster: '/Ashwani%20and%20Tarun.jpeg', label: 'Pre-wedding film sample', caption: 'Motion frame · Film 04' },
                { type: 'image', src: '/image.png', caption: 'Galaxy archive · Image 04', alt: 'Pre-wedding detail' },
              ]}
              reverse
            />
          </div>

          <div className="stories-experience__footer">
            <p>PHOTOGRAPHY · FILMS · DRONE · PRE-WEDDING</p>
            <MagneticButton href="/portfolio">View complete portfolio</MagneticButton>
          </div>
        </div>
      </section>

      <section className="film-section" data-nav-theme="dark">
        <div className="film-section__image"><img src={images.celebration} alt="Indian wedding celebration" data-image-reveal /></div>
        <div className="film-section__panel" data-reveal><p className="section-kicker">THE FILM</p><h2>Some stories<br /><em>need sound.</em></h2><p>Our wedding films bring movement, voices and atmosphere into the story, so years from now you remember not only how it looked, but how it felt.</p><a className="circle-link" href="/portfolio" aria-label="Watch films">↗</a></div>
      </section>

      <section className="services section-light" data-nav-theme="light">
        <div className="shell-wide">
          <div className="services__top" data-reveal><div><p className="section-kicker">WHAT WE DO</p><h2>Made for<br /><em>your story.</em></h2></div><p>Based in North India, we work across India for selected celebrations and destination stories.</p></div>
          <div className="services__list">{['Wedding Photography','Cinematic Films','Destination Weddings','Editorial Portraits'].map((item,i)=><a className="service-row" href="/contact" key={item}><span>0{i+1}</span><h3>{item}</h3><i>↗</i></a>)}</div>
        </div>
      </section>

      <section className="closing-cta" data-nav-theme="dark">
        <div className="closing-cta__backdrop"><img src={images.hero} alt="" /></div><div className="closing-cta__veil" />
        <div className="closing-cta__content" data-reveal><p className="section-kicker">YOUR STORY STARTS HERE</p><h2>Let's make<br /><em>something timeless.</em></h2><MagneticButton href="/contact">Plan your wedding</MagneticButton></div>
        <div className="closing-cta__footer shell-wide"><span>GALAXY PHOTOGRAPHY</span><span>KAITHAL · CHANDIGARH · INDIA</span><span>© 2026</span></div>
      </section>
    </>
  )
}
