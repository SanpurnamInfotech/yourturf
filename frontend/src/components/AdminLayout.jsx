import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaFutbol,
  FaTachometerAlt,
  FaCalendarCheck,
  FaImages,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaLayerGroup,
  FaFilter,
  FaSlidersH,
} from "react-icons/fa";

import API from "../services/api";
import { useTurf } from "../context/TurfContext";

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { turfs, selectedTurfId, setSelectedTurfId, loadTurfs } = useTurf();

  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("access");
    navigate("/admin-login");
  };

  useEffect(() => {
    // Reload all turfs (including inactive) for admin
    loadTurfs(true);
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin",
    },
    {
      name: "Manage Turfs",
      icon: <FaLayerGroup />,
      path: "/admin/turfs",
    },
    {
      name: "Master Settings",
      icon: <FaSlidersH />,
      path: "/admin/master-settings",
    },
    {
      name: "Bookings",
      icon: <FaCalendarCheck />,
      path: "/admin/bookings",
    },
    {
      name: "Calendar",
      icon: <FaCalendarAlt />,
      path: "/admin/calendar",
    },
    {
      name: "Gallery",
      icon: <FaImages />,
      path: "/admin/gallery",
    },
    {
      name: "Pricing & Closures",
      icon: <FaCog />,
      path: "/admin/settings",
    },
    {
      name: "Reports",
      icon: <FaMoneyBillWave />,
      path: "/admin/reports",
    },
  ];

  const currentTurf = turfs.find((t) => String(t.id) === String(selectedTurfId));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-72 bg-gray-950 text-white z-50 flex flex-col border-r border-gray-800 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <FaFutbol size={28} className="text-green-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">YourTurf Admin</h1>
              <p className="text-[11px] text-gray-400">Multi-Turf Control Panel</p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Global Turf Selector in Sidebar */}
        <div className="p-4 bg-gray-900/60 border-b border-gray-800">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FaFilter className="text-green-400" />
            <span>Target Turf Scope</span>
          </label>
          <select
            value={selectedTurfId || ""}
            onChange={(e) => setSelectedTurfId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl text-sm outline-none focus:border-green-500 cursor-pointer"
          >
            <option value="">All Turfs (Combined View)</option>
            {turfs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {!t.is_active ? "(Inactive)" : ""}
              </option>
            ))}
          </select>
          {currentTurf && (
            <div className="mt-2 text-[11px] text-green-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              <span>Managing: {currentTurf.name}</span>
            </div>
          )}
        </div>

        {/* Menu Navigation */}
        <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                    : "text-gray-300 hover:bg-gray-800/80 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition text-sm active:scale-95 shadow-md"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile-only header to toggle sidebar */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            aria-label="Open Sidebar Menu"
          >
            <FaBars size={20} />
          </button>
          <span className="font-bold text-gray-900 text-sm">YourTurf Admin</span>
          <div className="w-8" />
        </div>

        {/* Main Body */}
        <main className="p-4 md:p-8 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;