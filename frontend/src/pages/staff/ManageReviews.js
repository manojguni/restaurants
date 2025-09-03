import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try {
      const res = await axios.get('/api/reviews');
      setReviews(res.data.reviews || []);
    } finally { setLoading(false); }
  })(); }, []);

  if (loading) return <div className="p-6">Loading reviews...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Manage Reviews</h1>
        <div className="space-y-3">
          {reviews.map(rv => (
            <div key={rv._id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{rv.rating}/5</p>
                  <p className="text-gray-600">{rv.comment?.substring(0,120)}{rv.comment?.length > 120 ? '...' : ''}</p>
                </div>
                <span className="text-sm text-gray-500">{new Date(rv.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ManageReviews;
