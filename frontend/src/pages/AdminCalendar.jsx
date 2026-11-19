import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  FaCalendarDay,
  FaCheckCircle,
  FaClock,
  FaLock,
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { useTurf } from "../context/TurfContext";


function AdminCalendar() {

  // ==========================================
  // TODAY
  // ==========================================

  const today = new Date()
    .toISOString()
    .split("T")[0];


  // ==========================================
  // STATE
  // ==========================================

  const { turfs, selectedTurfId } = useTurf();
  const [calendarTurfId, setCalendarTurfId] = useState(selectedTurfId || "");
  const [currentTurfInfo, setCurrentTurfInfo] = useState(null);

  useEffect(() => {
    if (selectedTurfId) {
      setCalendarTurfId(selectedTurfId);
    }
  }, [selectedTurfId]);

  const [selectedDate, setSelectedDate] =
    useState(today);

  const [bookedSlots, setBookedSlots] =
    useState([]);

  const [availableSlots, setAvailableSlots] =
    useState([]);

  const [closedSlots, setClosedSlots] =
    useState([]);

  const [closure, setClosure] =
    useState(null);

  const [loading, setLoading] =
    useState(false);


  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================

  if (
    localStorage.getItem("isAdmin") !==
    "true"
  ) {

    return (
      <Navigate to="/admin-login" />
    );

  }


  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (time) => {

    if (!time) {
      return "";
    }

    return new Date(
      `2000-01-01T${time}`
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );

  };


  // ==========================================
  // LOAD CALENDAR
  // ==========================================

  const loadCalendar = async () => {

    try {

      setLoading(true);

      let url = `calendar/?date=${selectedDate}`;
      if (calendarTurfId) {
        url += `&turf_id=${calendarTurfId}`;
      }

      const response = await API.get(url);

      setBookedSlots(
        response.data.booked_slots || []
      );

      setAvailableSlots(
        response.data.available_slots || []
      );

      setClosedSlots(
        response.data.closed_slots || []
      );

      setClosure(
        response.data.closure || null
      );

      if (response.data.turf) {
        setCurrentTurfInfo(response.data.turf);
      }

    } catch (error) {

      console.log(
        "Failed to load calendar:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // DATE / TURF CHANGE
  // ==========================================

  useEffect(() => {

    loadCalendar();

  }, [selectedDate, calendarTurfId]);


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <AdminLayout>

      {/* ======================================
          HEADER
      ======================================= */}

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1
            className="
            text-4xl
            font-bold
            "
          >
            Slot Calendar
          </h1>

          <p
            className="
            text-gray-500
            mt-2
            "
          >
            Inspect booked, available, and closed slots for any venue
          </p>
        </div>

        {/* Venue Selector */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-600">Select Venue:</span>
          <select
            value={calendarTurfId}
            onChange={(e) => setCalendarTurfId(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 px-3 py-1.5 rounded-xl text-xs font-semibold outline-none focus:border-green-600 cursor-pointer"
          >
            {turfs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.location})
              </option>
            ))}
          </select>
        </div>

      </div>


      {/* ======================================
          DATE SELECTOR
      ======================================= */}

      <div
        className="
        bg-white
        rounded-2xl
        shadow-lg
        p-5
        mb-6
        "
      >

        <div
          className="
          flex
          items-center
          gap-2
          mb-4
          "
        >

          <FaCalendarDay />

          <h2
            className="
            text-xl
            font-bold
            "
          >

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


      {/* ======================================
          FULL DAY CLOSURE MESSAGE
      ======================================= */}

      {closure &&
        closure.type === "full_day" && (

        <div
          className="
          bg-orange-50
          border
          border-orange-200
          rounded-2xl
          p-5
          mb-6
          "
        >

          <div
            className="
            flex
            items-start
            gap-4
            "
          >

            <FaLock
              className="
              text-orange-500
              mt-1
              "
              size={24}
            />


            <div>

              <h3
                className="
                font-bold
                text-orange-700
                text-lg
                "
              >

                Turf Closed for Full Day

              </h3>


              {closure.reason && (

                <p
                  className="
                  text-orange-600
                  mt-1
                  "
                >

                  Reason: {closure.reason}

                </p>

              )}

            </div>

          </div>

        </div>

      )}


      {/* ======================================
          STATS CARDS
      ======================================= */}

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-6
        mb-8
        "
      >

        {/* BOOKED */}

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

          <div
            className="
            flex
            items-center
            gap-4
            "
          >

            <FaCheckCircle
              size={40}
            />


            <div>

              <h3 className="text-lg">

                Booked Slots

              </h3>


              <h2
                className="
                text-5xl
                font-bold
                "
              >

                {bookedSlots.length}

              </h2>

            </div>

          </div>

        </div>


        {/* AVAILABLE */}

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

          <div
            className="
            flex
            items-center
            gap-4
            "
          >

            <FaClock
              size={40}
            />


            <div>

              <h3 className="text-lg">

                Available Slots

              </h3>


              <h2
                className="
                text-5xl
                font-bold
                "
              >

                {availableSlots.length}

              </h2>

            </div>

          </div>

        </div>


        {/* CLOSED */}

        <div
          className="
          bg-gradient-to-r
          from-orange-500
          to-orange-700
          text-white
          rounded-2xl
          p-5
          shadow-lg
          "
        >

          <div
            className="
            flex
            items-center
            gap-4
            "
          >

            <FaLock
              size={40}
            />


            <div>

              <h3 className="text-lg">

                Closed Slots

              </h3>


              <h2
                className="
                text-5xl
                font-bold
                "
              >

                {closedSlots.length}

              </h2>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          LOADING
      ======================================= */}

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
          lg:grid-cols-3
          gap-8
          "
        >


          {/* =================================
              BOOKED SLOTS
          ================================== */}

          <div
            className="
            bg-white
            rounded-2xl
            shadow-lg
            p-6
            "
          >

            <div
              className="
              flex
              items-center
              gap-2
              mb-6
              "
            >

              <FaCheckCircle
                className="
                text-red-500
                "
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

                      <div
                        className="
                        flex
                        items-center
                        gap-2
                        "
                      >

                        <FaCheckCircle
                          className="
                          text-red-500
                          "
                        />


                        <span
                          className="
                          font-medium
                          "
                        >

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

              <div
                className="
                text-center
                py-12
                "
              >

                <FaCheckCircle
                  size={50}
                  className="
                  mx-auto
                  text-green-500
                  mb-4
                  "
                />


                <h3
                  className="
                  text-xl
                  font-semibold
                  "
                >

                  No Bookings Found

                </h3>


                <p
                  className="
                  text-gray-500
                  mt-2
                  "
                >

                  No slots are booked.

                </p>

              </div>

            )}

          </div>


          {/* =================================
              AVAILABLE SLOTS
          ================================== */}

          <div
            className="
            bg-white
            rounded-2xl
            shadow-lg
            p-6
            "
          >

            <div
              className="
              flex
              items-center
              gap-2
              mb-6
              "
            >

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

              <div
                className="
                space-y-3
                "
              >

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

                      <div
                        className="
                        flex
                        items-center
                        gap-2
                        "
                      >

                        <FaClock
                          className="
                          text-green-500
                          "
                        />


                        <span
                          className="
                          font-medium
                          "
                        >

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

              <div
                className="
                text-center
                py-12
                "
              >

                <FaClock
                  size={50}
                  className="
                  mx-auto
                  text-gray-400
                  mb-4
                  "
                />


                <h3
                  className="
                  text-xl
                  font-semibold
                  "
                >

                  No Available Slots

                </h3>


                <p
                  className="
                  text-gray-500
                  mt-2
                  "
                >

                  All slots are either booked
                  or closed.

                </p>

              </div>

            )}

          </div>


          {/* =================================
              CLOSED SLOTS
          ================================== */}

          <div
            className="
            bg-white
            rounded-2xl
            shadow-lg
            p-6
            "
          >

            <div
              className="
              flex
              items-center
              gap-2
              mb-6
              "
            >

              <FaLock
                className="
                text-orange-500
                "
              />


              <h2
                className="
                text-xl
                font-bold
                text-orange-600
                "
              >

                Closed Slots

              </h2>

            </div>


            {closedSlots.length > 0 ? (

              <div
                className="
                space-y-3
                "
              >

                {closedSlots.map(
                  (slot) => (

                    <div
                      key={slot.id}
                      className="
                      bg-orange-50
                      border
                      border-orange-200
                      rounded-xl
                      p-4
                      "
                    >

                      <div
                        className="
                        flex
                        items-center
                        gap-2
                        "
                      >

                        <FaLock
                          className="
                          text-orange-500
                          "
                        />


                        <span
                          className="
                          font-medium
                          text-orange-700
                          "
                        >

                          {formatTime(
                            slot.start_time
                          )}

                          {" - "}

                          {formatTime(
                            slot.end_time
                          )}

                        </span>

                      </div>


                      {closure?.reason && (

                        <p
                          className="
                          text-orange-600
                          text-sm
                          mt-2
                          ml-6
                          "
                        >

                          {closure.reason}

                        </p>

                      )}

                    </div>

                  )
                )}

              </div>

            ) : (

              <div
                className="
                text-center
                py-12
                "
              >

                <FaLock
                  size={50}
                  className="
                  mx-auto
                  text-green-500
                  mb-4
                  "
                />


                <h3
                  className="
                  text-xl
                  font-semibold
                  "
                >

                  No Closed Slots

                </h3>


                <p
                  className="
                  text-gray-500
                  mt-2
                  "
                >

                  There are no closures
                  for this date.

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