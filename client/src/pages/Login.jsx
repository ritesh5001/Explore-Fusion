import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';
import SafeImage from '../components/common/SafeImage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, token, user } = useAuth();
  const { showToast } = useToast();
  const LOGO_URL = import.meta.env.VITE_BRAND_LOGO_URL || '/branding/logo.png';

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
      const errorMessage = error?.message || 'Login failed';
      // If it's a 401, suggest registering
      if (errorMessage.includes('401') || errorMessage.includes('Invalid email or password')) {
        showToast(
          'Invalid email or password. If you don\'t have an account, please register first.',
          'error',
          5000
        );
      } else {
        showToast(errorMessage, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 page-section">
      <form onSubmit={handleLogin} className="glass-card p-8 w-full max-w-md shadow-md rounded-2xl">
      <div className="flex justify-center mb-4">
        <SafeImage
          src={LOGO_URL}
          fallback="/images/placeholder.svg"
          alt="Explore Fusion"
          className="h-14 w-14 rounded-2xl object-contain bg-white/60"
          loading="eager"
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