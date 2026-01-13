import { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      
      
      localStorage.setItem('token', data.token);

      const meRes = await API.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(meRes.data));
      
      alert('Login Successful! 🚀');
      navigate('/'); 
    } catch (error) {
      alert('Login Failed: ' + (error.response?.data?.message || 'Server Error'));
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded shadow-md w-96">
        <h1 className="mb-4 text-2xl font-bold text-center">Login</h1>
        
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-2 mb-4 border rounded"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-2 mb-4 border rounded"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        
        <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;