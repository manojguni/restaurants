const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Reservation = require('../models/Reservation');
const { authenticateToken, requireCustomer, requireStaff } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get reviews with filtering
// @access  Public (for viewing), Private (for management)
router.get('/', [
  query('rating').optional().isInt({ min: 1, max: 5 }),
  query('verified').optional().isBoolean(),
  query('customer').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { rating, verified, customer, page = 1, limit = 20 } = req.query;

    // Build filter object
    const filter = { };
    // If a customer filter is provided, show their reviews (including private)
    if (customer) {
      filter.customer = customer;
    } else {
      // Public listing for general view
      filter.isPublic = true;
    }
    if (rating) filter.rating = parseInt(rating);
    if (verified !== undefined) filter.isVerified = verified === 'true';

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get reviews with pagination
    const reviews = await Review.find(filter)
      .populate('customer', 'firstName lastName username')
      .populate('reservation', 'reservationDate startTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Review.countDocuments(filter);

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review (customers only)
// @access  Private (customers)
router.post('/', [
  authenticateToken,
  requireCustomer,
  body('reservationId').isMongoId().withMessage('Valid reservation ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('foodRating').optional().isInt({ min: 1, max: 5 }).withMessage('Food rating must be between 1 and 5'),
  body('serviceRating').optional().isInt({ min: 1, max: 5 }).withMessage('Service rating must be between 1 and 5'),
  body('ambianceRating').optional().isInt({ min: 1, max: 5 }).withMessage('Ambiance rating must be between 1 and 5'),
  body('comment').isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters'),
  body('images').optional().isArray().withMessage('Images must be an array')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const {
      reservationId,
      rating,
      foodRating,
      serviceRating,
      ambianceRating,
      comment,
      images = []
    } = req.body;

    // Check if reservation exists and belongs to the customer
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this reservation' });
    }

    // Check if review already exists for this reservation
    const existingReview = await Review.findOne({ reservation: reservationId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this reservation' });
    }

    // Create new review
    const review = new Review({
      customer: req.user._id,
      reservation: reservationId,
      rating,
      foodRating,
      serviceRating,
      ambianceRating,
      comment,
      images
    });

    await review.save();

    res.status(201).json({
      message: 'Review created successfully',
      review: await review.populate('customer', 'firstName lastName username')
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review (customers) or respond (staff)
// @access  Private
router.put('/:id', [
  authenticateToken,
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('foodRating').optional().isInt({ min: 1, max: 5 }),
  body('serviceRating').optional().isInt({ min: 1, max: 5 }),
  body('ambianceRating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ min: 10, max: 1000 }),
  body('images').optional().isArray(),
  body('staffResponse').optional().isObject()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check permissions
    if (req.user.role === 'customer' && review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this review' });
    }

    // Update fields based on user role
    if (req.user.role === 'customer') {
      if (req.body.rating) review.rating = req.body.rating;
      if (req.body.foodRating) review.foodRating = req.body.foodRating;
      if (req.body.serviceRating) review.serviceRating = req.body.serviceRating;
      if (req.body.ambianceRating) review.ambianceRating = req.body.ambianceRating;
      if (req.body.comment) review.comment = req.body.comment;
      if (req.body.images) review.images = req.body.images;
    }

    if (req.user.role === 'staff' && req.body.staffResponse) {
      review.staffResponse = {
        comment: req.body.staffResponse.comment,
        respondedBy: req.user._id,
        respondedAt: new Date()
      };
    }

    await review.save();

    res.json({
      message: 'Review updated successfully',
      review: await review.populate([
        { path: 'customer', select: 'firstName lastName username' },
        { path: 'staffResponse.respondedBy', select: 'firstName lastName username' }
      ])
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error while updating review' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review (customers) or hide (staff)
// @access  Private
router.delete('/:id', [authenticateToken], async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check permissions
    if (req.user.role === 'customer' && review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    if (req.user.role === 'customer') {
      // Customers can delete their own reviews
      await Review.findByIdAndDelete(req.params.id);
      res.json({ message: 'Review deleted successfully' });
    } else if (req.user.role === 'staff') {
      // Staff can hide reviews
      review.isPublic = false;
      await review.save();
      res.json({ message: 'Review hidden successfully' });
    }

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error while processing review' });
  }
});

// @route   POST /api/reviews/:id/verify
// @desc    Verify a review (staff only)
// @access  Private (staff)
router.post('/:id/verify', [authenticateToken, requireStaff], async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isVerified = !review.isVerified;
    await review.save();

    res.json({
      message: `Review ${review.isVerified ? 'verified' : 'unverified'} successfully`,
      review
    });

  } catch (error) {
    console.error('Verify review error:', error);
    res.status(500).json({ message: 'Server error while verifying review' });
  }
});

module.exports = router;
