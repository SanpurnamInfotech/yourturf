import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

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
} from "react-icons/fa";

function BookingHistory() {

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
        from-green-700
        to-green-500
        text-white
        py-16
        "
      >

        <div className="max-w-6xl mx-auto px-4">

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
            bg-white
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
            bg-white
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
        text-green-700
        "
      >
        Booking Details
      </h2>

      <p className="text-gray-600 mt-2">
        Booking information
      </p>

    </div>

    <button
      onClick={() => {

        if (bookingList.length > 0) {

          setView("list");

        } else {

          setView("search");

        }

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

  {/* Booking Code */}

  <div className="grid md:grid-cols-2 gap-6">

    <div
      className="
      bg-white
      rounded-2xl
      shadow
      p-6
      "
    >

      <div className="flex items-center gap-3">

        <FaReceipt className="text-green-600" />

        <span className="font-semibold">

          Booking Code

        </span>

      </div>

      <h2
        className="
        text-3xl
        font-bold
        mt-4
        text-green-700
        "
      >

        {selectedBooking.booking_code}

      </h2>

    </div>

    <div
      className="
      bg-white
      rounded-2xl
      shadow
      p-6
      "
    >

      <div className="flex items-center gap-3">

        <FaCalendarAlt className="text-green-600" />

        <span className="font-semibold">

          Booking Date

        </span>

      </div>

      <h3
        className="
        mt-4
        text-xl
        font-semibold
        "
      >

        {selectedBooking.booking_date}

      </h3>

    </div>

  </div>

  {/* Customer */}

  <div className="grid md:grid-cols-2 gap-6 mt-6">

    <div
      className="
      bg-white
      rounded-2xl
      shadow
      p-6
      "
    >

      <div className="flex items-center gap-3">

        <FaUser className="text-green-600" />

        <span className="font-semibold">

          Customer Name

        </span>

      </div>

      <p className="mt-4 text-lg">

        {selectedBooking.customer_name}

      </p>

    </div>

    <div
      className="
      bg-white
      rounded-2xl
      shadow
      p-6
      "
    >

      <div className="flex items-center gap-3">

        <FaPhone className="text-green-600" />

        <span className="font-semibold">

          Mobile Number

        </span>

      </div>

      <p className="mt-4 text-lg">

        {selectedBooking.mobile}

      </p>

    </div>

  </div>

  {/* Email */}

  <div
    className="
    bg-white
    rounded-2xl
    shadow
    p-6
    mt-6
    "
  >

    <div className="flex items-center gap-3">

      <FaEnvelope className="text-green-600" />

      <span className="font-semibold">

        Email Address

      </span>

    </div>

    <p className="mt-4 text-lg">

      {selectedBooking.email}

    </p>

  </div>

  {/* Slots */}

  <div
    className="
    bg-white
    rounded-2xl
    shadow
    p-6
    mt-6
    "
  >

    <h3
      className="
      text-2xl
      font-bold
      mb-6
      "
    >

      Booked Slot Timings

    </h3>

    <div className="space-y-3">

      {selectedBooking.slots.map(

        (slot, index) => (

          <div
            key={index}
            className="
            flex
            justify-between
            items-center
            bg-green-50
            rounded-xl
            p-4
            "
          >

            <span
              className="
              font-semibold
              "
            >

              {slot.start_time}
              {" - "}
              {slot.end_time}

            </span>

            <FaCheckCircle className="text-green-600" />

          </div>

        )

      )}

    </div>

  </div>

  {/* Total */}

  <div
    className="
    mt-6
    bg-gradient-to-r
    from-green-600
    to-green-800
    rounded-2xl
    p-6
    text-white
    "
  >

    <div className="flex justify-between items-center">

      <h3
        className="
        text-2xl
        font-bold
        "
      >

        Total Amount

      </h3>

      <h2
        className="
        text-4xl
        font-bold
        "
      >

        ₹{selectedBooking.total_amount}

      </h2>

    </div>

  </div>

  {/* Status */}

  <div
    className="
    bg-white
    rounded-2xl
    shadow
    p-6
    mt-6
    "
  >

    <h3
      className="
      text-xl
      font-bold
      mb-4
      "
    >

      Booking Status

    </h3>

    {selectedBooking.status === "Confirmed" ? (

      <span
        className="
        inline-flex
        items-center
        gap-2
        bg-green-100
        text-green-700
        px-5
        py-3
        rounded-full
        font-semibold
        "
      >

        <FaCheckCircle />

        Confirmed

      </span>

    ) : selectedBooking.status === "Cancelled" ? (

      <span
        className="
        inline-flex
        items-center
        gap-2
        bg-red-100
        text-red-700
        px-5
        py-3
        rounded-full
        font-semibold
        "
      >

        <FaTimesCircle />

        Cancelled

      </span>

    ) : (

      <span
        className="
        inline-flex
        items-center
        gap-2
        bg-blue-100
        text-blue-700
        px-5
        py-3
        rounded-full
        font-semibold
        "
      >

        <FaClock />

        Completed

      </span>

    )}

  </div>
      {/* Important Note */}

      <div
      className="
      mt-8
      bg-yellow-50
      border
      border-yellow-300
      rounded-2xl
      p-6
      "
    >

      <h3
        className="
        text-xl
        font-bold
        "
      >
        Important Note
      </h3>

      <ul
        className="
        mt-4
        space-y-3
        "
      >

        <li>
          ⚽ Please arrive at least
          <strong> 10 minutes </strong>
          before your booked slot.
        </li>

        <li>
          ⚽ Carry your Booking Code
          while visiting the turf.
        </li>

        <li>
          ⚽ Contact management for
          any booking issues.
        </li>

      </ul>

    </div>

    {/* Buttons */}

    <div
      className="
      mt-10
      grid
      grid-cols-1
      md:grid-cols-2
      gap-4
      "
    >

      {/* Print */}

      <button

        onClick={printReceipt}

        className="
        bg-blue-600
        hover:bg-blue-700
        text-white
        py-4
        rounded-2xl
        font-bold
        text-lg
        flex
        justify-center
        items-center
        gap-3
        transition
        shadow-lg
        "

      >

        <FaReceipt size={20} />

        Print Receipt

      </button>

      {/* Cancel Booking */}

{selectedBooking.status === "Confirmed" ? (

  <button

    onClick={() => setShowCancelModal(true)}

    className="
    bg-red-600
    hover:bg-red-700
    text-white
    py-4
    rounded-2xl
    font-bold
    text-lg
    flex
    justify-center
    items-center
    gap-3
    transition
    shadow-lg
    "

  >

    <FaTimesCircle size={20} />

    Cancel Booking

  </button>

) : selectedBooking.status === "Cancelled" ? (

  <button

    disabled

    className="
    bg-gray-400
    text-white
    py-4
    rounded-2xl
    font-bold
    text-lg
    cursor-not-allowed
    "

  >

    Booking Cancelled

  </button>

) : (

  <button

    disabled

    className="
    bg-blue-400
    text-white
    py-4
    rounded-2xl
    font-bold
    text-lg
    cursor-not-allowed
    "

  >

    Booking Completed

  </button>

)}

      {/* Home */}

      <Link

        to="/"

        className="
        bg-green-600
        hover:bg-green-700
        text-white
        py-4
        rounded-2xl
        font-bold
        text-lg
        flex
        justify-center
        items-center
        gap-3
        transition
        shadow-lg
        "

      >

        <FaHome size={20} />

        Back To Home

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