import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';

const PlanTrip = () => {
  const [formData, setFormData] = useState({ destination: '', days: 3, budget: 1000 });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
	const { showToast } = useToast();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/ai/plan', {
        destination: formData.destination,
        days: Number(formData.days),
        budget: Number(formData.budget),
      });
      const body = res?.data;
      const planData = body?.data ?? body;
      setPlan(planData);
    } catch (error) {
      console.error(error);
		showToast('AI Service Error: check console for details', 'error');
    }
    setLoading(false);
  };


  const handleSaveTrip = async () => {
    if (!user) {
		showToast('Please login to save trips', 'error');
      return;
    }

    if (!plan) {
		showToast('Please generate an itinerary first', 'error');
      return;
    }

    try {
      const activities = Array.isArray(plan?.itinerary) ? plan.itinerary : [];
      const estimatedRaw = plan?.estimated_cost ?? plan?.total_cost;
      const estimatedNum = Number(estimatedRaw);

      const payload = {
        destination: formData.destination,
        duration: Number(formData.days),
        budget: Number(formData.budget),
        currency: (typeof plan?.currency === 'string' && plan.currency.trim()) ? plan.currency.trim() : 'USD',
        activities: activities.map((item) => ({
          day: Number(item?.day),
          activity: item?.activity,
          cost: Number(item?.cost),
        })),
        note: plan?.note,
      };

      if (Number.isFinite(estimatedNum)) {
        payload.total_cost = estimatedNum;
      }

      await API.post('/itineraries', payload);
		showToast('Trip saved successfully', 'success');
      navigate('/bookings');
    } catch (error) {
      console.error(error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || 'Failed to save trip.';
		showToast(`${message}${status ? ` (HTTP ${status})` : ''}`, 'error');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container-app page-section max-w-4xl">
        <h1 className="text-3xl font-heading font-extrabold tracking-tight text-center text-mountain mb-8">AI Trip Planner</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="glass-card p-6 rounded-2xl shadow-sm h-fit">
            <h2 className="text-xl font-heading font-bold tracking-tight text-mountain mb-4">Tell me your plans</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Destination</label>
                <input
                  type="text" required
					className="w-full border border-soft p-3 rounded-xl bg-white/70"
                  placeholder="e.g. Paris, Goa, Tokyo"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Days</label>
                  <input
                    type="number" required min="1"
						className="w-full border border-soft p-3 rounded-xl bg-white/70"
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Budget ($)</label>
                  <input
                    type="number" required
						className="w-full border border-soft p-3 rounded-xl bg-white/70"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </div>

              <button
                disabled={loading}
				className="w-full btn-primary py-3"
              >
                {loading ? 'Generating Itinerary...' : '✨ Plan My Trip'}
              </button>
            </form>
          </div>

          <div className="glass-card p-6 rounded-2xl shadow-sm min-h-[300px]">
            {plan ? (
              <div>
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-2xl font-heading font-extrabold tracking-tight text-mountain">Trip to {formData.destination}</h2>
                  <p className="text-gray-500">Estimated Cost: {plan.currency} {plan.estimated_cost}</p>
                </div>

                <div className="space-y-4">
                  {plan.itinerary.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        Day {item.day}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.activity}</p>
                        <p className="text-sm text-gray-500">Cost: {item.cost}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
                  ⚠️ Note: {plan.note}
                </div>

                <button
                  onClick={handleSaveTrip}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold shadow-sm transition-colors"
                >
                  💾 Save This Itinerary
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-4xl mb-2">🗺️</span>
                <p>Your itinerary will appear here</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlanTrip;