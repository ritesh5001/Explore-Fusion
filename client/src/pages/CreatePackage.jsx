import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import Navbar from '../components/Navbar';
import { uploadImage } from "../utils/uploadImage";

const CreatePackage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    location: '',
    duration: '',
    image: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const getPreviewSrc = (imageUrl) => imageUrl || '';

  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);

      setFormData({ ...formData, image: uploadedUrl });
    } catch (error) {
      console.error("Upload failed", error);
      const message = error?.message || 'Upload failed';
      setUploadError(message);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      alert("Please login to create a package");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        price: Number(formData.price),
        description: formData.description,
        
        destination: formData.location,
        duration: formData.duration,
        
        creatorId: user._id,
      };

      
      if (formData.image) payload.images = [formData.image];

      await API.post('/packages', payload);
      alert('Package Created Successfully! 🎉');
      navigate('/packages');
    } catch (error) {
      console.error('Create package failed:', error);
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      const message = serverMessage || error?.message || 'Unknown error';
      alert(`Failed to create package${status ? ` (HTTP ${status})` : ''}: ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">💎 Create Influencer Trip</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">

          <div>
            <label className="block text-gray-700 font-bold mb-1">Trip Title</label>
            <input
              required
              className="w-full border p-2 rounded"
              placeholder="e.g. Bali Yoga Retreat"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Price ($)</label>
              <input
                required type="number"
                className="w-full border p-2 rounded"
                placeholder="500"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Duration</label>
              <input
                required
                className="w-full border p-2 rounded"
                placeholder="e.g. 5 Days"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Location</label>
            <input
              required
              className="w-full border p-2 rounded"
              placeholder="e.g. Ubud, Bali"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          { }
          <div className="border-2 border-dashed border-gray-300 p-4 rounded text-center">
            <label className="block text-gray-700 font-bold mb-2">Trip Image</label>

            {formData.image ? (
              <div className="relative">
                { }
                { }
                <img
                  src={getPreviewSrc(formData.image)}
                  alt="Preview"
                  className="h-40 w-full object-cover rounded mb-2"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: '' })}
                  className="text-red-500 text-sm font-bold underline"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            )}
            {uploading && <p className="text-blue-500 text-sm mt-2">Uploading...</p>}
            {!!uploadError && (
              <p className="text-red-600 text-sm mt-2">{uploadError}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Description</label>
            <textarea
              required
              className="w-full border p-2 rounded h-32"
              placeholder="Describe the experience..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            disabled={uploading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded hover:bg-purple-700 transition disabled:bg-gray-400"
          >
            🚀 Launch Trip
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreatePackage;