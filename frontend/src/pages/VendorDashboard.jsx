import { useEffect, useState } from 'react';
import {
  getMyServices,
  createService,
  updateService,
  deleteService,
  getCategories,
} from '../api/services';
import { getVendorBookings, completeBooking } from '../api/bookings';
import Badge from '../components/Badge';

export default function VendorDashboard() {
  const [tab, setTab] = useState('services');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // service being edited, or 'new'
  const [form, setForm] = useState({ title: '', description: '', price: '', categoryId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    setLoading(true);
    Promise.all([getMyServices(), getCategories(), getVendorBookings()])
      .then(([s, c, j]) => {
        setServices(s);
        setCategories(c);
        setJobs(j);
      })
      .finally(() => setLoading(false));
  }

  function startNew() {
    setForm({ title: '', description: '', price: '', categoryId: categories[0]?.id || '' });
    setEditing('new');
    setError('');
  }

  function startEdit(s) {
    setForm({ title: s.title, description: s.description || '', price: s.price, categoryId: s.categoryId });
    setEditing(s.id);
    setError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editing === 'new') {
        await createService(payload);
      } else {
        await updateService(editing, payload);
      }
      setEditing(null);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save service');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this service listing?')) return;
    await deleteService(id);
    loadAll();
  }

  async function handleComplete(bookingId) {
    await completeBooking(bookingId);
    loadAll();
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800">Vendor dashboard</h1>

      <div className="flex gap-4 mt-6 border-b border-gray-200">
        <button
          onClick={() => setTab('services')}
          className={`pb-2 text-sm font-medium ${tab === 'services' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          My services
        </button>
        <button
          onClick={() => setTab('jobs')}
          className={`pb-2 text-sm font-medium ${tab === 'jobs' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          Received jobs
        </button>
      </div>

      {loading && <p className="text-gray-400 mt-6 text-sm">Loading...</p>}

      {!loading && tab === 'services' && (
        <div className="mt-6">
          <button
            onClick={startNew}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            + Add new service
          </button>

          {editing && (
            <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg p-4 mt-4 space-y-3">
              {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded">{error}</div>}
              <input
                placeholder="Title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Price"
                  required
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                  Save
                </button>
                <button type="button" onClick={() => setEditing(null)} className="text-gray-500 text-sm px-4 py-2">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3 mt-4">
            {services.map((s) => (
              <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.category?.name}</p>
                  <p className="text-sm text-gray-400 mt-1">{s.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">৳{Number(s.price).toFixed(0)}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => startEdit(s)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && tab === 'jobs' && (
        <div className="space-y-3 mt-6">
          {jobs.length === 0 && <p className="text-gray-400 text-sm">No jobs received yet.</p>}
          {jobs.map((j) => (
            <div key={j.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-800">{j.service?.title}</h3>
                <p className="text-sm text-gray-500">Customer: {j.user?.name} ({j.user?.email})</p>
                <p className="text-xs text-gray-400 mt-1">Booked {new Date(j.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">৳{Number(j.amount).toFixed(0)}</p>
                <div className="mt-1"><Badge status={j.status} /></div>
                {j.status === 'PAID' && (
                  <button
                    onClick={() => handleComplete(j.id)}
                    className="text-xs text-indigo-600 hover:underline mt-2 block"
                  >
                    Mark completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}