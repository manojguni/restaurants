import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Users, MapPin, Edit, X, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Reservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Fetch reservations
  useEffect(() => {
    fetchReservations();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [statusFilter, reservations]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reservations');
      setReservations(response.data.reservations || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reservations];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }

    // Sort by date and time (upcoming first)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.reservationDate}T${a.startTime}`);
      const dateB = new Date(`${b.reservationDate}T${b.startTime}`);
      return dateA - dateB;
    });

    setFilteredReservations(filtered);
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const handleCancelReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      setCancelling(true);
      await axios.delete(`/api/reservations/${selectedReservation._id}`);
      
      toast.success('Reservation cancelled successfully');
      setShowCancelModal(false);
      setSelectedReservation(null);
      
      // Refresh reservations
      fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800',
      'no-show': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'confirmed': CheckCircle,
      'pending': AlertCircle,
      'cancelled': XCircle,
      'completed': CheckCircle,
      'no-show': XCircle
    };
    return icons[status] || AlertCircle;
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
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (reservation) => {
    const reservationDateTime = new Date(`${reservation.reservationDate}T${reservation.startTime}`);
    const now = new Date();
    return reservationDateTime > now && reservation.status !== 'cancelled';
  };

  const isToday = (date) => {
    const today = new Date().toDateString();
    return new Date(date).toDateString() === today;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
          <p className="text-gray-600 mt-2">
            View and manage your dining reservations
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {reservations.filter(r => isUpcoming(r)).length}
              </p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {reservations.filter(r => r.status === 'confirmed').length}
              </p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {reservations.filter(r => r.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {reservations.filter(r => r.status === 'cancelled').length}
              </p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filter by Status</h2>
            <div className="flex space-x-2">
              {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === 'all' 
                ? "You don't have any reservations yet. Start by booking a table!"
                : `No ${statusFilter} reservations found.`
              }
            </p>
            {statusFilter === 'all' && (
              <a href="/timeslots" className="btn-primary">
                Book a Table
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => {
              const StatusIcon = getStatusIcon(reservation.status);
              const upcoming = isUpcoming(reservation);
              const today = isToday(reservation.reservationDate);

              return (
                <div
                  key={reservation._id}
                  className={`card transition-all duration-200 ${
                    upcoming && today
                      ? 'ring-2 ring-primary-200 bg-primary-50'
                      : upcoming
                      ? 'hover:shadow-md'
                      : 'opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatDate(reservation.reservationDate)}
                            {today && (
                              <span className="ml-2 badge bg-primary-100 text-primary-800">
                                Today
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-600">
                            {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`badge ${getStatusColor(reservation.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </span>
                          {upcoming && (
                            <span className="badge bg-blue-100 text-blue-800">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{reservation.partySize} people</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="capitalize">
                            {reservation.timeSlot?.location || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="capitalize">
                            {reservation.timeSlot?.area || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {reservation.specialRequests && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Special Requests:</strong> {reservation.specialRequests}
                          </p>
                        </div>
                      )}

                      {/* Customer Notes */}
                      {reservation.customerNotes && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Your Notes:</strong> {reservation.customerNotes}
                          </p>
                        </div>
                      )}

                      {/* Staff Notes */}
                      {reservation.staffNotes && (
                        <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <p className="text-sm text-purple-800">
                            <strong>Staff Notes:</strong> {reservation.staffNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleViewDetails(reservation)}
                        className="btn-outline text-sm p-2"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {upcoming && reservation.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelReservation(reservation)}
                          className="btn-outline text-sm p-2 text-red-600 border-red-300 hover:bg-red-50"
                          title="Cancel Reservation"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Reservation Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-gray-900">
                      {formatDate(selectedReservation.reservationDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Time</label>
                    <p className="text-gray-900">
                      {formatTime(selectedReservation.startTime)} - {formatTime(selectedReservation.endTime)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Party Size</label>
                    <p className="text-gray-900">{selectedReservation.partySize} people</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`badge ${getStatusColor(selectedReservation.status)}`}>
                      {selectedReservation.status.charAt(0).toUpperCase() + selectedReservation.status.slice(1)}
                    </span>
                  </div>
                </div>

                {selectedReservation.specialRequests && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Special Requests</label>
                    <p className="text-gray-900">{selectedReservation.specialRequests}</p>
                  </div>
                )}

                {selectedReservation.customerNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Your Notes</label>
                    <p className="text-gray-900">{selectedReservation.customerNotes}</p>
                  </div>
                )}

                {selectedReservation.staffNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Staff Notes</label>
                    <p className="text-gray-900">{selectedReservation.staffNotes}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Reservation ID: {selectedReservation._id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(selectedReservation.createdAt).toLocaleDateString()}
                  </p>
                  {selectedReservation.updatedAt && (
                    <p className="text-sm text-gray-500">
                      Last Updated: {new Date(selectedReservation.updatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Cancel Reservation</h2>
                  <p className="text-gray-600">Are you sure you want to cancel this reservation?</p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Reservation Details</h3>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedReservation.reservationDate)} at {formatTime(selectedReservation.startTime)}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedReservation.partySize} people • {selectedReservation.timeSlot?.location || 'N/A'}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="btn-outline flex-1"
                >
                  Keep Reservation
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={cancelling}
                  className="btn-error flex-1"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
