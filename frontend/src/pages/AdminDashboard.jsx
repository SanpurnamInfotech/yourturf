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
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminDashboard() {
  const [dashboard, setDashboard] =
    useState({});

  const [recentBookings, setRecentBookings] =
    useState([]);

  const [turf, setTurf] = useState(null);  

  if (
    localStorage.getItem(
      "isAdmin"
    ) !== "true"
  ) {
    return (
      <Navigate
        to="/admin-login"
      />
    );
  }
  
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

  const loadDashboard = async () => {
    try {
      const response =
        await API.get(
          "dashboard/"
        );

      setDashboard(
        response.data
      );
    } catch (error) {
      console.log(error);
    }
  };

  const loadRecentBookings =
    async () => {
      try {
        const response =
          await API.get(
            "bookings/"
          );

        setRecentBookings(
          response.data.slice(
            0,
            5
          )
        );
      } catch (error) {
        console.log(error);
      }
    };

  useEffect(() => {
    loadDashboard();
    loadRecentBookings();
    loadTurf();
  }, []);

  return (
    <AdminLayout>

      {/* Welcome Banner */}
      <div
        className="
        bg-gradient-to-r
        from-green-600
        to-green-800
        text-white
        rounded-3xl
        p-6
        md:p-10
        mb-8
        shadow-xl
        "
      >
        <div
          className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-6
          "
        >
          <div>

            <h1
              className="
              text-3xl
              md:text-5xl
              font-bold
              "
            >
              {turf?.name || "Turf"} Turf
            </h1>

            <p
              className="
              mt-3
              text-green-100
              "
            >
              Manage bookings,
              gallery and
              slot calendar
              from one place.
            </p>

          </div>

          <FaFutbol
            size={80}
            className="
            hidden
            md:block
            "
          />

        </div>
      </div>

      {/* Dashboard Cards */}
      <div
        className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        gap-6
        mb-10
        "
      >

        <div
          className="
          bg-gradient-to-r
          from-blue-500
          to-blue-700
          text-white
          rounded-2xl
          p-6
          shadow-lg
          "
        >
          <FaCalendarCheck
            size={35}
          />

          <h3 className="mt-4">
            Total Bookings
          </h3>

          <h2
            className="
            text-4xl
            font-bold
            mt-2
            "
          >
            {
              dashboard.total_bookings ||
              0
            }
          </h2>
        </div>

        <div
          className="
          bg-gradient-to-r
          from-green-500
          to-green-700
          text-white
          rounded-2xl
          p-6
          shadow-lg
          "
        >
          <FaMoneyBillWave
            size={35}
          />

          <h3 className="mt-4">
            Today's Revenue
          </h3>

          <h2
            className="
            text-4xl
            font-bold
            mt-2
            "
          >
            ₹
            {
              dashboard.today_revenue ||
              0
            }
          </h2>
        </div>

        <div
          className="
          bg-gradient-to-r
          from-orange-500
          to-orange-700
          text-white
          rounded-2xl
          p-6
          shadow-lg
          "
        >
          <FaClock
            size={35}
          />

          <h3 className="mt-4">
            Today's Bookings
          </h3>

          <h2
            className="
            text-4xl
            font-bold
            mt-2
            "
          >
            {
              dashboard.today_bookings ||
              0
            }
          </h2>
        </div>

        <div
          className="
          bg-gradient-to-r
          from-purple-500
          to-purple-700
          text-white
          rounded-2xl
          p-6
          shadow-lg
          "
        >
          <FaClock
            size={35}
          />

          <h3 className="mt-4">
            Total Slots
          </h3>

          <h2
            className="
            text-4xl
            font-bold
            mt-2
            "
          >
            {
              dashboard.total_slots ||
              0
            }
          </h2>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="mb-10">

        <h2
          className="
          text-2xl
          font-bold
          mb-5
          "
        >
          Quick Actions
        </h2>

        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
          "
        >

          <Link
            to="/admin/bookings"
            className="
            bg-white
            rounded-2xl
            shadow-lg
            p-6
            hover:shadow-xl
            transition
            "
          >
            <FaCalendarCheck
              size={35}
              className="text-blue-600"
            />

            <h3
              className="
              text-xl
              font-bold
              mt-4
              "
            >
              Bookings
            </h3>

            <p className="text-gray-500 mt-2">
              View and manage
              bookings
            </p>

            <div className="mt-4">
              <FaArrowRight />
            </div>

          </Link>

          <Link
            to="/admin/gallery"
            className="
            bg-white
            rounded-2xl
            shadow-lg
            p-6
            hover:shadow-xl
            transition
            "
          >
            <FaImages
              size={35}
              className="text-green-600"
            />

            <h3
              className="
              text-xl
              font-bold
              mt-4
              "
            >
              Gallery
            </h3>

            <p className="text-gray-500 mt-2">
              Upload and manage
              images
            </p>

            <div className="mt-4">
              <FaArrowRight />
            </div>

          </Link>

          <Link
            to="/admin/calendar"
            className="
            bg-white
            rounded-2xl
            shadow-lg
            p-6
            hover:shadow-xl
            transition
            "
          >
            <FaCalendarAlt
              size={35}
              className="text-purple-600"
            />

            <h3
              className="
              text-xl
              font-bold
              mt-4
              "
            >
              Calendar
            </h3>

            <p className="text-gray-500 mt-2">
              View booked and
              available slots
            </p>

            <div className="mt-4">
              <FaArrowRight />
            </div>

          </Link>

        </div>

      </div>

      {/* Recent Bookings */}
      <div
        className="
        bg-white
        rounded-2xl
        shadow-lg
        p-6
        "
      >

        <h2
          className="
          text-2xl
          font-bold
          mb-5
          "
        >
          Recent Bookings
        </h2>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">

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
                  Amount
                </th>

              </tr>

            </thead>

            <tbody>

              {recentBookings.map(
                (
                  booking
                ) => (
                  <tr
                    key={
                      booking.id
                    }
                    className="
                    border-b
                    "
                  >
                    <td className="p-4">
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
                      {
                        booking.booking_date
                      }
                    </td>

                    <td
                      className="
                      p-4
                      font-bold
                      text-green-600
                      "
                    >
                      ₹
                      {
                        booking.total_amount
                      }
                    </td>
                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">

          {recentBookings.map(
            (
              booking
            ) => (
              <div
                key={
                  booking.id
                }
                className="
                border
                rounded-xl
                p-4
                "
              >
                <p>
                  <strong>
                    Code:
                  </strong>{" "}
                  {
                    booking.booking_code
                  }
                </p>

                <p>
                  <strong>
                    Customer:
                  </strong>{" "}
                  {
                    booking.customer_name
                  }
                </p>

                <p>
                  <strong>
                    Mobile:
                  </strong>{" "}
                  {
                    booking.mobile
                  }
                </p>

                <p>
                  <strong>
                    Date:
                  </strong>{" "}
                  {
                    booking.booking_date
                  }
                </p>

                <p
                  className="
                  text-green-600
                  font-bold
                  mt-2
                  "
                >
                  ₹
                  {
                    booking.total_amount
                  }
                </p>

              </div>
            )
          )}

        </div>

      </div>

    </AdminLayout>
  );
}

export default AdminDashboard;