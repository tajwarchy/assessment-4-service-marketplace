import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-lg font-bold text-indigo-600">
        ServiceHub
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link to="/" className="text-gray-600 hover:text-indigo-600">
          Marketplace
        </Link>

        {!user && (
          <>
            <Link to="/login" className="text-gray-600 hover:text-indigo-600">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </>
        )}

        {user && user.role === 'USER' && (
          <Link to="/my-bookings" className="text-gray-600 hover:text-indigo-600">
            My orders
          </Link>
        )}

        {user && user.role === 'VENDOR' && (
          <Link to="/vendor/dashboard" className="text-gray-600 hover:text-indigo-600">
            Vendor dashboard
          </Link>
        )}

        {user && user.role === 'ADMIN' && (
          <Link to="/admin" className="text-gray-600 hover:text-indigo-600">
            Admin
          </Link>
        )}

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-gray-500">
              {user.name} <span className="text-xs text-gray-400">({user.role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}