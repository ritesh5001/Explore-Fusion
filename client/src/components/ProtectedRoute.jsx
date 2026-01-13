import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../auth/useAuth';

const ProtectedRoute = ({ children, roles, requiredRole, redirectTo = '/' }) => {
  const location = useLocation();
  const { token, user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-600">Loading…</div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const rr = String(requiredRole);
    const allowed =
      rr === 'admin'
        ? ['admin', 'superadmin']
        : rr === 'superadmin'
          ? ['superadmin']
          : [rr];
    if (!allowed.includes(role)) {
      return <Navigate to={redirectTo === '/login' ? '/login' : redirectTo || '/dashboard'} replace />;
    }
  }

  if (Array.isArray(roles) && roles.length > 0) {
    if (!roles.includes(role)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
