import { Link } from "react-router-dom";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { useTurf } from "../context/TurfContext";

function ContactCTA({ turf }) {
  const { websiteSettings } = useTurf();
  const phone = websiteSettings?.contact_phone || turf?.phone || "1234567890";
  const email = websiteSettings?.contact_email || turf?.email || "support@yourturf.com";

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
              Book your turf slot today and enjoy a premium football & cricket
              experience with your friends and team.
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
                href={`tel:${phone}`}
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

          {/* Right Side - Information Box */}
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
              Contact Information
            </h3>

            <div className="space-y-6">
              {/* 1. Phone Number */}
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <FaPhoneAlt size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-green-100">
                    Phone Number
                  </h4>
                  <a
                    href={`tel:${phone}`}
                    className="text-lg font-bold hover:underline"
                  >
                    {phone}
                  </a>
                </div>
              </div>

              {/* 2. Email Address */}
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <FaEnvelope size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-green-100">
                    Email
                  </h4>
                  <a
                    href={`mailto:${email}`}
                    className="text-lg font-bold hover:underline break-all"
                  >
                    {email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactCTA;
