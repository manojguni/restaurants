const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const TimeSlot = require('../models/TimeSlot');
const Table = require('../models/Table');
const { authenticateToken, requireCustomer, requireStaff } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reservations
// @desc    Get reservations with filtering
// @access  Private
router.get('/', [
  authenticateToken,
  query('status').optional().isIn(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show']),
  query('date').optional().isISO8601().withMessage('Invalid date format'),
  query('customer').optional().isMongoId().withMessage('Invalid customer ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const { status, date, customer, page = 1, limit = 20 } = req.query;

    // Build filter object
    const filter = {};
    
    // Staff can see all reservations, customers only see their own
    if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    } else if (customer) {
      filter.customer = customer;
    }
    
    if (status) filter.status = status;
    if (date) {
      const searchDate = new Date(date);
      filter.reservationDate = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get reservations with pagination
    const reservations = await Reservation.find(filter)
      .populate('customer', 'firstName lastName username email')
      .populate('timeSlot', 'date startTime endTime location area specialPricing')
      .populate('table', 'tableNumber capacity location area features')
      .sort({ reservationDate: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Reservation.countDocuments(filter);

    res.json({
      reservations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ message: 'Server error while fetching reservations' });
  }
});

// @route   POST /api/reservations
// @desc    Create a new reservation
// @access  Private (customers)
router.post('/', [
  authenticateToken,
  requireCustomer,
  body('timeSlotId').isMongoId().withMessage('Valid time slot ID is required'),
  body('tableId').isMongoId().withMessage('Valid table ID is required'),
  body('partySize').isInt({ min: 1, max: 20 }).withMessage('Party size must be between 1 and 20'),
  body('reservationDate').isISO8601().withMessage('Valid reservation date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('specialRequests').optional().isString().trim().isLength({ max: 500 }).withMessage('Special requests too long'),
  body('customerNotes').optional().isString().trim().isLength({ max: 500 }).withMessage('Customer notes too long')
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
      timeSlotId,
      tableId,
      partySize,
      reservationDate,
      startTime,
      endTime,
      specialRequests,
      customerNotes
    } = req.body;

    // Check if time slot exists and is available
    const timeSlot = await TimeSlot.findById(timeSlotId);
    if (!timeSlot || !timeSlot.isAvailable) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    // Check if table exists and can accommodate party size
    const table = await Table.findById(tableId);
    if (!table || !table.isActive || table.capacity < partySize) {
      return res.status(400).json({ message: 'Table not suitable for party size' });
    }

    // Check for reservation conflicts
    const conflictingReservation = await Reservation.findOne({
      table: tableId,
      reservationDate: new Date(reservationDate),
      status: { $nin: ['cancelled', 'no-show'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingReservation) {
      return res.status(400).json({ message: 'Table already reserved for this time' });
    }

    // Determine price snapshot
    const pricePerPersonAtBooking = (timeSlot.specialPricing ?? table.pricePerPerson ?? 0);
    const totalPrice = pricePerPersonAtBooking * parseInt(partySize, 10);

    // Create new reservation
    const reservation = new Reservation({
      customer: req.user._id,
      timeSlot: timeSlotId,
      table: tableId,
      partySize,
      reservationDate: new Date(reservationDate),
      startTime,
      endTime,
      specialRequests,
      customerNotes,
      priceSnapshot: {
        pricePerPersonAtBooking,
        totalPrice
      }
    });

    await reservation.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('reservation-created', { reservation });
    }

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: await reservation.populate([
        { path: 'timeSlot', select: 'date startTime endTime location area specialPricing' },
        { path: 'table', select: 'tableNumber capacity location area features' }
      ])
    });

  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Server error while creating reservation' });
  }
});

// @route   PUT /api/reservations/:id
// @desc    Update reservation status (staff) or details (customer)
// @access  Private
router.put('/:id', [
  authenticateToken,
  body('status').optional().isIn(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show']),
  body('specialRequests').optional().isString().trim().isLength({ max: 500 }),
  body('customerNotes').optional().isString().trim().isLength({ max: 500 }),
  body('staffNotes').optional().isString().trim().isLength({ max: 500 })
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

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check permissions
    if (req.user.role === 'customer' && reservation.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this reservation' });
    }

    // Update fields based on user role
    if (req.user.role === 'staff') {
      if (req.body.status) reservation.status = req.body.status;
      if (req.body.staffNotes) reservation.staffNotes = req.body.staffNotes;
    }

    if (req.user.role === 'customer') {
      if (req.body.specialRequests) reservation.specialRequests = req.body.specialRequests;
      if (req.body.customerNotes) reservation.customerNotes = req.body.customerNotes;
    }

    await reservation.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('reservation-updated', { reservation });
    }

    res.json({
      message: 'Reservation updated successfully',
      reservation: await reservation.populate([
        { path: 'customer', select: 'firstName lastName username email' },
        { path: 'timeSlot', select: 'date startTime endTime location area specialPricing' },
        { path: 'table', select: 'tableNumber capacity location area features' }
      ])
    });

  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ message: 'Server error while updating reservation' });
  }
});

// @route   DELETE /api/reservations/:id
// @desc    Cancel reservation (customers) or delete (staff)
// @access  Private
router.delete('/:id', [authenticateToken], async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check permissions
    if (req.user.role === 'customer') {
      if (reservation.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
      }
      
      // Customers can only cancel, not delete
      reservation.status = 'cancelled';
      await reservation.save();
      
      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('reservation-cancelled', { reservation });
      }
      
      res.json({ message: 'Reservation cancelled successfully' });
    } else if (req.user.role === 'staff') {
      // Staff can delete reservations
      await Reservation.findByIdAndDelete(req.params.id);
      
      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('reservation-deleted', { reservationId: req.params.id });
      }
      
      res.json({ message: 'Reservation deleted successfully' });
    }

  } catch (error) {
    console.error('Delete/cancel reservation error:', error);
    res.status(500).json({ message: 'Server error while processing reservation' });
  }
});

module.exports = router;
