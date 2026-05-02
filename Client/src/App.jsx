import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/rootLayout/Navbar/Index';
import { Fuel } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy loading pages for better performance
const Home = lazy(() => import('./pages/Home/Index'));
const Register = lazy(() => import('./pages/Register/Index'));
const Login = lazy(() => import('./pages/Login/Index'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword/Index'));
const Stations = lazy(() => import('./pages/Stations/Index'));
const StationDetail = lazy(() => import('./pages/StationDetail/Index'));
const PumpDashboard = lazy(() => import('./pages/Dashboard/PumpDashboard'));
const UserSettings = lazy(() => import('./pages/Dashboard/UserSettings'));
import MapPage from './pages/Map/Index';
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
import ProtectedRoute from './components/shared/ProtectedRoute';
import LocationTracker from './components/shared/LocationTracker';

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-pulse">
    <div className="bg-amber-500 p-3 rounded-2xl shadow-xl shadow-amber-500/20 mb-4 animate-bounce">
      <Fuel className="text-white" size={32} />
    </div>
    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Fuel Data...</p>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500/30 selection:text-amber-700 flex flex-col items-center">
      <LocationTracker />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Navbar />
      <div className="w-full flex justify-center">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={
              <ProtectedRoute publicOnly={true}>
                <Login />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={
              <ProtectedRoute publicOnly={true}>
                <ForgotPassword />
              </ProtectedRoute>
            } />
            <Route path="/register" element={
              <ProtectedRoute publicOnly={true}>
                <Register />
              </ProtectedRoute>
            } />
            <Route path="/stations" element={<Stations />} />
            <Route path="/stations/:id" element={<StationDetail />} />
            
            {/* Protected Role-Based Routes */}
            <Route path="/dashboard/pump" element={
              <ProtectedRoute allowedRoles={['owner', 'admin']}>
                <PumpDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            } />
            
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/map" element={<MapPage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;
