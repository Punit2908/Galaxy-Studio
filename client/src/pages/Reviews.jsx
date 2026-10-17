import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api'
import '../styles/reviews.css'

const ratingLabels = {
  1: 'Needs improvement',
  2: 'Could be better',
  3: 'A lovely experience',
  4: 'Really memorable',
  5: 'Absolutely magical',
}

function Stars({ value, interactive = false, onChange, onHover, size = 'normal', label = 'Rating' }) {
  const [hovered, setHovered] = useState(0)
  const activeValue = hovered || value

  return (
    <div
      className={`review-stars review-stars--${size} ${interactive ? 'review-stars--interactive' : ''}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? label : `${value} out of 5 stars`}
      onMouseLeave={() => {
        setHovered(0)
        onHover?.(0)
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        interactive ? (
          <button
            key={star}
            type="button"
            className={star <= activeValue ? 'is-filled' : ''}
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            onMouseEnter={() => {
              setHovered(star)
              onHover?.(star)
            }}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange(star)}
          >
            <span aria-hidden="true">★</span>
          </button>
        ) : (
          <span key={star} className={star <= value ? 'is-filled' : ''} aria-hidden="true">★</span>
        )
      ))}
    </div>
  )
}

function ReviewCard({ review, index }) {
  const date = review.createdAt
    ? new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(review.createdAt))
    : 'Galaxy couple'

  return (
    <motion.article
      className="review-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08 }}
    >
      <div className="review-card__top">
        <span className="review-card__quote" aria-hidden="true">“</span>
        <span className="review-card__number">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <Stars value={review.rating} size="small" />
      <blockquote>{review.text}</blockquote>
      <div className="review-card__footer">
        <span className="review-card__avatar" aria-hidden="true">{review.name?.trim()?.charAt(0)?.toUpperCase() || 'G'}</span>
        <div>
          <strong>{review.name}</strong>
          <span>{date}</span>
        </div>
        <span className="review-card__verified" title="Published review" aria-label="Published review">✦</span>
      </div>
    </motion.article>
  )
}

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', rating: 5, text: '' })
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [submitError, setSubmitError] = useState('')

  const loadReviews = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const { data } = await api.get('/reviews')
      setReviews(Array.isArray(data.reviews) ? data.reviews : [])
    } catch {
      setLoadError('We couldn’t load the stories just now. Please refresh and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadReviews() }, [loadReviews])

  const stats = useMemo(() => {
    if (!reviews.length) return { average: '—', count: 0 }
    return {
      average: (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1),
      count: reviews.length,
    }
  }, [reviews])

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submitReview = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSuccess('')
    try {
      const { data } = await api.post('/reviews', {
        ...form,
        rating: Number(form.rating),
      })
      setSuccess(data.message || 'Thank you. Your review has been sent for approval.')
      setForm({ name: '', email: '', rating: 5, text: '' })
      setHoverRating(0)
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Your review could not be submitted. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="reviews-page">
      <section className="reviews-hero" data-nav-theme="dark">
        <div className="reviews-hero__orbit reviews-hero__orbit--one" />
        <div className="reviews-hero__orbit reviews-hero__orbit--two" />
        <div className="reviews-shell reviews-hero__inner">
          <motion.div
            className="reviews-hero__copy"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="reviews-eyebrow"><i /> THE WORDS THAT STAY</span>
            <h1>Love, in their<br /><em>own words.</em></h1>
            <p>Every celebration leaves a feeling behind. These are the words of the couples who trusted Galaxy to hold on to theirs.</p>
            <a href="#share-your-story" className="reviews-hero__cta">
              <span>Share your experience</span>
              <span className="material-symbols-outlined" aria-hidden="true">north_east</span>
            </a>
          </motion.div>

          <motion.aside
            className="reviews-summary"
            initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            aria-label="Review summary"
          >
            <div className="reviews-summary__rim">
              <span className="reviews-summary__label">THE GALAXY EXPERIENCE</span>
              <div className="reviews-summary__rating">{stats.average}<span>/5</span></div>
              <Stars value={Math.round(Number(stats.average) || 0)} size="large" />
              <div className="reviews-summary__rule" />
              <strong>{stats.count} {stats.count === 1 ? 'STORY' : 'STORIES'} SHARED</strong>
              <span className="reviews-summary__note">Real words. Lasting memories.</span>
            </div>
            <span className="reviews-summary__shine" aria-hidden="true" />
          </motion.aside>
        </div>
        <div className="reviews-hero__foot reviews-shell">
          <span>01 / THE EXPERIENCE</span>
          <span>MADE OF MOMENTS · KEPT FOREVER</span>
        </div>
      </section>

      <section className="reviews-wall" data-nav-theme="light" aria-labelledby="reviews-wall-title">
        <div className="reviews-shell">
          <header className="reviews-section-heading">
            <div>
              <span className="reviews-section-heading__index">01 — KIND WORDS</span>
              <h2 id="reviews-wall-title">Memories, <em>remembered.</em></h2>
            </div>
            <p>Not just photographs and films. A feeling our couples can return to, long after the celebration.</p>
          </header>

          {loading ? (
            <div className="reviews-state" role="status"><span className="reviews-loader" /> Gathering stories…</div>
          ) : loadError ? (
            <div className="reviews-state reviews-state--error" role="alert">
              <p>{loadError}</p>
              <button type="button" onClick={loadReviews}>Try again</button>
            </div>
          ) : reviews.length ? (
            <div className="reviews-grid">
              {reviews.map((review, index) => <ReviewCard key={review._id || review.id || index} review={review} index={index} />)}
            </div>
          ) : (
            <div className="reviews-empty">
              <span className="reviews-empty__icon" aria-hidden="true">✧</span>
              <h3>The first story is waiting.</h3>
              <p>Be the first to share what your Galaxy experience meant to you.</p>
            </div>
          )}
        </div>
      </section>

      <section className="review-form-section" id="share-your-story" data-nav-theme="dark">
        <div className="reviews-shell review-form-layout">
          <div className="review-form-intro">
            <span className="reviews-eyebrow"><i /> YOUR TURN</span>
            <h2>Leave a little<br /><em>light behind.</em></h2>
            <p>Your experience might be the reassurance another couple needs. Tell us how it felt to have your story captured by Galaxy.</p>
            <div className="review-form-intro__stamp">
              <span className="material-symbols-outlined" aria-hidden="true">favorite</span>
              <span>Every story is<br /><strong>deeply appreciated.</strong></span>
            </div>
          </div>

          <form className="review-form" onSubmit={submitReview}>
            <div className="review-form__heading">
              <span>THE GUESTBOOK</span>
              <span className="material-symbols-outlined" aria-hidden="true">edit_note</span>
            </div>
            <label className="review-form__label" htmlFor="review-name">Your name</label>
            <input id="review-name" name="name" autoComplete="name" value={form.name} onChange={updateForm} placeholder="How should we address you?" minLength={2} maxLength={120} required />

            <label className="review-form__label" htmlFor="review-email">Email address <span>PRIVATE</span></label>
            <input id="review-email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateForm} placeholder="For verification only" maxLength={254} required />

            <fieldset className="review-form__rating">
              <legend>How was your experience?</legend>
              <Stars
                value={Number(form.rating)}
                interactive
                onChange={(rating) => setForm((current) => ({ ...current, rating }))}
                onHover={setHoverRating}
                size="large"
                label="Choose a rating from 1 to 5 stars"
              />
              <span className="review-form__rating-caption">{ratingLabels[hoverRating || Number(form.rating)]}</span>
            </fieldset>

            <label className="review-form__label" htmlFor="review-text">Your story</label>
            <textarea id="review-text" name="text" value={form.text} onChange={updateForm} placeholder="The moments, the people, the feeling… tell us what stayed with you." minLength={3} maxLength={2000} rows={5} required />
            <div className="review-form__bottom">
              <span>{form.text.length}/2000</span>
              <span>YOUR EMAIL IS NEVER PUBLISHED</span>
            </div>

            {success && <p className="review-form__notice review-form__notice--success" role="status">{success}</p>}
            {submitError && <p className="review-form__notice review-form__notice--error" role="alert">{submitError}</p>}

            <button className="review-form__submit" type="submit" disabled={submitting}>
              <span>{submitting ? 'Sending your story…' : 'Submit your review'}</span>
              <span className="material-symbols-outlined" aria-hidden="true">{submitting ? 'hourglass_top' : 'north_east'}</span>
            </button>
            <p className="review-form__moderation">Reviews are published after a quick moderation check. Thank you for keeping this space thoughtful.</p>
          </form>
        </div>
      </section>
    </main>
  )
}
