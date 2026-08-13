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

function AdminSettings() {

  // -----------------------------
  // Admin Authentication
  // -----------------------------

  if (
    localStorage.getItem("isAdmin") !==
    "true"
  ) {
    return (
      <Navigate to="/admin-login" />
    );
  }

  // -----------------------------
  // State
  // -----------------------------

  const [dayPrice, setDayPrice] =
    useState("");

  const [nightPrice, setNightPrice] =
    useState("");

  const [holidayFrom, setHolidayFrom] =
    useState("");

  const [holidayTo, setHolidayTo] =
    useState("");

  const [holidayReason, setHolidayReason] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // -----------------------------
  // Load Settings
  // -----------------------------

  const loadSettings = async () => {

    try {

      setLoading(true);

      const response =
        await API.get(
          "settings/"
        );

      setDayPrice(
        response.data.day_price
      );

      setNightPrice(
        response.data.night_price
      );

      setHolidayFrom(
        response.data.holiday_from || ""
      );

      setHolidayTo(
        response.data.holiday_to || ""
      );

      setHolidayReason(
        response.data.holiday_reason || ""
      );

    } catch (error) {

      console.log(error);

      alert(
        "Unable to load settings."
      );

    } finally {

      setLoading(false);

    }

  };

  // -----------------------------
  // Save Settings
  // -----------------------------

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

    if (
      holidayFrom &&
      holidayTo &&
      holidayFrom > holidayTo
    ) {

      alert(
        "Holiday From date cannot be greater than Holiday To date."
      );

      return;

    }

    try {

      setSaving(true);
      const data = {

  day_price: dayPrice,

  night_price: nightPrice,

};

if (holidayFrom) {

  data.holiday_from = holidayFrom;

}

if (holidayTo) {

  data.holiday_to = holidayTo;

}

if (holidayReason.trim()) {

  data.holiday_reason = holidayReason;

}

await API.put(
  "settings/",
  data
);

      alert(
        "Settings Saved Successfully."
      );

    } catch (error) {

      console.log(error);

      alert(
        "Failed to save settings."
      );

    } finally {

      setSaving(false);

    }

  };

  const clearHoliday = async () => {

  try {

    setSaving(true);

    await API.put(
      "settings/",
      {
        holiday_from: null,
        holiday_to: null,
        holiday_reason: "",
      }
    );

    setHolidayFrom("");
    setHolidayTo("");
    setHolidayReason("");

    alert("Holiday Cleared Successfully.");

  } catch (error) {

    console.log(error);

    alert("Unable to clear holiday.");

  } finally {

    setSaving(false);

  }

};

  // -----------------------------
  // Initial Load
  // -----------------------------

  useEffect(() => {

    loadSettings();

  }, []);

  return (

    <AdminLayout>

          {/* Header */}

      <div className="mb-10">

        <div className="flex items-center gap-4">

          <div
            className="
            bg-green-600
            text-white
            p-4
            rounded-2xl
            "
          >
            <FaCog size={30} />
          </div>

          <div>

            <h1
              className="
              text-4xl
              font-bold
              "
            >
              Admin Settings
            </h1>

            <p className="text-gray-500 mt-2">
              Manage Turf Pricing and Holiday Settings
            </p>

          </div>

        </div>

      </div>

      {

        loading ?

        (

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

        )

        :

        (

          <>

            {/* Pricing Section */}

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

                {/* Day Price */}

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

                    onChange={(e)=>

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

                {/* Night Price */}

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

                    onChange={(e)=>

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


                    {/* Holiday Settings */}

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
                text-2xl
                font-bold
                mb-8
                flex
                items-center
                gap-3
                "
              >

                <FaCalendarAlt />

                Turf Holiday

              </h2>

              <div
                className="
                grid
                md:grid-cols-2
                gap-8
                "
              >

                {/* Holiday From */}

                <div>

                  <label
                    className="
                    font-semibold
                    block
                    mb-3
                    "
                  >

                    Holiday From

                  </label>

                  <input

                    type="date"

                    value={holidayFrom}

                    onChange={(e)=>

                      setHolidayFrom(
                        e.target.value
                      )

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

                </div>

                {/* Holiday To */}

                <div>

                  <label
                    className="
                    font-semibold
                    block
                    mb-3
                    "
                  >

                    Holiday To

                  </label>

                  <input

                    type="date"

                    value={holidayTo}

                    onChange={(e)=>

                      setHolidayTo(
                        e.target.value
                      )

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

                </div>

              </div>

              {/* Holiday Reason */}

              <div className="mt-8">

                <label
                  className="
                  font-semibold
                  block
                  mb-3
                  "
                >

                  <div
                    className="
                    flex
                    items-center
                    gap-2
                    "
                  >

                    <FaTools />

                    Holiday Reason

                  </div>

                </label>

                <textarea

                  rows="4"

                  value={holidayReason}

                  onChange={(e)=>

                    setHolidayReason(
                      e.target.value
                    )

                  }

                  placeholder="Example: Turf Maintenance"

                  className="
                  w-full
                  border
                  rounded-xl
                  p-4
                  resize-none
                  focus:ring-2
                  focus:ring-green-500
                  outline-none
                  "

                />

              </div>

            </div>

            {/* Save Button */}

            

<div className="mt-10 flex flex-col md:flex-row gap-4">

  <button
    onClick={saveSettings}
    disabled={saving}
    className="
    flex-1
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

    {saving ? "Saving..." : "Save Settings"}

  </button>

  <button
    onClick={clearHoliday}
    disabled={saving}
    className="
    flex-1
    bg-red-600
    hover:bg-red-700
    disabled:bg-gray-400
    text-white
    py-4
    rounded-2xl
    font-bold
    text-lg
    "
  >
    🗑 Clear Holiday
  </button>

</div>          </>

        )

      }

    </AdminLayout>

  );

}

export default AdminSettings;    