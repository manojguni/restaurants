const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Table = require('../models/Table');
const { authenticateToken, requireStaff } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tables
// @desc    Get all tables with filtering
// @access  Public (for viewing), Private (for management)
router.get('/', [
  query('capacity').optional().isInt({ min: 1, max: 20 }),
  query('location').optional().isIn(['indoor', 'outdoor', 'private-dining', 'bar', 'window-view', 'quiet-area']),
  query('area').optional().isString().trim(),
  query('isActive').optional().isBoolean(),
  query('currentStatus').optional().isIn(['available', 'occupied', 'reserved', 'maintenance'])
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

    const { capacity, location, area, isActive, currentStatus } = req.query;

    // Build filter object
    const filter = {};
    if (capacity) filter.capacity = { $gte: parseInt(capacity) };
    if (location) filter.location = location;
    if (area) filter.area = { $regex: area, $options: 'i' };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (currentStatus) filter.currentStatus = currentStatus;

    // Get tables
    const tables = await Table.find(filter).sort({ tableNumber: 1 });

    res.json({ tables });

  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ message: 'Server error while fetching tables' });
  }
});

// @route   POST /api/tables
// @desc    Create a new table (staff only)
// @access  Private (staff)
router.post('/', [
  authenticateToken,
  requireStaff,
  body('tableNumber').notEmpty().withMessage('Table number is required'),
  body('capacity').isInt({ min: 1, max: 20 }).withMessage('Capacity must be between 1 and 20'),
  body('location').isIn(['indoor', 'outdoor', 'private-dining', 'bar', 'window-view', 'quiet-area']).withMessage('Valid location is required'),
  body('area').notEmpty().withMessage('Area is required'),
  body('features').optional().isArray().withMessage('Features must be an array'),
  body('pricePerPerson').optional().isFloat({ min: 0 }).withMessage('Price per person must be positive')
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
      tableNumber,
      capacity,
      location,
      area,
      features = [],
      pricePerPerson
    } = req.body;

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({ message: 'Table number already exists' });
    }

    // Create new table
    const table = new Table({
      tableNumber,
      capacity,
      location,
      area,
      features,
      pricePerPerson
    });

    await table.save();

    res.status(201).json({
      message: 'Table created successfully',
      table
    });

  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ message: 'Server error while creating table' });
  }
});

// @route   PUT /api/tables/:id
// @desc    Update a table (staff only)
// @access  Private (staff)
router.put('/:id', [
  authenticateToken,
  requireStaff,
  body('tableNumber').optional().notEmpty().withMessage('Table number cannot be empty'),
  body('capacity').optional().isInt({ min: 1, max: 20 }).withMessage('Capacity must be between 1 and 20'),
  body('location').optional().isIn(['indoor', 'outdoor', 'private-dining', 'bar', 'window-view', 'quiet-area']).withMessage('Invalid location'),
  body('area').optional().notEmpty().withMessage('Area cannot be empty'),
  body('features').optional().isArray().withMessage('Features must be an array'),
  body('pricePerPerson').optional().isFloat({ min: 0 }).withMessage('Price per person must be positive'),
  body('isActive').optional().isBoolean().withMessage('Active status must be boolean'),
  body('currentStatus').optional().isIn(['available', 'occupied', 'reserved', 'maintenance']).withMessage('Invalid status')
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

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Check if table number conflicts with existing table
    if (req.body.tableNumber && req.body.tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({ tableNumber: req.body.tableNumber });
      if (existingTable) {
        return res.status(400).json({ message: 'Table number already exists' });
      }
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      table[key] = req.body[key];
    });

    await table.save();

    res.json({
      message: 'Table updated successfully',
      table
    });

  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ message: 'Server error while updating table' });
  }
});

// @route   DELETE /api/tables/:id
// @desc    Delete a table (staff only)
// @access  Private (staff)
router.delete('/:id', [authenticateToken, requireStaff], async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    await Table.findByIdAndDelete(req.params.id);

    res.json({ message: 'Table deleted successfully' });

  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ message: 'Server error while deleting table' });
  }
});

module.exports = router;
