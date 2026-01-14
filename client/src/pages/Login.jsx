import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, token, user } = useAuth();
  const { showToast } = useToast();
	const defaultRemoteLogo = 'https://ik.imagekit.io/Ritesh5001/explore-fusion/branding/logo.png';
	const [logoSrc, setLogoSrc] = useState(() => import.meta.env.VITE_BRAND_LOGO_URL || defaultRemoteLogo);

	if (token && user) {
		return <Navigate to="/" replace />;
	}

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await login(email, password);
		navigate('/', { replace: true });
    } catch (error) {
		showToast(error?.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 page-section">
      <form onSubmit={handleLogin} className="glass-card p-8 w-full max-w-md shadow-md rounded-2xl">
      <div className="flex justify-center mb-4">
        <img
          src={logoSrc}
          alt="Explore Fusion"
          className="h-14 w-14 rounded-2xl object-contain bg-white/60"
          onError={() => setLogoSrc('/branding/logo.png')}
        />
			</div>
        <h1 className="mb-4 text-2xl font-heading font-extrabold tracking-tight text-center text-mountain">Login</h1>
        
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-3 mb-4 border border-soft rounded-xl bg-white/70"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-3 mb-4 border border-soft rounded-xl bg-white/70"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        
        <button
          disabled={submitting}
			className="btn-primary w-full"
        >
          {submitting ? 'Logging in…' : 'Login'}
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          New here?{' '}
          <Link to="/register" className="btn-link">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;