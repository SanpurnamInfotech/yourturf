import {
  FaCheckCircle,
  FaFutbol,
  FaClock,
  FaShieldAlt,
} from "react-icons/fa";
import { useTurf } from "../context/TurfContext";

function About({ turf }) {
  const { websiteSettings } = useTurf();
  const displayName = websiteSettings?.site_name || turf?.name || "YourTurf";

  return (
    <section
      id="about"
      className="py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-16">

          <span className="text-green-600 font-semibold uppercase tracking-wider">
            About {displayName}
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            The Perfect Place To Play
          </h2>

          <p className="mt-6 text-gray-600 max-w-3xl mx-auto">
            {displayName} offers a premium football
            and cricket experience with modern
            facilities, flood lights, online booking,
            and a professionally maintained playing
            surface.
          </p>

        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Image */}
          <div>

            <img
              src={
                websiteSettings?.about_image ||
                turf?.about_image ||
                "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80"
              }
              alt={displayName}
              className="
                rounded-3xl
                shadow-2xl
                w-full
                h-full
                object-cover
             "
           />

          </div>

          {/* Right Content */}
          <div>

            <h3 className="text-3xl font-bold mb-6">
              Why Players Choose Us
            </h3>

            <p className="text-gray-600 mb-8">
              Whether you're playing with friends,
              organizing tournaments, or practicing
              with your team, {displayName} provides
              the ideal environment for every match.
            </p>

            <div className="space-y-6">

              <div className="flex items-start gap-4">

                <FaFutbol
                  className="text-green-500 mt-1"
                  size={24}
                />

                <div>
                  <h4 className="font-bold text-lg">
                    Premium Playing Surface
                  </h4>

                  <p className="text-gray-600">
                    Professionally maintained turf
                    for a smooth and safe experience.
                  </p>
                </div>

              </div>

              <div className="flex items-start gap-4">

                <FaClock
                  className="text-green-500 mt-1"
                  size={24}
                />

                <div>
                  <h4 className="font-bold text-lg">
                    Easy Online Booking
                  </h4>

                  <p className="text-gray-600">
                    Reserve your slot instantly from
                    any device.
                  </p>
                </div>

              </div>

              <div className="flex items-start gap-4">

                <FaShieldAlt
                  className="text-green-500 mt-1"
                  size={24}
                />

                <div>
                  <h4 className="font-bold text-lg">
                    Safe & Secure
                  </h4>

                  <p className="text-gray-600">
                    Clean environment with secure
                    facilities and proper maintenance.
                  </p>
                </div>

              </div>

            </div>

            {/* Highlights */}
            <div
              className="
                mt-10
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              "
            >

              <div className="flex items-center gap-3">

                <FaCheckCircle className="text-green-500" />

                <span>Flood Lights</span>

              </div>

              <div className="flex items-center gap-3">

                <FaCheckCircle className="text-green-500" />

                <span>Parking Facility</span>

              </div>

              <div className="flex items-center gap-3">

                <FaCheckCircle className="text-green-500" />

                <span>Clean Washrooms</span>

              </div>

              <div className="flex items-center gap-3">

                <FaCheckCircle className="text-green-500" />

                <span>Drinking Water</span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default About;
