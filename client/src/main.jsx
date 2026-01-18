import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './components/ToastProvider.jsx';
import { SystemProvider } from './context/SystemContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

console.log('API BASE:', import.meta.env.VITE_API_BASE_URL);

createRoot(document.getElementById('root')).render(
  <StrictMode>
	<ThemeProvider>
		<AuthProvider>
			<ToastProvider>
				<SystemProvider>
					<App />
				</SystemProvider>
			</ToastProvider>
		</AuthProvider>
	</ThemeProvider>
  </StrictMode>,
)
