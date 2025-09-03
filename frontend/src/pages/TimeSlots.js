import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Users, MapPin, DollarSign, Filter, Search, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TimeSlots = () => {
  const { user, isCustomer } = useAuth();
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      location: '',
      partySize: '',
      area: '',
      time: '',
      price: ''
    }
  });

  const filters = watch();

  // Fetch time slots
  useEffect(() => {
    fetchTimeSlots();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, timeSlots]);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/timeslots');
      setTimeSlots(response.data.timeSlots || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to load time slots');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...timeSlots];

    if (filters.date) {
      filtered = filtered.filter(slot => slot.date === filters.date);
    }

    if (filters.location) {
      filtered = filtered.filter(slot => slot.location === filters.location);
    }

    if (filters.partySize) {
      filtered = filtered.filter(slot => slot.maxPartySize >= parseInt(filters.partySize));
    }

    if (filters.area) {
      filtered = filtered.filter(slot => slot.area === filters.area);
    }

    if (filters.time) {
      filtered = filtered.filter(slot => slot.startTime === filters.time);
    }

    if (filters.price) {
      filtered = filtered.filter(slot => slot.specialPricing <= parseInt(filters.price));
    }

    setFilteredSlots(filtered);
  };

  const handleBookSlot = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const onSubmitBooking = async (data) => {
    try {
      setBookingLoading(true);

      const partySize = parseInt(data.partySize);

      // Fetch a suitable table for this slot and party size
      const tablesResp = await axios.get('/api/tables', {
        params: {
          capacity: partySize,
          location: selectedSlot.location,
          area: selectedSlot.area,
          isActive: true,
          currentStatus: 'available'
        }
      });
      const tables = tablesResp.data?.tables || [];
      if (!tables.length) {
        toast.error('No suitable table available for this time and party size');
        return;
      }

      // Create reservation with API-expected fields
      const reservationData = {
        timeSlotId: selectedSlot._id,
        tableId: tables[0]._id,
        partySize,
        reservationDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        specialRequests: data.specialRequests || '',
        customerNotes: data.customerNotes || ''
      };

      await axios.post('/api/reservations', reservationData);

      toast.success('Reservation created successfully!');
      setShowBookingModal(false);
      setSelectedSlot(null);
      reset();

      // Refresh time slots to show updated availability
      fetchTimeSlots();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    } finally {
      setBookingLoading(false);
    }
  };

  const clearFilters = () => {
    reset();
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLocationColor = (location) => {
    const colors = {
      'indoor': 'bg-blue-100 text-blue-800',
      'outdoor': 'bg-green-100 text-green-800',
      'patio': 'bg-orange-100 text-orange-800',
      'rooftop': 'bg-purple-100 text-purple-800'
    };
    return colors[location] || 'bg-gray-100 text-gray-800';
  };

  const getAreaColor = (area) => {
    const colors = {
      'main': 'bg-indigo-100 text-indigo-800',
      'bar': 'bg-amber-100 text-amber-800',
      'private': 'bg-pink-100 text-pink-800',
      'garden': 'bg-emerald-100 text-emerald-800'
    };
    return colors[area] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available time slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Time Slots</h1>
          <p className="text-gray-600 mt-2">
            Browse and book available dining times
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 btn-outline"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>

          {showFilters && (
            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="form-group">
                <label htmlFor="date" className="form-label">Date</label>
                <input
                  id="date"
                  type="date"
                  {...register('date')}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location" className="form-label">Location</label>
                <select {...register('location')} className="input">
                  <option value="">All Locations</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="patio">Patio</option>
                  <option value="rooftop">Rooftop</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="partySize" className="form-label">Party Size</label>
                <input
                  id="partySize"
                  type="number"
                  min="1"
                  max="20"
                  {...register('partySize')}
                  className="input"
                  placeholder="Min party size"
                />
              </div>

              <div className="form-group">
                <label htmlFor="area" className="form-label">Area</label>
                <select {...register('area')} className="input">
                  <option value="">All Areas</option>
                  <option value="main">Main Dining</option>
                  <option value="bar">Bar Area</option>
                  <option value="private">Private Room</option>
                  <option value="garden">Garden</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="time" className="form-label">Time</label>
                <select {...register('time')} className="input">
                  <option value="">All Times</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="21:00">9:00 PM</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="price" className="form-label">Max Price per Person</label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('price')}
                  className="input"
                  placeholder="Max price"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex space-x-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-outline"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="btn-primary"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredSlots.length} of {timeSlots.length} available time slots
            </p>
            {filteredSlots.length > 0 && (
              <div className="text-sm text-gray-500">
                {filteredSlots.filter(slot => slot.isAvailable).length} slots available
              </div>
            )}
          </div>
        </div>

        {/* Time Slots Grid */}
        {filteredSlots.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No time slots found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or check back later for more availability.
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlots.map((slot) => (
              <div key={slot._id} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  {/* Date and Time */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatDate(slot.date)}
                      </h3>
                      <span className={`badge ${slot.isAvailable ? 'badge-success' : 'badge-error'}`}>
                        {slot.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Up to {slot.maxPartySize} people</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="capitalize">{slot.location}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>${slot.specialPricing || 'Market rate'} per person</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`badge ${getLocationColor(slot.location)}`}>
                      {slot.location}
                    </span>
                    <span className={`badge ${getAreaColor(slot.area)}`}>
                      {slot.area}
                    </span>
                    {slot.features && slot.features.map((feature, index) => (
                      <span key={index} className="badge bg-gray-100 text-gray-800">
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Special Notes */}
                  {slot.specialNotes && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">{slot.specialNotes}</p>
                    </div>
                  )}

                  {/* Action Button */}
                  {slot.isAvailable && isCustomer() ? (
                    <button
                      onClick={() => handleBookSlot(slot)}
                      className="w-full btn-primary"
                    >
                      Book This Time
                    </button>
                  ) : !slot.isAvailable ? (
                    <button disabled className="w-full btn-disabled">
                      Unavailable
                    </button>
                  ) : (
                    <button disabled className="w-full btn-disabled">
                      Staff Only
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Book Reservation
              </h2>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Selected Time Slot</h3>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.startTime)}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedSlot.location} • {selectedSlot.area}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="partySize" className="form-label">Party Size</label>
                  <input
                    id="partySize"
                    type="number"
                    min="1"
                    max={selectedSlot.maxPartySize}
                    {...register('partySize', {
                      required: 'Party size is required',
                      min: {
                        value: 1,
                        message: 'Party size must be at least 1'
                      },
                      max: {
                        value: selectedSlot.maxPartySize,
                        message: `Party size cannot exceed ${selectedSlot.maxPartySize}`
                      }
                    })}
                    className="input"
                    defaultValue="2"
                  />
                  {errors.partySize && (
                    <p className="form-error">{errors.partySize.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="specialRequests" className="form-label">Special Requests</label>
                  <textarea
                    id="specialRequests"
                    {...register('specialRequests')}
                    className="input"
                    rows="3"
                    placeholder="Any special requests or dietary requirements?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customerNotes" className="form-label">Additional Notes</label>
                  <textarea
                    id="customerNotes"
                    {...register('customerNotes')}
                    className="input"
                    rows="2"
                    placeholder="Any additional information for the staff?"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedSlot(null);
                    }}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="btn-primary flex-1"
                  >
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlots;
