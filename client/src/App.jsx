import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AppRoutes from './routes/AppRoutes';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PageTransition from './components/motion/PageTransition';

function App() {
	const wrap = (node) => <PageTransition>{node}</PageTransition>;
  return (
    <Router>
		<AppLayout>
			<Routes>
				<Route path="/login" element={wrap(<Login />)} />
				<Route path="/register" element={wrap(<Register />)} />
				<Route
					path="/dashboard"
					element={
						wrap(
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						)
					}
				/>
				<Route
					path="/*"
					element={
						<ProtectedRoute>
							<AppRoutes />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</AppLayout>
    </Router>
  );
}

export default App;