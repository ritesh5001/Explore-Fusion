import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../utils/imagekit';
import { createPackage } from '../api/packages';
import { useToast } from '../components/ToastProvider';

const CreatePackage = () => {
  const navigate = useNavigate();
	const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    destination: '',
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

    try {
      const payload = {
        title: formData.title,
        price: Number(formData.price),
        description: formData.description,

        destination: formData.destination,
        duration: formData.duration,
      };

      
      if (formData.image) payload.images = [formData.image];

      await createPackage(payload);
		showToast('Package created successfully', 'success');
      navigate('/packages');
    } catch (error) {
      console.error('Create package failed:', error);
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      const message = serverMessage || error?.message || 'Unknown error';
		showToast(`Failed to create package${status ? ` (HTTP ${status})` : ''}: ${message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container-app page-section max-w-2xl">
        <h1 className="text-3xl font-heading font-extrabold tracking-tight text-center text-mountain mb-8">Create Influencer Trip</h1>

        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl shadow-sm space-y-4">

          <div>
            <label className="block text-gray-700 font-bold mb-1">Trip Title</label>
            <input
              required
              className="w-full border border-soft p-3 rounded-xl bg-white/70"
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
                className="w-full border border-soft p-3 rounded-xl bg-white/70"
                placeholder="500"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Duration</label>
              <input
                required
                className="w-full border border-soft p-3 rounded-xl bg-white/70"
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
              className="w-full border border-soft p-3 rounded-xl bg-white/70"
              placeholder="e.g. Ubud, Bali"
              value={formData.destination}
              onChange={e => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>

          <div className="border-2 border-dashed border-soft p-4 rounded-2xl text-center bg-white/40">
            <label className="block text-gray-700 font-bold mb-2">Trip Image</label>

            {formData.image ? (
              <div className="relative">
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
				className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sand file:text-mountain hover:file:bg-soft"
              />
            )}
            {uploading && <p className="text-forest text-sm mt-2">Uploading...</p>}
            {!!uploadError && (
              <p className="text-red-600 text-sm mt-2">{uploadError}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Description</label>
            <textarea
              required
              className="w-full border border-soft p-3 rounded-xl h-32 bg-white/70"
              placeholder="Describe the experience..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            disabled={uploading}
			className="w-full btn-primary py-3"
          >
            🚀 Launch Trip
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreatePackage;