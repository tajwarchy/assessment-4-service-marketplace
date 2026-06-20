import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps a route. If `roles` is provided, only those roles may access it.
// Usage: <ProtectedRoute roles={['VENDOR']}><VendorDashboard /></ProtectedRoute>
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}