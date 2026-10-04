import { Router } from 'express'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import { login, logout, me } from '../controllers/authController.js'
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js'
import {
  addMediaToAlbum, assignSlot, createAlbum, createInquiry, deleteAlbum, deleteMedia,
  getSettings, getSiteMedia, listAlbums, listAllAlbums, listInquiries, listMedia,
  listPublishedMedia, listSlots, removeMediaFromAlbum, removeSlot, updateAlbum,
  updateInquiry, updateMedia, updateSettings, uploadMedia,
} from '../controllers/mediaController.js'

const router=Router()
const authLimiter=rateLimit({windowMs:15*60*1000,max:20,standardHeaders:'draft-8',legacyHeaders:false})
const inquiryLimiter=rateLimit({windowMs:15*60*1000,max:30,standardHeaders:'draft-8',legacyHeaders:false})
const upload=multer({
  storage:multer.memoryStorage(),
  limits:{fileSize:150*1024*1024},
  fileFilter:(_req,file,cb)=>{
    const allowed=file.mimetype.startsWith('image/')||file.mimetype.startsWith('video/')
    cb(allowed?null:new Error('Only image and video files are allowed.'),allowed)
  },
})

router.post('/auth/login',authLimiter,login)
router.post('/auth/logout',logout)
router.get('/auth/me',requireAuth,me)

router.get('/media',listPublishedMedia)
router.get('/media/slots',getSiteMedia)
router.get('/albums',listAlbums)
router.get('/settings',getSettings)
router.post('/inquiries',inquiryLimiter,createInquiry)

router.use(requireAuth,requireSuperAdmin)
router.get('/admin/media',listMedia)
router.post('/admin/media/upload',upload.single('file'),uploadMedia)
router.patch('/admin/media/:id',updateMedia)
router.delete('/admin/media/:id',deleteMedia)
router.get('/admin/media/slots',listSlots)
router.put('/admin/media/slots',assignSlot)
router.delete('/admin/media/slots/:slot',removeSlot)

router.get('/admin/albums',listAllAlbums)
router.post('/admin/albums',createAlbum)
router.patch('/admin/albums/:id',updateAlbum)
router.delete('/admin/albums/:id',deleteAlbum)
router.post('/admin/albums/:id/media',addMediaToAlbum)
router.delete('/admin/albums/:id/media/:mediaId',removeMediaFromAlbum)

router.get('/admin/settings',getSettings)
router.patch('/admin/settings',updateSettings)
router.get('/admin/inquiries',listInquiries)
router.patch('/admin/inquiries/:id',updateInquiry)

export default router
