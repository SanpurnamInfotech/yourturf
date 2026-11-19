import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaMoneyBillWave,
  FaClock,
  FaImages,
  FaCalendarAlt,
  FaArrowRight,
  FaFutbol,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { useTurf } from "../context/TurfContext";

function AdminDashboard() {
  const { turfs, selectedTurfId, setSelectedTurfId } = useTurf();
  const [dashboard, setDashboard] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  if (localStorage.getItem("isAdmin") !== "true") {
    return <Navigate to="/admin-login" />;
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashUrl = selectedTurfId ? `dashboard/?turf_id=${selectedTurfId}` : "dashboard/";
      const bookingsUrl = selectedTurfId ? `bookings/?turf_id=${selectedTurfId}` : "bookings/";

      const [dashRes, bookRes] = await Promise.all([
        API.get(dashUrl),
        API.get(bookingsUrl),
      ]);

      setDashboard(dashRes.data || {});
      setRecentBookings((bookRes.data || []).slice(0, 6));
    } catch (error) {
      console.error("Dashboard data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedTurfId]);

  const activeTurfObj = turfs.find((t) => String(t.id) === String(selectedTurfId));

  return (
    <AdminLayout>
      {/* Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-green-950 text-white rounded-3xl p-6 md:p-10 mb-8 shadow-xl border border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/40 px-3 py-1 rounded-full text-green-400 text-xs font-semibold mb-3">
              <FaLayerGroup />
              <span>
                {activeTurfObj ? `Active Scope: ${activeTurfObj.name}` : "Multi-Turf Platform Scope: Combined"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {activeTurfObj ? activeTurfObj.name : "Platform Overview"}
            </h1>
            <p className="mt-2 text-gray-300 text-sm md:text-base max-w-xl">
              {activeTurfObj
                ? `Managing schedule, pricing, bookings, and revenue for ${activeTurfObj.name} in ${activeTurfObj.location}.`
                : "Centralized control panel to oversee all venues, monitor live occupancy, and track earnings across all turfs."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/turfs"
              className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-3 rounded-xl transition text-sm flex items-center gap-2 shadow-lg shadow-green-500/20 active:scale-95"
            >
              <FaLayerGroup />
              <span>+ Add New Turf</span>
            </Link>
            <Link
              to="/admin/calendar"
              className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-xl transition text-sm flex items-center gap-2 font-semibold"
            >
              <FaCalendarAlt />
              <span>Live Calendar</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Turfs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">Total Venues</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-lg">
              <FaLayerGroup />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">
            {dashboard.total_turfs ?? turfs.length}
          </div>
          <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1">
            <FaCheckCircle /> {dashboard.active_turfs ?? turfs.filter((t) => t.is_active).length} Active Turfs
          </p>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">Total Bookings</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
              <FaCalendarCheck />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">
            {dashboard.total_bookings ?? 0}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Today's: <span className="font-bold text-gray-800">{dashboard.today_bookings ?? 0}</span>
          </p>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">Today's Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg">
              <FaMoneyBillWave />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">
            ₹{dashboard.today_revenue?.toLocaleString("en-IN") ?? 0}
          </div>
          <p className="text-xs text-gray-500 mt-2">Calculated from confirmed slots</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-lg">
              <FaMoneyBillWave />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">
            ₹{dashboard.total_revenue?.toLocaleString("en-IN") ?? 0}
          </div>
          <p className="text-xs text-green-600 font-semibold mt-2">Cumulative verified revenue</p>
        </div>
      </div>

      {/* Turf-Wise Performance Table (shown in Combined view) */}
      {!selectedTurfId && dashboard.turf_breakdown && dashboard.turf_breakdown.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Turf-Wise Performance & Revenue</h2>
              <p className="text-sm text-gray-500">Comparison of earnings and booking volume across all venues</p>
            </div>
            <Link
              to="/admin/turfs"
              className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
            >
              <span>Manage Venues</span>
              <FaArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold uppercase text-gray-500 bg-gray-50/50">
                  <th className="py-3 px-4">Turf Venue</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Today Bookings</th>
                  <th className="py-3 px-4">Total Bookings</th>
                  <th className="py-3 px-4">Total Revenue</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {dashboard.turf_breakdown.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 px-4 font-bold text-gray-900">{t.name}</td>
                    <td className="py-4 px-4 text-gray-600 text-xs">{t.location}</td>
                    <td className="py-4 px-4">
                      {t.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">
                          <FaCheckCircle size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                          <FaTimesCircle size={10} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-800">{t.today_bookings}</td>
                    <td className="py-4 px-4 font-semibold text-gray-800">{t.total_bookings}</td>
                    <td className="py-4 px-4 font-bold text-green-600">
                      ₹{t.total_revenue?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedTurfId(t.id)}
                        className="text-xs bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg font-semibold transition"
                      >
                        Filter Dashboard
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
            <p className="text-sm text-gray-500">
              {activeTurfObj ? `Latest reservations for ${activeTurfObj.name}` : "Latest reservations across all turfs"}
            </p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
          >
            <span>View All Bookings</span>
            <FaArrowRight size={12} />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No bookings found for the selected scope.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold uppercase text-gray-500 bg-gray-50/50">
                  <th className="py-3 px-4">Booking Code</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {recentBookings.map((b) => (
                  <tr key={b.id || b.booking_code} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 px-4 font-mono font-bold text-green-700">{b.booking_code}</td>
                    <td className="py-4 px-4">
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {b.turf_name || "Primary Turf"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{b.customer_name}</div>
                      <div className="text-xs text-gray-500">{b.mobile}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{b.booking_date}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">₹{b.total_amount}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          b.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : b.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;