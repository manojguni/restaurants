const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  foodRating: {
    type: Number,
    min: 1,
    max: 5
  },
  serviceRating: {
    type: Number,
    min: 1,
    max: 5
  },
  ambianceRating: {
    type: Number,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 100
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  staffResponse: {
    comment: {
      type: String,
      trim: true,
      maxlength: 500
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ rating: 1, createdAt: -1 });
reviewSchema.index({ customer: 1, createdAt: -1 });
reviewSchema.index({ isPublic: 1, isVerified: 1 });
// Enforce one review per reservation
reviewSchema.index({ reservation: 1 }, { unique: true });

// Virtual for average rating
reviewSchema.virtual('averageRating').get(function() {
  const ratings = [this.foodRating, this.serviceRating, this.ambianceRating].filter(r => r);
  if (ratings.length === 0) return this.rating;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Method to calculate overall rating
reviewSchema.methods.calculateOverallRating = function() {
  const ratings = [this.foodRating, this.serviceRating, this.ambianceRating].filter(r => r);
  if (ratings.length === 0) return this.rating;
  return Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
};

module.exports = mongoose.model('Review', reviewSchema);
