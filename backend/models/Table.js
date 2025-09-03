const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  location: {
    type: String,
    required: true,
    enum: ['indoor', 'outdoor', 'private-dining', 'bar', 'window-view', 'quiet-area']
  },
  area: {
    type: String,
    required: true,
    trim: true
  },
  features: [{
    type: String,
    enum: ['window-view', 'quiet-area', 'private', 'accessible', 'high-chair-available']
  }],
  pricePerPerson: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentStatus: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Index for efficient queries
tableSchema.index({ capacity: 1, location: 1, isActive: 1 });

module.exports = mongoose.model('Table', tableSchema);
