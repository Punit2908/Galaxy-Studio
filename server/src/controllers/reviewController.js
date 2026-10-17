import mongoose from 'mongoose'
import Review from '../models/Review.js'

const publicReviewFields = 'name rating text createdAt'

export async function listApprovedReviews(_req, res) {
  const reviews = await Review.find({ status: { $ne: 'rejected' } })
    .select(publicReviewFields)
    .sort({ createdAt: -1 })
    .lean()

  res.json({ reviews })
}

export async function createReview(req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : ''
  const rating = req.body.rating

  if (name.length < 2 || name.length > 120) {
    return res.status(400).json({ message: 'Name must be between 2 and 120 characters.' })
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' })
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5.' })
  }

  if (text.length < 3 || text.length > 2000) {
    return res.status(400).json({ message: 'Review must be between 3 and 2000 characters.' })
  }

  const review = await Review.create({ name, email, rating, text, status: 'approved' })
  res.status(201).json({
    message: 'Thank you for your review. It is now published.',
    review: {
      id: review._id,
      name: review.name,
      rating: review.rating,
      text: review.text,
      status: review.status,
      createdAt: review.createdAt,
    },
  })
}

export async function listAdminReviews(_req, res) {
  const reviews = await Review.find()
    .sort({ status: 1, createdAt: -1 })
    .lean()

  res.json({ reviews })
}

export async function updateReviewStatus(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid review ID.' })
  }

  const { status } = req.body
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be pending, approved, or rejected.' })
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  ).lean()

  if (!review) return res.status(404).json({ message: 'Review not found.' })
  res.json({ review })
}
