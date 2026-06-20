const STYLES = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  PAID: 'bg-green-50 text-green-700',
  FAILED: 'bg-red-50 text-red-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function Badge({ status }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}