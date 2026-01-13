import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
		showToast(error?.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 page-section">
      <form onSubmit={handleLogin} className="glass-card p-8 w-full max-w-md shadow-md rounded-2xl">
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