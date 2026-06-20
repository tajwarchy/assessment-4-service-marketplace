import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    businessName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'VENDOR') navigate('/vendor/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-8 rounded-lg border border-gray-200">
      <h1 className="text-xl font-bold mb-6 text-gray-800">Create an account</h1>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">I am signing up as</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => update('role', 'USER')}
              className={`flex-1 py-2 rounded-md text-sm border ${
                form.role === 'USER'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              End-user
            </button>
            <button
              type="button"
              onClick={() => update('role', 'VENDOR')}
              className={`flex-1 py-2 rounded-md text-sm border ${
                form.role === 'VENDOR'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              Vendor
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {form.role === 'VENDOR' && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Business name</label>
            <input
              required
              value={form.businessName}
              onChange={(e) => update('businessName', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}