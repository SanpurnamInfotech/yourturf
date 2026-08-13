import {
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaEnvelope,
  } from "react-icons/fa";
  
  function Footer({ turf }) {
    return (
      <footer className="bg-gray-950 text-white">
  
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-6 py-20">
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
  
            {/* Brand */}
            <div>
  
              <h2 className="text-3xl font-bold">
                {turf?.name || "Dream Turf"}
                <span className="text-green-500">
                  {" "}Turf
                </span>
              </h2>
  
              <p className="mt-5 text-gray-400 leading-7">
                Premium football and cricket turf
                with world-class facilities,
                flood lights, parking and
                seamless online booking.
              </p>
  
              {/* Social Icons */}
              <div className="flex gap-4 mt-6">
  
                <a
                  href="#"
                  className="
                  w-10
                  h-10
                  rounded-full
                  bg-gray-800
                  flex
                  items-center
                  justify-center
                  hover:bg-green-500
                  transition
                  "
                >
                  <FaFacebookF />
                </a>
  
                <a
                  href="#"
                  className="
                  w-10
                  h-10
                  rounded-full
                  bg-gray-800
                  flex
                  items-center
                  justify-center
                  hover:bg-green-500
                  transition
                  "
                >
                  <FaInstagram />
                </a>
  
                <a
                  href="#"
                  className="
                  w-10
                  h-10
                  rounded-full
                  bg-gray-800
                  flex
                  items-center
                  justify-center
                  hover:bg-green-500
                  transition
                  "
                >
                  <FaTwitter />
                </a>
  
              </div>
  
            </div>
  
            {/* Quick Links */}
            <div>
  
              <h3 className="text-xl font-bold mb-6">
                Quick Links
              </h3>
  
              <ul className="space-y-4 text-gray-400">
  
                <li>
                  <a
                    href="#home"
                    className="hover:text-green-500"
                  >
                    Home
                  </a>
                </li>
  
                <li>
                  <a
                    href="#about"
                    className="hover:text-green-500"
                  >
                    About Us
                  </a>
                </li>
  
                <li>
                  <a
                    href="#gallery"
                    className="hover:text-green-500"
                  >
                    Gallery
                  </a>
                </li>
  
                <li>
                  <a
                    href="#contact"
                    className="hover:text-green-500"
                  >
                    Contact
                  </a>
                </li>
  
              </ul>
  
            </div>
  
            {/* Facilities */}
            <div>
  
              <h3 className="text-xl font-bold mb-6">
                Facilities
              </h3>
  
              <ul className="space-y-4 text-gray-400">
  
                <li>✓ Premium Turf</li>
                <li>✓ Flood Lights</li>
                <li>✓ Parking Facility</li>
                <li>✓ Washroom</li>
                <li>✓ Drinking Water</li>
                <li>✓ Online Booking</li>
  
              </ul>
  
            </div>
  
            {/* Contact */}
            <div>
  
              <h3 className="text-xl font-bold mb-6">
                Contact Info
              </h3>
  
              <div className="space-y-5">
  
                <div className="flex gap-3">
  
                  <FaPhoneAlt
                    className="text-green-500 mt-1"
                  />
  
                  <span className="text-gray-400">
                    {turf?.phone || "Contact Us"}
                  </span>
  
                </div>
  
                <div className="flex gap-3">
  
                  <FaEnvelope
                    className="text-green-500 mt-1"
                  />
  
                  <a
                    href={`mailto:${turf?.email || ""}`}
                    className="text-gray-400 hover:text-green-500 transition"
                  >
                    {turf?.email || "Email not available"}
                  </a>

  
                </div>
  
                <div className="flex gap-3">
  
                  <FaMapMarkerAlt
                    className="text-green-500 mt-1"
                  />
  
                  <span className="text-gray-400">
                    {turf?.location || "Location not available"}
                  </span>
  
                </div>
  
              </div>
  
            </div>
  
          </div>
  
        </div>
  
        {/* Bottom Bar */}
        <div
          className="
          border-t
          border-gray-800
          py-6
          text-center
          text-gray-500
          "
        >
          © 2026 {turf?.name || "Dream Turf"} Turf. All Rights Reserved.
        </div>
  
      </footer>
    );
  }
  
  export default Footer;