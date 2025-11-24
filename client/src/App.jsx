// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Student Pages
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import EventRegistrationPage from './pages/student/EventRegistrationPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import StudentCalendarPage from './pages/student/StudentCalendarPage';

// Club Pages
import ClubDashboard from './pages/club/ClubDashboard';
import CreateEventPage from './pages/club/CreateEventPage';
import ManageEventsPage from './pages/club/ManageEventsPage';
import EditEventPage from './pages/club/EditEventPage';
import ClubProfilePage from './pages/club/ClubProfilePage';
import ClubContactsPage from './pages/club/ClubContactsPage';
import ClubNotificationsPage from './pages/club/ClubNotificationsPage';
import ClubAnalyticsPage from './pages/club/ClubAnalyticsPage';
import ClubCalendarPage from './pages/club/ClubCalendarPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageClubsPage from './pages/admin/ManageClubsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminLayout from './components/admin/AdminLayout';

// Misc Pages
import HomePage from './pages/misc/HomePage';
import ContactsPage from './pages/misc/ContactsPage';
import UnauthorizedPage from './pages/misc/UnauthorizedPage';
import NotFoundPage from './pages/misc/NotFoundPage';

// Components
import ProtectedRoute from './routes/ProtectedRoute';
import DevModeIndicator from './components/common/DevModeIndicator';
import ManageContacts from './pages/admin/ManageContacts';



// Main App Routes Component
function AppRoutes() {
  const { devMode } = useAuth();

  return (
    <>
      {devMode && <DevModeIndicator />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/contacts" element={<ContactsPage />} />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/events/register"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <EventRegistrationPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/calendar"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentCalendarPage />
            </ProtectedRoute>
          }
        />
        {/* Student Event Registration */}
        <Route
          path="/student/event-registration/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <EventRegistrationPage />
            </ProtectedRoute>
          }
        />

        

        {/* Club Routes */}
        <Route
          path="/club/dashboard"
          element={
            <ProtectedRoute allowedRoles={['club']}>
              <ClubDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club/create-event"
          element={
            <ProtectedRoute allowedRoles={['club']}>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club/events/manage"
          element={
            <ProtectedRoute allowedRoles={['club']}>
              <ManageEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club/events/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['club']}>
              <EditEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club/profile"
          element={
            <ProtectedRoute allowedRoles={['club']}>
              <ClubProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clubs/:slug/contacts"
          element={
            <ProtectedRoute allowedRoles={['club']}>
              <ClubContactsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club/notifications"
          element={
            <ProtectedRoute allowedRoles={['club']}>
              <ClubNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club/analytics"
          element={
            <ProtectedRoute allowedRoles={['club']}>
              <ClubAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/club/calendar"
          element={
            <ProtectedRoute allowedRoles={['club']}>
              <ClubCalendarPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<ManageUsersPage />} />
                  <Route path="clubs" element={<ManageClubsPage />} />
                  <Route path="clubs/edit/:id" element={<ManageClubsPage />} />
                  <Route path="contacts" element={<ManageContacts />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                  {/* Redirect /admin to /admin/dashboard */}
                  <Route path="" element={<AdminDashboard />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        

        {/* Fallback Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
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