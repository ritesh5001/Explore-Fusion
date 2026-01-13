import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import PlanTrip from './pages/PlanTrip'; 
import MyTrips from './pages/MyTrips';
import BuddyMatcher from './pages/BuddyMatcher';
import CreatePackage from './pages/CreatePackage';
import Packages from './pages/Packages';
import CreatorDashboard from './pages/CreatorDashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/plan-trip" element={<PlanTrip />} />
          <Route path="/bookings" element={<MyTrips />} /> {/* <--- 2. Add Route */}
          <Route path="/buddy" element={<BuddyMatcher />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/create-package" element={<CreatePackage />} />
          <Route path="/creator" element={<CreatorDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;