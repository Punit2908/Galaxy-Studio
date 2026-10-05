import { useState } from 'react'
import { motion } from 'framer-motion'
import useSiteMedia from '../hooks/useSiteMedia'
import api from '../lib/api'

const services = [
  'Wedding Photography',
  'Cinematic Films',
  'Pre-Wedding Shoot',
  'Drone Coverage',
  'Event Photography',
  'Other',
]

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const { mediaByFilename, slotByName } = useSiteMedia()
  const contactBackground = slotByName['site.contact.background']?.mediaItems?.[0] || slotByName['site.contact.background']?.media || slotByName['site.contact.background']?.backgroundMedia

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSending(true)
    setSent(false)
    setError('')

    try {
      await api.post('/inquiries', form)
      setSent(true)
      setForm({ name: '', email: '', phone: '', service: '', message: '' })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not send your enquiry. Please try again or contact us directly.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="contact-page" data-nav-theme="dark">
      <div className="contact-page__bg" aria-hidden="true" style={{ "--contact-bg": contactBackground?.publicUrl ? `url("${contactBackground.publicUrl}")` : (mediaByFilename["image.png"] ? `url("${mediaByFilename["image.png"]}")` : "none") }} />
      <div className="contact-page__veil" aria-hidden="true" />
      <div className="contact-page__grain" aria-hidden="true" />


      <section className="contact-shell">
        <motion.div
          className="contact-copy"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8, delay: .15, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="contact-copy__eyebrow">GET IN TOUCH</p>
          <h1>Let's capture<br /><em>your story.</em></h1>
          <p className="contact-copy__lead">
            Have a question, want to book a shoot, or need a personalised quote?
            Tell us about your celebration and we'll get back to you.
          </p>

          <div className="contact-direct">
            <a href="mailto:harishjangra8361@gmail.com">
              <span className="material-symbols-outlined">mail</span>
              <span><small>EMAIL</small>harishjangra8361@gmail.com</span>
            </a>
            <a href="https://wa.me/917206889227" target="_blank" rel="noreferrer">
              <span className="material-symbols-outlined">chat</span>
              <span><small>WHATSAPP</small>+91 72068 89227</span>
            </a>
            <a href="tel:+917206889227">
              <span className="material-symbols-outlined">call</span>
              <span><small>CALL</small>+91 72068 89227</span>
            </a>
          </div>
        </motion.div>

        <motion.div
          className="contact-card"
          initial={{ opacity: 0, y: 35, scale: .985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: .9, delay: .25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="contact-card__heading">
            <div>
              <p className="contact-card__eyebrow">YOUR STORY STARTS HERE</p>
              <h2>Write to <em>us.</em></h2>
            </div>
            <span className="contact-card__mark">✦</span>
          </div>

          <form onSubmit={submit}>
            <div className="contact-form__row">
              <label>
                <span>Your name <b>*</b></span>
                <input name="name" value={form.name} onChange={update} placeholder="Enter your name" required />
              </label>
              <label>
                <span>Email address <b>*</b></span>
                <input type="email" name="email" value={form.email} onChange={update} placeholder="Enter your email" required />
              </label>
            </div>

            <div className="contact-form__row">
              <label>
                <span>Phone number</span>
                <input type="tel" name="phone" value={form.phone} onChange={update} placeholder="+91 72068 89227" />
              </label>
              <label>
                <span>Service interested in</span>
                <select name="service" value={form.service} onChange={update}>
                  <option value="">Select a service</option>
                  {services.map((service) => <option key={service} value={service}>{service}</option>)}
                </select>
              </label>
            </div>

            <label className="contact-form__message">
              <span>Message <b>*</b></span>
              <textarea name="message" value={form.message} onChange={update} placeholder="Tell us about your date, location, events or requirements..." required />
            </label>

            {sent && (
              <p className="contact-form__status">Your enquiry has been received. We’ll get back to you as soon as possible.</p>
            )}
            {error && <p className="contact-form__status contact-form__status--error">{error}</p>}

            <button className="contact-submit" type="submit" disabled={sending}>
              <span>{sending ? 'Sending…' : 'Send enquiry'}</span>
              <i className="material-symbols-outlined">north_east</i>
            </button>
          </form>
        </motion.div>
      </section>

      <div className="contact-bottom">
        <div><span className="material-symbols-outlined">location_on</span><p><small>OUR LOCATION</small>Safidon, Haryana, 126112</p></div>
        <div><span className="material-symbols-outlined">schedule</span><p><small>AVAILABILITY</small>Contact admin for current dates</p></div>
        <div><span className="material-symbols-outlined">photo_camera</span><p><small>FOLLOW US</small><a href="https://www.instagram.com/galaxyphotography3392/" target="_blank" rel="noreferrer">@galaxyphotography3392</a></p></div>
      </div>
    </main>
  )
}
