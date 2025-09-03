import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const res = await axios.get('/api/tables');
      setTables(res.data.tables || []);
    } finally { setLoading(false); }
  })(); }, []);

  if (loading) return <div className="p-6">Loading tables...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Manage Tables</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map(t => (
            <div key={t._id} className="card">
              <h3 className="text-lg font-semibold">Table #{t.tableNumber}</h3>
              <p className="text-gray-600">Capacity: {t.capacity}</p>
              <p className="text-gray-600 capitalize">Location: {t.location} • {t.area}</p>
              <p className="text-gray-600">Status: {t.currentStatus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ManageTables;
