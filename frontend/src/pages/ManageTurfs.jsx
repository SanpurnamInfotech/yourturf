import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  FaFutbol,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaSave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaClock,
  FaSun,
  FaMoon,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaLayerGroup,
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { useTurf } from "../context/TurfContext";

function ManageTurfs() {
  const { turfs, loadTurfs, operatingCities } = useTurf();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTurf, setEditingTurf] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    description: "",
    location: "",
    phone: "",
    email: "",
    day_price: "800",
    night_price: "1000",
    opening_time: "06:00:00",
    closing_time: "23:00:00",
    is_active: true,
  });

  const [mainImage, setMainImage] = useState(null);
  const [aboutImage, setAboutImage] = useState(null);
  const [saving, setSaving] = useState(false);

  if (localStorage.getItem("isAdmin") !== "true") {
    return <Navigate to="/admin-login" />;
  }

  const openCreateModal = () => {
    setEditingTurf(null);
    setFormData({
      name: "",
      city: operatingCities?.[0]?.name || "",
      description: "",
      location: "",
      phone: "",
      email: "",
      day_price: "800",
      night_price: "1000",
      opening_time: "06:00:00",
      closing_time: "23:00:00",
      is_active: true,
    });
    setMainImage(null);
    setAboutImage(null);
    setModalOpen(true);
  };

  const openEditModal = (turf) => {
    setEditingTurf(turf);
    setFormData({
      name: turf.name || "",
      city: turf.city || "",
      description: turf.description || "",
      location: turf.location || "",
      phone: turf.phone || "",
      email: turf.email || "",
      day_price: String(turf.day_price || "800"),
      night_price: String(turf.night_price || "1000"),
      opening_time: turf.opening_time || "06:00:00",
      closing_time: turf.closing_time || "23:00:00",
      is_active: turf.is_active ?? true,
    });
    setMainImage(null);
    setAboutImage(null);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      alert("Please provide at least a Turf Name and Location.");
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      if (mainImage) {
        payload.append("main_image", mainImage);
      }
      if (aboutImage) {
        payload.append("about_image", aboutImage);
      }

      if (editingTurf) {
        await API.put(`turfs/${editingTurf.id}/`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert(`Turf '${formData.name}' updated successfully!`);
      } else {
        await API.post("turfs/", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert(`New turf '${formData.name}' created successfully!`);
      }

      setModalOpen(false);
      await loadTurfs(true);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to save turf information.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (turf) => {
    const newStatus = !turf.is_active;
    const confirmMsg = newStatus
      ? `Activate '${turf.name}' for public booking?`
      : `Deactivate '${turf.name}'? It will no longer appear on the customer booking page.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await API.patch(`turfs/${turf.id}/`, { is_active: newStatus });
      await loadTurfs(true);
    } catch (error) {
      console.error(error);
      alert("Failed to change turf status.");
    }
  };

  const handleDeleteTurf = async (turf) => {
    const confirmMsg = `Are you sure you want to delete/deactivate '${turf.name}'?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await API.delete(`turfs/${turf.id}/`);
      alert(res.data?.message || "Action completed.");
      await loadTurfs(true);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to delete turf.");
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Manage Turfs & Venues</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create, edit, price, and control the active status of every venue on your platform
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95"
        >
          <FaPlus />
          <span>Add New Turf Venue</span>
        </button>
      </div>

      {/* Turfs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {turfs.map((turf) => (
          <div
            key={turf.id}
            className={`bg-white rounded-3xl p-6 shadow-sm border transition-all duration-200 flex flex-col justify-between ${
              turf.is_active ? "border-gray-200 hover:border-green-500" : "border-gray-300 opacity-80 bg-gray-50/70"
            }`}
          >
            <div>
              {/* Card Top */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                    <img
                      src={
                        turf.main_image ||
                        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={turf.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{turf.name}</h2>
                      <span className="text-xs text-gray-400 font-mono">#{turf.id}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      {turf.city && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          {turf.city}
                        </span>
                      )}
                      <FaMapMarkerAlt className="text-green-600" />
                      <span>{turf.location}</span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <button
                  onClick={() => handleToggleStatus(turf)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                    turf.is_active
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                  title="Click to toggle active status"
                >
                  {turf.is_active ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />}
                  <span>{turf.is_active ? "Active" : "Deactivated"}</span>
                </button>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                {turf.description || "No description provided."}
              </p>

              {/* Rates and Times */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs mb-4">
                <div>
                  <span className="text-gray-500 block mb-0.5">☀️ Day Rate:</span>
                  <span className="text-base font-extrabold text-gray-900">₹{turf.day_price || 800}/hr</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">🌙 Night Rate:</span>
                  <span className="text-base font-extrabold text-gray-900">₹{turf.night_price || 1000}/hr</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-gray-200 flex items-center gap-1.5 text-gray-600">
                  <FaClock className="text-green-600" />
                  <span>
                    Hours: {turf.opening_time || "06:00:00"} - {turf.closing_time || "23:00:00"}
                  </span>
                </div>
              </div>

              {/* Contacts */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-6">
                {turf.phone && (
                  <span className="flex items-center gap-1">
                    <FaPhone size={10} /> {turf.phone}
                  </span>
                )}
                {turf.email && (
                  <span className="flex items-center gap-1">
                    <FaEnvelope size={10} /> {turf.email}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => openEditModal(turf)}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <FaEdit />
                <span>Edit Settings</span>
              </button>

              <button
                onClick={() => handleDeleteTurf(turf)}
                className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                title="Deactivate or Remove"
              >
                <FaTrash />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create / Edit Turf */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-2 rounded-full transition"
            >
              <FaTimes size={18} />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {editingTurf ? `Edit Turf: ${editingTurf.name}` : "Add New Turf Venue"}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Configure name, operating hours, day/night prices, and imagery for this venue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Turf Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Sanpurnam Arena"
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                {/* Operating City */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Operating City *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-green-600 cursor-pointer"
                  >
                    <option value="">-- Select Official City --</option>
                    {operatingCities &&
                      operatingCities.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Street Address / Location */}
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Street Address / Landmark *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Opposite Central Bus Stand, Station Road"
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. venue@yourturf.com"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                {/* Day Price */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Day Slot Rate (₹/hr) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="day_price"
                    value={formData.day_price}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                {/* Night Price */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Night Slot Rate (₹/hr) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="night_price"
                    value={formData.night_price}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                {/* Opening Time */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Opening Time</label>
                  <input
                    type="time"
                    name="opening_time"
                    value={formData.opening_time}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-green-600"
                  />
                </div>

                {/* Closing Time */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Closing Time</label>
                  <input
                    type="time"
                    name="closing_time"
                    value={formData.closing_time}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-green-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe ground dimensions, turf pitch quality, and available sports..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm outline-none focus:border-green-600"
                ></textarea>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Main Cover Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMainImage(e.target.files[0])}
                    className="w-full bg-gray-50 border border-gray-300 p-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">About Section Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAboutImage(e.target.files[0])}
                    className="w-full bg-gray-50 border border-gray-300 p-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 rounded cursor-pointer"
                />
                <label htmlFor="is_active" className="text-xs font-bold text-gray-800 cursor-pointer">
                  Activate Turf for Customer Bookings
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <FaSave />
                  <span>{saving ? "Saving..." : editingTurf ? "Update Venue" : "Create Venue"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ManageTurfs;

