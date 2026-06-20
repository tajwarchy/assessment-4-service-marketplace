import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import Register from './pages/Register';

function VendorDashboardPlaceholder() {
  return <div className="max-w-5xl mx-auto mt-10 px-4 text-gray-500">Vendor dashboard — Phase 6</div>;
}
function AdminPlaceholder() {
  return <div className="max-w-5xl mx-auto mt-10 px-4 text-gray-500">Admin panel — Phase 6</div>;
}
function MyBookingsPlaceholder() {
  return <div className="max-w-5xl mx-auto mt-10 px-4 text-gray-500">My bookings — Phase 6</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Marketplace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute roles={['USER']}>
                  <MyBookingsPlaceholder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute roles={['VENDOR']}>
                  <VendorDashboardPlaceholder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminPlaceholder />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}