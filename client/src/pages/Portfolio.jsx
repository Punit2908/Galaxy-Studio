import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import useSmoothScroll from '../hooks/useSmoothScroll'

const differentiators = [
  {
    number: '01',
    title: 'Story-first coverage',
    text: 'We build coverage around the people, rituals, atmosphere and small interactions that make your wedding yours, rather than treating the day like a checklist of poses.',
  },
  {
    number: '02',
    title: 'Photography + motion',
    text: 'Your memories can live across photographs, cinematic films, pre-wedding stories and aerial perspectives, giving the final collection more depth and movement.',
  },
  {
    number: '03',
    title: 'Editorial without losing emotion',
    text: 'We combine considered composition with real expressions, so the finished gallery can feel polished while still preserving the character of the day.',
  },
  {
    number: '04',
    title: 'Aerial perspective',
    text: 'Drone imagery can show the venue, procession and scale of the celebration from a perspective that ground-level coverage cannot provide.',
  },
  {
    number: '05',
    title: 'Personal consultation',
    text: 'Every celebration has different priorities. We discuss your schedule, locations, coverage and expectations directly before finalising the package.',
  },
  {
    number: '06',
    title: 'Built around your celebration',
    text: 'Instead of forcing every wedding into one visual formula, we adapt the coverage to your people, traditions, locations and the way your day actually unfolds.',
  },
]

const process = [
  ['01', 'Tell us your plans', 'Share your date, location, events and the kind of memories you want to preserve.'],
  ['02', 'Plan the coverage', 'We discuss the schedule, locations, photography, films, pre-wedding work and any aerial requirements.'],
  ['03', 'Capture the story', 'Our team works through the day with a mix of guided portraits and documentary observation.'],
  ['04', 'Shape the final collection', 'Your photographs and films are prepared as a cohesive visual story rather than disconnected moments.'],
]

const faqs = [
  ['What is the starting price?', 'Our wedding photography packages start from ₹50,000. The final quote is negotiable and depends on the coverage, events, location, duration and services required.'],
  ['Is ₹50,000 the final package price?', 'No. ₹50,000 is the starting point, not a fixed universal package. A personalised quotation is prepared after understanding your requirements.'],
  ['Can I customise the package?', 'Yes. Coverage can be discussed around your wedding events and requirements, including photography, cinematic films, pre-wedding sessions and drone coverage where suitable.'],
  ['Do you travel for weddings?', 'Galaxy Photography is based in North India and can work across India for selected celebrations and destination stories. Travel and accommodation requirements are discussed directly.'],
  ['Can I ask for a quote before booking?', 'Yes. The first step is a direct conversation about your date, venue, events and requirements. The admin can then guide you through the available options and pricing.'],
  ['How do I get more information?', 'For package details, availability and further queries, contact the admin directly through the Contact page, phone, email or WhatsApp.'],
]

function PortfolioMedia({ src, type = 'image', alt = '' }) {
  if (type === 'video') {
    return <video src={src} muted autoPlay loop playsInline preload="metadata" aria-label={alt} />
  }
  return <img src={src} alt={alt} loading="lazy" />
}

