import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ToastProvider, useAuth } from './context/AppContext';

// Public Pages
import HomePage               from './pages/HomePage';
import RoomsPage              from './pages/RoomsPage';
import RoomDetailPage         from './pages/RoomDetailPage';
import BookingFormPage        from './pages/BookingFormPage';
import PaymentPage            from './pages/PaymentPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import SignInPage             from './pages/SignInPage';
import SignUpPage             from './pages/SignUpPage';
import AdminLoginPage         from './pages/AdminLoginPage';

// User Dashboard Pages
import UserDashboardPage      from './pages/dashboard/UserDashboardPage';
import MyBookingsPage         from './pages/dashboard/MyBookingsPage';
import ProfilePage            from './pages/dashboard/ProfilePage';
import SettingsPage           from './pages/dashboard/SettingsPage';
import MyReviewsPage          from './pages/dashboard/MyReviewsPage';

// Admin Pages
import AdminDashboardPage     from './pages/admin/AdminDashboardPage';
import AdminBookingsPage      from './pages/admin/AdminBookingsPage';
import AdminRoomsPage         from './pages/admin/AdminRoomsPage';
import AdminCustomersPage     from './pages/admin/AdminCustomersPage';
import AdminAnalyticsPage     from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage      from './pages/admin/AdminSettingsPage';

// Error Pages
import { NotFoundPage, ErrorPage } from './pages/ErrorPages';

// ─── Route Guards ─────────────────────────────────────────────────────────────
function RequireUser({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signin" replace/>;
}

function RequireAdmin({ children }) {
  const { admin } = useAuth();
  return admin ? children : <Navigate to="/admin/login" replace/>;
}

// ─── App ─────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"             element={<HomePage/>}/>
      <Route path="/rooms"        element={<RoomsPage/>}/>
      <Route path="/rooms/:id"    element={<RoomDetailPage/>}/>
      <Route path="/booking"      element={<BookingFormPage/>}/>
      <Route path="/payment"      element={<PaymentPage/>}/>
      <Route path="/booking/confirmation" element={<BookingConfirmationPage/>}/>
      <Route path="/signin"       element={<SignInPage/>}/>
      <Route path="/signup"       element={<SignUpPage/>}/>
      <Route path="/admin/login"  element={<AdminLoginPage/>}/>

      {/* User Dashboard */}
      <Route path="/dashboard" element={<RequireUser><UserDashboardPage/></RequireUser>}/>
      <Route path="/dashboard/bookings" element={<RequireUser><MyBookingsPage/></RequireUser>}/>
      <Route path="/dashboard/profile"  element={<RequireUser><ProfilePage/></RequireUser>}/>
      <Route path="/dashboard/settings" element={<RequireUser><SettingsPage/></RequireUser>}/>
      <Route path="/dashboard/reviews"  element={<RequireUser><MyReviewsPage/></RequireUser>}/>

      {/* Admin */}
      <Route path="/admin/dashboard"  element={<RequireAdmin><AdminDashboardPage/></RequireAdmin>}/>
      <Route path="/admin/bookings"   element={<RequireAdmin><AdminBookingsPage/></RequireAdmin>}/>
      <Route path="/admin/rooms"      element={<RequireAdmin><AdminRoomsPage/></RequireAdmin>}/>
      <Route path="/admin/customers"  element={<RequireAdmin><AdminCustomersPage/></RequireAdmin>}/>
      <Route path="/admin/analytics"  element={<RequireAdmin><AdminAnalyticsPage/></RequireAdmin>}/>
      <Route path="/admin/settings"   element={<RequireAdmin><AdminSettingsPage/></RequireAdmin>}/>

      {/* Errors */}
      <Route path="/500"  element={<ErrorPage/>}/>
      <Route path="*"     element={<NotFoundPage/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes/>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
