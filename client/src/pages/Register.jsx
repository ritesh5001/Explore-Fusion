import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';

const Register = () => {
  const navigate = useNavigate();
  const { register, token, user } = useAuth();
  const { showToast } = useToast();
	const defaultRemoteLogo = 'https://ik.imagekit.io/Ritesh5001/explore-fusion/branding/logo.png';
  const logoSrc = import.meta.env.VITE_BRAND_LOGO_URL || defaultRemoteLogo;
  const logoFallbackTriedRef = useRef(false);

  const handleLogoError = (e) => {
    const img = e.currentTarget;
    if (!logoFallbackTriedRef.current) {
      logoFallbackTriedRef.current = true;
      img.onerror = null;
      img.src = '/branding/logo.png';
      return;
    }
    img.onerror = null;
    img.style.display = 'none';
  };

	if (token && user) {
		return <Navigate to="/" replace />;
	}

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register(name, email, password);
		navigate('/', { replace: true });
    } catch (error) {
		showToast(error?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 page-section">
      <form onSubmit={onSubmit} className="glass-card shadow-md rounded-2xl p-8 w-full max-w-md">
			<div className="flex justify-center mb-4">
        <img
          src={logoSrc}
          alt="Explore Fusion"
          className="h-14 w-14 rounded-2xl object-contain bg-white/60"
			  onError={handleLogoError}
        />
			</div>
        <h1 className="text-2xl font-heading font-extrabold tracking-tight text-mountain mb-6">Create account</h1>

        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-soft rounded-xl px-3 py-2 mb-4 bg-white/70"
          placeholder="Your name"
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-soft rounded-xl px-3 py-2 mb-4 bg-white/70"
          placeholder="you@example.com"
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-soft rounded-xl px-3 py-2 mb-6 bg-white/70"
          placeholder="********"
          required
        />

        <button
          type="submit"
          disabled={loading}
			className="btn-primary w-full"
        >
          {loading ? 'Creating…' : 'Register'}
        </button>

        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="btn-link">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
