// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
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
import EditEventPage from './pages/EditEventPage';
import AnalyticsPage from './pages/AnalyticsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/club"
        element={
          <ProtectedRoute>
            <ClubDashboard />
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

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/register"
        element={
          <ProtectedRoute>
            <EventRegistrationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/create-event"
        element={
          <ProtectedRoute>
            <CreateEventPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/manage-events"
        element={
          <ProtectedRoute>
            <ManageEventsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/venue-booking"
        element={
          <ProtectedRoute>
            <VenueBookingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/venue-booking/cc"
        element={
          <ProtectedRoute>
            <CCBookingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/venue-booking/cc/form/:venueId"
        element={
          <ProtectedRoute>
            <CCBookingFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/venue-booking/seminar"
        element={
          <ProtectedRoute>
            <SeminarHallBookingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/venue-booking/seminar/form/:venueId"
        element={
          <ProtectedRoute>
            <SeminarHallFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/venue-booking/maharaja"
        element={
          <ProtectedRoute>
            <MaharajaBookingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/venue-booking/convention"
        element={
          <ProtectedRoute>
            <ConventionCenterBookingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/edit-event/:eventId"
        element={
          <ProtectedRoute>
            <EditEventPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/club/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect authenticated users based on role */}
      <Route
        path="/dashboard"
        element={
          <Navigate
            to={user?.role === 'club' ? '/dashboard/club' : '/dashboard/student'}
            replace
          />
        }
      />
    </Routes>
  );
}

/* ---------- Main App ---------- */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
