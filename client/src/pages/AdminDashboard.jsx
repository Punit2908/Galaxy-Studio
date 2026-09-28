import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import './admin-dashboard.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const api = axios.create({ baseURL: API, withCredentials: true })

api.interceptors.request.use((config) => {
  const token =
    window.localStorage.getItem('galaxy_access_token') ||
    window.sessionStorage.getItem('galaxy_access_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

const navItems = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'media', label: 'Media Library', icon: 'perm_media' },
  { id: 'slots', label: 'Website Slots', icon: 'web' },
  { id: 'albums', label: 'Albums', icon: 'photo_library' },
  { id: 'inquiries', label: 'Enquiries', icon: 'mail' },
  { id: 'settings', label: 'Settings', icon: 'tune' },
]

const emptyAlbum = { title: '', slug: '', description: '', sortOrder: 0, isPublished: true }
const mediaTypes = [
  ['cinematic', 'Cinematic Shot'],
  ['drone', 'Drone Shot'],
  ['wedding', 'Wedding Shot'],
  ['portrait', 'Portrait'],
  ['candid', 'Candid'],
  ['couple', 'Couple Shot'],
  ['ceremony', 'Ceremony'],
  ['decoration', 'Decoration'],
  ['other', 'Other'],
]
const mediaTypeLabel = (value) => mediaTypes.find(([key]) => key === value)?.[1] || 'Wedding Shot'

function formatBytes(bytes = 0) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function Stat({ label, value, note, icon }) {
  return (
    <article className="admin-stat">
      <span className="admin-stat__icon material-symbols-outlined">{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  )
}

function Empty({ icon, title, text }) {
  return (
    <div className="admin-empty">
      <span className="material-symbols-outlined">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [section, setSection] = useState('overview')
  const [user, setUser] = useState(null)
  const [media, setMedia] = useState([])
  const [slots, setSlots] = useState([])
  const [albums, setAlbums] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [upload, setUpload] = useState({ file: null, title: '', contentType: 'wedding', albumId: '', folder: 'portfolio', alt: '', description: '', isPublished: true })
  const [slotForm, setSlotForm] = useState({ slot: '', mediaId: '' })
  const [albumForm, setAlbumForm] = useState(emptyAlbum)
  const [settingsForm, setSettingsForm] = useState({})
  const [message, setMessage] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mediaFilter, setMediaFilter] = useState('all')
  const [selectedAlbumId, setSelectedAlbumId] = useState(null)

  const publishedCount = useMemo(() => media.filter((item) => item.isPublished).length, [media])
  const videoCount = useMemo(() => media.filter((item) => item.mediaType === 'video').length, [media])
  const newInquiries = useMemo(() => inquiries.filter((item) => item.status === 'new').length, [inquiries])

  const flash = (type, text) => {
    setMessage({ type, text })
    window.setTimeout(() => setMessage(null), 3500)
  }

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const me = await api.get('/auth/me')
      if (!['superadmin', 'admin'].includes(me.data.user.role)) {
        navigate('/')
        return
      }
      setUser(me.data.user)

      const [mediaRes, slotsRes, albumsRes, inquiriesRes, settingsRes] = await Promise.all([
        api.get('/admin/media'),
        api.get('/admin/media/slots'),
        api.get('/admin/albums'),
        api.get('/admin/inquiries'),
        api.get('/admin/settings'),
      ])

      setMedia(mediaRes.data.media || [])
      setSlots(slotsRes.data.slots || [])
      setAlbums(albumsRes.data.albums || [])
      setInquiries(inquiriesRes.data.inquiries || [])
      setSettingsForm(settingsRes.data.settings || {})
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        navigate('/login?next=/admin')
        return
      }
      flash('error', error.response?.data?.message || 'Could not load the admin dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {})
    window.localStorage.removeItem('galaxy_access_token')
    window.sessionStorage.removeItem('galaxy_access_token')
    navigate('/login')
  }

  const uploadMedia = async (event) => {
    event.preventDefault()
    if (!upload.file) {
      flash('error', 'Choose an image or video first.')
      return
    }

    setBusy(true)
    try {
      const formData = new FormData()
      formData.append('file', upload.file)
      formData.append('title', upload.title || upload.file.name)
      formData.append('folder', upload.folder)
      formData.append('contentType', upload.contentType)
      if (upload.albumId) formData.append('albumId', upload.albumId)
      formData.append('alt', upload.alt)
      formData.append('description', upload.description)
      formData.append('isPublished', String(upload.isPublished))

      const response = await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setMedia((current) => [response.data.media, ...current])
      setUpload({ file: null, title: '', contentType: 'wedding', albumId: '', folder: 'portfolio', alt: '', description: '', isPublished: true })
      event.target.reset()
      if (upload.albumId) {
        const albumsRes = await api.get('/admin/albums')
        setAlbums(albumsRes.data.albums || [])
      }
      flash('success', upload.albumId ? 'Media uploaded and added to the selected album.' : 'Media uploaded to your library.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  const updateMedia = async (item, changes) => {
    try {
      const response = await api.patch(`/admin/media/${item._id}`, changes)
      setMedia((current) => current.map((mediaItem) => mediaItem._id === item._id ? response.data.media : mediaItem))
    } catch (error) {
      flash('error', error.response?.data?.message || 'Media update failed.')
    }
  }

  const deleteMedia = async (item) => {
    if (!window.confirm(`Delete “${item.title || item.filename}” permanently?`)) return
    try {
      await api.delete(`/admin/media/${item._id}`)
      setMedia((current) => current.filter((mediaItem) => mediaItem._id !== item._id))
      setSlots((current) => current.filter((slot) => slot.media?._id !== item._id))
      flash('success', 'Media removed from MongoDB and Supabase Storage.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Media could not be deleted.')
    }
  }

  const assignSlot = async (event) => {
    event.preventDefault()
    if (!slotForm.slot || !slotForm.mediaId) return
    try {
      const response = await api.put('/admin/media/slots', slotForm)
      setSlots((current) => {
        const existing = current.findIndex((slot) => slot.slot === response.data.assignment.slot)
        if (existing === -1) return [...current, response.data.assignment]
        const next = [...current]
        next[existing] = response.data.assignment
        return next
      })
      flash('success', `Slot “${slotForm.slot}” updated.`)
    } catch (error) {
      flash('error', error.response?.data?.message || 'Slot assignment failed.')
    }
  }

  const clearSlot = async (slot) => {
    try {
      await api.delete(`/admin/media/slots/${encodeURIComponent(slot)}`)
      setSlots((current) => current.filter((item) => item.slot !== slot))
      flash('success', 'Website slot cleared.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Could not clear slot.')
    }
  }

  const createAlbum = async (event) => {
    event.preventDefault()
    if (!albumForm.title || !albumForm.slug) return
    setBusy(true)
    try {
      const response = await api.post('/admin/albums', albumForm)
      setAlbums((current) => [...current, response.data.album])
      setAlbumForm(emptyAlbum)
      flash('success', 'Album created.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Album creation failed.')
    } finally {
      setBusy(false)
    }
  }

  const deleteAlbum = async (album) => {
    if (!window.confirm(`Delete album “${album.title}”?`)) return
    try {
      await api.delete(`/admin/albums/${album._id}`)
      setAlbums((current) => current.filter((item) => item._id !== album._id))
      flash('success', 'Album deleted.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Album could not be deleted.')
    }
  }

  const updateInquiry = async (inquiry, changes) => {
    try {
      const response = await api.patch(`/admin/inquiries/${inquiry._id}`, changes)
      setInquiries((current) => current.map((item) => item._id === inquiry._id ? response.data.inquiry : item))
    } catch (error) {
      flash('error', error.response?.data?.message || 'Enquiry update failed.')
    }
  }

  const saveSettings = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      const response = await api.patch('/admin/settings', settingsForm)
      setSettingsForm(response.data.settings)
      flash('success', 'Website settings saved to MongoDB.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Settings could not be saved.')
    } finally {
      setBusy(false)
    }
  }

  const filteredMedia = useMemo(() => mediaFilter === 'all' ? media : media.filter((item) => mediaFilter === item.contentType), [media, mediaFilter])

  const removeFromAlbum = async (album, item) => {
    try {
      await api.delete(`/admin/albums/${album._id}/media/${item._id}`)
      const response = await api.get('/admin/albums')
      setAlbums(response.data.albums || [])
      flash('success', 'Media removed from album. It remains in your media library.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Could not remove media from album.')
    }
  }

  const navigateSection = (id) => {
    setSection(id)
    setMobileOpen(false)
  }

  if (loading) {
    return <main className="admin-loading"><div><span className="material-symbols-outlined">auto_awesome</span><p>Preparing your studio dashboard…</p></div></main>
  }

  return (
    <main className="admin-page">
      <aside className={`admin-sidebar ${mobileOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <Link to="/">GALAXY <span>PHOTOGRAPHY</span></Link>
          <button className="admin-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">×</button>
        </div>

        <div className="admin-profile">
          <span className="admin-avatar">{user?.name?.slice(0, 1).toUpperCase() || 'G'}</span>
          <div><strong>{user?.name || 'Studio Admin'}</strong><small>{user?.email}</small></div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <button key={item.id} className={section === item.id ? 'is-active' : ''} onClick={() => navigateSection(item.id)}>
              <span className="material-symbols-outlined">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar__bottom">
          <Link to="/" target="_blank"><span className="material-symbols-outlined">open_in_new</span>View website</Link>
          <button onClick={logout}><span className="material-symbols-outlined">logout</span>Sign out</button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu"><span className="material-symbols-outlined">menu</span></button>
          <div>
            <p>GALAXY PHOTOGRAPHY / ADMIN</p>
            <h1>{navItems.find((item) => item.id === section)?.label}</h1>
          </div>
          <div className="admin-topbar__actions">
            <span className="admin-live"><i /> API connected</span>
            <button onClick={loadDashboard} title="Refresh"><span className="material-symbols-outlined">refresh</span></button>
          </div>
        </header>

        {message && <div className={`admin-toast admin-toast--${message.type}`}><span className="material-symbols-outlined">{message.type === 'error' ? 'error' : 'check_circle'}</span>{message.text}</div>}

        {section === 'overview' && (
          <div className="admin-content">
            <div className="admin-welcome">
              <div><p className="admin-kicker">CONTROL ROOM</p><h2>Everything behind<br /><em>your stories.</em></h2><p>Manage the media, albums, website assignments and enquiries that power Galaxy Photography.</p></div>
              <button className="admin-primary" onClick={() => setSection('media')}><span className="material-symbols-outlined">cloud_upload</span>Upload media</button>
            </div>
            <div className="admin-stats">
              <Stat label="Media assets" value={media.length} note={`${publishedCount} published`} icon="perm_media" />
              <Stat label="Videos" value={videoCount} note="Stored in Supabase" icon="movie" />
              <Stat label="Albums" value={albums.length} note="MongoDB collections" icon="photo_library" />
              <Stat label="New enquiries" value={newInquiries} note={`${inquiries.length} total`} icon="mark_email_unread" />
            </div>
            <div className="admin-overview-grid">
              <section className="admin-panel">
                <div className="admin-panel__head"><div><p className="admin-kicker">LATEST MEDIA</p><h3>Recently uploaded</h3></div><button onClick={() => setSection('media')}>View all <span>→</span></button></div>
                {media.length ? <div className="admin-mini-grid">{media.slice(0, 6).map((item) => <MediaCard key={item._id} item={item} compact onDelete={deleteMedia} onToggle={() => updateMedia(item, { isPublished: !item.isPublished })} />)}</div> : <Empty icon="perm_media" title="No media yet" text="Upload your first image or video to test the storage pipeline." />}
              </section>
              <section className="admin-panel admin-panel--dark">
                <div className="admin-panel__head"><div><p className="admin-kicker">ENQUIRIES</p><h3>Latest conversations</h3></div><button onClick={() => setSection('inquiries')}>View all <span>→</span></button></div>
                {inquiries.length ? inquiries.slice(0, 5).map((item) => <div className="admin-inquiry-mini" key={item._id}><span>{item.name.slice(0, 1).toUpperCase()}</span><div><strong>{item.name}</strong><small>{item.service || 'General enquiry'} · {formatDate(item.createdAt)}</small></div><b className={`status-dot status-dot--${item.status}`} /></div>) : <Empty icon="mail" title="No enquiries yet" text="Contact form submissions will appear here." />}
              </section>
            </div>
          </div>
        )}

        {section === 'media' && (
          <div className="admin-content">
            <div className="admin-section-intro"><div><p className="admin-kicker">STORAGE PIPELINE</p><h2>Media Library</h2><p>Files go to your Supabase bucket. Metadata and website relationships stay in MongoDB.</p></div></div>
            <form className="admin-upload" onSubmit={uploadMedia}>
              <div className="admin-upload__drop">
                <input id="media-file" type="file" accept="image/*,video/*" onChange={(event) => setUpload((current) => ({ ...current, file: event.target.files?.[0] || null }))} />
                <label htmlFor="media-file"><span className="material-symbols-outlined">cloud_upload</span><strong>{upload.file ? upload.file.name : 'Choose image or video'}</strong><small>{upload.file ? formatBytes(upload.file.size) : 'PNG, JPG, WEBP, MP4, MOV and more'}</small></label>
              </div>
              <div className="admin-upload__fields">
                <label>Title<input value={upload.title} onChange={(event) => setUpload({ ...upload, title: event.target.value })} placeholder="Wedding story title" /></label>
                <label>Type<select value={upload.contentType} onChange={(event) => setUpload({ ...upload, contentType: event.target.value })}>{mediaTypes.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
                <label>Album<select value={upload.albumId} onChange={(event) => setUpload({ ...upload, albumId: event.target.value })}><option value="">Media library only</option>{albums.map((album) => <option key={album._id} value={album._id}>{album.title}</option>)}</select></label>
                <label>Folder<select value={upload.folder} onChange={(event) => setUpload({ ...upload, folder: event.target.value })}><option value="portfolio">portfolio</option><option value="hero">hero</option><option value="stories">stories</option><option value="albums">albums</option><option value="videos">videos</option></select></label>
                <label>Alt text<input value={upload.alt} onChange={(event) => setUpload({ ...upload, alt: event.target.value })} placeholder="Indian wedding celebration" /></label>
                <label>Description<textarea value={upload.description} onChange={(event) => setUpload({ ...upload, description: event.target.value })} placeholder="Optional media description" /></label>
                <label className="admin-check"><input type="checkbox" checked={upload.isPublished} onChange={(event) => setUpload({ ...upload, isPublished: event.target.checked })} /> Publish immediately</label>
                <button className="admin-primary" disabled={busy}>{busy ? 'Uploading…' : 'Upload to storage'} <span className="material-symbols-outlined">arrow_upward</span></button>
              </div>
            </form>
            <div className="admin-panel">
              <div className="admin-panel__head"><div><p className="admin-kicker">LIBRARY</p><h3>{filteredMedia.length} assets</h3></div><span className="admin-muted">{publishedCount} published · {videoCount} videos</span></div>
              <div className="admin-filter-row"><button className={mediaFilter === 'all' ? 'is-active' : ''} onClick={() => setMediaFilter('all')} type="button">All</button>{mediaTypes.map(([key, label]) => <button key={key} className={mediaFilter === key ? 'is-active' : ''} onClick={() => setMediaFilter(key)} type="button">{label}</button>)}</div>
              {filteredMedia.length ? <div className="admin-media-grid">{filteredMedia.map((item) => <MediaCard key={item._id} item={item} onDelete={deleteMedia} onToggle={() => updateMedia(item, { isPublished: !item.isPublished })} />)}</div> : <Empty icon="perm_media" title="Your library is empty" text="Upload an image or video above." />}
            </div>
          </div>
        )}

        {section === 'slots' && (
          <div className="admin-content">
            <div className="admin-section-intro"><div><p className="admin-kicker">WEBSITE CONTROL</p><h2>Website Slots</h2><p>Assign any uploaded asset to a stable slot name. Your frontend can read these assignments without hardcoding file URLs.</p></div></div>
            <form className="admin-inline-form" onSubmit={assignSlot}>
              <label>Slot name<input value={slotForm.slot} onChange={(event) => setSlotForm({ ...slotForm, slot: event.target.value })} placeholder="home.hero" /></label>
              <label>Media<select value={slotForm.mediaId} onChange={(event) => setSlotForm({ ...slotForm, mediaId: event.target.value })}><option value="">Choose media</option>{media.map((item) => <option key={item._id} value={item._id}>{item.title || item.filename}</option>)}</select></label>
              <button className="admin-primary">Assign slot</button>
            </form>
            <div className="admin-panel">
              <div className="admin-panel__head"><div><p className="admin-kicker">ASSIGNMENTS</p><h3>{slots.length} active slots</h3></div></div>
              {slots.length ? <div className="admin-slot-list">{slots.map((item) => <div className="admin-slot" key={item.slot}><div><code>{item.slot}</code><strong>{item.media?.title || item.media?.filename || 'Missing media'}</strong></div><button onClick={() => clearSlot(item.slot)}><span className="material-symbols-outlined">delete</span></button></div>)}</div> : <Empty icon="web" title="No website slots yet" text="Create your first slot above, for example home.hero or portfolio.cover." />}
            </div>
          </div>
        )}

        {section === 'albums' && (
          <div className="admin-content">
            <div className="admin-section-intro"><div><p className="admin-kicker">STORIES</p><h2>Albums</h2><p>Create and organise wedding galleries stored as MongoDB records.</p></div></div>
            <form className="admin-inline-form admin-inline-form--album" onSubmit={createAlbum}>
              <label>Title<input value={albumForm.title} onChange={(event) => setAlbumForm({ ...albumForm, title: event.target.value })} placeholder="Ashwani & Tarun" /></label>
              <label>Slug<input value={albumForm.slug} onChange={(event) => setAlbumForm({ ...albumForm, slug: event.target.value })} placeholder="ashwani-tarun" /></label>
              <label>Description<textarea value={albumForm.description} onChange={(event) => setAlbumForm({ ...albumForm, description: event.target.value })} placeholder="Short album description" /></label>
              <button className="admin-primary" disabled={busy}>Create album <span className="material-symbols-outlined">add</span></button>
            </form>
            <div className="admin-album-grid">{albums.length ? albums.map((album) => <article className={`admin-album ${selectedAlbumId === album._id ? 'is-selected' : ''}`} key={album._id} onClick={() => setSelectedAlbumId(album._id)}>{album.coverMedia?.publicUrl ? <img src={album.coverMedia.publicUrl} alt="" /> : <div className="admin-album__placeholder"><span className="material-symbols-outlined">photo_library</span></div>}<div><p>{formatDate(album.createdAt)}</p><h3>{album.title}</h3><span>{album.media?.length || 0} media · {album.isPublished ? 'Published' : 'Draft'}</span><button onClick={(event) => { event.stopPropagation(); deleteAlbum(album) }}>Delete album</button></div></article>) : <Empty icon="photo_library" title="No albums yet" text="Create an album to start building the MongoDB gallery structure." />}</div>
{selectedAlbumId && (() => {
  const album = albums.find((item) => item._id === selectedAlbumId)
  if (!album) return null
  return <section className="admin-panel admin-album-viewer">
    <div className="admin-panel__head"><div><p className="admin-kicker">ALBUM CONTENT</p><h3>{album.title}</h3><span className="admin-muted">{album.media?.length || 0} images & videos</span></div><button onClick={() => setSelectedAlbumId(null)}>Close</button></div>
    {album.media?.length ? <div className="admin-media-grid">{album.media.map((entry) => <MediaCard key={entry.asset?._id || entry.asset} item={entry.asset} onDelete={() => removeFromAlbum(album, entry.asset)} onToggle={() => updateMedia(entry.asset, { isPublished: !entry.asset.isPublished })} albumMode />)}</div> : <Empty icon="photo_library" title="Album is empty" text="Upload new media and select this album, or add existing media from the library." />}
  </section>
})()}
          </div>
        )}

        {section === 'inquiries' && (
          <div className="admin-content">
            <div className="admin-section-intro"><div><p className="admin-kicker">CLIENT CONTACT</p><h2>Enquiries</h2><p>Every contact form submission is stored in MongoDB for follow-up.</p></div></div>
            <div className="admin-panel">
              {inquiries.length ? <div className="admin-inquiry-list">{inquiries.map((item) => <article className="admin-inquiry" key={item._id}><div className="admin-inquiry__head"><div><span className={`admin-status admin-status--${item.status}`}>{item.status}</span><h3>{item.name}</h3><p>{item.email}{item.phone ? ` · ${item.phone}` : ''}</p></div><small>{formatDate(item.createdAt)}</small></div><div className="admin-inquiry__body"><p><strong>{item.service || 'General enquiry'}</strong></p><p>{item.message}</p></div><div className="admin-inquiry__actions"><a href={`mailto:${item.email}`}>Email client</a><select value={item.status} onChange={(event) => updateInquiry(item, { status: event.target.value })}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></div></article>)}</div> : <Empty icon="mail" title="No enquiries yet" text="Submissions from the public contact form will appear here." />}
            </div>
          </div>
        )}

        {section === 'settings' && (
          <div className="admin-content">
            <div className="admin-section-intro"><div><p className="admin-kicker">SITE CONFIGURATION</p><h2>Settings</h2><p>Simple key/value website settings stored in MongoDB. These can later drive the public site dynamically.</p></div></div>
            <form className="admin-panel admin-settings" onSubmit={saveSettings}>
              {Object.entries(settingsForm).length ? Object.entries(settingsForm).map(([key, value]) => <label key={key}>{key}<input value={value} onChange={(event) => setSettingsForm({ ...settingsForm, [key]: event.target.value })} /></label>) : <Empty icon="tune" title="No settings yet" text="Add a setting key to start configuring the website." />}
              <div className="admin-settings__new"><input id="new-setting-key" placeholder="new_setting_key" /><input id="new-setting-value" placeholder="value" /><button type="button" onClick={() => { const key = document.getElementById('new-setting-key').value.trim(); const value = document.getElementById('new-setting-value').value; if (key) { setSettingsForm({ ...settingsForm, [key]: value }); document.getElementById('new-setting-key').value = ''; document.getElementById('new-setting-value').value = '' } }}>Add</button></div>
              <button className="admin-primary" disabled={busy}>Save settings <span className="material-symbols-outlined">save</span></button>
            </form>
          </div>
        )}
      </section>
    </main>
  )
}

function MediaCard({ item, compact = false, onDelete, onToggle, albumMode = false }) {
  return (
    <article className={`admin-media-card ${compact ? 'admin-media-card--compact' : ''}`}>
      <div className="admin-media-card__visual">
        {item.mediaType === 'video' ? <video src={item.publicUrl} muted playsInline preload="metadata" /> : <img src={item.publicUrl} alt={item.altText || item.title || ''} />}
        <span className="admin-media-card__type">{item.mediaType} · {mediaTypeLabel(item.contentType)}</span>
        {!item.isPublished && <span className="admin-media-card__draft">DRAFT</span>}
      </div>
      <div className="admin-media-card__body">
        <div><strong title={item.title}>{item.title || item.filename}</strong><small>{formatBytes(item.sizeBytes)} · {formatDate(item.createdAt)}</small></div>
        {!compact && <p>{mediaTypeLabel(item.contentType)} · {item.folder || 'images'}</p>}
        <div className="admin-media-card__actions">
          <button onClick={onToggle}>{item.isPublished ? 'Unpublish' : 'Publish'}</button>
          <button onClick={() => onDelete(item)} className="is-danger">{albumMode ? 'Remove' : 'Delete'}</button>
        </div>
      </div>
    </article>
  )
}
