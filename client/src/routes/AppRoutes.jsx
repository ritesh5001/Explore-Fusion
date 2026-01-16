import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import UserProfile from '../pages/UserProfile';
import Packages from '../pages/Packages';
import PackageDetails from '../pages/PackageDetails';
import CreatePackage from '../pages/CreatePackage';
import MyBookings from '../pages/MyBookings';
import Itinerary from '../pages/Itinerary';
import CreatorDashboard from '../pages/CreatorDashboard';
import Reviews from '../pages/Reviews';
import Notifications from '../pages/Notifications';

import PageLoader from '../components/ui/PageLoader';
import PageTransition from '../components/motion/PageTransition';

const ChatRooms = lazy(() => import('../pages/chat/ChatRooms'));
const ChatRoom = lazy(() => import('../pages/chat/ChatRoom'));

const AiChat = lazy(() => import('../pages/ai/AiChat'));
const AiItinerary = lazy(() => import('../pages/ai/AiItinerary'));
const MyItineraries = lazy(() => import('../pages/ai/MyItineraries'));

const AdminLayout = lazy(() => import('../components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UsersAdmin = lazy(() => import('../pages/admin/UsersAdmin'));
const CreatorsAdmin = lazy(() => import('../pages/admin/CreatorsAdmin'));
const BookingsAdmin = lazy(() => import('../pages/admin/BookingsAdmin'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminSystem = lazy(() => import('../pages/admin/AdminSystem'));

import BuddyProfile from '../pages/buddy/BuddyProfile';
import BuddySuggestions from '../pages/buddy/BuddySuggestions';
import BuddyRequests from '../pages/buddy/BuddyRequests';
import MyBuddies from '../pages/buddy/MyBuddies';

import ProtectedRoute from '../components/ProtectedRoute';

const S = ({ children, label }) => (
  <Suspense fallback={<PageLoader label={label || 'Loading…'} />}>
    {children}
  </Suspense>
);

const AppRoutes = () => {
	const location = useLocation();
	const wrap = (node) => <PageTransition>{node}</PageTransition>;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={wrap(<Home />)} />
        <Route path="/login" element={wrap(<Login />)} />
        <Route path="/register" element={wrap(<Register />)} />

      <Route
        path="/profile"
        element={
          wrap(
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/users/:id"
        element={
          wrap(
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          )
        }
      />

      <Route path="/packages" element={wrap(<Packages />)} />
      <Route path="/packages/:id" element={wrap(<PackageDetails />)} />
      <Route
        path="/create-package"
        element={
          wrap(
            <ProtectedRoute roles={['creator', 'admin', 'superadmin']}>
              <CreatePackage />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/bookings"
        element={
          wrap(
            <ProtectedRoute>
              <Navigate to="/my-bookings" replace />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/my-bookings"
        element={
          wrap(
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          )
        }
      />

      <Route path="/plan-trip" element={wrap(<Itinerary />)} />
      <Route path="/itinerary" element={wrap(<Navigate to="/plan-trip" replace />)} />

      <Route
        path="/buddy"
        element={
          wrap(
            <ProtectedRoute>
              <Navigate to="/buddy/profile" replace />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/buddy/profile"
        element={
          wrap(
            <ProtectedRoute>
              <BuddyProfile />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/buddy/suggestions"
        element={
          wrap(
            <ProtectedRoute>
              <BuddySuggestions />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/buddy/requests"
        element={
          wrap(
            <ProtectedRoute>
              <BuddyRequests />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/buddy/my"
        element={
          wrap(
            <ProtectedRoute>
              <MyBuddies />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/chat"
        element={
          wrap(
            <ProtectedRoute>
              <S label="Loading chat…">
                <ChatRooms />
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/chat/:roomId"
        element={
          wrap(
            <ProtectedRoute>
              <S label="Loading room…">
                <ChatRoom />
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/creator"
        element={
          wrap(
            <ProtectedRoute roles={['creator', 'admin', 'superadmin']}>
              <CreatorDashboard />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/admin"
        element={
          wrap(
            <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          wrap(
            <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
              <S label="Loading admin…">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/admin/users"
        element={
          wrap(
            <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
              <S label="Loading users…">
                <AdminLayout>
                  <UsersAdmin />
                </AdminLayout>
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/admin/creators"
        element={
          wrap(
            <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
              <S label="Loading creators…">
                <AdminLayout>
                  <CreatorsAdmin />
                </AdminLayout>
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/admin/bookings"
        element={
          wrap(
            <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
              <S label="Loading bookings…">
                <AdminLayout>
                  <BookingsAdmin />
                </AdminLayout>
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/admin/analytics"
        element={
          wrap(
            <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
              <S label="Loading analytics…">
                <AdminLayout>
                  <AdminAnalytics />
                </AdminLayout>
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/admin/reports"
        element={
          wrap(
            <ProtectedRoute requiredRole="superadmin" redirectTo="/dashboard">
              <S label="Loading reports…">
                <AdminLayout>
                  <AdminReports />
                </AdminLayout>
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/admin/system"
        element={
          wrap(
            <ProtectedRoute requiredRole="superadmin" redirectTo="/dashboard">
              <S label="Loading system…">
                <AdminLayout>
                  <AdminSystem />
                </AdminLayout>
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/reviews"
        element={
          wrap(
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/notifications"
        element={
          wrap(
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/ai/chat"
        element={
          wrap(
            <ProtectedRoute>
              <S label="Loading AI chat…">
                <AiChat />
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/ai/itinerary"
        element={
          wrap(
            <ProtectedRoute>
              <S label="Loading itinerary…">
                <AiItinerary />
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route
        path="/my-itineraries"
        element={
          wrap(
            <ProtectedRoute>
              <S label="Loading itineraries…">
                <MyItineraries />
              </S>
            </ProtectedRoute>
          )
        }
      />

      <Route path="*" element={wrap(<Navigate to="/" replace />)} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
