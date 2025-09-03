import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (user) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect if no user
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user]);

  // Join reservation room for real-time updates
  const joinReservationRoom = (reservationId) => {
    if (socket && isConnected) {
      socket.emit('join-reservation-room', reservationId);
    }
  };

  // Leave reservation room
  const leaveReservationRoom = (reservationId) => {
    if (socket && isConnected) {
      socket.emit('leave-reservation-room', reservationId);
    }
  };

  // Listen for reservation updates
  const onReservationUpdate = (callback) => {
    if (socket) {
      socket.on('reservation-updated', callback);
      return () => socket.off('reservation-updated', callback);
    }
  };

  // Listen for new reservations
  const onReservationCreated = (callback) => {
    if (socket) {
      socket.on('reservation-created', callback);
      return () => socket.off('reservation-created', callback);
    }
  };

  // Listen for reservation cancellations
  const onReservationCancelled = (callback) => {
    if (socket) {
      socket.on('reservation-cancelled', callback);
      return () => socket.off('reservation-cancelled', callback);
    }
  };

  // Listen for time slot updates
  const onTimeSlotUpdate = (callback) => {
    if (socket) {
      socket.on('timeslot-updated', callback);
      return () => socket.off('timeslot-updated', callback);
    }
  };

  // Listen for new time slots
  const onTimeSlotCreated = (callback) => {
    if (socket) {
      socket.on('timeslot-created', callback);
      return () => socket.off('timeslot-created', callback);
    }
  };

  // Listen for time slot deletions
  const onTimeSlotDeleted = (callback) => {
    if (socket) {
      socket.on('timeslot-deleted', callback);
      return () => socket.off('timeslot-deleted', callback);
    }
  };

  const value = {
    socket,
    isConnected,
    joinReservationRoom,
    leaveReservationRoom,
    onReservationUpdate,
    onReservationCreated,
    onReservationCancelled,
    onTimeSlotUpdate,
    onTimeSlotCreated,
    onTimeSlotDeleted
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
