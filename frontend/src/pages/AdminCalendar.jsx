import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCalendarDay,
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminCalendar() {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const [selectedDate, setSelectedDate] =
    useState(today);

  const [bookedSlots, setBookedSlots] =
    useState([]);

  const [availableSlots, setAvailableSlots] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  if (
    localStorage.getItem("isAdmin") !==
    "true"
  ) {
    return (
      <Navigate to="/admin-login" />
    );
  }

  const formatTime = (time) => {
    return new Date(
      `2000-01-01T${time}`
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const loadCalendar = async () => {
    try {
      setLoading(true);

      const response =
        await API.get(
          `calendar/?date=${selectedDate}`
        );

      setBookedSlots(
        response.data.booked_slots
      );

      setAvailableSlots(
        response.data.available_slots
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, [selectedDate]);

  return (
    <AdminLayout>

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-4xl font-bold">
          Slot Calendar
        </h1>

        <p className="text-gray-500 mt-2">
          View booked and available slots
        </p>

        <div
          className="
          inline-block
          mt-4
          bg-green-100
          text-green-700
          px-4
          py-2
          rounded-full
          text-sm
          font-medium
          "
        >
          Selected Date: {selectedDate}
        </div>

      </div>

      {/* Date Selector */}
      <div
        className="
        bg-white
        rounded-2xl
        shadow-lg
        p-5
        mb-6
        "
      >

        <div className="flex items-center gap-2 mb-4">

          <FaCalendarDay />

          <h2 className="text-xl font-bold">
            Select Date
          </h2>

        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) =>
            setSelectedDate(
              e.target.value
            )
          }
          className="
          border
          rounded-xl
          p-3
          "
        />

      </div>

      {/* Stats Cards */}
      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-6
        mb-8
        "
      >

        <div
          className="
          bg-gradient-to-r
          from-red-500
          to-red-700
          text-white
          rounded-2xl
          p-5
          shadow-lg
          "
        >

          <div className="flex items-center gap-4">

            <FaCheckCircle size={40} />

            <div>

              <h3 className="text-lg">
                Booked Slots
              </h3>

              <h2 className="text-5xl font-bold">
                {bookedSlots.length}
              </h2>

            </div>

          </div>

        </div>

        <div
          className="
          bg-gradient-to-r
          from-green-500
          to-green-700
          text-white
          rounded-2xl
          p-5
          shadow-lg
          "
        >

          <div className="flex items-center gap-4">

            <FaClock size={40} />

            <div>

              <h3 className="text-lg">
                Available Slots
              </h3>

              <h2 className="text-5xl font-bold">
                {availableSlots.length}
              </h2>

            </div>

          </div>

        </div>

      </div>

      {loading ? (

        <div
          className="
          bg-white
          rounded-2xl
          shadow-lg
          p-10
          text-center
          "
        >
          Loading Slots...
        </div>

      ) : (

        <div
          className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-8
          "
        >

          {/* Booked Slots */}
          <div
            className="
            bg-white
            rounded-2xl
            shadow-lg
            p-6
            "
          >

            <div className="flex items-center gap-2 mb-6">

              <FaCheckCircle
                className="text-red-500"
              />

              <h2
                className="
                text-xl
                font-bold
                text-red-600
                "
              >
                Booked Slots
              </h2>

            </div>

            {bookedSlots.length > 0 ? (

              <div className="space-y-3">

                {bookedSlots.map(
                  (slot) => (

                    <div
                      key={slot.id}
                      className="
                      bg-red-50
                      border
                      border-red-200
                      rounded-xl
                      p-4
                      "
                    >

                      <div className="flex items-center gap-2">

                        <FaCheckCircle
                          className="
                          text-red-500
                          "
                        />

                        <span className="font-medium">

                          {formatTime(
                            slot.start_time
                          )}

                          {" - "}

                          {formatTime(
                            slot.end_time
                          )}

                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="text-center py-12">

                <FaCheckCircle
                  size={50}
                  className="
                  mx-auto
                  text-green-500
                  mb-4
                  "
                />

                <h3 className="text-xl font-semibold">
                  No Bookings Found
                </h3>

                <p className="text-gray-500 mt-2">
                  All slots are available.
                </p>

              </div>

            )}

          </div>

          {/* Available Slots */}
          <div
            className="
            bg-white
            rounded-2xl
            shadow-lg
            p-6
            "
          >

            <div className="flex items-center gap-2 mb-6">

              <FaClock
                className="
                text-green-500
                "
              />

              <h2
                className="
                text-xl
                font-bold
                text-green-600
                "
              >
                Available Slots
              </h2>

            </div>

            {availableSlots.length > 0 ? (

              <div className="space-y-3">

                {availableSlots.map(
                  (slot) => (

                    <div
                      key={slot.id}
                      className="
                      bg-green-50
                      border
                      border-green-200
                      rounded-xl
                      p-4
                      "
                    >

                      <div className="flex items-center gap-2">

                        <FaClock
                          className="
                          text-green-500
                          "
                        />

                        <span className="font-medium">

                          {formatTime(
                            slot.start_time
                          )}

                          {" - "}

                          {formatTime(
                            slot.end_time
                          )}

                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="text-center py-12">

                <FaClock
                  size={50}
                  className="
                  mx-auto
                  text-red-500
                  mb-4
                  "
                />

                <h3 className="text-xl font-semibold">
                  No Available Slots
                </h3>

                <p className="text-gray-500 mt-2">
                  All slots are booked.
                </p>

              </div>

            )}

          </div>

        </div>

      )}

    </AdminLayout>
  );
}

export default AdminCalendar;