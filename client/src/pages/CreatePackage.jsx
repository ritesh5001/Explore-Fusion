import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../utils/imagekit';
import { createPackage } from '../api/packages';
import { useToast } from '../components/ToastProvider';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import LuxImage from '../components/ui/LuxImage';

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
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  
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
      showToast(message, 'error');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
		if (uploading) return;
		setSubmitting(true);

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
    } finally {
		setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container-app page-section max-w-2xl">
      <SectionHeader
        title="Create Influencer Trip"
        subtitle="Publish a premium experience for travelers."
      />

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-4">
          <Input
            label="Trip Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            inputMode="text"
            aria-label="Trip title"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price (USD)"
              required
              type="number"
              min={0}
              step="1"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              aria-label="Price"
            />
            <Input
              label="Duration"
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              aria-label="Duration"
            />
          </div>

          <Input
            label="Location"
            required
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            aria-label="Location"
          />

          <div className="rounded-2xl border border-dashed border-soft/80 dark:border-white/10 p-4 bg-white/40 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <div className="font-heading font-extrabold tracking-tight text-mountain dark:text-sand">Trip Image</div>
              {formData.image && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, image: '' })}
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="mt-3">
              {formData.image ? (
                <div className="h-44 rounded-2xl overflow-hidden">
                  <LuxImage src={formData.image} alt="Trip preview" className="h-full w-full" transform="w-1000,h-500" />
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading || submitting}
                  className="block w-full text-sm text-charcoal/80 dark:text-sand/80 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sand file:text-mountain hover:file:bg-soft"
                />
              )}
              {uploading && <div className="mt-2 text-sm text-trail font-semibold">Uploading…</div>}
              {!!uploadError && <div className="mt-2 text-sm text-red-600 dark:text-red-300">{uploadError}</div>}
            </div>
          </div>

          <Textarea
            label="Description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            aria-label="Description"
          />

          <Button className="w-full" disabled={uploading || submitting}>
            {submitting ? 'Publishing…' : 'Launch Trip'}
          </Button>
        </Card>
      </form>
      </div>
    </div>
  );
};

export default CreatePackage;