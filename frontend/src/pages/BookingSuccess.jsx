import { useEffect, useState } from "react";

import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import API from "../services/api";

function BookingSuccess() {
  const location = useLocation();
  const [turf, setTurf] = useState(null);

useEffect(() => {

  const loadTurf = async () => {

    try {

      const response =
        await API.get("turf/");

      setTurf(response.data);

    } catch (error) {

      console.log(
        "Failed to load turf:",
        error
      );

    }

  };

  loadTurf();

}, []);
  
  const booking = location.state;

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2>No Booking Information Found</h2>
      </div>
    );
  }

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      <div
        className="
        print-receipt
        bg-white
        rounded-3xl
        shadow-2xl
        max-w-2xl
        w-full
        overflow-hidden
        "
      >

        {/* Professional Receipt Header */}

<div
  className="
  bg-gradient-to-r
  from-green-700
  to-green-500
  text-white
  px-6
  py-8
  "
>

  <div className="flex items-center justify-between">

    <div>

      <h1 className="text-3xl md:text-4xl font-bold">
        {turf?.name || "Dream Turf"} Turf
      </h1>

      <p className="mt-2 text-green-100">
        Turf Booking Payment Receipt
      </p>

    </div>

    <div className="text-right">

      <div className="text-5xl">
        ✓
      </div>

      <p className="font-bold">
        PAYMENT SUCCESSFUL
      </p>

    </div>

  </div>

</div>

        {/* Content */}
        <div className="p-8">

        {/* Booking Code */}
<div
  className="
  bg-green-50
  border
  border-green-300
  rounded-2xl
  p-6
  text-center
  mb-8
  "
>

  <p className="text-gray-600">
    Booking Code
  </p>

  <h2
    className="
    text-4xl
    font-bold
    text-green-600
    mt-2
    "
  >
    {booking.booking_code}
  </h2>

</div>


{/* Booking & Payment Dates */}

<div className="grid md:grid-cols-2 gap-4 mb-8">

  {/* Booking Date */}

  <div className="bg-gray-50 rounded-xl p-4">

    <p className="text-sm text-gray-500">
      Booking Date
    </p>

    <p className="font-bold mt-1">
      {booking.booking_date}
    </p>

  </div>


  {/* Payment Date */}

  <div className="bg-gray-50 rounded-xl p-4">

    <p className="text-sm text-gray-500">
      Payment Date
    </p>

    <p className="font-bold mt-1">

      {booking.payment_date
        ? new Date(
            booking.payment_date
          ).toLocaleString()
        : "N/A"}

    </p>

  </div>

</div>


{/* Details */}

<div className="space-y-5">

            {/* Customer Details */}

<div className="mt-6">

  <h3 className="text-xl font-bold mb-4">
    Customer Details
  </h3>

  <div className="space-y-4">

    {/* Name */}
    <div className="flex justify-between border-b pb-3">
      <span className="font-semibold">
        Customer Name
      </span>

      <span>
        {booking.customer_name}
      </span>
    </div>

    {/* Mobile */}
    <div className="flex justify-between border-b pb-3">
      <span className="font-semibold">
        Mobile Number
      </span>

      <span>
        {booking.mobile}
      </span>
    </div>

    {/* Email */}
    <div className="flex justify-between border-b pb-3 gap-4">
      <span className="font-semibold">
        Email
      </span>

      <span className="text-right break-all">
        {booking.email}
      </span>
    </div>

  </div>

</div>

            {/* Booked Slots */}

<div>

<div className="font-semibold mb-3">
  Booked Slots
</div>

<div className="space-y-3">

  {booking.selected_slots &&
    booking.selected_slots.map(
      (slot, index) => (

        <div
          key={index}
          className="
          flex
          justify-between
          items-center
          bg-gray-100
          rounded-xl
          p-4
          "
        >

          <span>
            {slot.time}
          </span>

          <span className="font-semibold text-green-600">
            ₹{slot.price}
          </span>

        </div>

      )
    )}

</div>

</div>

{/* Payment Details */}

<div className="mt-8">

  <h3 className="text-xl font-bold mb-4">
    Payment Details
  </h3>

  <div
    className="
    bg-gray-50
    border
    border-gray-200
    rounded-2xl
    p-5
    space-y-4
    "
  >

    {/* Payment Status */}
    <div className="flex justify-between border-b pb-3">

      <span className="font-semibold">
        Payment Status
      </span>

      <span
        className="
        bg-green-100
        text-green-700
        px-3
        py-1
        rounded-full
        font-semibold
        "
      >
        ✓ Paid
      </span>

    </div>

    {/* Transaction ID */}
    <div className="flex justify-between border-b pb-3 gap-4">

      <span className="font-semibold">
        Transaction ID
      </span>

      <span className="text-right break-all">
        {booking.payment_id || "N/A"}
      </span>

    </div>

    {/* Order ID */}
    <div className="flex justify-between border-b pb-3 gap-4">

      <span className="font-semibold">
        Razorpay Order ID
      </span>

      <span className="text-right break-all">
        {booking.order_id || "N/A"}
      </span>

    </div>

    {/* Amount */}
    <div className="flex justify-between">

      <span className="font-semibold">
        Transaction Amount
      </span>

      <span className="font-bold text-green-600">
        ₹{booking.total_amount}
      </span>

    </div>

  </div>

</div>

            <div className="flex justify-between border-b pb-3">
              <span className="font-semibold">
                Amount Paid
              </span>

              <span className="font-bold text-green-600">
                ₹{booking.total_amount}
              </span>
            </div>

          </div>

          {/* Important Note */}
          <div
            className="
            mt-8
            bg-yellow-50
            border
            border-yellow-300
            rounded-xl
            p-4
            "
          >
            ⚽ Please arrive 10 minutes before
            your booked slot.
          </div>

          {/* Receipt Footer */}

<div
  className="
  mt-8
  border-t
  border-gray-200
  pt-6
  text-center
  "
>

  <h3 className="text-xl font-bold text-green-700">
    {turf?.name || "Dream Turf"} Turf
  </h3>

  <p className="text-gray-500 mt-2">
    Thank you for choosing {turf?.name || "Dream Turf"} Turf!
  </p>

  <p className="text-sm text-gray-400 mt-2">
    Please keep this receipt for your records.
  </p>

  <p className="text-xs text-gray-400 mt-4">
    {/* This is a computer-generated payment receipt. */}
  </p>

</div>

          {/* Buttons */}
          <div
            className="
            no-print
            mt-10
            flex
            flex-col
            md:flex-row
            gap-4
            "
          >

            <button
              onClick={printReceipt}
              className="
              flex-1
              bg-blue-600
              hover:bg-blue-700
              text-white
              py-4
              rounded-xl
              font-bold
              "
            >
              Print Receipt
            </button>

            <Link
              to="/"
              className="
              flex-1
              bg-green-500
              hover:bg-green-600
              text-white
              py-4
              rounded-xl
              font-bold
              text-center
              "
            >
              Back To Home
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default BookingSuccess;