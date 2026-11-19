import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  FaSearch,
  FaTrash,
  FaCalendarCheck,
  FaPhone,
  FaUser,
  FaMoneyBillWave,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { useTurf } from "../context/TurfContext";

function AdminBookings() {
  const { turfs, selectedTurfId } = useTurf();
  const [bookings, setBookings] = useState([]);
  const [filterTurfId, setFilterTurfId] = useState(selectedTurfId || "");
  const [date, setDate] = useState("");
  const [mobile, setMobile] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  if (localStorage.getItem("isAdmin") !== "true") {
    return <Navigate to="/admin-login" />;
  }

  // Sync with global selector
  useEffect(() => {
    if (selectedTurfId !== undefined) {
      setFilterTurfId(selectedTurfId);
    }
  }, [selectedTurfId]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      let url = "bookings/?";

      if (filterTurfId) {
        url += `turf_id=${filterTurfId}&`;
      }
      if (date) {
        url += `date=${date}&`;
      }
      if (mobile) {
        url += `mobile=${mobile}&`;
      }
      if (bookingCode) {
        url += `booking_code=${bookingCode}&`;
      }

      const response = await API.get(url);
      setBookings(response.data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Load bookings error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [filterTurfId, date]);

  const totalPages = Math.ceil(bookings.length / bookingsPerPage);
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const cancelBooking = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to cancel this booking? The slot will be freed immediately."
    );
    if (!confirmDelete) return;

    try {
      await API.delete(`cancel/${id}/`);
      alert("Booking Cancelled Successfully");
      loadBookings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to cancel booking.");
    }
  };

  const handleResetFilters = () => {
    setDate("");
    setMobile("");
    setBookingCode("");
    setFilterTurfId("");
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Bookings Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Search, filter, inspect, and cancel customer bookings across any turf
          </p>
        </div>
        <span className="text-xs font-bold text-gray-600 bg-gray-200 px-3 py-1.5 rounded-full w-fit">
          Total: {bookings.length} Bookings
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Turf Filter */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Filter by Turf</label>
            <select
              value={filterTurfId}
              onChange={(e) => setFilterTurfId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-2.5 rounded-xl text-sm outline-none focus:border-green-600 cursor-pointer"
            >
              <option value="">All Turfs (Combined)</option>
              {turfs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Booking Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-2 rounded-xl text-sm outline-none focus:border-green-600"
            />
          </div>

          {/* Mobile Filter */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Mobile Number</label>
            <input
              type="text"
              placeholder="Search 10-digit mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadBookings()}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-2 rounded-xl text-sm outline-none focus:border-green-600"
            />
          </div>

          {/* Booking Code Filter */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Booking Code</label>
            <input
              type="text"
              placeholder="e.g. DT123456"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadBookings()}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-2 rounded-xl text-sm outline-none focus:border-green-600 font-mono"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          {(date || mobile || bookingCode || filterTurfId) && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <FaTimes />
              <span>Reset Filters</span>
            </button>
          )}

          <button
            onClick={loadBookings}
            className="px-5 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
          >
            <FaSearch />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading bookings...</div>
        ) : currentBookings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No bookings found for the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold uppercase text-gray-500 bg-gray-50">
                  <th className="py-4 px-4">Code</th>
                  <th className="py-4 px-4">Turf Venue</th>
                  <th className="py-4 px-4">Customer Details</th>
                  <th className="py-4 px-4">Date & Slots</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {currentBookings.map((b) => (
                  <tr key={b.id || b.booking_code} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-4 font-mono font-bold text-green-700">{b.booking_code}</td>
                    <td className="py-4 px-4">
                      <span className="bg-green-50 border border-green-200 text-green-900 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {b.turf_name || "Primary Turf"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{b.customer_name}</div>
                      <div className="text-xs text-gray-500">{b.mobile}</div>
                      <div className="text-xs text-gray-400">{b.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-800">{b.booking_date}</div>
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        {b.slots && b.slots.length > 0 ? (
                          b.slots.map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-gray-100 text-gray-700 text-[11px] px-2 py-0.5 rounded mr-1"
                            >
                              {s.start_time} - {s.end_time}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">Standard Slot</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">₹{b.total_amount}</div>
                      <div className="text-xs text-gray-400">{b.payment_status || "Paid"}</div>
                    </td>
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
                    <td className="py-4 px-4 text-right">
                      {b.status !== "Cancelled" && (
                        <button
                          onClick={() => cancelBooking(b.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl text-xs font-semibold transition"
                          title="Cancel Booking"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg disabled:opacity-50 font-semibold"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 bg-gray-100 rounded-lg disabled:opacity-50 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminBookings;