const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Explore Us', href: '/portfolio' },
  { label: 'Features', href: '/#services' },
  { label: 'Albums', href: '/albums' },
  { label: 'Contact', href: '/contact' },
]

const services = [
  { label: 'Wedding Photography', href: '/portfolio' },
  { label: 'Pre-Wedding Shoots', href: '/portfolio' },
  { label: 'Candid Photography', href: '/portfolio' },
  { label: 'Cinematic Films', href: '/albums' },
  { label: 'Maternity & Baby Shoots', href: '/contact' },
  { label: 'Event Photography', href: '/portfolio' },
  { label: 'Album Designing', href: '/albums' },
]

function Icon({ name }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const paths = {
    camera: <><path d="M8.5 5 10 3h4l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.5Z" /><circle cx="12" cy="12" r="3.5" /></>,
    heart: <path d="M20.8 8.8c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.8 2.4Z" />,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    phone: <path d="M6.8 3.8 9 3l2 5-2.3 1.5a15.5 15.5 0 0 0 5.3 5.3l1.5-2.3 5 2 .8 2.2a2 2 0 0 1-2 2.7C10.4 18.5 5.5 13.6 4.6 5.8a2 2 0 0 1 2.2-2Z" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></>,
    whatsapp: <><path d="M20.4 11.1a8.3 8.3 0 0 1-12.3 7.2L3.5 20l1.7-4.4A8.3 8.3 0 1 1 20.4 11.1Z" /><path d="M9 8.2c.2-.4.5-.4.8-.1l1.1 1.6c.2.3.1.5-.1.8l-.5.5c.6 1.1 1.5 2 2.6 2.6l.5-.5c.3-.2.5-.3.8-.1l1.6 1.1c.3.2.3.6.1.8l-.4.5c-.5.6-1.3.8-2 .5-3.3-1.3-5.8-3.8-7.1-7.1-.3-.7-.1-1.5.5-2Z" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  }

  return <svg {...common}>{paths[name]}</svg>
}

function FooterLink({ href, children }) {
  return (
    <a className="site-footer__link" href={href}>
      <Icon name="chevron" />
      <span>{children}</span>
    </a>
  )
}

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/galaxyphotography3392/', icon: 'instagram', className: 'footer-social--instagram' },
  { label: 'WhatsApp', href: 'https://wa.me/917206889227', icon: 'whatsapp', className: 'footer-social--whatsapp' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__backdrop" aria-hidden="true" />
      <div className="site-footer__veil" aria-hidden="true" />

      <div className="site-footer__inner shell-wide">
        <div className="site-footer__main">
          <section className="site-footer__brand">
            <a href="/" className="site-footer__logo-link" aria-label="Galaxy Photography home">
              <img src="/logo.png" alt="Galaxy Photography" className="site-footer__logo" />
            </a>

            <p className="site-footer__tagline">
              Capturing real moments, creating<br />
              memories for a lifetime.
            </p>

            <div className="site-footer__ornament" aria-hidden="true">
              <span /><i>✦</i><span />
            </div>

            <p className="site-footer__eyebrow">WEDDING PHOTOGRAPHY</p>

            <div className="site-footer__stats">
              <div><Icon name="camera" /><strong>1000+</strong><span>Happy Clients</span></div>
              <div><Icon name="heart" /><strong>5+</strong><span>Years Experience</span></div>
              <div><Icon name="star" /><strong>Premium</strong><span>Quality Work</span></div>
            </div>
          </section>

          <nav className="site-footer__column" aria-label="Quick Links">
            <h3>Quick Links</h3>
            <span className="site-footer__heading-line" />
            <div className="site-footer__links">
              {quickLinks.map((link) => <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>)}
            </div>
          </nav>

          <nav className="site-footer__column" aria-label="Our Services">
            <h3>Our Services</h3>
            <span className="site-footer__heading-line" />
            <div className="site-footer__links">
              {services.map((link) => <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>)}
            </div>
          </nav>

          <section className="site-footer__column site-footer__contact">
            <h3>Get In Touch</h3>
            <span className="site-footer__heading-line" />

            <a href="tel:+917206889227" className="site-footer__contact-row">
              <span className="site-footer__contact-icon site-footer__contact-icon--phone"><Icon name="phone" /></span>
              <span>+91 72068 89227</span>
            </a>

            <a href="mailto:harishjangra8361@gmail.com" className="site-footer__contact-row">
              <span className="site-footer__contact-icon site-footer__contact-icon--mail"><Icon name="mail" /></span>
              <span>harishjangra8361@gmail.com</span>
            </a>

            <a href="https://www.google.com/maps/search/?api=1&query=Safidon%2C%20Haryana%2C%20126112" target="_blank" rel="noreferrer" className="site-footer__contact-row">
              <span className="site-footer__contact-icon site-footer__contact-icon--location"><Icon name="pin" /></span>
              <span>Safidon, Haryana, 126112</span>
            </a>

            <a href="https://www.instagram.com/galaxyphotography3392/" target="_blank" rel="noreferrer" className="site-footer__contact-row">
              <span className="site-footer__contact-icon site-footer__contact-icon--instagram"><Icon name="instagram" /></span>
              <span>@galaxyphotography3392</span>
            </a>
          </section>
        </div>

        <div className="site-footer__bottom">
          <p>© 2026 Galaxy Photography. All Rights Reserved.</p>

          <div className="site-footer__signature">
            <span>Let's Capture Your Beautiful Story</span>
            <div className="site-footer__ornament" aria-hidden="true">
              <span /><i>✦</i><span />
            </div>
          </div>

          <div className="site-footer__follow">
            <span>Follow Us</span>
            <span className="site-footer__follow-divider" />
            <div className="site-footer__socials">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label} className={`site-footer__social ${social.className}`}>
                  <Icon name={social.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
