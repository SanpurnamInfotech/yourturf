import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route 
          path="/" 
          element={<Home />}   
        />

        <Route
          path="/book"
          element={<BookTurf />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/calendar"
          element={<CalendarView />}
        />

        <Route
          path="/booking-success"
          element={<BookingSuccess />}
        />

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

<Route
  path="/admin/gallery"
  element={<AdminGallery />}
/>

<Route
  path="/admin/bookings"
  element={<AdminBookings />}
/>

<Route
  path="/admin/calendar"
  element={<AdminCalendar />}
/>

<Route
    path="/booking-history"
    element={<BookingHistory />}
/>

<Route
  path="/admin/settings"
  element={<AdminSettings />}
/>

<Route
  path="/admin/reports"
  element={<AdminReports />}
/>

<Route
  path="/admin/master-settings"
  element={<MasterSettings />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;