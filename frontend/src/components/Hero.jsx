import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Hero({ turf }) {

  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    day_price: 800,
    night_price: 1000,
  });

  useEffect(() => {

  const loadSettings = async () => {

    try {

      const response = await API.get("settings/");

      setSettings(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  // Initial Load
  loadSettings();

  // Refresh every 30 seconds
  const interval = setInterval(() => {

    loadSettings();

  }, 30000);

  // Refresh when user comes back to the tab
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
      id="home"
      className="
      relative
      min-h-screen
      flex
      items-center
      justify-center
      bg-cover
      bg-center
      "
      style={{
        backgroundImage:`url("${
          turf?.main_image ||
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80"
        }")`,
      }}
    >

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Content */}
      <div
        className="
        relative
        z-10
        max-w-7xl
        mx-auto
        px-6
        text-center
        text-white
        "
      >

        <span
          className="
          inline-block
          bg-green-500
          px-4
          py-2
          rounded-full
          text-sm
          font-semibold
          mb-6
          "
        >
          Premium Cricket & Football Turf
        </span>

        <h1
          className="
          text-5xl
          md:text-7xl
          font-bold
          leading-tight
          "
        >
          {turf?.name || "Dream Turf"}
          <span className="text-green-500">
            {" "}
            Turf
          </span>
        </h1>

        <h2
          className="
          text-2xl
          md:text-4xl
          font-semibold
          mt-4
          "
        >
          Play. Compete. Win.
        </h2>

        <p
          className="
          mt-6
          max-w-2xl
          mx-auto
          text-lg
          text-gray-200
          "
        >
          Experience premium turf facilities with
          flood lights, parking, clean washrooms,
          drinking water, and seamless online
          booking.
        </p>

        {/* Dynamic Prices */}

        <div
          className="
          flex
          flex-wrap
          justify-center
          gap-4
          mt-8
          "
        >

          <div
            className="
            bg-green-500
            px-6
            py-3
            rounded-full
            font-semibold
            "
          >
            ☀️ Day Slot ₹{settings.day_price}/hr
          </div>

          <div
            className="
            bg-gray-800
            border
            border-white
            px-6
            py-3
            rounded-full
            font-semibold
            "
          >
            🌙 Night Slot ₹{settings.night_price}/hr
          </div>

        </div>

        {/* Buttons */}

        <div
          className="
          flex
          flex-col
          sm:flex-row
          gap-4
          justify-center
          mt-10
          "
        >

          <button
            onClick={() => navigate("/book")}
            className="
            bg-green-500
            hover:bg-green-600
            px-8
            py-4
            rounded-xl
            text-lg
            font-semibold
            transition
            "
          >
            Book Turf
          </button>

          <a
            href="#gallery"
            className="
            border
            border-white
            hover:bg-white
            hover:text-black
            px-8
            py-4
            rounded-xl
            text-lg
            font-semibold
            transition
            "
          >
            View Gallery
          </a>

        </div>

        {/* Stats */}

        <div
          className="
          mt-16
          grid
          grid-cols-1
          md:grid-cols-3
          gap-8
          "
        >

          <div>

            <h3
              className="
              text-3xl
              font-bold
              text-green-500
              "
            >
              500+
            </h3>

            <p>Happy Players</p>

          </div>

          <div>

            <h3
              className="
              text-3xl
              font-bold
              text-green-500
              "
            >
              24
            </h3>

            <p>Available Slots Daily</p>

          </div>

          <div>

            <h3
              className="
              text-3xl
              font-bold
              text-green-500
              "
            >
              100%
            </h3>

            <p>Online Booking</p>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;