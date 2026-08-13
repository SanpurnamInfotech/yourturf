import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  FaSearch,
  FaTrash,
  FaCalendarCheck,
  FaPhone,
  FaUser,
  FaMoneyBillWave,
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  const [date, setDate] = useState("");
  const [mobile, setMobile] = useState("");
  const [bookingCode, setBookingCode] =
    useState("");

  const [currentPage, setCurrentPage] =
  useState(1);

  const bookingsPerPage = 10;     

  if (
    localStorage.getItem("isAdmin") !==
    "true"
  ) {
    return (
      <Navigate to="/admin-login" />
    );
  }

  const loadBookings = async () => {
    try {
      let url = "bookings/?";

      if (date) {
        url += `date=${date}&`;
      }

      if (mobile) {
        url += `mobile=${mobile}&`;
      }

      if (bookingCode) {
        url += `booking_code=${bookingCode}&`;
      }

      const response =
        await API.get(url);

      setBookings(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.log(error);
    }
  };

  const totalPages = Math.ceil(
  bookings.length / bookingsPerPage
);

const indexOfLastBooking =
  currentPage * bookingsPerPage;

const indexOfFirstBooking =
  indexOfLastBooking - bookingsPerPage;

const currentBookings =
  bookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  const cancelBooking = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to cancel this booking?"
      );

    if (!confirmDelete) return;

    try {
      await API.delete(
        `cancel/${id}/`
      );

      alert(
        "Booking Cancelled Successfully"
      );

      loadBookings();
    } catch (error) {
      console.log(error);

      alert(
        "Failed to cancel booking"
      );
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <AdminLayout>

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl md:text-4xl font-bold">
          Booking Management
        </h1>

        <p className="text-gray-500 mt-2">
          Search, view and manage turf bookings
        </p>

      </div>

      {/* Search Section */}
      <div
        className="
        bg-white
        rounded-2xl
        shadow-lg
        p-6
        mb-8
        "
      >

        <div className="flex items-center gap-2 mb-5">

          <FaSearch />

          <h2 className="text-xl font-bold">
            Search Bookings
          </h2>

        </div>

        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-4
          gap-4
          "
        >

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(
                e.target.value
              )
            }
            className="
            border
            rounded-lg
            p-3
            "
          />

          <input
            type="text"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) =>
              setMobile(
                e.target.value
              )
            }
            className="
            border
            rounded-lg
            p-3
            "
          />

          <input
            type="text"
            placeholder="Booking Code"
            value={bookingCode}
            onChange={(e) =>
              setBookingCode(
                e.target.value
              )
            }
            className="
            border
            rounded-lg
            p-3
            "
          />

          <button
            onClick={() => {setCurrentPage(1);loadBookings();}}
            className="
            bg-green-600
            hover:bg-green-700
            text-white
            rounded-lg
            p-3
            font-semibold
            "
          >
            Search
          </button>

        </div>

      </div>

      {/* Desktop Table */}
      <div
        className="
        hidden
        lg:block
        bg-white
        rounded-2xl
        shadow-lg
        p-6
        "
      >

        <h2 className="text-xl font-bold mb-5">
          Booking List
        </h2>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead>

              <tr className="bg-gray-100">

                <th className="p-4 text-left">
                  Code
                </th>

                <th className="p-4 text-left">
                  Customer
                </th>

                <th className="p-4 text-left">
                  Mobile
                </th>


                <th className="p-4 text-left">
                  Date
                </th>

                <th className="p-4 text-left">
                  Slots
                </th>

                <th className="p-4 text-left">
                  Amount
                </th>

                <th className="p-4 text-center">
                  Payment
                </th>

                <th className="p-4 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {currentBookings.map(
                (booking) => (
                  <tr
                    key={
                      booking.id
                    }
                    className="
                    border-b
                    hover:bg-gray-50
                    "
                  >

                    <td className="p-4 font-semibold">
                      {
                        booking.booking_code
                      }
                    </td>

                    <td className="p-4">
                      {
                        booking.customer_name
                      }
                    </td>

                    <td className="p-4">
                      {
                        booking.mobile
                      }
                    </td>

                    <td className="p-4">
  {booking.booking_date}
</td>

<td className="p-4">

  <div className="space-y-2">

    {booking.slots?.map((slot, index) => (

      <div
        key={index}
        className="
        bg-green-100
        text-green-700
        px-3
        py-1
        rounded-lg
        text-sm
        inline-block
        mr-2
        mb-2
        "
      >

        {slot.start_time}
        {" - "}
        {slot.end_time}

      </div>

    ))}

  </div>

</td>

<td className="p-4 font-bold text-green-600">
  ₹{booking.total_amount}
</td>

<td className="p-4 text-center">

  {booking.payment_id ? (

    <span
      className="
      inline-block
      bg-green-100
      text-green-700
      px-3
      py-1
      rounded-full
      font-semibold
      text-sm
      "
    >
      ✓ Paid
    </span>

  ) : (

    <span
      className="
      inline-block
      bg-yellow-100
      text-yellow-700
      px-3
      py-1
      rounded-full
      font-semibold
      text-sm
      "
    >
      Unpaid
    </span>

  )}

</td>


<td className="p-4 text-center">

  
{booking.status === "Confirmed" ? (

  <button
    onClick={() => cancelBooking(booking.id)}
    className="
      bg-red-500
      hover:bg-red-600
      text-white
      px-5
      py-2
      rounded-lg
    "
  >
    Cancel
  </button>

) : booking.status === "Cancelled" ? (

  <button
    disabled
    className="
      bg-gray-500
      text-white
      px-5
      py-2
      rounded-lg
      cursor-not-allowed
    "
  >
    Cancelled
  </button>

) : (

  <button
    disabled
    className="
      bg-blue-500
      text-white
      px-5
      py-2
      rounded-lg
      cursor-not-allowed
    "
  >
    Completed
  </button>

)}
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    {/* Pagination */}

{totalPages > 1 && (

  <div
    className="
    flex
    flex-wrap
    justify-center
    items-center
    gap-2
    mt-6
    "
  >

    {/* Previous */}

    <button
      onClick={() =>
        setCurrentPage(
          (page) =>
            Math.max(page - 1, 1)
        )
      }
      disabled={currentPage === 1}
      className="
      px-4
      py-2
      rounded-lg
      border
      font-semibold
      disabled:opacity-40
      disabled:cursor-not-allowed
      hover:bg-gray-100
      "
    >
      Previous
    </button>


    {/* Page Numbers */}

    {Array.from(
      { length: totalPages },
      (_, index) => index + 1
    ).map((page) => (

      <button
        key={page}
        onClick={() =>
          setCurrentPage(page)
        }
        className={`
          px-4
          py-2
          rounded-lg
          font-semibold
          ${
            currentPage === page
              ? "bg-green-600 text-white"
              : "border hover:bg-gray-100"
          }
        `}
      >
        {page}
      </button>

    ))}


    {/* Next */}

    <button
      onClick={() =>
        setCurrentPage(
          (page) =>
            Math.min(
              page + 1,
              totalPages
            )
        )
      }
      disabled={
        currentPage === totalPages
      }
      className="
      px-4
      py-2
      rounded-lg
      border
      font-semibold
      disabled:opacity-40
      disabled:cursor-not-allowed
      hover:bg-gray-100
      "
    >
      Next
    </button>

  </div>

)}  

      {/* Mobile Cards */}
      <div
        className="
        lg:hidden
        space-y-4
        "
      >

        {bookings.length > 0 ? (

          currentBookings.map(
            (booking) => (
              <div
                key={
                  booking.id
                }
                className="
                bg-white
                rounded-2xl
                shadow-lg
                p-5
                "
              >

                <div className="flex justify-between items-center mb-3">

                  <h3
                    className="
                    font-bold
                    text-lg
                    "
                  >
                    {
                      booking.booking_code
                    }
                  </h3>

                  <span
                    className="
                    text-green-600
                    font-bold
                    "
                  >
                    ₹
                    {
                      booking.total_amount
                    }
                  </span>

                  {booking.payment_id ? (

  <span
    className="
    bg-green-100
    text-green-700
    px-3
    py-1
    rounded-full
    text-xs
    font-semibold
    "
  >
    ✓ Paid
  </span>

) : (

  <span
    className="
    bg-yellow-100
    text-yellow-700
    px-3
    py-1
    rounded-full
    text-xs
    font-semibold
    "
  >
    Unpaid
  </span>

)}

                </div>

                <div className="space-y-2">

                  <div className="flex items-center gap-2">

                    <FaUser />

                    <span>
                      {
                        booking.customer_name
                      }
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <FaPhone />

                    <span>
                      {
                        booking.mobile
                      }
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <FaCalendarCheck />

                    <span>
                      {
                        booking.booking_date
                      }
                    </span>

                  </div>

                  <div className="mt-3">

  <h4 className="font-semibold mb-2">

    Booked Slots

  </h4>

  <div className="flex flex-wrap gap-2">

    {booking.slots?.map((slot, index) => (

      <span
        key={index}
        className="
        bg-green-100
        text-green-700
        px-3
        py-1
        rounded-full
        text-sm
        "
      >

        {slot.start_time}
        {" - "}
        {slot.end_time}

      </span>

    ))}

  </div>

</div>


                </div>

{booking.status === "Confirmed" ? (

  <button
    onClick={() => cancelBooking(booking.id)}
    className="
    w-full
    mt-4
    bg-red-500
    hover:bg-red-600
    text-white
    py-3
    rounded-xl
    flex
    items-center
    justify-center
    gap-2
    "
  >
    <FaTrash />
    Cancel Booking
  </button>

) : booking.status === "Cancelled" ? (

  <button
    disabled
    className="
    w-full
    mt-4
    bg-gray-500
    text-white
    py-3
    rounded-xl
    cursor-not-allowed
    "
  >
    Cancelled
  </button>

) : (

  <button
    disabled
    className="
    w-full
    mt-4
    bg-blue-500
    text-white
    py-3
    rounded-xl
    cursor-not-allowed
    "
  >
    Completed
  </button>

)}

              </div>
            )
          )

        ) : (

          <div
            className="
            bg-white
            rounded-2xl
            shadow-lg
            p-8
            text-center
            "
          >
            No Bookings Found
          </div>

        )}

      </div>

    </AdminLayout>
  );
}

export default AdminBookings;