export default function Portfolio() {
  const page = useRef(null)
  const [openFaq, setOpenFaq] = useState(0)
  useSmoothScroll()

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-portfolio-reveal]').forEach((el) => {
        gsap.fromTo(el, { y: 45, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: .9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        })
      })

      gsap.utils.toArray('[data-portfolio-image]').forEach((el) => {
        gsap.fromTo(el, { scale: 1.08, clipPath: 'inset(8% 6% 8% 6%)' }, {
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.25,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        })
      })
    }, page)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={page} className="portfolio-page">
      <Navbar />

      <main>
        <section className="portfolio-hero" data-nav-theme="dark">
          <div className="portfolio-hero__backdrop">
            <img src="/Ashwani%20and%20Tarun.jpeg" alt="" />
          </div>
          <div className="portfolio-hero__veil" />
          <div className="shell-wide portfolio-hero__inner">
            <p className="section-kicker" data-portfolio-reveal>GALAXY PHOTOGRAPHY · WEDDINGS ACROSS INDIA</p>
            <h1 data-portfolio-reveal>More than a<br /><em>photo package.</em></h1>
            <p className="portfolio-hero__lead" data-portfolio-reveal>
              A wedding collection built around your people, your atmosphere and the moments you will want to remember years from now.
            </p>
            <div className="portfolio-hero__meta" data-portfolio-reveal>
              <span>STARTING FROM <strong>₹50,000</strong></span>
              <i />
              <span>NEGOTIABLE ACCORDING TO REQUIREMENTS</span>
            </div>
            <a className="portfolio-hero__cta" href="/contact" data-portfolio-reveal>
              <span>Discuss your wedding</span>
              <i className="material-symbols-outlined">north_east</i>
            </a>
          </div>
        </section>

        <section className="portfolio-intro section-light" data-nav-theme="light">
          <div className="shell-wide portfolio-intro__grid">
            <div data-portfolio-reveal>
              <p className="section-kicker">WHY GALAXY PHOTOGRAPHY</p>
              <h2>Your wedding is<br /><em>not a template.</em></h2>
            </div>
            <div data-portfolio-reveal>
              <p>
                Choosing a photographer is about more than a camera or a gallery of pretty pictures. It is about how your day is observed, how people are treated, what gets noticed and how the final story feels.
              </p>
              <p>
                Galaxy Photography brings photography, cinematic motion, pre-wedding stories and aerial perspectives into one visual approach, with the flexibility to discuss what your celebration actually needs.
              </p>
            </div>
          </div>
        </section>

        <section className="portfolio-differentiators section-dark">
          <div className="shell-wide">
            <div className="portfolio-section-heading" data-portfolio-reveal>
              <div>
                <p className="section-kicker">WHAT SETS US APART</p>
                <h2>Why couples<br /><em>choose Galaxy.</em></h2>
              </div>
              <p>Six parts of the experience that shape how we approach a wedding, from the first conversation to the final collection.</p>
            </div>

            <div className="portfolio-differentiators__grid">
              {differentiators.map((item) => (
                <article className="portfolio-difference" key={item.number} data-portfolio-reveal>
                  <span>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="portfolio-showcase section-dark">
          <div className="shell-wide">
            <div className="portfolio-showcase__heading" data-portfolio-reveal>
              <p className="section-kicker">THE WORK</p>
              <h2>See the story<br /><em>from every angle.</em></h2>
            </div>

            <div className="portfolio-showcase__grid">
              <figure className="portfolio-showcase__card portfolio-showcase__card--large" data-portfolio-image>
                <PortfolioMedia src="/Ashwani.jpeg" alt="Indian wedding portrait" />
                <figcaption><span>01 · PHOTOGRAPHY</span><strong>Emotion in the frame.</strong></figcaption>
              </figure>
              <figure className="portfolio-showcase__card" data-portfolio-image>
                <PortfolioMedia src="/Video%202.mp4" type="video" alt="Cinematic wedding film" />
                <figcaption><span>02 · CINEMATIC FILM</span><strong>Moments in motion.</strong></figcaption>
              </figure>
              <figure className="portfolio-showcase__card" data-portfolio-image>
                <PortfolioMedia src="/Drone%20Shot%201.png" alt="Indian wedding venue from above" />
                <figcaption><span>03 · DRONE</span><strong>The celebration in scale.</strong></figcaption>
              </figure>
            </div>

            <a className="text-link portfolio-showcase__link" href="/albums">Explore albums & films <span>↗</span></a>
          </div>
        </section>

        <section className="portfolio-pricing section-light">
          <div className="shell-wide">
            <div className="portfolio-section-heading portfolio-section-heading--light" data-portfolio-reveal>
              <div>
                <p className="section-kicker">INVESTMENT</p>
                <h2>Starting from<br /><em>₹50,000.</em></h2>
              </div>
              <p>Every wedding is different. The starting price gives you a reference point, while the final quote is discussed and negotiated according to your coverage, events, location and selected services.</p>
            </div>

            <div className="portfolio-pricing__box" data-portfolio-reveal>
              <div>
                <span className="portfolio-pricing__label">WEDDING COLLECTIONS</span>
                <strong>₹50,000<span>+</span></strong>
                <p>Starting price · final pricing is customised</p>
              </div>
              <div className="portfolio-pricing__includes">
                <span>PHOTOGRAPHY</span>
                <span>CINEMATIC FILMS</span>
                <span>PRE-WEDDING</span>
                <span>DRONE COVERAGE</span>
                <span>EVENT-SPECIFIC COVERAGE</span>
              </div>
              <a href="/contact">Get a personalised quote <span>↗</span></a>
            </div>

            <p className="portfolio-pricing__note" data-portfolio-reveal>
              Pricing depends on the exact requirements. For availability, package details, travel requirements or any further query, please contact the admin directly.
            </p>
          </div>
        </section>

        <section className="portfolio-process section-dark">
          <div className="shell-wide">
            <div className="portfolio-section-heading" data-portfolio-reveal>
              <div>
                <p className="section-kicker">HOW IT WORKS</p>
                <h2>From first message<br /><em>to final story.</em></h2>
              </div>
            </div>
            <div className="portfolio-process__grid">
              {process.map(([number, title, text]) => (
                <article key={number} data-portfolio-reveal>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="portfolio-faq section-light">
          <div className="shell-wide portfolio-faq__grid">
            <div data-portfolio-reveal>
              <p className="section-kicker">COMMON QUESTIONS</p>
              <h2>Before you<br /><em>book.</em></h2>
              <p className="portfolio-faq__intro">
                Still deciding what you need? These are the questions most couples should settle before confirming their wedding coverage.
              </p>
              <a className="portfolio-faq__contact" href="/contact">Contact the admin <span>↗</span></a>
            </div>

            <div className="portfolio-faq__list" data-portfolio-reveal>
              {faqs.map(([question, answer], index) => (
                <article className={openFaq === index ? 'is-open' : ''} key={question}>
                  <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}>
                    <span>{question}</span>
                    <i className="material-symbols-outlined">{openFaq === index ? 'remove' : 'add'}</i>
                  </button>
                  <div className="portfolio-faq__answer">
                    <p>{answer}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="portfolio-cta section-dark">
          <div className="portfolio-cta__image"><img src="/Anita%20and%20Sunil.png" alt="" /></div>
          <div className="portfolio-cta__veil" />
          <div className="shell-wide portfolio-cta__content" data-portfolio-reveal>
            <p className="section-kicker">YOUR DATE · YOUR STORY · YOUR CHOICE</p>
            <h2>Let's talk about<br /><em>your wedding.</em></h2>
            <p>For exact pricing, availability and package details, speak directly with the admin.</p>
            <div className="portfolio-cta__actions">
              <a href="/contact">Contact the admin <span>↗</span></a>
              <a href="https://wa.me/917206889227" target="_blank" rel="noreferrer">WhatsApp <span>↗</span></a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
