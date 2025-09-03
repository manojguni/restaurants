const express = require('express');
const { body, query, validationResult } = require('express-validator');
const TimeSlot = require('../models/TimeSlot');
const { authenticateToken, requireStaff, requireCustomer } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/timeslots
// @desc    Get available time slots with filtering
// @access  Public (for viewing), Private (for detailed info)
router.get('/', [
  query('date').optional().isISO8601().withMessage('Invalid date format'),
  query('location').optional().isIn(['indoor', 'outdoor', 'private-dining', 'bar', 'window-view', 'quiet-area']),
  query('partySize').optional().isInt({ min: 1, max: 20 }).withMessage('Party size must be between 1 and 20'),
  query('area').optional().isString().trim(),
  query('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  query('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  query('priceMin').optional().isFloat({ min: 0 }).withMessage('Minimum price must be positive'),
  query('priceMax').optional().isFloat({ min: 0 }).withMessage('Maximum price must be positive')
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
      date,
      location,
      partySize,
      area,
      startTime,
      endTime,
      priceMin,
      priceMax,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = { isAvailable: true };
    
    if (date) {
      const searchDate = new Date(date);
      filter.date = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }
    
    if (location) filter.location = location;
    if (area) filter.area = { $regex: area, $options: 'i' };
    if (partySize) filter.maxPartySize = { $gte: parseInt(partySize) };
    if (startTime) filter.startTime = { $gte: startTime };
    if (endTime) filter.endTime = { $lte: endTime };
    if (priceMin || priceMax) {
      filter.specialPricing = {};
      if (priceMin) filter.specialPricing.$gte = parseFloat(priceMin);
      if (priceMax) filter.specialPricing.$lte = parseFloat(priceMax);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get time slots with pagination
    const timeSlots = await TimeSlot.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await TimeSlot.countDocuments(filter);

    res.json({
      timeSlots,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get time slots error:', error);
    res.status(500).json({ message: 'Server error while fetching time slots' });
  }
});

// @route   POST /api/timeslots
// @desc    Create a new time slot (staff only)
// @access  Private (staff)
router.post('/', [
  authenticateToken,
  requireStaff,
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('duration').isInt({ min: 30, max: 240 }).withMessage('Duration must be between 30 and 240 minutes'),
  body('maxPartySize').isInt({ min: 1, max: 20 }).withMessage('Max party size must be between 1 and 20'),
  body('location').isIn(['indoor', 'outdoor', 'private-dining', 'bar', 'window-view', 'quiet-area']).withMessage('Valid location is required'),
  body('area').notEmpty().withMessage('Area is required'),
  body('specialPricing').optional().isFloat({ min: 0 }).withMessage('Special pricing must be positive'),
  body('specialNotes').optional().isString().trim().isLength({ max: 500 }).withMessage('Special notes too long')
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
      date,
      startTime,
      endTime,
      duration,
      maxPartySize,
      location,
      area,
      specialPricing,
      specialNotes
    } = req.body;

    // Check for time conflicts
    const conflictingSlot = await TimeSlot.findOne({
      date: new Date(date),
      location,
      isAvailable: true,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingSlot) {
      return res.status(400).json({ 
        message: 'Time slot conflicts with existing availability' 
      });
    }

    // Create new time slot
    const timeSlot = new TimeSlot({
      date: new Date(date),
      startTime,
      endTime,
      duration,
      maxPartySize,
      location,
      area,
      specialPricing,
      specialNotes,
      createdBy: req.user._id
    });

    await timeSlot.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('timeslot-created', { timeSlot });
    }

    res.status(201).json({
      message: 'Time slot created successfully',
      timeSlot: await timeSlot.populate('createdBy', 'firstName lastName')
    });

  } catch (error) {
    console.error('Create time slot error:', error);
    res.status(500).json({ message: 'Server error while creating time slot' });
  }
});

// @route   PUT /api/timeslots/:id
// @desc    Update a time slot (staff only)
// @access  Private (staff)
router.put('/:id', [
  authenticateToken,
  requireStaff,
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format'),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format'),
  body('duration').optional().isInt({ min: 30, max: 240 }).withMessage('Duration must be between 30 and 240 minutes'),
  body('maxPartySize').optional().isInt({ min: 1, max: 20 }).withMessage('Max party size must be between 1 and 20'),
  body('location').optional().isIn(['indoor', 'outdoor', 'private-dining', 'bar', 'window-view', 'quiet-area']).withMessage('Invalid location'),
  body('area').optional().notEmpty().withMessage('Area cannot be empty'),
  body('specialPricing').optional().isFloat({ min: 0 }).withMessage('Special pricing must be positive'),
  body('specialNotes').optional().isString().trim().isLength({ max: 500 }).withMessage('Special notes too long'),
  body('isAvailable').optional().isBoolean().withMessage('Availability must be boolean')
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

    const timeSlot = await TimeSlot.findById(req.params.id);
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key === 'date') {
        timeSlot[key] = new Date(req.body[key]);
      } else {
        timeSlot[key] = req.body[key];
      }
    });

    await timeSlot.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('timeslot-updated', { timeSlot });
    }

    res.json({
      message: 'Time slot updated successfully',
      timeSlot: await timeSlot.populate('createdBy', 'firstName lastName')
    });

  } catch (error) {
    console.error('Update time slot error:', error);
    res.status(500).json({ message: 'Server error while updating time slot' });
  }
});

// @route   DELETE /api/timeslots/:id
// @desc    Delete a time slot (staff only)
// @access  Private (staff)
router.delete('/:id', [authenticateToken, requireStaff], async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id);
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    await TimeSlot.findByIdAndDelete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('timeslot-deleted', { timeSlotId: req.params.id });
    }

    res.json({ message: 'Time slot deleted successfully' });

  } catch (error) {
    console.error('Delete time slot error:', error);
    res.status(500).json({ message: 'Server error while deleting time slot' });
  }
});

module.exports = router;
