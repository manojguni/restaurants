import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const res = await axios.get('/api/reservations');
      setReservations(res.data.reservations || []);
    } finally { setLoading(false); }
  })(); }, []);

  if (loading) return <div className="p-6">Loading reservations...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Manage Reservations</h1>
        <div className="space-y-3">
          {reservations.map(r => (
            <div key={r._id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{r.reservationDate} • {r.startTime} - {r.endTime}</p>
                  <p className="text-gray-600">Party: {r.partySize} • Status: {r.status}</p>
                </div>
                <span className="text-sm text-gray-500">{r.customer?.firstName} {r.customer?.lastName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ManageReservations;
