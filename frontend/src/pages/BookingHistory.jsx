import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useTurf } from "../context/TurfContext";

import {
  FaHistory,
  FaSearch,
  FaReceipt,
  FaHome,
  FaPhone,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowLeft,
  FaFutbol,
  FaMapMarkerAlt,
} from "react-icons/fa";

function BookingHistory() {
  const { websiteSettings } = useTurf();

  // ----------------------------
  // Search
  // ----------------------------

  const [searchType, setSearchType] =
    useState("booking");

  const [searchValue, setSearchValue] =
    useState("");

  // ----------------------------
  // Results
  // ----------------------------

  const [bookingList, setBookingList] =
    useState([]);

  const [selectedBooking, setSelectedBooking] =
    useState(null);


  const [showCancelModal, setShowCancelModal] =
   useState(false);

  const [view, setView] =
    useState("search");

  // ----------------------------
  // Loading
  // ----------------------------

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ----------------------------
  // Search Booking
  // ----------------------------

  const searchBooking = async () => {

    if (!searchValue.trim()) {

      alert("Please enter search value");

      return;

    }

    setLoading(true);

    setError("");

    setBookingList([]);

    setSelectedBooking(null);

    try {

      const params = {};

      if (searchType === "booking") {

        params.booking_code =
          searchValue;

      } else {

        params.mobile =
          searchValue;

      }

      const response =
        await API.get(
          "booking-history/",
          {
            params,
          }
        );

      // ------------------
      // Single Booking
      // ------------------

      if (
        response.data.type ===
        "single"
      ) {

        setSelectedBooking(
          response.data.booking
        );

        setView(
          "details"
        );

      }

      // ------------------
      // Multiple Bookings
      // ------------------

      else {

        setBookingList(
          response.data.bookings
        );

        setView(
          "list"
        );

      }

    } catch (err) {

      setError(

        err.response?.data?.error ||

        "Booking Not Found"

      );

    } finally {

      setLoading(false);

    }

  };

  // ----------------------------
  // Print
  // ----------------------------

  const printReceipt = () => {

    window.print();

  };

  const cancelBooking = async () => {

  try {

    const response = await API.post(

      "customer-cancel/",

      {

        booking_code: selectedBooking.booking_code,

      }

    );

    alert(response.data.message);

    setSelectedBooking({

      ...selectedBooking,

      status: "Cancelled",

    });

  }

  catch (error) {

    alert(

      error.response?.data?.error ||

      "Unable to cancel booking."

    );

  }

};

  return (

    <div className="min-h-screen bg-gray-100">

      {/* Hero */}

      <div
        className="
        bg-gradient-to-r
        no-print
        from-green-700
        to-green-500
        text-white
        py-10
        "
      >

        <div className="max-w-6xl mx-auto px-4">

          {/* Top Bar / Back to Home */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md rounded-xl font-bold text-sm shadow-sm border border-white/30 transition-all group"
            >
              <FaArrowLeft className="text-white/80 group-hover:-translate-x-0.5 transition-transform" />
              <FaHome className="text-white/90" />
              <span>Back to Home</span>
            </Link>

            <Link
              to="/book"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-green-700 hover:bg-green-50 rounded-xl font-bold text-sm shadow-md transition-all"
            >
              Book Turf
            </Link>
          </div>

          <div className="flex items-center gap-5">

            <FaHistory
              size={48}
            />

            <div>

              <h1
                className="
                text-4xl
                md:text-5xl
                font-bold
                "
              >

                Booking History

              </h1>

              <p
                className="
                mt-2
                text-lg
                "
              >

                Find your bookings instantly

              </p>

            </div>

          </div>

        </div>

      </div>

      {/* Body */}

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Search Card */}

        {view === "search" && (

          <div
            className="
            bg-white no-print
            rounded-3xl
            shadow-xl
            p-8
            "
          >

            <h2
              className="
              text-3xl
              font-bold
              mb-8
              "
            >

              Search Booking

            </h2>

            {/* Search Tabs */}

            <div
              className="
              flex
              gap-4
              mb-8
              "
            >

              <button

                onClick={() => {

                  setSearchType(
                    "booking"
                  );

                  setSearchValue("");

                }}

                className={`
                flex-1
                py-3
                rounded-xl
                font-semibold
                transition

                ${
                  searchType ===
                  "booking"

                  ?

                  "bg-green-600 text-white"

                  :

                  "bg-gray-200"

                }

                `}

              >

                Booking Code

              </button>

              <button

                onClick={() => {

                  setSearchType(
                    "mobile"
                  );

                  setSearchValue("");

                }}

                className={`
                flex-1
                py-3
                rounded-xl
                font-semibold
                transition

                ${
                  searchType ===
                  "mobile"

                  ?

                  "bg-green-600 text-white"

                  :

                  "bg-gray-200"

                }

                `}

              >

                Mobile Number

              </button>

            </div>

            {/* Input */}

            <label
              className="
              font-semibold
              block
              mb-3
              "
            >

              {

                searchType ===
                "booking"

                ?

                "Booking Code"

                :

                "Mobile Number"

              }

            </label>

            <input

              type="text"

              value={searchValue}

              onChange={(e) =>
                setSearchValue(
                  e.target.value
                )
              }

              placeholder={

                searchType ===
                "booking"

                ?

                "DT548721"

                :

                "9876543210"

              }

              className="
              w-full
              border
              rounded-xl
              p-4
              focus:ring-2
              focus:ring-green-500
              outline-none
              "

            />

            {/* Search Button */}

            <button

              onClick={
                searchBooking
              }

              className="
              mt-8
              w-full
              bg-green-600
              hover:bg-green-700
              text-white
              py-4
              rounded-2xl
              text-lg
              font-bold
              flex
              items-center
              justify-center
              gap-3
              transition
              "

            >

              <FaSearch />

              Search Booking

            </button>

            {loading && (

              <div
                className="
                text-center
                mt-6
                text-green-700
                font-semibold
                "
              >

                Searching...

              </div>

            )}

            {error && (

              <div
                className="
                mt-6
                bg-red-100
                text-red-700
                p-4
                rounded-xl
                "
              >

                {error}

              </div>

            )}
                      </div>

)}
                        {/* ===========================
                BOOKING LIST
            ============================ */}

{view === "list" && (

<div className="mt-10">

  {/* Header */}

  <div
    className="
    flex
    flex-col
    md:flex-row
    justify-between
    items-center
    gap-4
    mb-8
    "
  >

    <div>

      <h2
        className="
        text-3xl
        font-bold
        "
      >

        Bookings Found

      </h2>

      <p className="text-gray-600">

        Total Bookings :
        {" "}
        <span className="font-bold">

          {bookingList.length}

        </span>

      </p>

    </div>

    <button

      onClick={() => {

        setView("search");

        setBookingList([]);

        setSearchValue("");

      }}

      className="
      flex
      items-center
      gap-2
      bg-gray-700
      hover:bg-gray-800
      text-white
      px-5
      py-3
      rounded-xl
      "

    >

      <FaArrowLeft />

      Back

    </button>

  </div>

  {/* Booking Cards */}

  <div className="space-y-6">

    {

      bookingList.map(

        (booking, index) => (

          <div

            key={index}

            className="
            bg-white no-print
            rounded-3xl
            shadow-lg
            p-6
            hover:shadow-2xl
            transition
            "

          >

            <div
              className="
              grid
              md:grid-cols-5
              gap-6
              items-center
              "
            >

              {/* Booking Code */}

              <div>

                <p className="text-gray-500 text-sm">

                  Booking Code

                </p>

                <h3
                  className="
                  text-xl
                  font-bold
                  text-green-600
                  "
                >

                  {booking.booking_code}

                </h3>

                {booking.turf_name && (
                  <span className="inline-block mt-1 text-xs bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full font-semibold border border-green-200">
                    🏟️ {booking.turf_name}
                  </span>
                )}

              </div>

              {/* Booking Date */}

              <div>

                <p className="text-gray-500 text-sm">

                  Booking Date

                </p>

                <p
                  className="
                  font-semibold
                  "
                >

                  {booking.booking_date}

                </p>

              </div>

              {/* Amount */}

              <div>

                <p className="text-gray-500 text-sm">

                  Amount

                </p>

                <h3
                  className="
                  text-2xl
                  font-bold
                  text-green-700
                  "
                >

                  ₹{booking.total_amount}

                </h3>

              </div>

              {/* Status */}

              <div>

                {

                  booking.status ===
                  "Confirmed"

                  ?

                  <span
                    className="
                    inline-flex
                    items-center
                    gap-2
                    bg-green-100
                    text-green-700
                    px-4
                    py-2
                    rounded-full
                    font-semibold
                    "
                  >

                    <FaCheckCircle />

                    Confirmed

                  </span>

                  :

                  booking.status ===
                  "Cancelled"

                  ?

                  <span
                    className="
                    inline-flex
                    items-center
                    gap-2
                    bg-red-100
                    text-red-700
                    px-4
                    py-2
                    rounded-full
                    font-semibold
                    "
                  >

                    <FaTimesCircle />

                    Cancelled

                  </span>

                  :

                  <span
                    className="
                    inline-flex
                    items-center
                    gap-2
                    bg-blue-100
                    text-blue-700
                    px-4
                    py-2
                    rounded-full
                    font-semibold
                    "
                  >

                    <FaClock />

                    Completed

                  </span>

                }

              </div>

              {/* Button */}

              <div>

                <button

                  onClick={() => {

                    setSelectedBooking(
                      booking
                    );

                    setView(
                      "details"
                    );

                  }}

                  className="
                  w-full
                  bg-green-600
                  hover:bg-green-700
                  text-white
                  py-3
                  rounded-xl
                  font-semibold
                  transition
                  "

                >

                  View Details →

                </button>

              </div>

            </div>

          </div>

        )

      )

    }

  </div>

</div>

)}
{/* ===========================
    BOOKING DETAILS
=========================== */}

{view === "details" && selectedBooking && (
  <div className="mt-8">
    <style>{`
      @media print {
        body {
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .no-print, nav, header, footer {
          display: none !important;
        }
        #printable-booking-receipt {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
          border: 1px solid #d1d5db !important;
          border-radius: 12px !important;
          background: #ffffff !important;
          page-break-inside: avoid !important;
        }
      }
    `}</style>

    {/* Top Navigation & Print Bar (Screen Only) */}
    <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-green-700">
          Booking Details & Voucher
        </h2>
        <p className="text-gray-600 text-xs md:text-sm mt-1">
          Review official reservation receipt and print confirmation voucher
        </p>
      </div>
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          onClick={printReceipt}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md transition active:scale-95"
        >
          <FaReceipt />
          <span>Print Receipt</span>
        </button>
        <button
          onClick={() => {
            if (bookingList.length > 0) {
              setView("list");
            } else {
              setView("search");
            }
          }}
          className="flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
      </div>
    </div>

    {/* ======================================================== */}
    {/* PRINTABLE RECEIPT CARD                                  */}
    {/* ======================================================== */}
    <div
      id="printable-booking-receipt"
      className="print-receipt bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden text-gray-900"
    >
      {/* Receipt Header Banner */}
      <div className="bg-gradient-to-r from-green-700 via-green-600 to-green-800 text-white p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center text-2xl border border-white/20 flex-shrink-0 shadow-inner">
              <FaFutbol className="text-white" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest font-bold text-green-200 block">
                {websiteSettings?.site_name || "YourTurf"} &bull; Official Booking Voucher
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                {selectedBooking.turf_name || "Turf Venue"}
              </h1>
              {selectedBooking.turf_location && (
                <p className="text-xs text-green-100 flex items-center gap-1.5 mt-0.5">
                  <FaMapMarkerAlt size={11} className="flex-shrink-0" />
                  <span>{selectedBooking.turf_location}</span>
                </p>
              )}
            </div>
          </div>

          <div className="sm:text-right flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedBooking.status === "Confirmed"
                  ? "bg-white text-green-800"
                  : selectedBooking.status === "Cancelled"
                  ? "bg-red-500 text-white"
                  : "bg-blue-600 text-white"
              }`}
            >
              {selectedBooking.status === "Confirmed" && <FaCheckCircle size={12} />}
              {selectedBooking.status === "Cancelled" && <FaTimesCircle size={12} />}
              {selectedBooking.status === "Completed" && <FaClock size={12} />}
              <span>{selectedBooking.status}</span>
            </span>
            <p className="text-[11px] text-green-100 mt-1">
              Payment: <strong className="text-white">{selectedBooking.payment_status || "Paid"}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation & Reference Code Bar */}
      <div className="bg-green-50/70 border-b border-green-200 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase text-gray-500 tracking-wider block">
            Booking Reference Code
          </span>
          <span className="text-2xl md:text-3xl font-extrabold text-green-700 font-mono tracking-wider block mt-0.5">
            {selectedBooking.booking_code}
          </span>
          <span className="text-xs text-gray-500">
            Present this code upon arrival at the turf reception counter
          </span>
        </div>

        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-green-200">
          <span className="text-[11px] font-bold uppercase text-gray-500 tracking-wider block">
            Match / Reservation Date
          </span>
          <span className="text-lg font-bold text-gray-900 block mt-0.5">
            {new Date(selectedBooking.booking_date).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          {selectedBooking.created_on && (
            <span className="text-[11px] text-gray-400 block mt-0.5">
              Booked on: {new Date(selectedBooking.created_on).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Details Body */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Customer & Venue Info 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Info Card */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3 flex items-center gap-2">
              <FaUser className="text-green-600" />
              <span>Customer Information</span>
            </h4>
            <div className="space-y-1.5 text-sm">
              <p className="font-bold text-gray-900 text-base">
                {selectedBooking.customer_name}
              </p>
              <p className="text-gray-600 flex items-center gap-2">
                <FaPhone size={12} className="text-gray-400" />
                <span>{selectedBooking.mobile}</span>
              </p>
              <p className="text-gray-600 flex items-center gap-2">
                <FaEnvelope size={12} className="text-gray-400" />
                <span className="break-all">{selectedBooking.email}</span>
              </p>
            </div>
          </div>

          {/* Venue Info Card */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="text-green-600" />
              <span>Venue Information</span>
            </h4>
            <div className="space-y-1.5 text-sm">
              <p className="font-bold text-gray-900 text-base">
                {selectedBooking.turf_name || "YourTurf Venue"}
              </p>
              <p className="text-gray-600">
                {selectedBooking.turf_location || "Location on record"}
              </p>
              {selectedBooking.turf_phone && (
                <p className="text-gray-600 flex items-center gap-2">
                  <FaPhone size={12} className="text-gray-400" />
                  <span>Helpline: {selectedBooking.turf_phone}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Booked Slots Table */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-gray-100/80 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider flex items-center gap-2">
              <FaClock className="text-green-600" />
              <span>Reserved Time Slots</span>
            </h4>
            <span className="text-xs font-semibold text-gray-500">
              {selectedBooking.slots?.length || 0} slot(s) reserved
            </span>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[11px] font-bold uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-4 w-12">#</th>
                <th className="py-2.5 px-4">Slot Timing</th>
                <th className="py-2.5 px-4">Match Date</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedBooking.slots && selectedBooking.slots.length > 0 ? (
                selectedBooking.slots.map((slot, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-200 font-mono text-xs font-bold">
                        {slot.start_time} - {slot.end_time}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {selectedBooking.booking_date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
                        <FaCheckCircle size={12} />
                        <span>Reserved</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400 text-xs">
                    Slot details confirmed
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Payment Summary Box */}
        <div className="bg-gradient-to-r from-gray-950 to-gray-850 text-white rounded-2xl p-5 flex items-center justify-between border border-gray-800">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider block">
              Total Amount Paid
            </span>
            <span className="text-xs text-green-400 font-medium">
              Payment Method: {selectedBooking.payment_method || "Online Payment"} (Verified)
            </span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-green-400">
              ₹{selectedBooking.total_amount}
            </span>
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider">
              All taxes included
            </span>
          </div>
        </div>

        {/* Guidelines & Terms */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
          <h5 className="font-bold text-amber-950 flex items-center gap-1.5 mb-1.5">
            <span>⚽ Venue Guidelines & Rules:</span>
          </h5>
          <p>&bull; Please arrive at the venue at least <strong>10 minutes</strong> before your scheduled slot.</p>
          <p>&bull; Wear appropriate sports footwear (flat or rubber studs; metal spikes strictly prohibited).</p>
          <p>&bull; Present this receipt or your Booking Reference Code <strong>({selectedBooking.booking_code})</strong> upon arrival.</p>
        </div>

        {/* Receipt Sign-off */}
        <div className="border-t border-gray-200 pt-5 text-center text-xs text-gray-400">
          <p className="font-bold text-gray-700">
            {selectedBooking.turf_name || websiteSettings?.site_name || "YourTurf"} &bull; Thank you for booking with us!
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            This is an official computer-generated booking receipt. No physical signature required.
          </p>
        </div>
      </div>
    </div>

    {/* Bottom Action Buttons (Screen Only) */}
    <div className="no-print mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Print Button */}
      <button
        onClick={printReceipt}
        className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-bold text-base flex justify-center items-center gap-2.5 transition shadow-lg active:scale-95"
      >
        <FaReceipt size={18} />
        <span>Print Receipt</span>
      </button>

      {/* Cancel Booking Button */}
      {selectedBooking.status === "Confirmed" ? (
        <button
          onClick={() => setShowCancelModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-2xl font-bold text-base flex justify-center items-center gap-2.5 transition shadow-lg active:scale-95"
        >
          <FaTimesCircle size={18} />
          <span>Cancel Booking</span>
        </button>
      ) : selectedBooking.status === "Cancelled" ? (
        <button
          disabled
          className="bg-gray-400 text-white py-4 px-6 rounded-2xl font-bold text-base cursor-not-allowed"
        >
          Booking Cancelled
        </button>
      ) : (
        <button
          disabled
          className="bg-blue-400 text-white py-4 px-6 rounded-2xl font-bold text-base cursor-not-allowed"
        >
          Booking Completed
        </button>
      )}

      {/* Back to Home Button */}
      <Link
        to="/"
        className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-2xl font-bold text-base flex justify-center items-center gap-2.5 transition shadow-lg active:scale-95 text-center"
      >
        <FaHome size={18} />
        <span>Back To Home</span>
      </Link>
    </div>
  </div>
)}

{/* ======================================
    Cancel Booking Modal
====================================== */}

{showCancelModal && (

  <div
    className="
    fixed
    inset-0
    bg-black/60
    no-print
    flex
    justify-center
    items-center
    z-50
    p-4
    "
  >

    <div
      className="
      bg-white
      rounded-3xl
      shadow-2xl
      w-full
      max-w-lg
      p-8
      "
    >

      <div className="text-center">

        <FaTimesCircle
          className="
          text-red-600
          mx-auto
          mb-4
          "
          size={60}
        />

        <h2
          className="
          text-3xl
          font-bold
          "
        >

          Cancel Booking

        </h2>

        <p
          className="
          mt-4
          text-gray-600
          "
        >

          Are you sure you want to cancel this booking?

        </p>

      </div>

      <div
        className="
        mt-8
        bg-gray-100
        rounded-2xl
        p-5
        space-y-3
        "
      >

        <div className="flex justify-between">

          <span className="font-semibold">
            Booking Code
          </span>

          <span>
            {selectedBooking.booking_code}
          </span>

        </div>

        <div className="flex justify-between">

          <span className="font-semibold">
            Customer
          </span>

          <span>
            {selectedBooking.customer_name}
          </span>

        </div>

        <div className="flex justify-between">

          <span className="font-semibold">
            Booking Date
          </span>

          <span>
            {selectedBooking.booking_date}
          </span>

        </div>

      </div>

      <div
        className="
        grid
        grid-cols-2
        gap-4
        mt-8
        "
      >

        <button

          onClick={() =>
            setShowCancelModal(false)
          }

          className="
          bg-gray-300
          hover:bg-gray-400
          py-3
          rounded-xl
          font-bold
          "

        >

          No

        </button>

        <button

          onClick={async () => {

            setShowCancelModal(false);

            await cancelBooking();

          }}

          className="
          bg-red-600
          hover:bg-red-700
          text-white
          py-3
          rounded-xl
          font-bold
          "

        >

          Yes, Cancel Booking

        </button>

      </div>

    </div>

  </div>

)}

      </div>

    </div>

  );

}

export default BookingHistory;