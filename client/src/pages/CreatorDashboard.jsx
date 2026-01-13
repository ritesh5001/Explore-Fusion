import { useEffect, useState } from 'react';
import API from '../api';
import Navbar from '../components/Navbar';

const CreatorDashboard = () => {
  const [sales, setSales] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const { data } = await API.get(`/bookings/creator/${user._id}`);
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">📈 Creator Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-500">Total Bookings</h3>
            <p className="text-3xl font-bold">{sales.length}</p>
          </div>
          <div className="bg-white p-6 rounded shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-500">Total Revenue (Est.)</h3>
            <p className="text-3xl font-bold">
              ${sales.reduce((acc, curr) => acc + (curr.package_id?.price || 0), 0)}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Package Name</th>
                <th className="p-4">Price</th>
                <th className="p-4">Customer ID</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id} className="border-b">
                  <td className="p-4 font-medium">{sale.package_id?.title || 'Unknown Package'}</td>
                  <td className="p-4">${sale.package_id?.price}</td>
                  <td className="p-4 text-gray-500 text-sm">{sale.user_id}</td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No bookings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;