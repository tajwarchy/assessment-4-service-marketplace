import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServiceById } from '../api/services';
import { createBooking, payForBooking } from '../api/bookings';
import { useAuth } from '../context/AuthContext';

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('view'); // view -> checkout -> paying -> done
  const [booking, setBooking] = useState(null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    getServiceById(id)
      .then(setService)
      .catch(() => setError('Service not found'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBookNow() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'USER') {
      setError('Only end-user accounts can book services.');
      return;
    }
    setError('');
    try {
      const newBooking = await createBooking(service.id);
      setBooking(newBooking);
      setStep('checkout');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start booking');
    }
  }

  async function handlePay(e) {
    e.preventDefault();
    setError('');
    setStep('paying');
    try {
      const res = await payForBooking(booking.id, cardNumber.replace(/\s/g, ''));
      setResult(res);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
      setStep('checkout');
    }
  }

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  if (!service) return <p className="text-center mt-10 text-red-500">{error || 'Not found'}</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-indigo-600 mb-4">
        ← Back to marketplace
      </button>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
          {service.category?.name}
        </span>
        <h1 className="text-2xl font-bold text-gray-800 mt-3">{service.title}</h1>
        <p className="text-gray-600 mt-2">{service.description}</p>
        <p className="text-sm text-gray-400 mt-3">
          Vendor: <span className="text-gray-600">{service.vendor?.businessName}</span>
        </p>
        <p className="text-2xl font-bold text-gray-800 mt-4">৳{Number(service.price).toFixed(0)}</p>

        {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mt-4">{error}</div>}

        {step === 'view' && (
          <button
            onClick={handleBookNow}
            className="mt-6 w-full bg-indigo-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Book this service
          </button>
        )}

        {step === 'checkout' && (
          <form onSubmit={handlePay} className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="font-medium text-gray-800 mb-3">Sandbox checkout</h2>
            <p className="text-xs text-gray-400 mb-4">
              This is a simulated payment — no real card or money is involved. Use any 16-digit
              number to simulate success, or end it in <code className="bg-gray-100 px-1 rounded">0000</code> to simulate a declined payment.
            </p>
            <label className="block text-sm text-gray-600 mb-1">Card number (sandbox)</label>
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="mt-4 w-full bg-indigo-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Pay ৳{Number(service.price).toFixed(0)} (sandbox)
            </button>
          </form>
        )}

        {step === 'paying' && (
          <p className="mt-6 text-center text-sm text-gray-400">Processing sandbox payment...</p>
        )}

        {step === 'done' && result && (
          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            {result.booking.status === 'PAID' ? (
              <>
                <p className="text-green-600 font-medium">✓ Payment successful</p>
                <p className="text-sm text-gray-500 mt-1">{result.message}</p>
              </>
            ) : (
              <>
                <p className="text-red-600 font-medium">✗ Payment declined</p>
                <p className="text-sm text-gray-500 mt-1">{result.message}</p>
              </>
            )}
            <button
              onClick={() => navigate('/my-bookings')}
              className="mt-4 text-sm text-indigo-600 hover:underline"
            >
              View my orders →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}