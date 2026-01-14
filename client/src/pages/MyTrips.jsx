import { useEffect, useState } from 'react';
import API from '../api';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';

const MyTrips = () => {
  const [itineraries, setItineraries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [deletingItineraryId, setDeletingItineraryId] = useState(null);
  const { user } = useAuth();
	const { showToast } = useToast();

  useEffect(() => {
    if (!user?._id) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        const aiRes = await API.get(`/itineraries/my?userId=${user._id}`);
        const aiBody = aiRes?.data;
        const aiList = aiBody?.data?.itineraries ?? aiBody?.itineraries ?? aiBody;
        if (!cancelled) setItineraries(Array.isArray(aiList) ? aiList : []);

        const bookingRes = await API.get(`/bookings/my?userId=${user._id}`);
        const bookingBody = bookingRes?.data;
        const bookingList = bookingBody?.data?.bookings ?? bookingBody?.bookings ?? bookingBody;
        if (!cancelled) setBookings(Array.isArray(bookingList) ? bookingList : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (!cancelled) {
          setItineraries([]);
          setBookings([]);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleDeleteItinerary = async (itineraryId) => {
    if (!itineraryId || deletingItineraryId) return;

    const ok = window.confirm('Delete this saved AI plan? This cannot be undone.');
    if (!ok) return;

    setDeletingItineraryId(itineraryId);
    try {
      await API.delete(`/itineraries/${itineraryId}`);
      setItineraries((prev) => (Array.isArray(prev) ? prev.filter((t) => t?._id !== itineraryId) : []));
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || 'Failed to delete itinerary';
		showToast(`${message}${status ? ` (HTTP ${status})` : ''}`, 'error');
    } finally {
      setDeletingItineraryId(null);
    }
  };

  if (!user) return <div className="text-center mt-20">Please Login</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">✈️ My Trips</h1>

        <h2 className="text-xl font-bold mb-4 text-purple-700">📦 Booked Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {(Array.isArray(bookings) ? bookings : []).map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-purple-500">
              <div className="p-4">
                <h3 className="font-bold text-lg">{booking.packageId?.title}</h3>
                <p className="text-gray-600">${booking.packageId?.price}</p>
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded uppercase font-bold">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-gray-500">No packages booked yet.</p>}
        </div>

        <h2 className="text-xl font-bold mb-4 text-indigo-700">🤖 Saved AI Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(itineraries) ? itineraries : []).map((trip) => (
            <div key={trip._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-600 p-4 text-white flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold truncate">{trip.destination}</h2>
                  <p className="text-indigo-100">{trip.duration} Days • ${trip.total_cost}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteItinerary(trip._id)}
                  disabled={deletingItineraryId === trip._id}
                  className="shrink-0 bg-white/15 hover:bg-white/25 disabled:opacity-60 px-3 py-1 rounded text-sm font-bold"
                  title="Delete saved plan"
                >
                  {deletingItineraryId === trip._id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  {(Array.isArray(trip.activities) ? trip.activities : []).slice(0, 3).map((act, i) => (
                    <li key={i}>• Day {act.day}: {act.activity}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {itineraries.length === 0 && <p className="text-gray-500">No AI plans saved yet.</p>}
        </div>

      </div>
    </div>
  );
};

export default MyTrips;