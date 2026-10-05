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
  { id: 'hero', label: 'Home Hero', icon: 'movie' },
  { id: 'stories', label: 'Home Stories', icon: 'collections' },
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
const WEBSITE_SLOT_DEFINITIONS = [
  { slot: 'home.hero.background', group: 'Home', title: 'Hero background', mode: 'multi', accept: 'all', max: 6, note: 'Full-screen hero media. Images and videos can be mixed and will rotate automatically.' },
  { slot: 'home.hero.ring', group: 'Home', title: 'Hero circular ring', mode: 'multi', accept: 'all', max: 6, note: 'Round hero media. Images and videos are cropped automatically.' },
  { slot: 'home.story.01', group: 'Home Stories', title: 'Story 01 · Wedding Photography', mode: 'story', accept: 'all', max: 4, note: 'One background image plus up to four ordered cards.' },
  { slot: 'home.story.02', group: 'Home Stories', title: 'Story 02 · Cinematic Wedding Films', mode: 'story', accept: 'all', max: 4, note: 'One background image plus up to four ordered cards.' },
  { slot: 'home.story.03', group: 'Home Stories', title: 'Story 03 · Drone Stories', mode: 'story', accept: 'all', max: 4, note: 'One background image plus up to four ordered cards.' },
  { slot: 'home.story.04', group: 'Home Stories', title: 'Story 04 · Pre-Wedding Stories', mode: 'story', accept: 'all', max: 4, note: 'One background image plus up to four ordered cards.' },
  { slot: 'home.film.image', group: 'Home', title: 'The Film section image', mode: 'single', accept: 'image', note: 'The large image beside “Some stories need sound.”' },
  { slot: 'home.closing.background', group: 'Home', title: 'Closing CTA background', mode: 'single', accept: 'image', note: 'The full-screen background behind the final “something timeless” CTA.' },
  { slot: 'portfolio.hero', group: 'Portfolio', title: 'Portfolio hero', mode: 'single', accept: 'image', note: 'Hero backdrop on the Portfolio page.' },
  { slot: 'portfolio.showcase.01', group: 'Portfolio', title: 'Portfolio showcase · Photography', mode: 'single', accept: 'image', note: 'First showcase frame.' },
  { slot: 'portfolio.showcase.02', group: 'Portfolio', title: 'Portfolio showcase · Film', mode: 'single', accept: 'all', note: 'Second showcase frame. Can be an image or video.' },
  { slot: 'portfolio.showcase.03', group: 'Portfolio', title: 'Portfolio showcase · Drone', mode: 'single', accept: 'image', note: 'Third showcase frame.' },
  { slot: 'portfolio.cta', group: 'Portfolio', title: 'Portfolio closing CTA', mode: 'single', accept: 'image', note: 'Background for the final Portfolio contact section.' },
  { slot: 'site.albums.hero', group: 'Site', title: 'Albums hero', mode: 'single', accept: 'image', note: 'Albums page hero background.' },
  { slot: 'site.contact.background', group: 'Site', title: 'Contact background', mode: 'single', accept: 'image', note: 'Contact page cinematic backdrop.' },
  { slot: 'site.auth.background', group: 'Site', title: 'Login / signup background', mode: 'single', accept: 'image', note: 'Authentication page background.' },
  { slot: 'site.footer.background', group: 'Site', title: 'Footer background', mode: 'single', accept: 'image', note: 'Shared cinematic footer background.' },
  { slot: 'site.brand.logo', group: 'Site', title: 'Brand logo', mode: 'single', accept: 'image', note: 'Shared logo used by the navbar and footer.' },
]

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
  const [theme, setTheme] = useState(() => window.localStorage.getItem('galaxy-admin-theme') || 'dark')
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
  const [mediaSearch, setMediaSearch] = useState('')
  const [selectedAlbumId, setSelectedAlbumId] = useState(null)
  const [heroTarget, setHeroTarget] = useState('home.hero.background')
  const [heroUpload, setHeroUpload] = useState({ file: null, title: '', albumId: '' })
  const [heroAlbumFilter, setHeroAlbumFilter] = useState('all')
  const [storyTarget, setStoryTarget] = useState('home.story.01')
  const [storyLibraryFilter, setStoryLibraryFilter] = useState('all')
  const [storyAlbumFilter, setStoryAlbumFilter] = useState('all')
  const [storyUploadMode, setStoryUploadMode] = useState('card')
  const [storyUpload, setStoryUpload] = useState({ file: null, title: '', albumId: '' })
  const [storyUploadPreview, setStoryUploadPreview] = useState('')
  const [slotDrafts, setSlotDrafts] = useState({})
  const [logoUpload, setLogoUpload] = useState({ file: null, title: 'Galaxy Photography Logo' })

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
      setSlotDrafts(Object.fromEntries((slotsRes.data.slots || []).map((item) => [item.slot, { mediaIds: (item.mediaItems?.length ? item.mediaItems : (item.media ? [item.media] : [])).map((mediaItem) => mediaItem._id), backgroundMediaId: item.backgroundMedia?._id || '' }])))
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

  useEffect(() => {
    window.localStorage.setItem('galaxy-admin-theme', theme)
  }, [theme])


  useEffect(() => {
    setSlotDrafts(Object.fromEntries(slots.map((item) => [item.slot, {
      mediaIds: (item.mediaItems?.length ? item.mediaItems : (item.media ? [item.media] : [])).map((mediaItem) => mediaItem._id),
      backgroundMediaId: item.backgroundMedia?._id || '',
    }])))
  }, [slots])

  useEffect(() => {
    if (!storyUpload.file) {
      setStoryUploadPreview('')
      return undefined
    }

    const previewUrl = URL.createObjectURL(storyUpload.file)
    setStoryUploadPreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [storyUpload.file])

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
      setSlots((current) => current.map((slot) => ({
        ...slot,
        media: slot.media?._id === item._id ? null : slot.media,
        mediaItems: (slot.mediaItems || []).filter((entry) => entry._id !== item._id),
      })).filter((slot) => slot.media || slot.mediaItems?.length))
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
      await api.delete('/admin/media/slots/' + encodeURIComponent(slot))
      setSlots((current) => current.filter((item) => item.slot !== slot))
      flash('success', 'Website slot cleared.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Could not clear slot.')
    }
  }

  const getSlotAssignment = (slot) => slots.find((item) => item.slot === slot)
  const getSlotItems = (slot) => {
    const assignment = getSlotAssignment(slot)
    return assignment?.mediaItems?.length ? assignment.mediaItems : (assignment?.media ? [assignment.media] : [])
  }
  const getSlotDraft = (definition) => {
    const existing = slotDrafts[definition.slot]
    if (existing) return existing
    const items = getSlotItems(definition.slot)
    return {
      mediaIds: items.map((item) => item._id),
      backgroundMediaId: getSlotAssignment(definition.slot)?.backgroundMedia?._id || '',
    }
  }
  const mediaMatches = (item, accept) => accept === 'all' || item.mediaType === accept
  const setSlotDraft = (slot, changes) => {
    setSlotDrafts((current) => ({
      ...current,
      [slot]: { ...getSlotDraft(WEBSITE_SLOT_DEFINITIONS.find((definition) => definition.slot === slot) || { slot }), ...changes },
    }))
  }
  const saveWebsiteSlot = async (definition) => {
    const draft = getSlotDraft(definition)
    const mediaIds = (draft.mediaIds || []).filter(Boolean).slice(0, definition.max || 1)
    if (definition.mode === 'story' && mediaIds.length > 4) {
      flash('error', 'A Home story can contain a maximum of four cards.')
      return
    }
    if (definition.mode === 'story' && draft.backgroundMediaId) {
      const background = media.find((item) => item._id === draft.backgroundMediaId)
      if (background && background.mediaType !== 'image') {
        flash('error', 'Story backgrounds must be images.')
        return
      }
    }
    if (definition.accept !== 'all') {
      const invalid = mediaIds.some((id) => {
        const item = media.find((entry) => entry._id === id)
        return item && !mediaMatches(item, definition.accept)
      })
      if (invalid) {
        flash('error', 'This slot only accepts the selected media type.')
        return
      }
    }
    try {
      const response = await api.put('/admin/media/slots', {
        slot: definition.slot,
        mediaIds,
        backgroundMediaId: definition.mode === 'story' ? (draft.backgroundMediaId || null) : null,
      })
      setSlots((current) => {
        const index = current.findIndex((item) => item.slot === definition.slot)
        if (index === -1) return [...current, response.data.assignment]
        const next = [...current]
        next[index] = response.data.assignment
        return next
      })
      setSlotDrafts((current) => ({
        ...current,
        [definition.slot]: {
          mediaIds: response.data.assignment.mediaItems?.map((item) => item._id) || [],
          backgroundMediaId: response.data.assignment.backgroundMedia?._id || '',
        },
      }))
      flash('success', definition.title + ' updated.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Website slot update failed.')
    }
  }

  const clearWebsiteSlot = async (definition) => {
    try {
      await api.delete('/admin/media/slots/' + encodeURIComponent(definition.slot))
      setSlots((current) => current.filter((item) => item.slot !== definition.slot))
      setSlotDrafts((current) => ({ ...current, [definition.slot]: { mediaIds: [], backgroundMediaId: '' } }))
      flash('success', definition.title + ' cleared. The public page will use its fallback media when available.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Could not clear website slot.')
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

  const filteredMedia = useMemo(() => {
    const query = mediaSearch.trim().toLowerCase()
    return media.filter((item) => {
      const matchesFilter = mediaFilter === 'all' || mediaFilter === item.contentType
      if (!matchesFilter) return false
      if (!query) return true
      return [item.title, item.filename, item.altText, item.description, item.folder, item.mediaType, mediaTypeLabel(item.contentType)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [media, mediaFilter, mediaSearch])

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

  const heroFallbackMedia = (slot) => {
    const filenames = slot === 'home.hero.background'
      ? ['Video 1.mp4', 'Video 2.mp4', 'Video 3.mp4']
      : ['image.png']
    return filenames.map((filename) => media.find((item) => item.filename === filename)).filter(Boolean)
  }

  const slotMedia = (slot) => {
    const assignment = slots.find((item) => item.slot === slot)
    if (!assignment) return heroFallbackMedia(slot)
    return assignment.mediaItems?.length ? assignment.mediaItems : (assignment.media ? [assignment.media] : [])
  }

  const slotIsConfigured = (slot) => slots.some((item) => item.slot === slot)

  const saveHeroSlot = async (slot, mediaIds) => {
    try {
      const response = await api.put('/admin/media/slots', { slot, mediaIds })
      setSlots((current) => {
        const index = current.findIndex((item) => item.slot === slot)
        if (index === -1) return [...current, response.data.assignment]
        const next = [...current]
        next[index] = response.data.assignment
        return next
      })
      flash('success', `${slot === 'home.hero.background' ? 'Background' : 'Ring'} media updated.`)
    } catch (error) {
      flash('error', error.response?.data?.message || 'Hero media update failed.')
    }
  }

  const clearHeroSlot = async (slot) => {
    try {
      await api.delete(`/admin/media/slots/${encodeURIComponent(slot)}`)
      setSlots((current) => current.filter((item) => item.slot !== slot))
      flash('success', 'Hero media cleared.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Could not clear hero media.')
    }
  }

  const uploadHeroMedia = async (event) => {
    event.preventDefault()
    if (!heroUpload.file) {
      flash('error', 'Choose an image or video first.')
      return
    }
    setBusy(true)
    try {
      const formData = new FormData()
      formData.append('file', heroUpload.file)
      formData.append('title', heroUpload.title || heroUpload.file.name)
      formData.append('folder', heroTarget.includes('background') ? 'hero/background' : 'hero/ring')
      if (heroUpload.albumId) formData.append('albumId', heroUpload.albumId)
      formData.append('contentType', 'wedding')
      formData.append('isPublished', 'true')

      const response = await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const existing = slotMedia(heroTarget).map((item) => item._id)
      await saveHeroSlot(heroTarget, [...existing, response.data.media._id])
      setHeroUpload({ file: null, title: '', albumId: '' })
      event.target.reset()
      const mediaRes = await api.get('/admin/media')
      setMedia(mediaRes.data.media || [])
      const albumsRes = await api.get('/admin/albums')
      setAlbums(albumsRes.data.albums || [])
      flash('success', 'Media uploaded and added to the Home Hero.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Hero media upload failed.')
    } finally {
      setBusy(false)
    }
  }

  const storyFallbacks = {
    'home.story.01': { background: 'Ashwani and Tarun.jpeg', items: ['Ashwani.jpeg', 'image.png', 'Ashwani and Tarun.jpeg', 'Video 1.mp4'] },
    'home.story.02': { background: 'Anita and Sunil.png', items: ['Video 2.mp4', 'Video 3.mp4', 'image.png', 'Ashwani and Tarun.jpeg'] },
    'home.story.03': { background: 'Drone Shot 1.png', items: ['Drone Shot 1.png', 'Drone  Shot 2.png', 'Drone Shot 3.mp4', 'Anita and Sunil.png'] },
    'home.story.04': { background: 'Ashwani.jpeg', items: ['Ashwani and Tarun.jpeg', 'Ashwani.jpeg', 'Video 4.mp4', 'image.png'] },
  }

  const storyTitles = {
    'home.story.01': 'Wedding Photography',
    'home.story.02': 'Cinematic Wedding Films',
    'home.story.03': 'Drone Stories',
    'home.story.04': 'Pre-Wedding Stories',
  }

  const storyFallbackMedia = (slot) => {
    const fallback = storyFallbacks[slot]
    if (!fallback) return { background: null, items: [] }
    const byFilename = (filename) => media.find((item) => item.filename === filename) || null
    return {
      background: byFilename(fallback.background),
      items: fallback.items.map(byFilename).filter(Boolean),
    }
  }

  const storyData = (slot) => {
    const assignment = slots.find((item) => item.slot === slot)
    if (!assignment) return { configured: false, ...storyFallbackMedia(slot) }
    return {
      configured: true,
      background: assignment.backgroundMedia || null,
      items: assignment.mediaItems?.length ? assignment.mediaItems : (assignment.media ? [assignment.media] : []),
    }
  }

  const saveStorySection = async (slot, mediaIds, backgroundMediaId = null) => {
    if (mediaIds.length > 4) {
      flash('error', 'Each Home story can contain a maximum of four media cards.')
      return false
    }
    if (backgroundMediaId) {
      const background = media.find((item) => item._id === backgroundMediaId)
      if (background && background.mediaType !== 'image') {
        flash('error', 'Story backgrounds must use an image.')
        return false
      }
    }

    try {
      const response = await api.put('/admin/media/slots', {
        slot,
        mediaIds,
        backgroundMediaId,
      })
      setSlots((current) => {
        const index = current.findIndex((item) => item.slot === slot)
        if (index === -1) return [...current, response.data.assignment]
        const next = [...current]
        next[index] = response.data.assignment
        return next
      })
      flash('success', `${storyTitles[slot]} updated.`)
      return true
    } catch (error) {
      flash('error', error.response?.data?.message || 'Story section update failed.')
      return false
    }
  }

  const updateStoryItems = (slot, nextItems) => {
    const current = storyData(slot)
    return saveStorySection(slot, nextItems.map((item) => item._id), current.background?._id || null)
  }

  const chooseStoryBackground = (slot, item) => {
    if (item.mediaType !== 'image') {
      flash('error', 'Choose an image for the story background.')
      return
    }
    const current = storyData(slot)
    saveStorySection(slot, current.items.map((entry) => entry._id), item._id)
  }

  const toggleStoryLibraryItem = (slot, item) => {
    const current = storyData(slot)
    const assignedIndex = current.items.findIndex((entry) => entry._id === item._id)
    if (assignedIndex >= 0) {
      updateStoryItems(slot, current.items.filter((entry) => entry._id !== item._id))
      return
    }
    if (current.items.length >= 4) {
      flash('error', 'This story already has four media cards. Remove one or reorder the cards first.')
      return
    }
    updateStoryItems(slot, [...current.items, item])
  }

  const moveStoryItem = (slot, index, direction) => {
    const current = storyData(slot)
    const next = [...current.items]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    updateStoryItems(slot, next)
  }

  const uploadStoryMedia = async (event) => {
    event.preventDefault()
    if (!storyUpload.file) {
      flash('error', 'Choose an image or video first.')
      return
    }
    if (storyUploadMode === 'background' && !storyUpload.file.type.startsWith('image/')) {
      flash('error', 'Story backgrounds must be images.')
      return
    }
    const current = storyData(storyTarget)
    if (storyUploadMode === 'card' && current.items.length >= 4) {
      flash('error', 'This story already has four media cards.')
      return
    }

    setBusy(true)
    try {
      const formData = new FormData()
      formData.append('file', storyUpload.file)
      formData.append('title', storyUpload.title || storyUpload.file.name)
      formData.append('folder', 'stories')
      formData.append('contentType', 'wedding')
      formData.append('isPublished', 'true')
      if (storyUpload.albumId) formData.append('albumId', storyUpload.albumId)

      const response = await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const nextItems = storyUploadMode === 'card'
        ? [...current.items.map((item) => item._id), response.data.media._id]
        : current.items.map((item) => item._id)
      const nextBackground = storyUploadMode === 'background'
        ? response.data.media._id
        : (current.background?._id || null)

      const saved = await saveStorySection(storyTarget, nextItems, nextBackground)
      if (saved) {
        setStoryUpload({ file: null, title: '', albumId: '' })
        event.target.reset()
        const [mediaRes, albumsRes] = await Promise.all([api.get('/admin/media'), api.get('/admin/albums')])
        setMedia(mediaRes.data.media || [])
        setAlbums(albumsRes.data.albums || [])
        flash('success', 'Media uploaded and added to the Home story.')
      }
    } catch (error) {
      flash('error', error.response?.data?.message || 'Story media upload failed.')
    } finally {
      setBusy(false)
    }
  }

  const uploadLogo = async (event) => {
    event.preventDefault()
    if (!logoUpload.file) {
      flash('error', 'Choose a PNG logo first.')
      return
    }
    if (logoUpload.file.type !== 'image/png') {
      flash('error', 'The navbar logo must be a PNG image.')
      return
    }

    setBusy(true)
    try {
      const formData = new FormData()
      formData.append('file', logoUpload.file)
      formData.append('title', logoUpload.title || 'Galaxy Photography Logo')
      formData.append('folder', 'branding')
      formData.append('contentType', 'other')
      formData.append('alt', 'Galaxy Photography')
      formData.append('description', 'Navbar and footer brand logo')
      formData.append('isPublished', 'true')

      const uploadResponse = await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const slotResponse = await api.put('/admin/media/slots', {
        slot: 'site.brand.logo',
        mediaIds: [uploadResponse.data.media._id],
      })

      setMedia((current) => [uploadResponse.data.media, ...current])
      setSlots((current) => {
        const index = current.findIndex((item) => item.slot === 'site.brand.logo')
        if (index === -1) return [...current, slotResponse.data.assignment]
        const next = [...current]
        next[index] = slotResponse.data.assignment
        return next
      })
      setSlotDrafts((current) => ({
        ...current,
        'site.brand.logo': { mediaIds: [uploadResponse.data.media._id], backgroundMediaId: '' },
      }))
      setLogoUpload({ file: null, title: 'Galaxy Photography Logo' })
      event.target.reset()
      flash('success', 'Navbar logo updated. The new logo is now live on the website.')
    } catch (error) {
      flash('error', error.response?.data?.message || 'Logo update failed.')
    } finally {
      setBusy(false)
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
    <main className={`admin-page admin-page--${theme}`}>
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

          <div className="admin-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="search"
              placeholder="Search media, albums, enquiries…"
              aria-label="Search media, albums, enquiries"
            />
            <kbd>Ctrl K</kbd>
          </div>

          <div className="admin-topbar__actions">
            <div className="admin-live">
              <i />
              <span><strong>API Connected</strong><small>All systems operational</small></span>
            </div>

            <button
              className="admin-icon-button admin-theme-toggle"
              type="button"
              onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>

            <button className="admin-icon-button" onClick={loadDashboard} title="Refresh dashboard" aria-label="Refresh dashboard">
              <span className="material-symbols-outlined">refresh</span>
            </button>

            <div className="admin-topbar__avatar" aria-label="Current admin">
              {user?.name?.slice(0, 1).toUpperCase() || 'G'}
            </div>

            <span className="material-symbols-outlined admin-topbar__chevron">expand_more</span>
          </div>
        </header>

        {message && <div className={`admin-toast admin-toast--${message.type}`}><span className="material-symbols-outlined">{message.type === 'error' ? 'error' : 'check_circle'}</span>{message.text}</div>}

        {section === 'overview' && (
          <div className="admin-content admin-overview">
            <div className="admin-overview-heading">
              <div>
                <p className="admin-kicker">DASHBOARD</p>
                <h2>Overview</h2>
                <p>Welcome back! Here's what's happening with Galaxy Photography.</p>
              </div>
              <div className="admin-overview-date">
                <span className="material-symbols-outlined">calendar_today</span>
                <div>
                  <strong>{new Intl.DateTimeFormat('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())}</strong>
                  <small>Have a productive day!</small>
                </div>
              </div>
            </div>

            <div className="admin-stats">
              <article className="admin-stat admin-stat--gold" onClick={() => setSection('media')} role="button" tabIndex={0}>
                <span className="admin-stat__icon-wrap"><span className="admin-stat__icon material-symbols-outlined">image</span></span>
                <div className="admin-stat__content"><p>Media Assets</p><strong>{media.length}</strong><small>+{publishedCount} published</small></div>
                <span className="admin-stat__arrow material-symbols-outlined">chevron_right</span>
              </article>
              <article className="admin-stat admin-stat--blue" onClick={() => setSection('media')} role="button" tabIndex={0}>
                <span className="admin-stat__icon-wrap"><span className="admin-stat__icon material-symbols-outlined">videocam</span></span>
                <div className="admin-stat__content"><p>Videos</p><strong>{videoCount}</strong><small>Stored in media library</small></div>
                <span className="admin-stat__arrow material-symbols-outlined">chevron_right</span>
              </article>
              <article className="admin-stat admin-stat--purple" onClick={() => setSection('albums')} role="button" tabIndex={0}>
                <span className="admin-stat__icon-wrap"><span className="admin-stat__icon material-symbols-outlined">photo_library</span></span>
                <div className="admin-stat__content"><p>Albums</p><strong>{albums.length}</strong><small>{albums.length === 1 ? '1 collection' : `${albums.length} collections`}</small></div>
                <span className="admin-stat__arrow material-symbols-outlined">chevron_right</span>
              </article>
              <article className="admin-stat admin-stat--green" onClick={() => setSection('inquiries')} role="button" tabIndex={0}>
                <span className="admin-stat__icon-wrap"><span className="admin-stat__icon material-symbols-outlined">mail</span></span>
                <div className="admin-stat__content"><p>New Enquiries</p><strong>{newInquiries}</strong><small>{inquiries.length} total enquiries</small></div>
                <span className="admin-stat__arrow material-symbols-outlined">chevron_right</span>
              </article>
            </div>

            <section className="admin-welcome admin-welcome--reference">
              <div className="admin-welcome__copy">
                <p className="admin-welcome__eyebrow">{new Date().getHours() < 12 ? 'GOOD MORNING,' : new Date().getHours() < 17 ? 'GOOD AFTERNOON,' : 'GOOD EVENING,'}</p>
                <h3>Galaxy Photography <em>Admin</em></h3>
                <p>Manage your media, albums, website content and client enquiries all in one place.</p>
                <div className="admin-welcome__actions">
                  <button className="admin-primary" onClick={() => setSection('media')}><span className="material-symbols-outlined">cloud_upload</span>Upload Media</button>
                  <button className="admin-secondary" onClick={() => setSection('albums')}><span className="material-symbols-outlined">photo_library</span>Manage Albums</button>
                  <button className="admin-secondary" onClick={() => setSection('inquiries')}><span className="material-symbols-outlined">mail</span>View Enquiries</button>
                  <button className="admin-secondary" onClick={() => setSection('hero')}><span className="material-symbols-outlined">edit_square</span>Edit Home Hero</button>
                </div>
              </div>
              <div className="admin-welcome__visual">
                {media.find((item) => item.mediaType === 'image')?.publicUrl
                  ? <img src={media.find((item) => item.mediaType === 'image')?.publicUrl} alt="Recent Galaxy Photography work" />
                  : <div className="admin-welcome__visual-placeholder"><span className="material-symbols-outlined">photo_camera</span></div>}
                <div className="admin-welcome__quote">
                  <span>“</span>
                  <p>Capturing moments<br />that last a lifetime.</p>
                  <i />
                </div>
              </div>
            </section>

            <div className="admin-overview-grid">
              <section className="admin-panel admin-recent-panel">
                <div className="admin-panel__head">
                  <div><p className="admin-kicker">LATEST MEDIA</p><h3>Recent Media</h3><small>Latest uploads from your library</small></div>
                  <button onClick={() => setSection('media')}>View All <span className="material-symbols-outlined">arrow_forward</span></button>
                </div>
                {media.length ? (
                  <div className="admin-mini-grid">
                    {media.slice(0, 5).map((item) => <MediaCard key={item._id} item={item} compact onDelete={deleteMedia} onToggle={() => updateMedia(item, { isPublished: !item.isPublished })} />)}
                  </div>
                ) : <Empty icon="perm_media" title="No media yet" text="Upload your first image or video to test the storage pipeline." />}
              </section>

              <section className="admin-panel admin-recent-enquiries">
                <div className="admin-panel__head">
                  <div><p className="admin-kicker">CLIENT CONTACT</p><h3>Recent Enquiries</h3></div>
                  <button onClick={() => setSection('inquiries')}>View All <span className="material-symbols-outlined">arrow_forward</span></button>
                </div>
                {inquiries.length ? inquiries.slice(0, 4).map((item) => (
                  <div className="admin-inquiry-mini" key={item._id}>
                    <span>{item.name.slice(0, 1).toUpperCase()}</span>
                    <div><strong>{item.name}</strong><small>{item.service || 'General enquiry'} · {formatDate(item.createdAt)}</small></div>
                    <b className={`admin-enquiry-status admin-enquiry-status--${item.status}`}>{item.status === 'new' ? 'New' : item.status === 'contacted' ? 'Replied' : 'Closed'}</b>
                    <span className="material-symbols-outlined admin-inquiry-arrow">chevron_right</span>
                  </div>
                )) : <Empty icon="mail" title="No enquiries yet" text="Contact form submissions will appear here." />}
              </section>
            </div>
          </div>
        )}
        {section === 'media' && (
          <div className="admin-content admin-media-library-page">
            <div className="admin-section-intro admin-media-library-intro">
              <div>
                <p className="admin-kicker">STORAGE PIPELINE</p>
                <h2>Media Library</h2>
                <p>Upload, organize and publish your photography and video assets from one workspace.</p>
              </div>
              <div className="admin-library-summary">
                <strong>{media.length}</strong><span>Total assets</span>
                <i />
                <strong>{publishedCount}</strong><span>Published</span>
                <i />
                <strong>{videoCount}</strong><span>Videos</span>
              </div>
            </div>

            <form className="admin-upload admin-upload--library" onSubmit={uploadMedia}>
              <div className="admin-upload__drop admin-upload__drop--library">
                <input id="media-file" type="file" accept="image/*,video/*" onChange={(event) => setUpload((current) => ({ ...current, file: event.target.files?.[0] || null }))} />
                <label htmlFor="media-file">
                  <span className="admin-upload__upload-icon material-symbols-outlined">cloud_upload</span>
                  <strong>{upload.file ? upload.file.name : 'Drop an image or video here'}</strong>
                  <small>{upload.file ? formatBytes(upload.file.size) : 'or click to browse · JPG, PNG, WEBP, MP4, MOV'}</small>
                </label>
              </div>
              <div className="admin-upload__fields admin-upload__fields--library">
                <label>Title<input value={upload.title} onChange={(event) => setUpload({ ...upload, title: event.target.value })} placeholder="Wedding story title" /></label>
                <label>Type<select value={upload.contentType} onChange={(event) => setUpload({ ...upload, contentType: event.target.value })}>{mediaTypes.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
                <label>Album<select value={upload.albumId} onChange={(event) => setUpload({ ...upload, albumId: event.target.value })}><option value="">Media library only</option>{albums.map((album) => <option key={album._id} value={album._id}>{album.title}</option>)}</select></label>
                <label>Folder<select value={upload.folder} onChange={(event) => setUpload({ ...upload, folder: event.target.value })}><option value="portfolio">portfolio</option><option value="hero">hero</option><option value="stories">stories</option><option value="albums">albums</option><option value="videos">videos</option></select></label>
                <label>Alt text<input value={upload.alt} onChange={(event) => setUpload({ ...upload, alt: event.target.value })} placeholder="Indian wedding celebration" /></label>
                <label>Description<textarea value={upload.description} onChange={(event) => setUpload({ ...upload, description: event.target.value })} placeholder="Optional media description" /></label>
                <div className="admin-upload__footer">
                  <label className="admin-check"><input type="checkbox" checked={upload.isPublished} onChange={(event) => setUpload({ ...upload, isPublished: event.target.checked })} /> Publish immediately</label>
                  <button className="admin-primary" disabled={busy}>{busy ? 'Uploading…' : 'Upload to storage'} <span className="material-symbols-outlined">arrow_upward</span></button>
                </div>
              </div>
            </form>

            <div className="admin-panel admin-library-panel">
              <div className="admin-library-toolbar">
                <div className="admin-panel__head">
                  <div><p className="admin-kicker">LIBRARY</p><h3>{filteredMedia.length} assets</h3></div>
                  <span className="admin-muted">{publishedCount} published · {videoCount} videos</span>
                </div>
                <label className="admin-library-search">
                  <span className="material-symbols-outlined">search</span>
                  <input value={mediaSearch} onChange={(event) => setMediaSearch(event.target.value)} placeholder="Search title, filename, folder…" aria-label="Search media library" />
                  {mediaSearch && <button type="button" onClick={() => setMediaSearch('')} aria-label="Clear search"><span className="material-symbols-outlined">close</span></button>}
                </label>
              </div>
              <div className="admin-filter-row admin-filter-row--colorful">
                <button className={mediaFilter === 'all' ? 'is-active' : ''} onClick={() => setMediaFilter('all')} type="button"><span className="filter-dot filter-dot--all" />All <b>{media.length}</b></button>
                {mediaTypes.map(([key, label]) => <button key={key} className={mediaFilter === key ? 'is-active' : ''} onClick={() => setMediaFilter(key)} type="button"><span className={`filter-dot filter-dot--${key}`} />{label}<b>{media.filter((item) => item.contentType === key).length}</b></button>)}
              </div>
              {filteredMedia.length ? <div className="admin-media-grid admin-media-grid--library">{filteredMedia.map((item) => <MediaCard key={item._id} item={item} onDelete={deleteMedia} onToggle={() => updateMedia(item, { isPublished: !item.isPublished })} />)}</div> : <Empty icon="perm_media" title={mediaSearch ? 'No matching media' : 'Your library is empty'} text={mediaSearch ? 'Try a different title, filename or folder.' : 'Upload an image or video above.'} />}
            </div>
          </div>
        )}

        {section === 'hero' && (
          <div className="admin-content admin-hero-page">
            <div className="admin-section-intro admin-hero-intro">
              <div>
                <p className="admin-kicker">HOME / HERO EXPERIENCE</p>
                <h2>Hero Media Control</h2>
                <p>Choose the media that powers the Home hero. Preview every asset before assigning it to the background or circular ring.</p>
              </div>
              <div className="admin-hero-intro__status">
                <span className="admin-hero-status-dot" />
                <div><strong>Hero controls live</strong><small>Changes publish to the website immediately</small></div>
              </div>
            </div>

            <section className="admin-hero-stage admin-panel">
              <div className="admin-hero-stage__head">
                <div><p className="admin-kicker">LIVE PREVIEW</p><h3>Current Home Hero</h3></div>
                <a href="/" target="_blank" rel="noreferrer"><span className="material-symbols-outlined">open_in_new</span>View website</a>
              </div>
              <div className="admin-hero-stage__grid">
                {[
                  ['home.hero.background', 'Background', 'Full-screen visual'],
                  ['home.hero.ring', 'Circular Ring', 'Foreground ring media'],
                ].map(([slot, title, note]) => {
                  const items = slotMedia(slot)
                  const first = items[0]
                  return (
                    <article className={`admin-hero-stage-card ${slot.endsWith('ring') ? 'is-ring' : ''}`} key={slot}>
                      <div className="admin-hero-stage-card__media">
                        {first ? (
                          first.mediaType === 'video'
                            ? <video src={first.publicUrl} muted playsInline autoPlay loop preload="metadata" />
                            : <img src={first.publicUrl} alt={first.altText || first.title || title} />
                        ) : <div className="admin-hero-stage-card__empty"><span className="material-symbols-outlined">{slot.endsWith('ring') ? 'radio_button_checked' : 'landscape'}</span></div>}
                        <span className="admin-hero-stage-card__badge">{slotIsConfigured(slot) ? 'CUSTOM' : 'FALLBACK'}</span>
                        <span className="admin-hero-stage-card__count">{items.length} {items.length === 1 ? 'asset' : 'assets'}</span>
                      </div>
                      <div className="admin-hero-stage-card__info">
                        <div><strong>{title}</strong><small>{note}</small></div>
                        {first && <span>{first.title || first.filename}</span>}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <div className="admin-hero-workspace">
              {[
                ['home.hero.background', 'Background', 'Full-screen background media. Mix images and videos; the website handles cropping, looping and transitions.'],
                ['home.hero.ring', 'Circular Ring', 'Media displayed inside the circular ring. Images and videos are automatically cropped to the round frame.'],
              ].map(([slot, title, description]) => {
                const items = slotMedia(slot)
                return (
                  <section className={`admin-panel admin-hero-workspace-card ${slot.endsWith('ring') ? 'is-ring' : ''}`} key={slot}>
                    <div className="admin-hero-workspace-card__head">
                      <div>
                        <span className="admin-hero-slot-icon material-symbols-outlined">{slot.endsWith('ring') ? 'radio_button_checked' : 'wallpaper'}</span>
                        <div><p className="admin-kicker">{slot.endsWith('ring') ? 'RING MEDIA' : 'BACKGROUND'}</p><h3>{title}</h3></div>
                      </div>
                      <button type="button" className="admin-danger-ghost" onClick={() => clearHeroSlot(slot)} disabled={!items.length}>Clear all</button>
                    </div>
                    <p className="admin-hero-panel__description">{description}</p>

                    <div className="admin-hero-assigned">
                      <div className="admin-hero-subhead"><strong>Assigned media</strong><span>{items.length} selected</span></div>
                      {items.length ? (
                        <div className="admin-hero-assigned-grid">
                          {items.map((item,index) => (
                            <article className="admin-hero-assigned-item" key={item._id}>
                              <div className="admin-hero-assigned-item__preview">
                                {item.mediaType === 'video'
                                  ? <video src={item.publicUrl} muted playsInline autoPlay loop preload="metadata" />
                                  : <img src={item.publicUrl} alt={item.altText || item.title || ''} />}
                                <span>{String(index + 1).padStart(2,'0')}</span>
                              </div>
                              <div className="admin-hero-assigned-item__info">
                                <strong title={item.title || item.filename}>{item.title || item.filename}</strong>
                                <small>{item.mediaType.toUpperCase()} · {formatBytes(item.sizeBytes)}</small>
                                <button type="button" onClick={() => {
                                  const next = items.filter((entry) => entry._id !== item._id).map((entry) => entry._id)
                                  if (next.length) saveHeroSlot(slot, next)
                                  else clearHeroSlot(slot)
                                }}><span className="material-symbols-outlined">remove_circle</span>Remove</button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="admin-hero-assigned-empty"><span className="material-symbols-outlined">perm_media</span><div><strong>Using fallback media</strong><small>No custom media is assigned to this slot.</small></div></div>
                      )}
                    </div>

                    <div className="admin-hero-library-block">
                      <div className="admin-hero-subhead">
                        <div><strong>Choose from media library</strong><small>Click any preview to add or remove it</small></div>
                        <select value={heroAlbumFilter} onChange={(event) => setHeroAlbumFilter(event.target.value)}>
                          <option value="all">All media</option>
                          {albums.map((album) => <option key={album._id} value={album._id}>{album.title}</option>)}
                        </select>
                      </div>
                      <div className="admin-hero-library-grid">
                        {media.filter((item) => heroAlbumFilter === 'all' || albums.some((album) => album._id === heroAlbumFilter && album.media?.some((entry) => entry.asset?._id === item._id || entry.asset === item._id))).map((item) => {
                          const assigned = items.some((entry) => entry._id === item._id)
                          return (
                            <button type="button" key={item._id} title={item.title || item.filename} className={`admin-hero-library-card ${assigned ? 'is-assigned' : ''}`} onClick={() => {
                              const next = assigned
                                ? items.filter((entry) => entry._id !== item._id).map((entry) => entry._id)
                                : [...items.map((entry) => entry._id), item._id]
                              saveHeroSlot(slot, next)
                            }}>
                              <span className="admin-hero-library-card__preview">
                                {item.mediaType === 'video'
                                  ? <video src={item.publicUrl} muted playsInline preload="metadata" />
                                  : <img src={item.publicUrl} alt={item.altText || item.title || ''} />}
                                {item.mediaType === 'video' && <i className="material-symbols-outlined">play_circle</i>}
                                <em>{assigned ? 'SELECTED' : 'ADD'}</em>
                              </span>
                              <strong>{item.title || item.filename}</strong>
                              <small>{item.mediaType.toUpperCase()} · {mediaTypeLabel(item.contentType)}</small>
                            </button>
                          )
                        })}
                      </div>
                      {!media.length && <Empty icon="perm_media" title="No media available" text="Upload media from the Media Library first." />}
                    </div>
                  </section>
                )
              })}
            </div>

            <section className="admin-panel admin-hero-upload-panel admin-hero-direct-upload">
              <div className="admin-panel__head">
                <div><p className="admin-kicker">DIRECT UPLOAD</p><h3>Add new hero media</h3><p className="admin-hero-panel__description">Upload and assign an asset in one step.</p></div>
              </div>
              <form className="admin-hero-upload" onSubmit={uploadHeroMedia}>
                <label>Destination<select value={heroTarget} onChange={(event) => setHeroTarget(event.target.value)}><option value="home.hero.background">Background</option><option value="home.hero.ring">Circular Ring</option></select></label>
                <label>Album<select value={heroUpload.albumId} onChange={(event) => setHeroUpload({ ...heroUpload, albumId: event.target.value })}><option value="">Don't add to an album</option>{albums.map((album) => <option key={album._id} value={album._id}>{album.title}</option>)}</select></label>
                <label>Title<input value={heroUpload.title} onChange={(event) => setHeroUpload({ ...heroUpload, title: event.target.value })} placeholder="Hero media title" /></label>
                <label className="admin-hero-upload__file"><input type="file" accept="image/*,video/*" onChange={(event) => setHeroUpload({ ...heroUpload, file: event.target.files?.[0] || null })} /><span className="material-symbols-outlined">cloud_upload</span><strong>{heroUpload.file ? heroUpload.file.name : 'Choose image or video'}</strong><small>{heroUpload.file ? formatBytes(heroUpload.file.size) : 'JPG, PNG, WEBP, MP4, MOV'}</small></label>
                <button className="admin-primary" disabled={busy}>{busy ? 'Uploading…' : 'Upload & add to hero'} <span className="material-symbols-outlined">arrow_upward</span></button>
              </form>
            </section>
          </div>
        )}

        {section === 'stories' && (
          <div className="admin-content admin-stories-page">
            <div className="admin-section-intro admin-stories-intro">
              <div>
                <p className="admin-kicker">HOME / STORIES IN EVERY FRAME</p>
                <h2>Home Stories</h2>
                <p>Manage each Home story section separately. Every section has one background image and up to four ordered story cards.</p>
              </div>
              <div className="admin-stories-help">
                <span className="material-symbols-outlined">info</span>
                <span>Background = section backdrop<br />Cards = foreground media</span>
              </div>
            </div>

            <nav className="admin-story-tabs" aria-label="Home story sections">
              {Object.entries(storyTitles).map(([slot, title], index) => (
                <button key={slot} type="button" className={storyTarget === slot ? 'is-active' : ''} onClick={() => setStoryTarget(slot)}>
                  <span className="admin-story-tab-number">{String(index + 1).padStart(2, '0')}</span>
                  <span><strong>{title}</strong><small>{slot}</small></span>
                </button>
              ))}
            </nav>

            {(() => {
              const current = storyData(storyTarget)
              const currentTitle = storyTitles[storyTarget]
              const currentIndex = Object.keys(storyTitles).indexOf(storyTarget) + 1
              const backgroundCandidates = media
                .filter((item) => item.mediaType === 'image' && item.isPublished !== false)
                .filter((item) => storyAlbumFilter === 'all' || albums.some((album) => album._id === storyAlbumFilter && album.media?.some((entry) => entry.asset?._id === item._id || entry.asset === item._id)))
              return (
                <>
                  <section className="admin-story-hero-panel admin-panel">
                    <div className="admin-story-hero-panel__media">
                      {current.background?.publicUrl
                        ? <img src={current.background.publicUrl} alt={current.background.altText || current.background.title || ''} />
                        : <div className="admin-story-empty-preview"><span className="material-symbols-outlined">landscape</span><strong>No background selected</strong><small>Choose a background image below</small></div>}
                      <div className="admin-story-hero-panel__overlay" />
                      <div className="admin-story-hero-panel__label"><span>STORY {String(currentIndex).padStart(2,'0')}</span><strong>{currentTitle}</strong><small>{current.configured ? 'Custom configuration' : 'Using current fallback'}</small></div>
                    </div>
                    <div className="admin-story-hero-panel__side">
                      <p className="admin-kicker">CURRENT CONFIGURATION</p>
                      <h3>{currentTitle}</h3>
                      <div className="admin-story-statline">
                        <span><strong>{current.items.length}</strong><small>of 4 cards</small></span>
                        <span><strong>{current.background ? '1' : '0'}</strong><small>background</small></span>
                      </div>
                      <p>Use the background selector to change the large section image. Use the card library to control the foreground media.</p>
                    </div>
                  </section>

                  <div className="admin-story-editor-grid">
                    <section className="admin-panel admin-story-background-panel">
                      <div className="admin-panel__head">
                        <div>
                          <p className="admin-kicker">01 · SECTION BACKGROUND</p>
                          <h3>Choose background image</h3>
                          <p className="admin-story-panel__description">This image fills the background of <strong>{currentTitle}</strong>. It is separate from the four foreground cards.</p>
                        </div>
                        <button type="button" className="admin-danger-ghost" disabled={!current.background} onClick={() => saveStorySection(storyTarget, current.items.map((item) => item._id), null)}>Remove background</button>
                      </div>

                      <div className="admin-story-current-background">
                        {current.background ? (
                          <>
                            <img src={current.background.publicUrl} alt={current.background.altText || current.background.title || ''} />
                            <div><span>CURRENT BACKGROUND</span><strong>{current.background.title || current.background.filename}</strong><small>{current.background.filename}</small></div>
                          </>
                        ) : <div className="admin-story-current-background--empty"><span className="material-symbols-outlined">image</span><div><strong>No custom background</strong><small>The Home page is using its fallback background.</small></div></div>}
                      </div>

                      <div className="admin-story-library-toolbar">
                        <strong>Choose from library</strong>
                        <select value={storyAlbumFilter} onChange={(event) => setStoryAlbumFilter(event.target.value)}>
                          <option value="all">All albums</option>
                          {albums.map((album) => <option key={album._id} value={album._id}>{album.title}</option>)}
                        </select>
                      </div>

                      <div className="admin-story-background-grid">
                        {backgroundCandidates.map((item) => {
                          const selected = current.background?._id === item._id
                          return (
                            <button type="button" key={item._id} className={`admin-story-background-card ${selected ? 'is-selected' : ''}`} onClick={() => chooseStoryBackground(storyTarget, item)}>
                              <span><img src={item.publicUrl} alt={item.altText || item.title || ''} />{selected && <i className="material-symbols-outlined">check_circle</i>}</span>
                              <strong title={item.title || item.filename}>{item.title || item.filename}</strong>
                              <small>{selected ? 'CURRENT BACKGROUND' : 'Set as background'}</small>
                            </button>
                          )
                        })}
                      </div>
                      {!backgroundCandidates.length && <Empty icon="image" title="No background images found" text="Upload an image in Media Library or use the direct upload below." />}
                    </section>

                    <section className="admin-panel admin-story-cards-panel">
                      <div className="admin-panel__head">
                        <div>
                          <p className="admin-kicker">02 · FOREGROUND CARDS</p>
                          <h3>Story media cards</h3>
                          <p className="admin-story-panel__description">These are the four foreground images/videos shown inside <strong>{currentTitle}</strong>.</p>
                        </div>
                        <strong className="admin-story-count">{current.items.length}/4</strong>
                      </div>

                      <div className="admin-story-card-list">
                        {current.items.map((item, index) => (
                          <article className="admin-story-card-row" key={item._id}>
                            <div className="admin-story-card-row__preview">
                              {item.mediaType === 'video' ? <video src={item.publicUrl} muted playsInline autoPlay loop preload="metadata" /> : <img src={item.publicUrl} alt={item.altText || item.title || ''} />}
                              <span>{String(index + 1).padStart(2,'0')} · {item.mediaType.toUpperCase()}</span>
                            </div>
                            <div className="admin-story-card-row__body">
                              <strong title={item.title || item.filename}>{item.title || item.filename}</strong>
                              <small>{item.filename}</small>
                              <div>
                                <button type="button" disabled={index === 0} onClick={() => moveStoryItem(storyTarget, index, -1)} title="Move earlier"><span className="material-symbols-outlined">arrow_upward</span></button>
                                <button type="button" disabled={index === current.items.length - 1} onClick={() => moveStoryItem(storyTarget, index, 1)} title="Move later"><span className="material-symbols-outlined">arrow_downward</span></button>
                                <button type="button" className="is-danger" onClick={() => updateStoryItems(storyTarget, current.items.filter((entry) => entry._id !== item._id))}><span className="material-symbols-outlined">delete</span>Remove</button>
                              </div>
                            </div>
                          </article>
                        ))}
                        {Array.from({ length: Math.max(0, 4 - current.items.length) }).map((_, index) => <div className="admin-story-card-row admin-story-card-row--empty" key={`empty-${index}`}><span className="material-symbols-outlined">add_photo_alternate</span><div><strong>Empty card {current.items.length + index + 1}</strong><small>Add media from the library below</small></div></div>)}
                      </div>
                    </section>
                  </div>

                  <section className="admin-panel admin-story-library-panel">
                    <div className="admin-panel__head">
                      <div>
                        <p className="admin-kicker">03 · MEDIA LIBRARY</p>
                        <h3>Add foreground cards</h3>
                        <p className="admin-story-panel__description">Click a preview to add or remove it from <strong>{currentTitle}</strong>. Maximum four cards.</p>
                      </div>
                      <span className="admin-muted">{current.items.length}/4 selected · {media.length} assets</span>
                    </div>

                    <div className="admin-story-filter-row">
                      <select value={storyLibraryFilter} onChange={(event) => setStoryLibraryFilter(event.target.value)}>
                        <option value="all">All media</option><option value="image">Images only</option><option value="video">Videos only</option>
                      </select>
                      <select value={storyAlbumFilter} onChange={(event) => setStoryAlbumFilter(event.target.value)}>
                        <option value="all">All albums</option>{albums.map((album) => <option key={album._id} value={album._id}>{album.title}</option>)}
                      </select>
                    </div>

                    <div className="admin-story-library-grid">
                      {media.filter((item) => item.isPublished !== false)
                        .filter((item) => storyLibraryFilter === 'all' || item.mediaType === storyLibraryFilter)
                        .filter((item) => storyAlbumFilter === 'all' || albums.some((album) => album._id === storyAlbumFilter && album.media?.some((entry) => entry.asset?._id === item._id || entry.asset === item._id)))
                        .map((item) => {
                          const assigned = current.items.some((entry) => entry._id === item._id)
                          return (
                            <article className={`admin-story-library-item ${assigned ? 'is-assigned' : ''}`} key={item._id}>
                              <div className="admin-story-library-item__media">
                                {item.mediaType === 'video' ? <video src={item.publicUrl} muted playsInline preload="metadata" onMouseEnter={(event) => event.currentTarget.play().catch(() => {})} onMouseLeave={(event) => { event.currentTarget.pause(); event.currentTarget.currentTime = 0 }} /> : <img src={item.publicUrl} alt={item.altText || item.title || ''} loading="lazy" />}
                                <span>{item.mediaType.toUpperCase()}</span>
                                {assigned && <b><span className="material-symbols-outlined">check</span> SELECTED</b>}
                              </div>
                              <div className="admin-story-library-item__body">
                                <strong title={item.title || item.filename}>{item.title || item.filename}</strong>
                                <small>{mediaTypeLabel(item.contentType)}</small>
                                <button type="button" onClick={() => toggleStoryLibraryItem(storyTarget, item)} disabled={!assigned && current.items.length >= 4}>{assigned ? 'Remove card' : 'Add to cards'}</button>
                              </div>
                            </article>
                          )
                        })}
                    </div>
                  </section>

                  <section className="admin-panel admin-story-upload-panel">
                    <div className="admin-panel__head">
                      <div><p className="admin-kicker">04 · DIRECT UPLOAD</p><h3>Upload to {currentTitle}</h3><p className="admin-story-panel__description">Upload a new foreground card or a dedicated background image.</p></div>
                    </div>
                    <form className="admin-story-upload">
                      <div className="admin-story-upload__preview">
                        {storyUploadPreview ? (storyUpload.file?.type.startsWith('video/') ? <video src={storyUploadPreview} muted playsInline controls /> : <img src={storyUploadPreview} alt="Selected upload preview" />) : <div><span className="material-symbols-outlined">preview</span><small>Select a file to preview it here</small></div>}
                      </div>
                      <div className="admin-story-upload__fields">
                        <label>Upload as<select value={storyUploadMode} onChange={(event) => setStoryUploadMode(event.target.value)}><option value="card">Foreground card (image/video)</option><option value="background">Section background (image only)</option></select></label>
                        <label>Album<select value={storyUpload.albumId} onChange={(event) => setStoryUpload({ ...storyUpload, albumId: event.target.value })}><option value="">Don't add to an album</option>{albums.map((album) => <option key={album._id} value={album._id}>{album.title}</option>)}</select></label>
                        <label>Title<input value={storyUpload.title} onChange={(event) => setStoryUpload({ ...storyUpload, title: event.target.value })} placeholder={storyUploadMode === 'background' ? `${currentTitle} background` : `${currentTitle} card`} /></label>
                        <label className="admin-story-upload__file"><input type="file" accept={storyUploadMode === 'background' ? 'image/*' : 'image/*,video/*'} onChange={(event) => setStoryUpload({ ...storyUpload, file: event.target.files?.[0] || null })} /><span className="material-symbols-outlined">cloud_upload</span><strong>{storyUpload.file ? storyUpload.file.name : 'Choose file'}</strong><small>{storyUploadMode === 'background' ? 'Image only' : 'Image or video'}</small></label>
                        <button className="admin-primary" disabled={busy || (storyUploadMode === 'card' && current.items.length >= 4)} onClick={(event) => { if (!event.currentTarget.form.checkValidity()) event.preventDefault() }}>{busy ? 'Uploading…' : 'Upload & assign'} <span className="material-symbols-outlined">arrow_upward</span></button>
                      </div>
                    </form>
                  </section>
                </>
              )
            })()}
          </div>
        )}

        {section === 'slots' && (
          <div className="admin-content">
            <div className="admin-section-intro admin-slot-intro">
              <div>
                <p className="admin-kicker">WEBSITE CONTROL CENTRE</p>
                <h2>Website Slots</h2>
                <p>Manage every visual used by the public site. Each slot shows the media currently live and the exact assets available to choose.</p>
              </div>
              <div className="admin-slot-overview">
                <span className="admin-slot-overview__count">{WEBSITE_SLOT_DEFINITIONS.length}</span>
                <div><strong>Visual slots</strong><small>Images & videos previewed</small></div>
              </div>
            </div>

            {['Home', 'Home Stories', 'Portfolio', 'Site'].map((group) => (
              <section className="admin-slot-group admin-slot-group--visual" key={group}>
                <div className="admin-slot-group__heading">
                  <div>
                    <p className="admin-kicker">{group.toUpperCase()}</p>
                    <h3>{group === 'Home Stories' ? 'Stories in every frame' : group === 'Home' ? 'Home experience' : group === 'Site' ? 'Shared site visuals' : 'Portfolio experience'}</h3>
                  </div>
                  <span>{WEBSITE_SLOT_DEFINITIONS.filter((item) => item.group === group).length} slots</span>
                </div>
                <div className="admin-slot-visual-grid">
                  {WEBSITE_SLOT_DEFINITIONS.filter((definition) => definition.group === group).map((definition) => {
                    const assignment = getSlotAssignment(definition.slot)
                    const currentItems = getSlotItems(definition.slot)
                    const draft = getSlotDraft(definition)
                    const currentIds = draft.mediaIds || []
                    const options = media.filter((item) => item.isPublished && mediaMatches(item, definition.accept))
                    const fallbackItems = heroFallbackMedia(definition.slot)
                    const displayItems = currentItems.length ? currentItems : fallbackItems
                    const toggleSelected = (item) => {
                      if (definition.mode === 'single') {
                        setSlotDraft(definition.slot, { mediaIds: [item._id] })
                        return
                      }
                      const selected = currentIds.includes(item._id)
                      const next = selected ? currentIds.filter((id) => id !== item._id) : [...currentIds, item._id].slice(0, definition.max || 1)
                      setSlotDraft(definition.slot, { mediaIds: next })
                    }
                    return (
                      <article className={'admin-slot-visual-card admin-slot-visual-card--' + definition.mode} key={definition.slot}>
                        <div className="admin-slot-visual-card__head">
                          <div>
                            <div className="admin-slot-visual-card__eyebrow">
                              <code>{definition.slot}</code>
                              <span className={assignment ? 'is-live' : 'is-fallback'}>{assignment ? 'CUSTOM' : 'FALLBACK'}</span>
                            </div>
                            <h4>{definition.title}</h4>
                            <p>{definition.note}</p>
                          </div>
                          <span className="admin-slot-visual-card__limit">{definition.mode === 'multi' ? 'Up to ' + definition.max : definition.mode === 'story' ? '4 cards' : '1 asset'}</span>
                        </div>
                        <div className="admin-slot-current-label">
                          <span>Currently on website</span>
                          <small>{displayItems.length ? displayItems.length + ' preview' + (displayItems.length === 1 ? '' : 's') : 'No media'}</small>
                        </div>
                        <div className={'admin-slot-current-preview admin-slot-current-preview--' + definition.mode}>
                          {displayItems.length ? displayItems.map((item, index) => (
                            <div className="admin-slot-preview-tile" key={item._id}>
                              <div className="admin-slot-preview-tile__media">
                                {item.mediaType === 'video' ? <video src={item.publicUrl} muted playsInline autoPlay loop preload="metadata" /> : <img src={item.publicUrl} alt={item.altText || item.title || ''} />}
                                <span className="admin-slot-preview-tile__badge">{item.mediaType === 'video' ? 'VIDEO' : 'IMAGE'}</span>
                                <span className="admin-slot-preview-tile__index">{String(index + 1).padStart(2, '0')}</span>
                              </div>
                              <div className="admin-slot-preview-tile__info"><strong title={item.title || item.filename}>{item.title || item.filename}</strong><small>{item.filename}</small></div>
                            </div>
                          )) : <div className="admin-slot-preview-empty"><span className="material-symbols-outlined">image</span><strong>No media assigned</strong><small>The website will use its built-in fallback, if available.</small></div>}
                        </div>
                        {definition.mode === 'story' && (
                          <div className="admin-slot-story-background">
                            <div><span className="admin-slot-control-label">Story background</span><strong>{(draft.backgroundMediaId && media.find((item) => item._id === draft.backgroundMediaId)?.title) || (draft.backgroundMediaId && media.find((item) => item._id === draft.backgroundMediaId)?.filename) || 'No custom background'}</strong></div>
                            <select value={draft.backgroundMediaId || ''} onChange={(event) => setSlotDraft(definition.slot, { backgroundMediaId: event.target.value })}>
                              <option value="">Use fallback background</option>
                              {media.filter((item) => item.isPublished && item.mediaType === 'image').map((item) => <option key={item._id} value={item._id}>{item.title || item.filename}</option>)}
                            </select>
                          </div>
                        )}
                        <div className="admin-slot-picker">
                          <div className="admin-slot-picker__head"><div><span className="admin-slot-control-label">Choose media</span><strong>{definition.mode === 'single' ? 'Select one asset' : 'Select up to ' + definition.max + ' assets'}</strong></div><small>{currentIds.length} selected</small></div>
                          {options.length ? (
                            <div className={'admin-slot-picker-grid admin-slot-picker-grid--' + definition.mode}>
                              {options.map((item) => {
                                const selected = currentIds.includes(item._id)
                                return (
                                  <button type="button" key={item._id} className={'admin-slot-picker-item ' + (selected ? 'is-selected' : '')} onClick={() => toggleSelected(item)}>
                                    <div className="admin-slot-picker-item__media">
                                      {item.mediaType === 'video' ? <video src={item.publicUrl} muted playsInline loop preload="metadata" onMouseEnter={(event) => event.currentTarget.play().catch(() => {})} onMouseLeave={(event) => { event.currentTarget.pause(); event.currentTarget.currentTime = 0 }} /> : <img src={item.publicUrl} alt={item.altText || item.title || ''} loading="lazy" />}
                                      <span className="admin-slot-picker-item__type">{item.mediaType === 'video' ? 'VIDEO' : 'IMAGE'}</span>
                                      {selected && <span className="admin-slot-picker-item__selected"><span className="material-symbols-outlined">check</span></span>}
                                    </div>
                                    <div className="admin-slot-picker-item__body"><strong title={item.title || item.filename}>{item.title || item.filename}</strong><small>{mediaTypeLabel(item.contentType)} · {formatBytes(item.sizeBytes)}</small></div>
                                  </button>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="admin-slot-picker-empty"><span className="material-symbols-outlined">perm_media</span><strong>No compatible published media</strong><small>Upload an asset in Media Library first.</small><button type="button" onClick={() => setSection('media')}>Open Media Library</button></div>
                          )}
                        </div>
                        <div className="admin-slot-visual-card__footer">
                          <span className="admin-slot-save-hint">{assignment ? 'Custom media is active.' : 'Fallback is active.'}</span>
                          <div className="admin-slot-control-actions">
                            <button type="button" className="admin-slot-clear-visual" onClick={() => clearWebsiteSlot(definition)}><span className="material-symbols-outlined">restart_alt</span>Fallback</button>
                            <button type="button" className="admin-primary admin-slot-save-visual" onClick={() => saveWebsiteSlot(definition)} disabled={busy}><span className="material-symbols-outlined">save</span>Save changes</button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
            <section className="admin-slot-library-note admin-slot-library-note--visual">
              <div><p className="admin-kicker">MEDIA LIBRARY</p><h3>Need a new image or video?</h3><p>Upload it once to the library. It will then appear here with a real preview everywhere the asset is compatible.</p></div>
              <button type="button" className="admin-primary" onClick={() => setSection('media')}><span className="material-symbols-outlined">perm_media</span>Open Media Library</button>
            </section>
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
              {inquiries.length ? <div className="admin-inquiry-list">{inquiries.map((item) => <article className="admin-inquiry" key={item._id}><div className="admin-inquiry__head"><div><span className={`admin-status admin-status--${item.status}`}>{item.status}</span><h3>{item.name}</h3><p>{item.email}{item.phone ? ` · ${item.phone}` : ''}</p></div><small>{formatDate(item.createdAt)}</small></div><div className="admin-inquiry__body"><p><strong>{item.service || 'General enquiry'}</strong></p><p>{item.message}</p></div><div className="admin-inquiry__actions">
  <a href={`mailto:${item.email}`}>Email client</a>
  <span className={`admin-inquiry__delivery ${item.notificationSentAt ? 'is-sent' : item.emailError ? 'is-error' : ''}`}>
    <span className="material-symbols-outlined">{item.notificationSentAt ? 'mark_email_read' : item.emailError ? 'error' : 'mail'}</span>
    {item.notificationSentAt ? 'Email notified' : item.emailError ? 'Email failed' : 'Stored'}
  </span>
  <select value={item.status} onChange={(event) => updateInquiry(item, { status: event.target.value })}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select>
</div></article>)}</div> : <Empty icon="mail" title="No enquiries yet" text="Submissions from the public contact form will appear here." />}
            </div>
          </div>
        )}

        {section === 'settings' && (
          <div className="admin-content">
            <div className="admin-section-intro"><div><p className="admin-kicker">SITE CONFIGURATION</p><h2>Settings</h2><p>Simple key/value website settings stored in MongoDB. These can later drive the public site dynamically.</p></div></div>

            <section className="admin-panel admin-brand-logo-panel">
              <div className="admin-panel__head">
                <div>
                  <p className="admin-kicker">BRAND IDENTITY</p>
                  <h3>Navbar Logo</h3>
                  <p className="admin-brand-logo-panel__description">Replace the PNG logo used in the public navbar and shared footer without touching the code.</p>
                </div>
                <span className="admin-muted">PNG only</span>
              </div>
              <form className="admin-brand-logo-form" onSubmit={uploadLogo}>
                <div className="admin-brand-logo-preview">
                  {slotByNameForAdmin(slots, 'site.brand.logo')?.mediaItems?.[0]?.publicUrl || slotByNameForAdmin(slots, 'site.brand.logo')?.media?.publicUrl
                    ? <img src={slotByNameForAdmin(slots, 'site.brand.logo')?.mediaItems?.[0]?.publicUrl || slotByNameForAdmin(slots, 'site.brand.logo')?.media?.publicUrl} alt="Current Galaxy Photography logo" />
                    : <div><span className="material-symbols-outlined">image</span><small>No custom logo assigned</small></div>}
                </div>
                <label className="admin-brand-logo-file">
                  <input type="file" accept="image/png" onChange={(event) => setLogoUpload({ ...logoUpload, file: event.target.files?.[0] || null })} />
                  <span className="material-symbols-outlined">upload</span>
                  <strong>{logoUpload.file ? logoUpload.file.name : 'Choose new PNG logo'}</strong>
                  <small>Transparent PNG recommended. It will replace the current navbar logo immediately after upload.</small>
                </label>
                <button className="admin-primary" disabled={busy || !logoUpload.file}>
                  {busy ? 'Updating logo…' : 'Update navbar logo'}
                  <span className="material-symbols-outlined">save</span>
                </button>
              </form>
            </section>

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

function slotByNameForAdmin(slots, slotName) {
  return slots.find((item) => item.slot === slotName)
}

function MediaCard({ item, compact = false, onDelete, onToggle, albumMode = false }) {
  return (
    <article className={`admin-media-card ${compact ? 'admin-media-card--compact' : ''} admin-media-card--${item.mediaType} admin-media-card--${item.contentType}`}>
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
