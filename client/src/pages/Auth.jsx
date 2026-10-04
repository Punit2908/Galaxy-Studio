import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import useSiteMedia from '../hooks/useSiteMedia'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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

export default function Auth() {
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)
  const { mediaByFilename, slotByName } = useSiteMedia()
  const authBackground = slotByName['site.auth.background']?.mediaItems?.[0]
    || slotByName['site.auth.background']?.media
    || slotByName['site.auth.background']?.backgroundMedia

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus(null)
    setBusy(true)

    try {
      const response = await axios.post(API + '/auth/login', {
        email: form.email,
        password: form.password,
      }, { withCredentials: true })

      const loggedInUser = response.data.user
      const token = response.data.token

      if (!['admin', 'superadmin'].includes(loggedInUser?.role)) {
        setStatus({ type: 'error', message: 'Admin access is required.' })
        return
      }

      if (token) {
        const storage = remember ? window.localStorage : window.sessionStorage
        const otherStorage = remember ? window.sessionStorage : window.localStorage
        otherStorage.removeItem('galaxy_access_token')
        storage.setItem('galaxy_access_token', token)
      }

      const next = new URLSearchParams(location.search).get('next')
      setStatus({ type: 'success', message: 'Admin access granted.' })
      window.setTimeout(() => navigate(next || '/admin'), 500)
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to sign in.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page auth-page--login">
      <motion.div
        className="auth-bg"
        style={{ '--auth-bg': authBackground?.publicUrl ? `url("${authBackground.publicUrl}")` : (mediaByFilename['image.png'] ? `url("${mediaByFilename['image.png']}")` : 'none') }}
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="auth-bg__shade" />
      <div className="auth-bg__vignette" />
      <div className="auth-bg__grain" />

      <motion.header className="auth-topbar" initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35, duration: .7 }}>
        <Link to="/" className="auth-logo">Galaxy Photography</Link>
        <div className="auth-topbar__right">
          <span>ADMIN PORTAL</span>
          <span>PRIVATE ACCESS</span>
          <span className="auth-topbar__mark">✧</span>
        </div>
      </motion.header>

      <div className="auth-vertical auth-vertical--left">STUDIO MANAGEMENT</div>
      <div className="auth-vertical auth-vertical--right">AUTHORIZED ACCESS ONLY</div>

      <motion.section className="auth-center" initial={{ opacity: 0, y: 26, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }}>
        <motion.div className="auth-heading" initial={{ opacity: 0, y: 22, filter: 'blur(9px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: .12, duration: .8 }}>
          <p className="auth-heading__eyebrow"><span>□</span>ADMIN ACCESS</p>
          <h1>
            <span>Welcome</span>
            <span>Back <em>Admin</em></span>
          </h1>
          <p>Sign in to manage the Galaxy Photography studio.</p>
        </motion.div>

        <motion.form
          className="auth-form"
          onSubmit={submit}
          initial={{ opacity: 0, x: 45, filter: 'blur(6px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: .65, ease: [0.22, 1, 0.36, 1] }}
        >
          <Field icon="✉" label="Admin email address" type="email" name="email" value={form.email} onChange={update} autoComplete="username" />
          <Field icon="♙" label="Admin password" type="password" name="password" value={form.password} onChange={update} autoComplete="current-password" />

          <div className="auth-form__options">
            <label>
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span>Remember me</span>
            </label>
          </div>

          {status && (
            <motion.p className={`auth-status auth-status--${status.type}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              {status.message}
            </motion.p>
          )}

          <motion.button className="auth-submit" type="submit" disabled={busy} whileHover={{ scale: 1.012 }} whileTap={{ scale: .985 }}>
            <span>{busy ? 'Signing in…' : 'Admin Login'}</span>
            <i>→</i>
          </motion.button>
        </motion.form>
      </motion.section>

      <motion.footer className="auth-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .65, duration: .8 }}>
        <span>PRIVATE STUDIO<br />ACCESS</span>
        <span>GALAXY PHOTOGRAPHY · ADMIN</span>
        <span>© 2026</span>
      </motion.footer>
    </main>
  )
}
