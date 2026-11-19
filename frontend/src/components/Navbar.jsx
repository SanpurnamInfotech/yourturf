import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaMapMarkerAlt, FaFutbol } from "react-icons/fa";
import { useTurf } from "../context/TurfContext";
import CitySelector from "./CitySelector";

function Navbar({ turf }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { websiteSettings } = useTurf();

  // Branding remains permanently fixed to YourTurf / Master Settings
  const brandName = websiteSettings?.site_name || "YourTurf";

  return (
    <nav className="bg-black text-white sticky top-0 z-50 shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Permanent Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5">
          {websiteSettings?.logo ? (
            <img
              src={websiteSettings.logo}
              alt={brandName}
              className="h-8 md:h-9 w-auto max-w-[160px] object-contain rounded"
            />
          ) : (
            <FaFutbol className="text-green-500 text-2xl" />
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {brandName}
          </h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#home" className="hover:text-green-400 transition font-medium">
            Home
          </a>

          <a href="#turfs" className="hover:text-green-400 transition font-medium">
            Our Turfs
          </a>

          <a href="#about" className="hover:text-green-400 transition font-medium">
            About
          </a>

          <a href="#gallery" className="hover:text-green-400 transition font-medium">
            Gallery
          </a>

          <Link
            to={turf?.id ? `/book?turf_id=${turf.id}` : "/book"}
            className="text-green-400 hover:text-green-300 font-semibold transition"
          >
            Book Turf
          </Link>

          <Link
            to="/booking-history"
            className="hover:text-green-400 transition font-medium"
          >
            My Bookings
          </Link>

          {/* Searchable City Selector Dropdown */}
          <CitySelector />

          <Link
            to="/admin-login"
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-xl transition shadow-md active:scale-95 text-sm"
          >
            Admin
          </Link>
        </div>

        {/* Mobile Icon */}
        <button
          className="md:hidden text-2xl text-gray-300 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800 flex flex-col p-6 gap-4">
          {/* Searchable City Selector in Mobile Menu */}
          <div className="mb-2 p-3 bg-gray-900 border border-gray-700 rounded-xl">
            <label className="text-xs text-gray-400 block mb-2 flex items-center gap-1.5 font-medium">
              <FaMapMarkerAlt className="text-green-400" />
              <span>Select City:</span>
            </label>
            <CitySelector isMobile={true} onSelect={() => setMenuOpen(false)} />
          </div>

          <a href="#home" onClick={() => setMenuOpen(false)} className="hover:text-green-400 py-1 font-medium">
            Home
          </a>
          <a href="#turfs" onClick={() => setMenuOpen(false)} className="hover:text-green-400 py-1 font-medium">
            Our Turfs
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)} className="hover:text-green-400 py-1 font-medium">
            About
          </a>
          <a href="#gallery" onClick={() => setMenuOpen(false)} className="hover:text-green-400 py-1 font-medium">
            Gallery
          </a>
          <Link
            to={turf?.id ? `/book?turf_id=${turf.id}` : "/book"}
            onClick={() => setMenuOpen(false)}
            className="text-green-400 font-bold py-1"
          >
            Book Turf
          </Link>
          <Link to="/booking-history" onClick={() => setMenuOpen(false)} className="hover:text-green-400 py-1 font-medium">
            My Bookings
          </Link>
          <Link
            to="/admin-login"
            onClick={() => setMenuOpen(false)}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-3 rounded-xl text-center transition mt-2 shadow-md"
          >
            Admin Login
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
