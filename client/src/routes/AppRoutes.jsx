import { Routes, Route, Navigate } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Packages from '../pages/Packages';
import PackageDetails from '../pages/PackageDetails';
import CreatePackage from '../pages/CreatePackage';
import MyBookings from '../pages/MyBookings';
import Itinerary from '../pages/Itinerary';
import ChatRooms from '../pages/chat/ChatRooms';
import ChatRoom from '../pages/chat/ChatRoom';
import CreatorDashboard from '../pages/AdminDashboard';
import Reviews from '../pages/Reviews';
import Notifications from '../pages/Notifications';

import AiChat from '../pages/ai/AiChat';
import AiItinerary from '../pages/ai/AiItinerary';
import MyItineraries from '../pages/ai/MyItineraries';

import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UsersAdmin from '../pages/admin/UsersAdmin';
import CreatorsAdmin from '../pages/admin/CreatorsAdmin';
import BookingsAdmin from '../pages/admin/BookingsAdmin';
import AdminReports from '../pages/admin/AdminReports';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminSystem from '../pages/admin/AdminSystem';

import BuddyProfile from '../pages/buddy/BuddyProfile';
import BuddySuggestions from '../pages/buddy/BuddySuggestions';
import BuddyRequests from '../pages/buddy/BuddyRequests';
import MyBuddies from '../pages/buddy/MyBuddies';

import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/packages" element={<Packages />} />
      <Route path="/packages/:id" element={<PackageDetails />} />
      <Route
        path="/create-package"
        element={
          <ProtectedRoute roles={['creator', 'admin', 'superadmin']}>
            <CreatePackage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Navigate to="/my-bookings" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route path="/plan-trip" element={<Itinerary />} />
      <Route path="/itinerary" element={<Navigate to="/plan-trip" replace />} />

      <Route
        path="/buddy"
        element={
          <ProtectedRoute>
            <Navigate to="/buddy/profile" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/profile"
        element={
          <ProtectedRoute>
            <BuddyProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/suggestions"
        element={
          <ProtectedRoute>
            <BuddySuggestions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/requests"
        element={
          <ProtectedRoute>
            <BuddyRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buddy/my"
        element={
          <ProtectedRoute>
            <MyBuddies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatRooms />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:roomId"
        element={
          <ProtectedRoute>
            <ChatRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/creator"
        element={
          <ProtectedRoute roles={['creator', 'admin', 'superadmin']}>
            <CreatorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
            <AdminLayout>
              <UsersAdmin />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/creators"
        element={
          <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
            <AdminLayout>
              <CreatorsAdmin />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
            <AdminLayout>
              <BookingsAdmin />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
            <AdminLayout>
              <AdminAnalytics />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredRole="superadmin" redirectTo="/dashboard">
            <AdminLayout>
              <AdminReports />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/system"
        element={
          <ProtectedRoute requiredRole="superadmin" redirectTo="/dashboard">
            <AdminLayout>
              <AdminSystem />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <Reviews />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai/chat"
        element={
          <ProtectedRoute>
            <AiChat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai/itinerary"
        element={
          <ProtectedRoute>
            <AiItinerary />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-itineraries"
        element={
          <ProtectedRoute>
            <MyItineraries />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
