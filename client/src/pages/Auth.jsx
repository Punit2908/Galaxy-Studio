import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const screens = {
  login: {
    eyebrow: 'CINEMATIC MOMENTS',
    title: ['Good to', 'See You Again'],
    accent: 'Again',
    subtitle: 'Some stories never end. Continue yours.',
    action: 'Sign In',
    switchText: 'New here?',
    switchLabel: 'Create an account',
    switchTo: '/signup',
  },
  signup: {
    eyebrow: 'CINEMATIC MOMENTS',
    title: ['Create', 'Your Story'],
    accent: 'Story',
    subtitle: 'Join us and be a part of something beautiful.',
    action: 'Create Account',
    switchText: 'Already have an account?',
    switchLabel: 'Sign In',
    switchTo: '/login',
  },
}

function Field({ icon, label, type = 'text', name, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  const password = type === 'password'

  return (
    <label className="auth-field">
      <span className="auth-field__icon" aria-hidden="true">{icon}</span>
      <input
        name={name}
        type={password && show ? 'text' : type}
        value={value}
        onChange={onChange}
        placeholder={label}
        autoComplete={autoComplete}
        required
      />
      {password && (
        <button
          type="button"
          className="auth-field__toggle"
          onClick={() => setShow((current) => !current)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? '◉' : '◌'}
        </button>
      )}
    </label>
  )
}

export default function Auth({ mode: routeMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const mode = routeMode || (location.pathname === '/signup' ? 'signup' : 'login')
  const screen = screens[mode]
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [remember, setRemember] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setStatus(null)
  }, [mode])

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus(null)

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
      setStatus({ type: 'success', message: mode === 'login' ? 'Welcome back.' : 'Your story begins here.' })
      window.setTimeout(() => navigate('/'), 700)
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to complete this request.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className={`auth-page auth-page--${mode}`}>
      <motion.div
        className="auth-bg"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="auth-bg__shade" />
      <div className="auth-bg__vignette" />
      <div className="auth-bg__grain" />

      <motion.header
        className="auth-topbar"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .35, duration: .7 }}
      >
        <Link to="/" className="auth-logo">Galaxy Photography</Link>
        <div className="auth-topbar__right">
          <span>GALLERY</span>
          <span>STORIES</span>
          <span className="auth-topbar__mark">✧</span>
        </div>
      </motion.header>

      <div className="auth-vertical auth-vertical--left">MORE MEMORIES THAN JUST PHOTOGRAPHS</div>
      <div className="auth-vertical auth-vertical--right">CAPTURING WHAT MATTERS</div>

      <motion.section
        className="auth-center"
        key={mode}
        initial={{ opacity: 0, y: 26, scale: .985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="auth-heading"
          initial={{ opacity: 0, y: 22, filter: 'blur(9px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: .12, duration: .8 }}
        >
          <p className="auth-heading__eyebrow"><span>□</span>{screen.eyebrow}</p>
          <h1>
            <span>{screen.title[0]}</span>
            <span>{screen.title[1].replace(screen.accent, '')}<em>{screen.accent}</em></span>
          </h1>
          <p>{screen.subtitle}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            className="auth-form"
            onSubmit={submit}
            initial={{ opacity: 0, x: mode === 'login' ? 45 : -45, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: mode === 'login' ? -45 : 45, filter: 'blur(6px)' }}
            transition={{ duration: .65, ease: [0.22, 1, 0.36, 1] }}
          >
            {mode === 'signup' && (
              <Field icon="♧" label="Full Name" name="name" value={form.name} onChange={update} autoComplete="name" />
            )}
            <Field icon="✉" label="Email address" type="email" name="email" value={form.email} onChange={update} autoComplete="email" />
            <Field icon="♙" label="Password" type="password" name="password" value={form.password} onChange={update} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            {mode === 'signup' && (
              <Field icon="♙" label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} autoComplete="new-password" />
            )}

            {mode === 'login' && (
              <div className="auth-form__options">
                <label>
                  <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                  <span>Remember me</span>
                </label>
                <button type="button" onClick={() => setStatus({ type: 'info', message: 'Password recovery will be connected next.' })}>
                  Forgot password?
                </button>
              </div>
            )}

            {status && (
              <motion.p
                className={`auth-status auth-status--${status.type}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {status.message}
              </motion.p>
            )}

            <motion.button className="auth-submit" type="submit" disabled={busy} whileHover={{ scale: 1.012 }} whileTap={{ scale: .985 }}>
              <span>{busy ? 'Please wait' : screen.action}</span>
              <i>→</i>
            </motion.button>

            <div className="auth-divider"><span>OR</span></div>

            <div className="auth-socials">
              <button type="button" className="auth-social auth-social--google" aria-label="Continue with Google">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M21.35 12.27c0-.7-.06-1.37-.18-2H12v3.79h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.18Z"/>
                  <path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.48-4.03H3.27v2.53A9.74 9.74 0 0 0 12 21.7Z"/>
                  <path fill="#FBBC05" d="M6.52 13.79A5.86 5.86 0 0 1 6.21 12c0-.62.11-1.22.31-1.79V7.68H3.27A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.06 1.02 4.32l3.25-2.53Z"/>
                  <path fill="#EA4335" d="M12 6.18c1.43 0 2.72.49 3.74 1.45l2.8-2.8C16.84 3.18 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.73 5.38l3.25 2.53C7.29 7.9 9.45 6.18 12 6.18Z"/>
                </svg>
                <span>Google</span>
              </button>
              <button type="button" className="auth-social auth-social--facebook" aria-label="Continue with Facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11 10.13 11.93v-8.43H7.08v-3.5h3.05V9.4c0-3.04 1.79-4.73 4.58-4.73 1.33 0 2.73.24 2.73.24v3.02h-1.54c-1.51 0-1.98.94-1.98 1.9v2.24h3.37l-.54 3.5h-2.83V24C19.61 23.07 24 18.09 24 12.07Z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            <div className="auth-switch">
              <span>{screen.switchText}</span>
              <Link to={screen.switchTo}>{screen.switchLabel}</Link>
            </div>
          </motion.form>
        </AnimatePresence>
      </motion.section>

      <motion.footer
        className="auth-bottom"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: .65, duration: .8 }}
      >
        <span>A STORY<br />FOR A LIFETIME</span>
        <span>WEDDINGS · PEOPLE · EMOTIONS</span>
        <span>© 2026</span>
      </motion.footer>
    </main>
  )
}
