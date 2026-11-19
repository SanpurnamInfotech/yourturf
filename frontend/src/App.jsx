import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TurfProvider } from "./context/TurfContext";

import Home from "./pages/Home";
import BookTurf from "./pages/BookTurf";
import AdminDashboard from "./pages/AdminDashboard";
import CalendarView from "./pages/CalendarView";
import BookingSuccess from "./pages/BookingSuccess";
import AdminLogin from "./pages/AdminLogin";
import AdminGallery from "./pages/AdminGallery";
import AdminBookings from "./pages/AdminBookings";
import AdminCalendar from "./pages/AdminCalendar";
import BookingHistory from "./pages/BookingHistory";
import AdminSettings from "./pages/AdminSettings";
import AdminReports from "./pages/AdminReports";
import MasterSettings from "./pages/MasterSettings";
import ManageTurfs from "./pages/ManageTurfs";

function App() {
  return (
    <TurfProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookTurf />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/calendar" element={<AdminCalendar />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/master-settings" element={<MasterSettings />} />
          <Route path="/admin/turfs" element={<ManageTurfs />} />
          <Route path="/admin/reports" element={<AdminReports />} />

          <Route path="/booking-history" element={<BookingHistory />} />
        </Routes>
      </BrowserRouter>
    </TurfProvider>
  );
}

export default App;
