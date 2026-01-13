import { useEffect, useState } from 'react';
import API from '../api';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Packages = () => {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data } = await API.get('/packages');
        setPackages(data);
      } catch (error) {
        console.error("Error fetching packages", error);
      }
    };
    fetchPackages();
  }, []);

  const handleBook = async (pkgId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert("Login to book!");

    try {
      await API.post('/bookings', {
        userId: user._id,
        packageId: pkgId,
        status: 'confirmed'
      });
      alert("Booking Confirmed! ✈️");
    } catch (error) {
      alert("Booking failed");
    }
  };


  const getImageUrl = (img) => {
    if (!img) return "https://via.placeholder.com/400x200";
    if (img.startsWith('http')) return img;
    return `http://localhost:5050${img}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">📦 Travel Packages</h1>
          <Link to="/create-package" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            + Create New Trip
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">

              { }
              <img
                src={getImageUrl(pkg.images?.[0])}
                alt={pkg.title}
                className="w-full h-48 object-cover"
              />

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold mb-2">{pkg.title}</h2>
                  <span className="bg-green-100 text-green-800 text-sm font-bold px-2 py-1 rounded">
                    ${pkg.price}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>📍 {pkg.destination}</span>
                  <span>⏳ {pkg.duration}</span>
                </div>

                <button
                  onClick={() => handleBook(pkg._id)}
                  className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}

          {packages.length === 0 && (
            <div className="col-span-3 text-center py-20">
              <p className="text-gray-500 text-xl">No active packages found.</p>
              <Link to="/create-package" className="text-blue-600 font-bold underline">
                Be the first to list one!
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Packages;