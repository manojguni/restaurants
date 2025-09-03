import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, Users, Star, AlertCircle, CheckCircle, XCircle, MapPin } from 'lucide-react';
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

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
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

      const today = new Date().toISOString().split('T')[0];
      const todayReservations = reservations.filter(r => r.reservationDate === today);
      const pendingReservations = reservations.filter(r => r.status === 'pending');
      const availableTables = tables.filter(t => t.isActive && t.currentStatus === 'available');
      const activeTimeSlots = timeSlots.filter(t => t.isAvailable);
      const averageRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

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

      setRecentReservations(reservations.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5));
      setRecentReviews(reviews.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load dashboard data');
    } finally { setLoading(false); }
  };

  const getStatusColor = (status) => ({
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    'no-show': 'bg-gray-100 text-gray-800'
  })[status] || 'bg-gray-100 text-gray-800';

  const getStatusIcon = (status) => ({
    confirmed: CheckCircle,
    pending: AlertCircle,
    cancelled: XCircle,
    completed: CheckCircle,
    'no-show': XCircle
  })[status] || AlertCircle;

  const formatTime = (time) => new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.firstName}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center"><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Calendar className="w-6 h-6 text-blue-600"/></div><div className="ml-4"><p className="text-sm text-gray-600">Today</p><p className="text-2xl font-bold">{stats.todayReservations}</p></div></div>
          </div>
          <div className="card">
            <div className="flex items-center"><div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-yellow-600"/></div><div className="ml-4"><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold">{stats.pendingReservations}</p></div></div>
          </div>
          <div className="card">
            <div className="flex items-center"><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-green-600"/></div><div className="ml-4"><p className="text-sm text-gray-600">Available Tables</p><p className="text-2xl font-bold">{stats.availableTables}</p></div></div>
          </div>
          <div className="card">
            <div className="flex items-center"><div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><Star className="w-6 h-6 text-purple-600"/></div><div className="ml-4"><p className="text-sm text-gray-600">Avg Rating</p><p className="text-2xl font-bold">{stats.averageRating}</p></div></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/staff/tables" className="card"><div className="flex items-center"><div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center"><MapPin className="w-6 h-6 text-indigo-600"/></div><div className="ml-4"><h3 className="text-lg font-semibold">Manage Tables</h3><p className="text-gray-600">{stats.totalTables} tables</p></div></div></Link>
          <Link to="/staff/timeslots" className="card"><div className="flex items-center"><div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600"/></div><div className="ml-4"><h3 className="text-lg font-semibold">Manage Time Slots</h3><p className="text-gray-600">{stats.totalTimeSlots} slots</p></div></div></Link>
          <Link to="/staff/reservations" className="card"><div className="flex items-center"><div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center"><Calendar className="w-6 h-6 text-emerald-600"/></div><div className="ml-4"><h3 className="text-lg font-semibold">Manage Reservations</h3><p className="text-gray-600">{stats.totalReservations} total</p></div></div></Link>
          <Link to="/staff/reviews" className="card"><div className="flex items-center"><div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center"><Star className="w-6 h-6 text-pink-600"/></div><div className="ml-4"><h3 className="text-lg font-semibold">Manage Reviews</h3><p className="text-gray-600">{stats.totalReviews} reviews</p></div></div></Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Recent Reservations</h2><Link to="/staff/reservations" className="text-sm text-primary-600">View All</Link></div>
            {recentReservations.length === 0 ? (<div className="text-center py-8 text-gray-600">No recent reservations</div>) : (
              <div className="space-y-3">
                {recentReservations.map(r => { const Icon = getStatusIcon(r.status); return (
                  <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div><p className="text-sm font-medium">{r.customer?.firstName} {r.customer?.lastName}</p><p className="text-xs text-gray-500">{formatDate(r.reservationDate)} at {formatTime(r.startTime)}</p></div>
                    <span className={`badge ${getStatusColor(r.status)}`}><Icon className="w-3 h-3 mr-1"/>{r.status}</span>
                  </div>
                );})}
              </div>
            )}
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Recent Reviews</h2><Link to="/staff/reviews" className="text-sm text-primary-600">View All</Link></div>
            {recentReviews.length === 0 ? (<div className="text-center py-8 text-gray-600">No recent reviews</div>) : (
              <div className="space-y-3">
                {recentReviews.map(rv => (
                  <div key={rv._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Star className="w-4 h-4 text-yellow-500"/><span className="text-sm font-medium">{rv.rating}/5</span></div><span className="text-xs text-gray-500">{new Date(rv.createdAt).toLocaleDateString()}</span></div>
                    <p className="text-sm text-gray-700 mt-2">{rv.comment?.substring(0,100)}{rv.comment?.length>100?'...':''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
