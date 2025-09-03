import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import TimeSlots from './pages/TimeSlots';
import Reservations from './pages/Reservations';
import Reviews from './pages/Reviews';
import Profile from './pages/Profile';
import StaffDashboard from './pages/staff/StaffDashboard';
import ManageTables from './pages/staff/ManageTables';
import ManageTimeSlots from './pages/staff/ManageTimeSlots';
import ManageReservations from './pages/staff/ManageReservations';
import ManageReviews from './pages/staff/ManageReviews';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
          <Route path="/timeslots" element={<TimeSlots />} />
          <Route path="/reviews" element={<Reviews />} />

          {/* Protected Customer Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reservations" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Reservations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Protected Staff Routes */}
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/tables" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <ManageTables />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/timeslots" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <ManageTimeSlots />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/reservations" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <ManageReservations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff/reviews" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <ManageReviews />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

// App Component with Providers
const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppContent />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
