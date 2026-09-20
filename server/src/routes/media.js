import { Router } from 'express'
import multer from 'multer'
import { assignSlot, deleteMedia, listMedia, listSlots, removeSlot, updateMedia, uploadMedia } from '../controllers/mediaController.js'
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')
    cb(allowed ? null : new Error('Only image and video files are allowed.'), allowed)
  },
})

router.get('/slots', listSlots)
router.use(requireAuth, requireSuperAdmin)
router.get('/', listMedia)
router.post('/upload', upload.single('file'), uploadMedia)
router.patch('/:id', updateMedia)
router.put('/slots', assignSlot)
router.delete('/slots/:slot', removeSlot)
router.delete('/:id', deleteMedia)

export default router
