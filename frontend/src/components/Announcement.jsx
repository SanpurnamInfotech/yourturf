import { useEffect, useState } from "react";
import API from "../services/api";

function Announcement() {

  const [closures, setClosures] = useState([]);

  const [loading, setLoading] = useState(true);

  const [isPaused, setIsPaused] = useState(false);


  // ==========================================
  // LOAD CLOSURES
  // ==========================================

  const loadClosures = async () => {

    try {

      const response = await API.get("closures/");

      setClosures(response.data || []);

    } catch (error) {

      console.log(
        "Failed to load announcements:",
        error
      );

      setClosures([]);

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD + REFRESH
  // ==========================================

  useEffect(() => {

    loadClosures();

    const interval = setInterval(() => {

      loadClosures();

    }, 30000);


    const handleFocus = () => {

      loadClosures();

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


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return null;

  }


  // ==========================================
  // TODAY
  // ==========================================

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  // ==========================================
  // FILTER UPCOMING CLOSURES
  // ==========================================

  const validClosures = closures
    .filter((closure) => {

      if (!closure.date) {

        return false;

      }


      const closureDate = new Date(
        `${closure.date}T00:00:00`
      );


      return closureDate >= today;

    })
    .sort((a, b) => {

      return (
        new Date(
          `${a.date}T00:00:00`
        ) -
        new Date(
          `${b.date}T00:00:00`
        )
      );

    });


  // ==========================================
  // NO CLOSURES
  // ==========================================

  if (validClosures.length === 0) {

    return null;

  }


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {

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
  // FORMAT TIME
  // ==========================================

  const formatTime = (time) => {

    if (!time) {

      return "";

    }


    const [hour] = time.split(":");

    const hourNumber = Number(hour);

    const period =
      hourNumber >= 12
        ? "PM"
        : "AM";


    let displayHour =
      hourNumber % 12;


    if (displayHour === 0) {

      displayHour = 12;

    }


    return `${displayHour} ${period}`;

  };


  // ==========================================
  // CREATE ALL ANNOUNCEMENTS
  // ==========================================

  const announcementMessages =
    validClosures.map(
      (closure) => {

        const date =
          formatDate(
            closure.date
          );


        // FULL DAY

        if (closure.is_full_day) {

          return (
            `⚽ ${
              closure.reason ||
              "Turf will remain closed for the full day."
            } — Closed on ${date}`
          );

        }


        // SPECIFIC HOURS

        let message =
          `⚽ ${
            closure.reason ||
            "Turf will be temporarily closed."
          } — Closed on ${date}`;


        if (
          closure.start_time &&
          closure.end_time
        ) {

          message +=
            ` from ${formatTime(
              closure.start_time
            )} to ${formatTime(
              closure.end_time
            )}`;

        }


        return message;

      }
    );


  // ==========================================
  // JOIN ALL ANNOUNCEMENTS
  // ==========================================

  const announcementText =
    announcementMessages.join(
      "     •     "
    );


  // ==========================================
  // DISPLAY
  // ==========================================

  return (

    <div
      className="
      w-full
      bg-green-700
      text-white
      overflow-hidden
      "
    >

      <div
        className="
        flex
        items-stretch
        "
      >

        {/* ==================================
            LABEL
        =================================== */}

        <div
          className="
          bg-green-900
          px-5
          md:px-8
          py-3
          font-bold
          whitespace-nowrap
          flex
          items-center
          z-10
          "
        >

          🔔 Announcement

        </div>


        {/* ==================================
            SCROLLING ANNOUNCEMENTS
        =================================== */}

        <div
          className="
          flex-1
          overflow-hidden
          whitespace-nowrap
          "
        >

          <div
  className="
    inline-block
    py-3
    pl-6
    pr-10
    font-medium
    animate-marquee
  "
  style={{
    animationPlayState:
      isPaused
        ? "paused"
        : "running",
  }}
  onMouseEnter={() =>
    setIsPaused(true)
  }
  onMouseLeave={() =>
    setIsPaused(false)
  }
>
  {announcementText}
</div>

        </div>

      </div>

    </div>

  );

}


export default Announcement;