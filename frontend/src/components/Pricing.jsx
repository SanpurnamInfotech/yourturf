import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaFutbol,
  FaParking,
  FaLightbulb,
} from "react-icons/fa";

import API from "../services/api";

function Pricing({ turf }) {

  const [settings, setSettings] = useState({
    day_price: turf?.day_price || 800,
    night_price: turf?.night_price || 1000,
  });

  useEffect(() => {
    if (turf?.day_price && turf?.night_price) {
      setSettings({
        day_price: turf.day_price,
        night_price: turf.night_price,
      });
      return;
    }

    const loadSettings = async () => {
      try {
        const url = turf?.id ? `settings/?turf_id=${turf.id}` : "settings/";
        const response = await API.get(url);
        setSettings(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    loadSettings();

  const interval = setInterval(() => {

    loadSettings();

  }, 30000);

  const handleFocus = () => {

    loadSettings();

  };

  window.addEventListener(
    "focus",
    handleFocus
  );

  return () => {

    clearInterval(interval);

    window.removeEventListener(
      "focus",
      handleFocus
    );

  };

}, []);

  return (
    <section
      id="pricing"
      className="py-20 bg-gray-100"
    >
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-14">

          <h2 className="text-4xl md:text-5xl font-bold">
            Turf Pricing
          </h2>

          <p className="text-gray-600 mt-4">
            Affordable rates for all players
          </p>

        </div>

        <div
          className="
          grid
          md:grid-cols-2
          gap-8
          "
        >

          {/* Day Plan */}

          <div
            className="
            bg-white
            rounded-3xl
            shadow-xl
            p-8
            text-center
            "
          >

            <div className="text-5xl mb-4">
              ☀️
            </div>

            <h3
              className="
              text-3xl
              font-bold
              text-green-600
              "
            >
              Day Slot
            </h3>

            <div
              className="
              text-6xl
              font-bold
              my-6
              "
            >
              ₹{settings.day_price}
            </div>

            <p className="text-gray-500">
              Per Hour
            </p>

            <div className="mt-6">
              6:00 AM - 6:00 PM
            </div>

          </div>

          {/* Night Plan */}

          <div
            className="
            bg-gray-900
            text-white
            rounded-3xl
            shadow-xl
            p-8
            text-center
            "
          >

            <div className="text-5xl mb-4">
              🌙
            </div>

            <h3
              className="
              text-3xl
              font-bold
              text-yellow-400
              "
            >
              Night Slot
            </h3>

            <div
              className="
              text-6xl
              font-bold
              my-6
              "
            >
              ₹{settings.night_price}
            </div>

            <p className="text-gray-300">
              Per Hour
            </p>

            <div className="mt-6">
              6:00 PM - 6:00 AM
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Pricing;