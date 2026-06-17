import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RequireRole from './components/RequireRole.jsx';

import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import FeedbacksPage from './pages/FeedbacksPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DoctorsPage from './pages/DoctorsPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import BookAppointmentPage from './pages/BookAppointmentPage.jsx';
import RecordsPage from './pages/RecordsPage.jsx';
import RecordDetailPage from './pages/RecordDetailPage.jsx';
import NewRecordPage from './pages/NewRecordPage.jsx';
import PrescriptionsPage from './pages/PrescriptionsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SubmitFeedbackPage from './pages/SubmitFeedbackPage.jsx';
import ModerateFeedbackPage from './pages/ModerateFeedbackPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminDoctorsPage from './pages/AdminDoctorsPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* No layout */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public — with Layout */}
          <Route element={<Layout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/feedbacks" element={<FeedbacksPage />} />
          </Route>

          {/* Protected — login required + Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/feedback/submit" element={<SubmitFeedbackPage />} />
              <Route path="/records/:id" element={<RecordDetailPage />} />
              <Route path="/prescriptions" element={<PrescriptionsPage />} />

              {/* Patient only */}
              <Route element={<RequireRole roles={['patient']} />}>
                <Route path="/appointments/book" element={<BookAppointmentPage />} />
                <Route path="/records" element={<RecordsPage />} />
              </Route>

              {/* Doctor only */}
              <Route element={<RequireRole roles={['doctor']} />}>
                <Route path="/records/new" element={<NewRecordPage />} />
              </Route>

              {/* Doctor or Admin */}
              <Route element={<RequireRole roles={['doctor', 'admin']} />}>
                <Route path="/admin/feedback" element={<ModerateFeedbackPage />} />
              </Route>

              {/* Admin only */}
              <Route element={<RequireRole roles={['admin']} />}>
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
              </Route>
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
