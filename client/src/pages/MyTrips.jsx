import { useEffect, useState } from 'react';
import API from '../api';
import Navbar from '../components/Navbar';

const MyTrips = () => {
  const [itineraries, setItineraries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      
      const aiRes = await API.get(`/itineraries/my?userId=${user._id}`);
      setItineraries(aiRes.data);

      
      const bookingRes = await API.get(`/bookings/my?userId=${user._id}`);
      setBookings(bookingRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (!user) return <div className="text-center mt-20">Please Login</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">✈️ My Trips</h1>

        {}
        <h2 className="text-xl font-bold mb-4 text-purple-700">📦 Booked Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-purple-500">
              <div className="p-4">
                <h3 className="font-bold text-lg">{booking.package_id?.title}</h3>
                <p className="text-gray-600">${booking.package_id?.price}</p>
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

        {}
        <h2 className="text-xl font-bold mb-4 text-indigo-700">🤖 Saved AI Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((trip) => (
            <div key={trip._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-indigo-600 p-4 text-white">
                <h2 className="text-xl font-bold">{trip.destination}</h2>
                <p className="text-indigo-100">{trip.duration} Days • ${trip.total_cost}</p>
              </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  {trip.activities.slice(0, 3).map((act, i) => (
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