import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Users, Star, TrendingUp, AlertCircle, CheckCircle, XCircle, MapPin, DollarSign } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReservations: 0,
    todayReservations: 0,
    pendingReservations: 0,
    totalReviews: 0,
    averageRating: 0,
    totalTables: 0,
    availableTables: 0,
    totalTimeSlots: 0,
    activeTimeSlots: 0
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const [reservationsRes, reviewsRes, tablesRes, timeSlotsRes] = await Promise.all([
        axios.get('/api/reservations'),
        axios.get('/api/reviews'),
        axios.get('/api/tables'),
        axios.get('/api/timeslots')
      ]);

      const reservations = reservationsRes.data.reservations || [];
      const reviews = reviewsRes.data.reviews || [];
      const tables = tablesRes.data.tables || [];
      const timeSlots = timeSlotsRes.data.timeSlots || [];

      // Calculate today's date
      const today = new Date().toISOString().split('T')[0];

      // Calculate statistics
      const todayReservations = reservations.filter(r => r.reservationDate === today);
      const pendingReservations = reservations.filter(r => r.status === 'pending');
      const availableTables = tables.filter(t => t.isActive && t.currentStatus === 'available');
      const activeTimeSlots = timeSlots.filter(t => t.isAvailable);

      const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

      setStats({
        totalReservations: reservations.length,
        todayReservations: todayReservations.length,
        pendingReservations: pendingReservations.length,
        totalReviews: reviews.length,
        averageRating: parseFloat(averageRating),
        totalTables: tables.length,
        availableTables: availableTables.length,
        totalTimeSlots: timeSlots.length,
        activeTimeSlots: activeTimeSlots.length
      });

      // Get recent reservations (last 5)
      const sortedReservations = reservations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentReservations(sortedReservations);

      // Get recent reviews (last 5)
      const sortedReviews = reviews
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentReviews(sortedReviews);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName}! Here's what's happening today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Reservations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayReservations}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReservations}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Tables</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableTables}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/staff/tables"
            className="card hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  Manage Tables
                </h3>
                <p className="text-gray-600">
                  {stats.totalTables} tables • {stats.availableTables} available
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/staff/timeslots"
            className="card hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                  Manage Time Slots
                </h3>
                <p className="text-gray-600">
                  {stats.totalTimeSlots} slots • {stats.activeTimeSlots} active
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/staff/reservations"
            className="card hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  Manage Reservations
                </h3>
                <p className="text-gray-600">
                  {stats.totalReservations} total • {stats.pendingReservations} pending
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/staff/reviews"
            className="card hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                <Star className="w-6 h-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                  Manage Reviews
                </h3>
                <p className="text-gray-600">
                  {stats.totalReviews} reviews • {stats.averageRating} avg rating
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/staff/users"
            className="card hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Manage Users
                </h3>
                <p className="text-gray-600">
                  Customer and staff accounts
                </p>
              </div>
            </div>
          </Link>

          <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                Quick Actions
              </h3>
              <p className="text-primary-700 mb-4">
                Common tasks and shortcuts
              </p>
              <div className="flex flex-col space-y-2">
                <button className="btn-primary text-sm">
                  Create Time Slot
                </button>
                <button className="btn-outline border-primary-300 text-primary-700 hover:bg-primary-50 text-sm">
                  View Today's Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reservations */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Reservations</h2>
              <Link
                to="/staff/reservations"
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                View All
              </Link>
            </div>
            
            {recentReservations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No recent reservations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReservations.map((reservation) => {
                  const StatusIcon = getStatusIcon(reservation.status);
                  return (
                    <div key={reservation._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {reservation.customer?.firstName} {reservation.customer?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(reservation.reservationDate)} at {formatTime(reservation.startTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${getStatusColor(reservation.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {reservation.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {reservation.partySize} people
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
              <Link
                to="/staff/reviews"
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                View All
              </Link>
            </div>
            
            {recentReviews.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No recent reviews</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <div key={review._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-yellow-600 fill-current" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {review.rating}/5
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {review.comment?.substring(0, 100)}
                      {review.comment?.length > 100 && '...'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {review.customer?.firstName} {review.customer?.lastName}
                      </span>
                      {review.isVerified && (
                        <span className="badge bg-green-100 text-green-800 text-xs">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="card mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Reservation System</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Database</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Real-time Updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
