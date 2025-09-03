import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Star, MessageSquare, Image, Send, Eye, ThumbsUp, Calendar, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Reviews = () => {
  const { user, isCustomer } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [completedReservations, setCompletedReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      rating: 5,
      foodRating: 5,
      serviceRating: 5,
      ambianceRating: 5,
      comment: '',
      images: []
    }
  });

  const watchedRating = watch('rating');
  const watchedFoodRating = watch('foodRating');
  const watchedServiceRating = watch('serviceRating');
  const watchedAmbianceRating = watch('ambianceRating');

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [ratingFilter, reviews]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch public reviews
      const reviewsResponse = await axios.get('/api/reviews');
      setReviews(reviewsResponse.data.reviews || []);
      
      // Fetch user's reviews if authenticated
      if (user) {
        const userReviewsResponse = await axios.get('/api/reviews', {
          params: { customer: user._id }
        });
        setUserReviews(userReviewsResponse.data.reviews || []);
        
        // Fetch completed reservations for review submission
        if (isCustomer()) {
          const reservationsResponse = await axios.get('/api/reservations', {
            params: { status: 'completed' }
          });
          setCompletedReservations(reservationsResponse.data.reservations || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    if (ratingFilter !== 'all') {
      const minRating = parseInt(ratingFilter);
      filtered = filtered.filter(review => review.rating >= minRating);
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredReviews(filtered);
  };

  const handleSubmitReview = async (data) => {
    try {
      setSubmitting(true);
      
      const reviewData = {
        reservationId: selectedReservation._id,
        rating: parseInt(data.rating),
        foodRating: parseInt(data.foodRating),
        serviceRating: parseInt(data.serviceRating),
        ambianceRating: parseInt(data.ambianceRating),
        comment: data.comment,
        images: uploadedImages
      };

      await axios.post('/api/reviews', reviewData);
      
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setSelectedReservation(null);
      setUploadedImages([]);
      reset();
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          url: e.target.result,
          caption: file.name,
          file: file
        };
        setUploadedImages(prev => [...prev, imageData]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleHelpfulVote = async (reviewId) => {
    try {
      await axios.post(`/api/reviews/${reviewId}/helpful`);
      fetchData(); // Refresh to get updated vote count
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to register vote');
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-2">
            Share your dining experience and read what others have to say
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => r.isVerified).length}
              </p>
              <p className="text-sm text-gray-600">Verified Reviews</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {userReviews.length}
              </p>
              <p className="text-sm text-gray-600">Your Reviews</p>
            </div>
          </div>
        </div>

        {/* Submit Review Section */}
        {isCustomer() && completedReservations.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Submit a Review</h2>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="btn-primary"
              >
                {showReviewForm ? 'Cancel' : 'Write Review'}
              </button>
            </div>

            {showReviewForm && (
              <div className="border-t pt-6">
                <form onSubmit={handleSubmit(handleSubmitReview)} className="space-y-6">
                  {/* Reservation Selection */}
                  <div className="form-group">
                    <label className="form-label">Select Reservation to Review</label>
                    <select
                      {...register('reservation', { required: 'Please select a reservation' })}
                      onChange={(e) => {
                        const reservation = completedReservations.find(r => r._id === e.target.value);
                        setSelectedReservation(reservation);
                      }}
                      className="input"
                    >
                      <option value="">Choose a completed reservation</option>
                      {completedReservations.map((reservation) => (
                        <option key={reservation._id} value={reservation._id}>
                          {formatDate(reservation.reservationDate)} at {reservation.startTime} - {reservation.partySize} people
                        </option>
                      ))}
                    </select>
                    {errors.reservation && (
                      <p className="form-error">{errors.reservation.message}</p>
                    )}
                  </div>

                  {selectedReservation && (
                    <>
                      {/* Overall Rating */}
                      <div className="form-group">
                        <label className="form-label">Overall Rating</label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setValue('rating', star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= watchedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">{watchedRating}/5</span>
                        </div>
                      </div>

                      {/* Detailed Ratings */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-group">
                          <label className="form-label">Food Quality</label>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setValue('foodRating', star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= watchedFoodRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Service</label>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setValue('serviceRating', star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= watchedServiceRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Ambiance</label>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setValue('ambianceRating', star)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= watchedAmbianceRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="form-group">
                        <label htmlFor="comment" className="form-label">Your Review</label>
                        <textarea
                          id="comment"
                          {...register('comment', {
                            required: 'Please share your experience',
                            minLength: {
                              value: 10,
                              message: 'Review must be at least 10 characters long'
                            }
                          })}
                          className="input"
                          rows="4"
                          placeholder="Share your dining experience, what you liked, what could be improved..."
                        />
                        {errors.comment && (
                          <p className="form-error">{errors.comment.message}</p>
                        )}
                      </div>

                      {/* Image Upload */}
                      <div className="form-group">
                        <label className="form-label">Add Photos (Optional)</label>
                        <div className="space-y-3">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="input"
                          />
                          {uploadedImages.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {uploadedImages.map((image, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={image.url}
                                    alt={image.caption}
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowReviewForm(false);
                            setSelectedReservation(null);
                            setUploadedImages([]);
                            reset();
                          }}
                          className="btn-outline"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="btn-primary"
                        >
                          {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filter Reviews</h2>
            <div className="flex space-x-2">
              {['all', '5', '4', '3', '2', '1'].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setRatingFilter(rating)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    ratingFilter === rating
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rating === 'all' ? 'All Ratings' : `${rating}+ Stars`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="card text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">
              {ratingFilter === 'all' 
                ? "Be the first to share your experience!"
                : `No reviews with ${ratingFilter}+ stars found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {review.customer?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.customer?.firstName} {review.customer?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {review.isVerified && (
                      <span className="badge bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                    <div className="flex items-center">
                      {getRatingStars(review.rating)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Food:</span>
                    <div className="flex items-center">
                      {getRatingStars(review.foodRating)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Service:</span>
                    <div className="flex items-center">
                      {getRatingStars(review.serviceRating)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Ambiance:</span>
                    <div className="flex items-center">
                      {getRatingStars(review.ambianceRating)}
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <div className="mb-4">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                )}

                {/* Images */}
                {review.images && review.images.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={image.caption || 'Review image'}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(image.url, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff Response */}
                {review.staffResponse && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-blue-800">Staff Response</span>
                      <span className="text-xs text-blue-600">
                        {formatDate(review.staffResponse.respondedAt)}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">{review.staffResponse.comment}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleHelpfulVote(review._id)}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({review.helpfulVotes || 0})</span>
                    </button>
                  </div>
                  
                  {review.reservation && (
                    <div className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {formatDate(review.reservation.reservationDate)}
                      <Users className="w-4 h-4 inline ml-2 mr-1" />
                      {review.reservation.partySize} people
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
