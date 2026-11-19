import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  FaSave,
  FaSun,
  FaMoon,
  FaCalendarAlt,
  FaTools,
  FaCog,
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { useTurf } from "../context/TurfContext";


function AdminSettings() {

  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================

  if (
    localStorage.getItem("isAdmin") !== "true"
  ) {
    return <Navigate to="/admin-login" />;
  }


  // ==========================================
  // TURF SELECTION
  // ==========================================

  const { turfs, selectedTurfId } = useTurf();
  const [settingsTurfId, setSettingsTurfId] = useState(selectedTurfId || "");

  useEffect(() => {
    if (selectedTurfId) {
      setSettingsTurfId(selectedTurfId);
    } else if (turfs.length > 0 && !settingsTurfId) {
      setSettingsTurfId(turfs[0].id);
    }
  }, [selectedTurfId, turfs]);


  // ==========================================
  // PRICING
  // ==========================================

  const [dayPrice, setDayPrice] =
    useState("");

  const [nightPrice, setNightPrice] =
    useState("");


  // ==========================================
  // CLOSURES
  // ==========================================

  const [closures, setClosures] =
    useState([]);

  const [closureDate, setClosureDate] =
    useState("");

  const [closureType, setClosureType] =
    useState("full_day");

  const [closureReason, setClosureReason] =
    useState("");


  // ==========================================
  // START TIME
  // ==========================================

  const [startHour, setStartHour] =
    useState("");

  const [startPeriod, setStartPeriod] =
    useState("AM");


  // ==========================================
  // END TIME
  // ==========================================

  const [endHour, setEndHour] =
    useState("");

  const [endPeriod, setEndPeriod] =
    useState("AM");


  // ==========================================
  // LOADING / SAVING
  // ==========================================

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);


  // ==========================================
  // LOAD SETTINGS
  // ==========================================

  const loadSettings = async () => {

    try {

      setLoading(true);

      const url = settingsTurfId ? `settings/?turf_id=${settingsTurfId}` : "settings/";
      const response = await API.get(url);

      setDayPrice(
        response.data.day_price
      );

      setNightPrice(
        response.data.night_price
      );

    } catch (error) {

      console.log(
        "Failed to load settings:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD CLOSURES
  // ==========================================

  const loadClosures = async () => {

    try {

      const url = settingsTurfId ? `closures/?turf_id=${settingsTurfId}` : "closures/";
      const response = await API.get(url);

      setClosures(
        response.data
      );

    } catch (error) {

      console.log(
        "Failed to load closures:",
        error
      );

    }

  };


  // ==========================================
  // CONVERT 12 HOUR → 24 HOUR
  // ==========================================

  const convertTo24Hour = (
    hour,
    period
  ) => {

    let hour24 =
      Number(hour);


    if (period === "AM") {

      if (hour24 === 12) {

        hour24 = 0;

      }

    } else {

      if (hour24 !== 12) {

        hour24 += 12;

      }

    }


    return `${String(hour24).padStart(
      2,
      "0"
    )}:00:00`;

  };


  // ==========================================
  // CONVERT TIME → MINUTES
  // ==========================================

  const getMinutesFromTime = (
    hour,
    period
  ) => {

    let hour24 =
      Number(hour);


    if (period === "AM") {

      if (hour24 === 12) {

        hour24 = 0;

      }

    } else {

      if (hour24 !== 12) {

        hour24 += 12;

      }

    }


    return hour24 * 60;

  };


  // ==========================================
  // FORMAT TIME FOR DISPLAY
  // ==========================================

  const formatTime = (time) => {

    if (!time) {

      return "";

    }


    const parts =
      time.split(":");


    const hour =
      Number(parts[0]);


    const period =
      hour >= 12
        ? "PM"
        : "AM";


    let displayHour =
      hour % 12;


    if (displayHour === 0) {

      displayHour = 12;

    }


    return `${displayHour} ${period}`;

  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {

    if (!date) {

      return "";

    }


    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // ==========================================
  // ADD CLOSURE
  // ==========================================

  const addClosure = async () => {

    // ----------------------------------------
    // DATE VALIDATION
    // ----------------------------------------

    if (!closureDate) {

      alert(
        "Please select a closure date."
      );

      return;

    }


    // ----------------------------------------
    // TIME VALIDATION
    // ----------------------------------------

    if (
      closureType ===
      "specific_hours"
    ) {

      if (
        !startHour ||
        !endHour
      ) {

        alert(
          "Please select From Time and To Time."
        );

        return;

      }


      const startMinutes =
        getMinutesFromTime(
          startHour,
          startPeriod
        );


      const endMinutes =
        getMinutesFromTime(
          endHour,
          endPeriod
        );


      if (
        startMinutes >=
        endMinutes
      ) {

        alert(
          "To Time must be greater than From Time."
        );

        return;

      }

    }


    try {

      setSaving(true);


      // ----------------------------------------
      // DATA
      // ----------------------------------------

      const data = {
        turf: settingsTurfId || 1,
        date: closureDate,
        is_full_day:
          closureType ===
          "full_day",

        reason:
          closureReason.trim(),

      };


      // ----------------------------------------
      // SPECIFIC HOURS
      // ----------------------------------------

      if (
        closureType ===
        "specific_hours"
      ) {

        data.start_time =
          convertTo24Hour(
            startHour,
            startPeriod
          );


        data.end_time =
          convertTo24Hour(
            endHour,
            endPeriod
          );

      } else {

        data.start_time = null;

        data.end_time = null;

      }


      // ----------------------------------------
      // SAVE TO API
      // ----------------------------------------

      await API.post(
        "closures/",
        data
      );


      alert(
        "Closure Added Successfully."
      );


      // ----------------------------------------
      // RESET FORM
      // ----------------------------------------

      setClosureDate("");

      setClosureType(
        "full_day"
      );

      setStartHour("");

      setStartPeriod("AM");

      setEndHour("");

      setEndPeriod("AM");

      setClosureReason("");


      // ----------------------------------------
      // RELOAD CLOSURES
      // ----------------------------------------

      await loadClosures();

    } catch (error) {

      console.log(
        "Add closure error:",
        error
      );


      console.log(
        "API response:",
        error.response?.data
      );


      alert(
        error.response?.data?.detail ||
        "Unable to add closure."
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // DELETE CLOSURE
  // ==========================================

  const deleteClosure = async (
    closureId
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this closure?"
      );


    if (!confirmDelete) {

      return;

    }


    try {

      setSaving(true);


      await API.delete(
        `closures/${closureId}/`
      );


      setClosures(
        (previousClosures) =>
          previousClosures.filter(
            (closure) =>
              closure.id !==
              closureId
          )
      );


      alert(
        "Closure Deleted Successfully."
      );

    } catch (error) {

      console.log(
        "Delete closure error:",
        error
      );


      alert(
        "Unable to delete closure."
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // SAVE PRICING SETTINGS
  // ==========================================

  const saveSettings = async () => {

    if (!dayPrice) {

      alert(
        "Please enter Day Price."
      );

      return;

    }


    if (!nightPrice) {

      alert(
        "Please enter Night Price."
      );

      return;

    }


    try {

      setSaving(true);


      await API.put(
        "settings/",
        {
          turf_id: settingsTurfId,
          day_price: dayPrice,
          night_price: nightPrice,
        }
      );


      alert(
        "Settings Saved Successfully."
      );

    } catch (error) {

      console.log(
        "Save settings error:",
        error
      );


      alert(
        "Failed to save settings."
      );

    } finally {

      setSaving(false);

    }

  };


  // ==========================================
  // LOAD DATA WHEN PAGE OPENS OR TURF CHANGES
  // ==========================================

  useEffect(() => {

    loadSettings();

    loadClosures();

  }, [settingsTurfId]);


  // ==========================================
  // HOURS
  // ==========================================

  const hours = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];


  // ==========================================
  // TIME SELECTOR
  // ==========================================

  const TimeSelector = ({
    hour,
    setHour,
    period,
    setPeriod,
  }) => {

    return (

      <div
        className="
        grid
        grid-cols-2
        gap-3
        "
      >

        {/* HOUR */}

        <select
          value={hour}
          onChange={(e) =>
            setHour(
              e.target.value
            )
          }
          className="
          w-full
          border
          border-gray-300
          rounded-xl
          p-4
          bg-white
          text-lg
          outline-none
          focus:ring-2
          focus:ring-green-500
          "
        >

          <option value="">
            Hour
          </option>


          {hours.map(
            (item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            )
          )}

        </select>


        {/* AM / PM */}

        <select
          value={period}
          onChange={(e) =>
            setPeriod(
              e.target.value
            )
          }
          className="
          w-full
          border
          border-gray-300
          rounded-xl
          p-4
          bg-white
          text-lg
          font-semibold
          outline-none
          focus:ring-2
          focus:ring-green-500
          "
        >

          <option value="AM">
            AM
          </option>

          <option value="PM">
            PM
          </option>

        </select>

      </div>

    );

  };


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <AdminLayout>

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div
          className="
          flex
          items-center
          gap-4
          "
        >

          <div
            className="
            bg-green-600
            text-white
            p-4
            rounded-2xl
            "
          >

            <FaCog
              size={30}
            />

          </div>


          <div>

            <h1
              className="
              text-4xl
              font-bold
              "
            >

              Pricing & Closures

            </h1>


            <p
              className="
              text-gray-500
              mt-2
              "
            >

              Configure Day/Night rates and Full/Partial Day Closures per Venue

            </p>

          </div>

        </div>

        {/* Venue Selector */}
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-600">Select Venue:</span>
          <select
            value={settingsTurfId}
            onChange={(e) => setSettingsTurfId(e.target.value)}
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


      {/* =====================================
          LOADING
      ====================================== */}

      {loading ? (

        <div
          className="
          bg-white
          rounded-2xl
          shadow-lg
          p-20
          text-center
          text-xl
          font-semibold
          "
        >

          Loading Settings...

        </div>

      ) : (

        <>


          {/* =================================
              PRICING
          ================================== */}

          <div
            className="
            bg-white
            rounded-3xl
            shadow-xl
            p-8
            mb-8
            "
          >

            <h2
              className="
              text-2xl
              font-bold
              mb-8
              "
            >

              Turf Pricing

            </h2>


            <div
              className="
              grid
              md:grid-cols-2
              gap-8
              "
            >

              {/* DAY PRICE */}

              <div>

                <label
                  className="
                  flex
                  items-center
                  gap-3
                  font-semibold
                  mb-3
                  "
                >

                  <FaSun
                    className="
                    text-yellow-500
                    text-xl
                    "
                  />

                  Day Price (Per Hour)

                </label>


                <input
                  type="number"
                  value={dayPrice}
                  onChange={(e) =>
                    setDayPrice(
                      e.target.value
                    )
                  }
                  className="
                  w-full
                  border
                  rounded-xl
                  p-4
                  text-lg
                  focus:ring-2
                  focus:ring-green-500
                  outline-none
                  "
                />

              </div>


              {/* NIGHT PRICE */}

              <div>

                <label
                  className="
                  flex
                  items-center
                  gap-3
                  font-semibold
                  mb-3
                  "
                >

                  <FaMoon
                    className="
                    text-blue-600
                    text-xl
                    "
                  />

                  Night Price (Per Hour)

                </label>


                <input
                  type="number"
                  value={nightPrice}
                  onChange={(e) =>
                    setNightPrice(
                      e.target.value
                    )
                  }
                  className="
                  w-full
                  border
                  rounded-xl
                  p-4
                  text-lg
                  focus:ring-2
                  focus:ring-green-500
                  outline-none
                  "
                />

              </div>

            </div>

          </div>


          {/* =================================
              CLOSURE MANAGEMENT
          ================================== */}

          <div
            className="
            bg-white
            rounded-3xl
            shadow-xl
            p-8
            mb-8
            "
          >

            <h2
              className="
              text-2xl
              font-bold
              mb-2
              flex
              items-center
              gap-3
              "
            >

              <FaCalendarAlt />

              Holiday / Closure Management

            </h2>


            <p
              className="
              text-gray-500
              mb-8
              "
            >

              Add full-day holidays or
              close the turf for specific
              hours.

            </p>


            {/* =================================
                ADD CLOSURE FORM
            ================================== */}

            <div
              className="
              bg-gray-50
              rounded-2xl
              p-6
              "
            >

              <h3
                className="
                text-xl
                font-bold
                mb-6
                "
              >

                Add New Closure

              </h3>


              {/* CLOSURE TYPE */}

              <div className="mb-6">

                <label
                  className="
                  font-semibold
                  block
                  mb-3
                  "
                >

                  Closure Type

                </label>


                <div
                  className="
                  grid
                  md:grid-cols-2
                  gap-4
                  "
                >

                  {/* FULL DAY */}

                  <button
                    type="button"
                    onClick={() =>
                      setClosureType(
                        "full_day"
                      )
                    }
                    className={`
                    p-4
                    rounded-xl
                    border-2
                    font-semibold
                    transition

                    ${
                      closureType ===
                      "full_day"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white hover:border-green-400"
                    }
                    `}
                  >

                    📅 Full Day

                  </button>


                  {/* SPECIFIC HOURS */}

                  <button
                    type="button"
                    onClick={() =>
                      setClosureType(
                        "specific_hours"
                      )
                    }
                    className={`
                    p-4
                    rounded-xl
                    border-2
                    font-semibold
                    transition

                    ${
                      closureType ===
                      "specific_hours"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white hover:border-green-400"
                    }
                    `}
                  >

                    🕐 Specific Hours

                  </button>

                </div>

              </div>


              {/* =================================
                  DATE
              ================================== */}

              <div className="mb-6">

                <label
                  className="
                  font-semibold
                  block
                  mb-3
                  "
                >

                  Closure Date

                </label>


                <input
                  type="date"
                  value={
                    closureDate
                  }
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setClosureDate(
                      e.target.value
                    )
                  }
                  className="
                  w-full
                  border
                  rounded-xl
                  p-4
                  outline-none
                  focus:ring-2
                  focus:ring-green-500
                  "
                />

              </div>


              {/* =================================
                  SPECIFIC HOURS
              ================================== */}

              {closureType ===
                "specific_hours" && (

                <div
                  className="
                  grid
                  md:grid-cols-2
                  gap-6
                  mb-6
                  "
                >

                  {/* FROM TIME */}

                  <div>

                    <label
                      className="
                      font-semibold
                      block
                      mb-3
                      "
                    >

                      From Time

                    </label>


                    <TimeSelector
                      hour={
                        startHour
                      }
                      setHour={
                        setStartHour
                      }
                      period={
                        startPeriod
                      }
                      setPeriod={
                        setStartPeriod
                      }
                    />

                  </div>


                  {/* TO TIME */}

                  <div>

                    <label
                      className="
                      font-semibold
                      block
                      mb-3
                      "
                    >

                      To Time

                    </label>


                    <TimeSelector
                      hour={
                        endHour
                      }
                      setHour={
                        setEndHour
                      }
                      period={
                        endPeriod
                      }
                      setPeriod={
                        setEndPeriod
                      }
                    />

                  </div>

                </div>

              )}


              {/* =================================
                  REASON
              ================================== */}

              <div className="mb-6">

                <label
                  className="
                  font-semibold
                  block
                  mb-3
                  "
                >

                  <span
                    className="
                    flex
                    items-center
                    gap-2
                    "
                  >

                    <FaTools />

                    Reason

                  </span>

                </label>


                <textarea
                  rows="3"
                  value={
                    closureReason
                  }
                  onChange={(e) =>
                    setClosureReason(
                      e.target.value
                    )
                  }
                  placeholder="Example: Turf Maintenance / Private Match / Tournament"
                  className="
                  w-full
                  border
                  rounded-xl
                  p-4
                  resize-none
                  outline-none
                  focus:ring-2
                  focus:ring-green-500
                  "
                />

              </div>


              {/* =================================
                  ADD BUTTON
              ================================== */}

              <button
                type="button"
                onClick={
                  addClosure
                }
                disabled={
                  saving
                }
                className="
                w-full
                bg-green-600
                hover:bg-green-700
                disabled:bg-gray-400
                text-white
                py-4
                rounded-xl
                font-bold
                text-lg
                transition
                "
              >

                {saving
                  ? "Adding..."
                  : "+ Add Closure"}

              </button>

            </div>


            {/* =================================
                UPCOMING CLOSURES
            ================================== */}

            <div
              className="
              mt-10
              "
            >

              <h3
                className="
                text-xl
                font-bold
                mb-5
                "
              >

                Upcoming Closures

              </h3>


              {closures.length === 0 ? (

                <div
                  className="
                  bg-gray-50
                  rounded-2xl
                  p-8
                  text-center
                  text-gray-500
                  "
                >

                  No closures added yet.

                </div>

              ) : (

                <div
                  className="
                  space-y-4
                  "
                >

                  {closures.map(
                    (closure) => (

                      <div
                        key={
                          closure.id
                        }
                        className="
                        border
                        border-gray-200
                        rounded-2xl
                        p-5
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-4
                        "
                      >

                        {/* CLOSURE INFO */}

                        <div>

                          <div
                            className="
                            font-bold
                            text-lg
                            "
                          >

                            📅{" "}

                            {formatDate(
                              closure.date
                            )}

                          </div>


                          <div
                            className="
                            text-green-600
                            font-semibold
                            mt-1
                            "
                          >

                            {closure.is_full_day

                              ? "Full Day Closed"

                              : `${formatTime(
                                  closure.start_time
                                )} - ${formatTime(
                                  closure.end_time
                                )}`

                            }

                          </div>


                          {closure.reason && (

                            <p
                              className="
                              text-gray-500
                              mt-1
                              "
                            >

                              {closure.reason}

                            </p>

                          )}

                        </div>


                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            deleteClosure(
                              closure.id
                            )
                          }
                          disabled={
                            saving
                          }
                          className="
                          bg-red-500
                          hover:bg-red-600
                          disabled:bg-gray-400
                          text-white
                          px-5
                          py-3
                          rounded-xl
                          font-semibold
                          "
                        >

                          🗑 Delete

                        </button>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>


          {/* =================================
              SAVE SETTINGS
          ================================== */}

          <div
            className="
            mt-10
            mb-10
            "
          >

            <button
              onClick={
                saveSettings
              }
              disabled={
                saving
              }
              className="
              w-full
              bg-green-600
              hover:bg-green-700
              disabled:bg-gray-400
              text-white
              py-4
              rounded-2xl
              font-bold
              text-lg
              flex
              justify-center
              items-center
              gap-3
              "
            >

              <FaSave />

              {saving
                ? "Saving..."
                : "Save Settings"}

            </button>

          </div>

        </>

      )}

    </AdminLayout>

  );

}


export default AdminSettings;