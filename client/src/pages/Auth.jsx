import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const copy = {
  login: {
    eyebrow: 'WELCOME BACK',
    title: 'Good to\nsee you again.',
    body: 'Sign in to continue your journey with Galaxy Studio.',
    submit: 'Sign In',
    switchText: "Don't have an account?",
    switchLabel: 'Sign up',
    switchTo: '/signup',
  },
  signup: {
    eyebrow: 'BEGIN YOUR JOURNEY',
    title: 'Create\nyour account.',
    body: "Join Galaxy Studio and keep your story close to the moments that matter.",
    submit: 'Create Account',
    switchText: 'Already have an account?',
    switchLabel: 'Sign in',
    switchTo: '/login',
  },
}

function Field({ label, type = 'text', name, value, onChange, autoComplete, required = true }) {
  const [focused, setFocused] = useState(false)
  const isPassword = type === 'password'

  return (
    <label className={`auth-field ${focused || value ? 'is-active' : ''}`}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {isPassword && <i className="auth-field__mark">•••</i>}
    </label>
  )
}

export default function Auth({ mode: routeMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const mode = routeMode || (location.pathname === '/signup' ? 'signup' : 'login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [remember, setRemember] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [busy, setBusy] = useState(false)

  const text = copy[mode]

  useEffect(() => {
    setStatus({ type: '', message: '' })
  }, [mode])

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus({ type: '', message: '' })

    if (mode === 'signup' && form.password !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setBusy(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }

      await axios.post(API + endpoint, payload, { withCredentials: true })
      setStatus({ type: 'success', message: mode === 'login' ? 'Welcome back.' : 'Your account is ready.' })
      window.setTimeout(() => navigate('/'), 650)
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Something went wrong. Please try again.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className={`auth-page auth-page--${mode}`}>
      <motion.div
        className="auth-page__atmosphere"
        animate={{ scale: mode === 'signup' ? 1.08 : 1, x: mode === 'signup' ? '-2%' : '0%' }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
      />
      <div className="auth-page__veil" />
      <div className="auth-page__grain" />

      <Link className="auth-brand" to="/">Galaxy Studio</Link>
      <div className="auth-location">INDIA · STORIES · EMOTIONS</div>
      <div className="auth-caption">CAPTURING WHAT MATTERS</div>

      <div className="auth-orbit auth-orbit--one" />
      <div className="auth-orbit auth-orbit--two" />

      <section className="auth-shell" aria-label={mode === 'login' ? 'Login' : 'Sign up'}>
        <motion.div
          className="auth-copy"
          key={mode + '-copy'}
          initial={{ opacity: 0, y: 35, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -25, filter: 'blur(8px)' }}
          transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="auth-eyebrow">{text.eyebrow}</p>
          <h1>{text.title.split('\n').map((line) => <span key={line}>{line}</span>)}</h1>
          <p>{text.body}</p>
          <div className="auth-copy__rule" />
          <span>PEOPLE · PLACES · PROMISES</span>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            className="auth-card"
            onSubmit={submit}
            initial={{ opacity: 0, x: mode === 'login' ? 55 : -55, scale: .96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: mode === 'login' ? -55 : 55, scale: .97, filter: 'blur(8px)' }}
            transition={{ duration: .7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="auth-card__heading">
              <span>{mode === 'login' ? '01 / 02' : '02 / 02'}</span>
              <p>{mode === 'login' ? 'SIGN IN' : 'SIGN UP'}</p>
            </div>

            {mode === 'signup' && (
              <Field label="Full name" name="name" value={form.name} onChange={update} autoComplete="name" />
            )}
            <Field label="Email address" type="email" name="email" value={form.email} onChange={update} autoComplete="email" />
            <Field label="Password" type="password" name="password" value={form.password} onChange={update} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            {mode === 'signup' && (
              <Field label="Confirm password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} autoComplete="new-password" />
            )}

            {mode === 'login' && (
              <div className="auth-options">
                <label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /><span>Remember me</span></label>
                <button type="button" onClick={() => setStatus({ type: 'info', message: 'Password recovery will be connected next.' })}>Forgot password?</button>
              </div>
            )}

            {status.message && <motion.p className={`auth-status auth-status--${status.type}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{status.message}</motion.p>}

            <motion.button className="auth-submit" type="submit" disabled={busy} whileHover={{ y: -2 }} whileTap={{ scale: .985 }}>
              <span>{busy ? 'Please wait' : text.submit}</span><i>↗</i>
            </motion.button>

            <div className="auth-divider"><span>OR</span></div>

            <div className="auth-switch">
              <span>{text.switchText}</span>
              <Link to={text.switchTo}>{text.switchLabel}</Link>
            </div>
          </motion.form>
        </AnimatePresence>
      </section>

      <footer className="auth-footer">
        <span>GALAXY STUDIO</span>
        <span>WEDDING PHOTOGRAPHY · NORTH INDIA</span>
        <span>© 2026</span>
      </footer>
    </main>
  )
}
