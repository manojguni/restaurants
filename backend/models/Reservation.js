const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timeSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  partySize: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  reservationDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 500
  },
  customerNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  staffNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isWalkIn: {
    type: Boolean,
    default: false
  },
  // Price snapshot captured at booking time for accurate history/reporting
  priceSnapshot: {
    pricePerPersonAtBooking: { type: Number, min: 0 },
    totalPrice: { type: Number, min: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
reservationSchema.index({ customer: 1, reservationDate: 1 });
reservationSchema.index({ table: 1, reservationDate: 1, startTime: 1 });
reservationSchema.index({ status: 1, reservationDate: 1 });

// Virtual for formatted reservation date
reservationSchema.virtual('formattedDate').get(function() {
  return this.reservationDate.toISOString().split('T')[0];
});

// Virtual for time range
reservationSchema.virtual('timeRange').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Pre-save middleware to update updatedAt
reservationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
