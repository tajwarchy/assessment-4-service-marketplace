import { useEffect, useState } from 'react';
import { getMyBookings } from '../api/bookings';
import Badge from '../components/Badge';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800">My orders</h1>
      <p className="text-gray-500 mt-1">Your service booking history.</p>

      {loading && <p className="text-gray-400 mt-8 text-sm">Loading...</p>}
      {!loading && bookings.length === 0 && (
        <p className="text-gray-400 mt-8 text-sm">No orders yet. Browse the marketplace to book a service.</p>
      )}

      <div className="space-y-3 mt-6">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-800">{b.service?.title}</h3>
              <p className="text-sm text-gray-500">{b.service?.vendor?.businessName}</p>
              <p className="text-xs text-gray-400 mt-1">
                Booked {new Date(b.createdAt).toLocaleString()}
              </p>
              {b.transaction && (
                <p className="text-xs text-gray-400 mt-1">
                  Ref: <span className="font-mono">{b.transaction.sandboxRef}</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">৳{Number(b.amount).toFixed(0)}</p>
              <div className="mt-1">
                <Badge status={b.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}