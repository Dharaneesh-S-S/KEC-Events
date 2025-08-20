// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Page Components
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import ClubDashboard from './pages/ClubDashboard';
import ContactsPage from './pages/ContactsPage';
import CalendarPage from './pages/CalendarPage';
import EventRegistrationPage from './pages/EventRegistrationPage';
import CreateEventPage from './pages/CreateEventPage';
import ManageEventsPage from './pages/ManageEventsPage';
import NotificationsPage from './pages/NotificationsPage';
import VenueBookingPage from './pages/VenueBookingPage';
import CCBookingPage from './pages/CCBookingPage';
import SeminarHallBookingPage from './pages/SeminarHallBookingPage';
import SeminarHallFormPage from './pages/SeminarHallFormPage';
import MaharajaBookingPage from './pages/MaharajaBookingPage';
import ConventionCenterBookingPage from './pages/ConventionCenterBookingPage';
import CCBookingFormPage from './pages/CCBookingFormPage';
import DynamicVenueBookingPage from './pages/DynamicVenueBookingPage';
import ClubVenueBookingsDashboard from './pages/ClubVenueBookingsDashboard';
import EditEventPage from './pages/EditEventPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Main App Routes Component
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

      {/* Student Routes */}
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Club Routes */}
      <Route
        path="/dashboard/club"
        element={
          <ProtectedRoute requiredRole="club">
            <ClubDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/create-event"
        element={
          <ProtectedRoute requiredRole="club">
            <CreateEventPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/manage-events"
        element={
          <ProtectedRoute requiredRole="club">
            <ManageEventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/edit-event/:id"
        element={
          <ProtectedRoute requiredRole="club">
            <EditEventPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/notifications"
        element={
          <ProtectedRoute requiredRole="club">
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/analytics"
        element={
          <ProtectedRoute requiredRole="club">
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      {/* Shared Authenticated Routes */}
      <Route
        path="/events/register"
        element={
          <ProtectedRoute>
            <EventRegistrationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <ContactsPage />
          </ProtectedRoute>
        }
      />

      {/* Venue Booking Routes */}
      <Route
        path="/club/venue-booking"
        element={
          <ProtectedRoute requiredRole="club">
            <VenueBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/venue-booking/dynamic"
        element={
          <ProtectedRoute requiredRole="club">
            <DynamicVenueBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/venue-bookings"
        element={
          <ProtectedRoute requiredRole="club">
            <ClubVenueBookingsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/venue-booking/cc"
        element={
          <ProtectedRoute requiredRole="club">
            <CCBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/venue-booking/cc/form/:venueId"
        element={
          <ProtectedRoute requiredRole="club">
            <CCBookingFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/venue-booking/seminar"
        element={
          <ProtectedRoute requiredRole="club">
            <SeminarHallBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/venue-booking/seminar/form/:venueId"
        element={
          <ProtectedRoute requiredRole="club">
            <SeminarHallFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/venue-booking/maharaja"
        element={
          <ProtectedRoute requiredRole="club">
            <MaharajaBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club/venue-booking/convention"
        element={
          <ProtectedRoute requiredRole="club">
            <ConventionCenterBookingPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Route */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Dashboard Redirect */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <Navigate
              to={user.role === 'admin' ? '/dashboard/admin' : user.role === 'club' ? '/dashboard/club' : '/dashboard/student'}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;