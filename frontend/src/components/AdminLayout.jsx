import { useState , useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {FaBars,FaTimes,FaFutbol,FaTachometerAlt,FaCalendarCheck,FaImages,FaCalendarAlt,FaCog,FaSignOutAlt,} from "react-icons/fa";

import { FaMoneyBillWave } from "react-icons/fa";

import API from "../services/api";

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [turf, setTurf] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  useEffect(() => {

  const loadTurf = async () => {

    try {

      const response =
        await API.get("turf/");

      setTurf(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  loadTurf();

}, []);

  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin",
    },

    {
      name: "Bookings",
      icon: <FaCalendarCheck />,
      path: "/admin/bookings",
    },

    {
      name: "Gallery",
      icon: <FaImages />,
      path: "/admin/gallery",
    },

    {
      name: "Calendar",
      icon: <FaCalendarAlt />,
      path: "/admin/calendar",
    },
    
    {
      name: "Admin Settings",
      icon: <FaCog />,
      path: "/admin/settings",
    },

    {
      name: "Master Settings",
      icon: <FaCog />,
      path: "/admin/master-settings",
    },

    {
      name: "Reports",
      icon: <FaMoneyBillWave />,
      path: "/admin/reports",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="
          fixed
          inset-0
          bg-black/50
          z-40
          md:hidden
          "
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:static
        top-0 left-0
        h-full
        w-72
        bg-gray-900
        text-white
        z-50
        flex
        flex-col
        transform
        transition-transform
        duration-300

        ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }

        md:translate-x-0
        `}
      >

        {/* Logo */}
        <div
          className="
          p-6
          border-b
          border-gray-800
          "
        >
          <div className="flex items-center gap-3">

            <FaFutbol
              size={28}
              className="text-green-500"
            />

            <h1 className="text-2xl font-bold">
              {turf?.name || "Turf"} Turf
            </h1>

          </div>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="
            md:hidden
            absolute
            top-6
            right-6
            "
          >
            <FaTimes size={22} />
          </button>
        </div>

        {/* Menu */}
        <div className="p-4 flex-1 space-y-3">

          {menuItems.map((item) => (

            <Link
              key={item.path}
              to={item.path}
              onClick={() =>
                setSidebarOpen(false)
              }
              className={`
              flex
              items-center
              gap-3
              p-4
              rounded-xl
              transition

              ${
                location.pathname ===
                item.path
                  ? "bg-green-600 text-white"
                  : "hover:bg-gray-800"
              }
              `}
            >
              {item.icon}

              <span>
                {item.name}
              </span>

            </Link>

          ))}

        </div>

        {/* Logout Bottom */}
        <div className="p-4">

          <button
            onClick={logout}
            className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            bg-red-500
            hover:bg-red-600
            py-3
            rounded-xl
            transition
            "
          >
            <FaSignOutAlt />
            Logout
          </button>

        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1">

        {/* Mobile Header */}
        <div
          className="
          md:hidden
          bg-white
          shadow
          px-4
          py-4
          flex
          items-center
          justify-between
          sticky
          top-0
          z-30
          "
        >

          <div className="flex items-center gap-2">

            <FaFutbol className="text-green-600" />

            <span className="font-bold">
              {turf?.name || "Turf"} Turf
            </span>

          </div>

          <button
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            <FaBars size={22} />
          </button>

        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8">
          {children}
        </div>

      </div>

    </div>
  );
}

export default AdminLayout;