import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar({ turf }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="
      bg-black
      text-white
      sticky
      top-0
      z-50
      shadow-lg
      "
    >
      <div
        className="
        max-w-7xl
        mx-auto
        px-6
        py-4
        flex
        justify-between
        items-center
      "
      >
        {/* Logo */}
        <div>
          <h1 className="text-3xl font-bold">
           {turf?.name || "Dream Turf"}
            <span className="text-green-500">
              {" "}Turf
            </span>
          </h1>
        </div>

        {/* Desktop Menu */}
<div className="hidden md:flex items-center gap-7">

  <a
    href="#home"
    className="hover:text-green-500 transition"
  >
    Home
  </a>

  <a
    href="#about"
    className="hover:text-green-500 transition"
  >
    About
  </a>

  <a
    href="#gallery"
    className="hover:text-green-500 transition"
  >
    Gallery
  </a>

  <a
    href="#pricing"
    className="hover:text-green-500 transition"
  >
    Pricing
  </a>

  <Link
    to="/book"
    className="hover:text-green-500 transition"
  >
    Book Turf
  </Link>

  <Link
    to="/booking-history"
    className="hover:text-green-500 transition"
  >
    Booking History
  </Link>

  <a
    href="#contact"
    className="hover:text-green-500 transition"
  >
    Contact
  </a>

  <Link
    to="/admin-login"
    className="
    bg-green-500
    hover:bg-green-600
    px-5
    py-2
    rounded-xl
    transition
    "
  >
    Admin
  </Link>

</div>

        {/* Mobile Icon */}
        <button
          className="md:hidden text-2xl"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >
          {menuOpen ? (
            <FaTimes />
          ) : (
            <FaBars />
          )}
        </button>
      </div>

      {/* Mobile Menu */}

      {menuOpen && (

<div
className="
flex
flex-col
p-6
gap-5
"
>

<a
  href="#home"
  onClick={() => setMenuOpen(false)}
>
  Home
</a>

<a
  href="#about"
  onClick={() => setMenuOpen(false)}
>
  About
</a>

<a
  href="#gallery"
  onClick={() => setMenuOpen(false)}
>
  Gallery
</a>

<a
  href="#pricing"
  onClick={() => setMenuOpen(false)}
>
  Pricing
</a>

<Link
  to="/book"
  onClick={() => setMenuOpen(false)}
>
  Book Turf
</Link>

<Link
  to="/booking-history"
  onClick={() => setMenuOpen(false)}
>
  Booking History
</Link>

<a
  href="#contact"
  onClick={() => setMenuOpen(false)}
>
  Contact
</a>

<Link
  to="/admin-login"
  onClick={() => setMenuOpen(false)}
  className="
  bg-green-500
  hover:bg-green-600
  px-4
  py-3
  rounded-xl
  text-center
  transition
  "
>
  Admin Login
</Link>

</div>

      )}

    </nav>
  );
}

export default Navbar;