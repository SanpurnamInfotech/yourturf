import { Link } from "react-router-dom";
import {
  FaPhoneAlt,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";

function ContactCTA({ turf }) {
  return (
    <section
      id="contact"
      className="
      py-24
      bg-gradient-to-r
      from-green-600
      to-green-800
      text-white
      "
    >
      <div className="max-w-7xl mx-auto px-6">

        <div
          className="
          grid
          lg:grid-cols-2
          gap-12
          items-center
          "
        >

          {/* Left Side */}
          <div>

            <span
              className="
              uppercase
              tracking-widest
              font-semibold
              text-green-100
              "
            >
              Contact & Booking
            </span>

            <h2
              className="
              text-4xl
              md:text-6xl
              font-bold
              mt-4
              "
            >
              Ready To Play?
            </h2>

            <p
              className="
              mt-6
              text-lg
              text-green-100
              max-w-xl
              "
            >
              Book your turf slot today and enjoy
              a premium football & cricket experience
              with your friends and team.
            </p>

            {/* CTA Buttons */}
            <div
              className="
              flex
              flex-col
              sm:flex-row
              gap-4
              mt-10
              "
            >

              <a
                href={`tel:${turf?.phone || ""}`}
                className="
                bg-white
                text-green-700
                px-8
                py-4
                rounded-xl
                font-bold
                text-center
                hover:bg-gray-100
                transition
                "
              >
                📞 Call Now
              </a>

              <Link
                to="/book"
                className="
                border-2
                border-white
                px-8
                py-4
                rounded-xl
                font-bold
                text-center
                hover:bg-white
                hover:text-green-700
                transition
                "
              >
                Book Turf
              </Link>

            </div>

          </div>

          {/* Right Side */}
          <div
            className="
            bg-white/10
            backdrop-blur-md
            rounded-3xl
            p-8
            shadow-2xl
            "
          >

            <h3
              className="
              text-2xl
              font-bold
              mb-8
              "
            >
              Turf Information
            </h3>

            <div className="space-y-6">

              <div className="flex gap-4">

                <FaPhoneAlt
                  size={22}
                  className="mt-1"
                />

                <div>

                  <h4 className="font-semibold">
                    Phone Number
                  </h4>

                  <p>
                   {turf?.phone || "Contact Us"}
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <FaClock
                  size={22}
                  className="mt-1"
                />

                <div>

                  <h4 className="font-semibold">
                    Opening Hours
                  </h4>

                  <p>
                    24*7 Open
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <FaMapMarkerAlt
                  size={22}
                  className="mt-1"
                />

                <div>

                  <h4 className="font-semibold">
                    Location
                  </h4>

                  <p>
                    {turf?.location || "Location not available"}
                  </p>

                </div>

              </div>

            </div>

            {/* Small Notice */}
            <div
              className="
              mt-8
              bg-green-500/20
              p-4
              rounded-xl
              "
            >
              ⚽ Online booking available for all
              daily slots. Secure your preferred
              time before it gets booked.
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default ContactCTA;