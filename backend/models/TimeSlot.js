const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 30,
    max: 240
  },
  maxPartySize: {
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
  // Tag-like features to aid filtering and UI badges (e.g., lunch, dinner, patio)
  features: [{
    type: String,
    trim: true
  }],
  specialPricing: {
    type: Number,
    min: 0
  },
  specialNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
timeSlotSchema.index({ date: 1, startTime: 1, location: 1, isAvailable: 1 });
timeSlotSchema.index({ date: 1, isAvailable: 1 });

// Virtual for formatted date
timeSlotSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Virtual for time range
timeSlotSchema.virtual('timeRange').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Ensure startTime is before endTime
function timeToMinutes(time) {
  const parts = time.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

timeSlotSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    if (timeToMinutes(this.startTime) >= timeToMinutes(this.endTime)) {
      return next(new Error('startTime must be before endTime'));
    }
  }
  next();
});

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
