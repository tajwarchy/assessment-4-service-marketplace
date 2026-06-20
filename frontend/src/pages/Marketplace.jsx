import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices, getCategories } from '../api/services';

export default function Marketplace() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;

    const timeout = setTimeout(() => {
      getServices(params)
        .then(setServices)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300); // debounce search input

    return () => clearTimeout(timeout);
  }, [search, categoryId]);

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800">Find a service</h1>
      <p className="text-gray-500 mt-1">Browse offerings from vendors near you.</p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-400 mt-8 text-sm">Loading services...</p>}

      {!loading && services.length === 0 && (
        <p className="text-gray-400 mt-8 text-sm">No services found. Try a different search.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {services.map((s) => (
          <Link
            to={`/services/${s.id}`}
            key={s.id}
            className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                {s.category?.name}
              </span>
              <span className="text-sm font-semibold text-gray-800">৳{Number(s.price).toFixed(0)}</span>
            </div>
            <h3 className="font-medium text-gray-800">{s.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.description}</p>
            <p className="text-xs text-gray-400 mt-3">by {s.vendor?.businessName}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}