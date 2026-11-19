import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../services/api";
import { FaFutbol, FaMapMarkerAlt, FaPhone, FaPrint, FaHome, FaCheckCircle } from "react-icons/fa";

function BookingSuccess() {
  const location = useLocation();
  const [turf, setTurf] = useState(null);

  const booking = location.state;

  useEffect(() => {
    const loadTurf = async () => {
      try {
        const turfId = booking?.turf_id;
        const endpoint = turfId ? `turfs/${turfId}/` : "turf/";
        const response = await API.get(endpoint);
        setTurf(response.data);
      } catch (error) {
        console.log("Failed to load turf details:", error);
      }
    };

    if (booking) {
      loadTurf();
    }
  }, [booking]);

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">No Booking Information Found</h2>
        <p className="text-gray-500 mt-2">
          It looks like you navigated here directly or the session expired.
        </p>
        <Link
          to="/"
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const printReceipt = () => {
    window.print();
  };

  const venueName = booking.turf_name || turf?.name || "Sanpurnam Turf";
  const venueLocation = booking.turf_location || turf?.location;
  const venuePhone = booking.turf_phone || turf?.phone;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 py-12">
      <div className="print-receipt bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 text-white px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="bg-white/20 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                Booking Confirmed
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-2">
                {venueName}
              </h1>
              <p className="mt-1 text-green-100 text-sm">
                Official Booking & Payment Receipt
              </p>
            </div>
            <div className="text-right">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
                ✓
              </div>
              <p className="font-bold text-xs mt-2 tracking-wider">PAID & VERIFIED</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Booking Code */}
          <div className="bg-green-50 border border-green-300 rounded-2xl p-6 text-center mb-8 shadow-sm">
            <p className="text-gray-600 text-sm uppercase tracking-wider font-semibold">
              Confirmation Code
            </p>
            <h2 className="text-4xl font-extrabold text-green-700 mt-2 tracking-wide font-mono">
              {booking.booking_code}
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              Present this code at the turf reception counter upon arrival.
            </p>
          </div>

          {/* Venue Details Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-2 text-green-700 font-bold text-sm uppercase tracking-wider mb-3">
              <FaFutbol />
              <span>Venue Information</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{venueName}</h3>
            {venueLocation && (
              <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
                <span>{venueLocation}</span>
              </div>
            )}
            {venuePhone && (
              <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                <FaPhone className="text-gray-400 flex-shrink-0" />
                <span>Contact: {venuePhone}</span>
              </div>
            )}
          </div>

          {/* Booking & Payment Dates */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase">Booked Play Date</p>
              <p className="font-bold text-gray-800 text-lg mt-1">{booking.booking_date}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase">Payment Timestamp</p>
              <p className="font-bold text-gray-800 text-sm mt-1">
                {booking.payment_date
                  ? new Date(booking.payment_date).toLocaleString()
                  : new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Customer Details</h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Customer Name</span>
                <span className="font-bold text-gray-900">{booking.customer_name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Mobile Number</span>
                <span className="font-semibold text-gray-900">{booking.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-semibold text-gray-900">{booking.email}</span>
              </div>
            </div>
          </div>

          {/* Booked Slots */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Reserved Time Slots</h3>
            <div className="space-y-2">
              {booking.selected_slots &&
                booking.selected_slots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-green-50 border border-green-200 rounded-xl p-3 text-sm"
                  >
                    <span className="font-semibold text-gray-800">{slot.time}</span>
                    <span className="font-bold text-green-700">₹{slot.price}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Payment Summary</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Payment Status</span>
                <span className="bg-green-100 text-green-800 px-3 py-0.5 rounded-full font-bold text-xs flex items-center gap-1">
                  <FaCheckCircle /> Paid Successfully
                </span>
              </div>
              {booking.payment_id && (
                <div className="flex justify-between border-b pb-2 gap-4">
                  <span className="text-gray-600">Payment Reference</span>
                  <span className="font-mono text-gray-900 break-all text-right">
                    {booking.payment_id}
                  </span>
                </div>
              )}
              {booking.order_id && (
                <div className="flex justify-between border-b pb-2 gap-4">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-mono text-gray-900 break-all text-right">
                    {booking.order_id}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 text-base">
                <span className="font-bold text-gray-800">Total Amount Paid</span>
                <span className="font-extrabold text-2xl text-green-600">
                  ₹{booking.total_amount}
                </span>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs mb-8">
            ⚽ <strong>Player Reminder:</strong> Please reach {venueName} at least 10 minutes before your slot time with appropriate non-metal stud footwear.
          </div>

          {/* Receipt Footer */}
          <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
            <h4 className="font-bold text-green-700 text-sm">{venueName}</h4>
            <p className="mt-1">Thank you for booking with us! Keep this receipt for your records.</p>
          </div>

          {/* Action Buttons */}
          <div className="no-print mt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={printReceipt}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition"
            >
              <FaPrint />
              <span>Print Receipt</span>
            </button>
            <Link
              to="/"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-center shadow-md transition"
            >
              <FaHome />
              <span>Back To Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccess;