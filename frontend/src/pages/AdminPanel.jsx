import { useEffect, useState } from 'react';
import { getAllUsers, getAdminStats } from '../api/admin';

const ROLE_STYLES = {
  ADMIN: 'bg-purple-50 text-purple-700',
  VENDOR: 'bg-blue-50 text-blue-700',
  USER: 'bg-gray-100 text-gray-600',
};

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getAdminStats()])
      .then(([u, s]) => {
        setUsers(u);
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800">Admin panel</h1>

      {loading && <p className="text-gray-400 mt-6 text-sm">Loading...</p>}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          {[
            ['End-users', stats.userCount],
            ['Vendors', stats.vendorCount],
            ['Services', stats.serviceCount],
            ['Bookings', stats.bookingCount],
            ['Paid orders', stats.paidCount],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-800 mt-8">All users</h2>
      <div className="bg-white border border-gray-200 rounded-lg mt-3 divide-y divide-gray-100">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{u.name}</p>
              <p className="text-xs text-gray-500">{u.email}</p>
              {u.vendorProfile && (
                <p className="text-xs text-gray-400 mt-0.5">{u.vendorProfile.businessName}</p>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_STYLES[u.role]}`}>
              {u.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}