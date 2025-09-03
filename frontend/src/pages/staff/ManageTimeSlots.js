import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageTimeSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const res = await axios.get('/api/timeslots');
      setSlots(res.data.timeSlots || []);
    } finally { setLoading(false); }
  })(); }, []);

  if (loading) return <div className="p-6">Loading time slots...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Manage Time Slots</h1>
        <div className="space-y-3">
          {slots.map(s => (
            <div key={s._id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{s.date} • {s.startTime} - {s.endTime}</p>
                  <p className="text-gray-600">Max party: {s.maxPartySize} • {s.location} • {s.area}</p>
                </div>
                <span className={`badge ${s.isAvailable ? 'badge-success' : 'badge-error'}`}>{s.isAvailable ? 'Available' : 'Unavailable'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ManageTimeSlots;
