import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  FaSlidersH,
  FaFutbol,
  FaEdit,
  FaUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaImage,
  FaGlobe,
  FaCloudUploadAlt,
  FaInfoCircle,
  FaCheck,
  FaTrash,
  FaCity,
  FaPlus,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { useTurf } from "../context/TurfContext";

function MasterSettings() {
  const { websiteSettings, loadWebsiteSettings, operatingCities, loadCities, loadTurfs } = useTurf();

  // Authentication check
  if (localStorage.getItem("isAdmin") !== "true") {
    return <Navigate to="/admin-login" />;
  }

  // Local notifications
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Name Edit Modal State
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [siteNameInput, setSiteNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  // Image Upload Modal State
  // modalType: 'logo' | 'hero_image' | 'about_image' | null
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalType, setImageModalType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  // Operating Cities Management State
  const [newCityName, setNewCityName] = useState("");
  const [addingCity, setAddingCity] = useState(false);
  const [cityError, setCityError] = useState("");
  const [deletingCityId, setDeletingCityId] = useState(null);

  // Edit City Modal State
  const [editCityModalOpen, setEditCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [editCityNameInput, setEditCityNameInput] = useState("");
  const [savingCity, setSavingCity] = useState(false);
  const [editCityError, setEditCityError] = useState("");

  // Contact Info (Phone / Email) Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactFieldType, setContactFieldType] = useState("contact_phone");
  const [contactInput, setContactInput] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [contactError, setContactError] = useState("");

  // Sync current site name when modal opens
  useEffect(() => {
    if (websiteSettings?.site_name) {
      setSiteNameInput(websiteSettings.site_name);
    }
  }, [websiteSettings]);

  // Clean up object URL when modal closes or file changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Handlers for Name Edit
  const openNameModal = () => {
    setSiteNameInput(websiteSettings?.site_name || "YourTurf");
    setNameError("");
    setNameModalOpen(true);
  };

  const closeNameModal = () => {
    if (savingName) return;
    setNameModalOpen(false);
    setNameError("");
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    const trimmed = siteNameInput.trim();
    if (!trimmed) {
      setNameError("Website name cannot be empty.");
      return;
    }
    if (trimmed.length < 2) {
      setNameError("Website name must be at least 2 characters long.");
      return;
    }

    setSavingName(true);
    setNameError("");

    try {
      const formData = new FormData();
      formData.append("site_name", trimmed);

      const response = await API.patch("settings/website/", formData);
      if (response.data) {
        await loadWebsiteSettings();
        setSuccessMessage("Website name updated successfully!");
        closeNameModal();
      }
    } catch (err) {
      console.error("Failed to update site name:", err);
      setNameError(
        err.response?.data?.site_name?.[0] ||
          err.response?.data?.error ||
          "Failed to update website name. Please try again."
      );
    } finally {
      setSavingName(false);
    }
  };

  // Handlers for Operating Cities
  const handleAddCity = async (e) => {
    e.preventDefault();
    const trimmed = newCityName.trim();
    if (!trimmed) {
      setCityError("Please enter a city name.");
      return;
    }

    setAddingCity(true);
    setCityError("");

    try {
      const response = await API.post("settings/cities/", { name: trimmed });
      if (response.data) {
        setSuccessMessage(`City '${response.data.name}' added to operating cities!`);
        setNewCityName("");
        if (loadCities) await loadCities();
      }
    } catch (err) {
      console.error("Failed to add city:", err);
      setCityError(
        err.response?.data?.error ||
          err.response?.data?.name?.[0] ||
          "Failed to add city. Please try again."
      );
    } finally {
      setAddingCity(false);
    }
  };

  const handleDeleteCity = async (cityId, cityName, turfCount) => {
    const warning =
      turfCount > 0
        ? `Warning: ${turfCount} venue(s) are currently associated with ${cityName}. Are you sure you want to remove it from operating cities?`
        : `Are you sure you want to remove '${cityName}' from operating cities?`;

    if (!window.confirm(warning)) return;

    setDeletingCityId(cityId);
    try {
      await API.delete(`settings/cities/${cityId}/`);
      setSuccessMessage(`City '${cityName}' removed successfully.`);
      if (loadCities) await loadCities();
    } catch (err) {
      console.error("Failed to delete city:", err);
      setErrorMessage(
        err.response?.data?.error || "Failed to remove city. Please try again."
      );
    } finally {
      setDeletingCityId(null);
    }
  };

  const openEditCityModal = (city) => {
    setEditingCity(city);
    setEditCityNameInput(city.name);
    setEditCityError("");
    setEditCityModalOpen(true);
  };

  const closeEditCityModal = () => {
    if (savingCity) return;
    setEditCityModalOpen(false);
    setEditingCity(null);
    setEditCityNameInput("");
    setEditCityError("");
  };

  const handleSaveEditCity = async (e) => {
    e.preventDefault();
    const trimmed = editCityNameInput.trim();
    if (!trimmed) {
      setEditCityError("City name cannot be empty.");
      return;
    }
    if (!editingCity) return;

    if (trimmed.toLowerCase() === editingCity.name.toLowerCase()) {
      closeEditCityModal();
      return;
    }

    setSavingCity(true);
    setEditCityError("");

    try {
      const response = await API.put(`settings/cities/${editingCity.id}/`, {
        name: trimmed,
      });
      if (response.data) {
        setSuccessMessage(
          `City updated to '${response.data.city?.name || trimmed}' successfully!`
        );
        closeEditCityModal();
        if (loadCities) await loadCities();
        if (loadTurfs) await loadTurfs(true);
      }
    } catch (err) {
      console.error("Failed to update city:", err);
      setEditCityError(
        err.response?.data?.error ||
          err.response?.data?.name?.[0] ||
          "Failed to update city. Please try again."
      );
    } finally {
      setSavingCity(false);
    }
  };

  const openContactModal = (fieldType) => {
    setContactFieldType(fieldType);
    setContactInput(
      fieldType === "contact_phone"
        ? websiteSettings?.contact_phone || "1234567890"
        : websiteSettings?.contact_email || "support@yourturf.com"
    );
    setContactError("");
    setContactModalOpen(true);
  };

  const closeContactModal = () => {
    if (savingContact) return;
    setContactModalOpen(false);
    setContactError("");
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    const trimmed = contactInput.trim();
    if (!trimmed) {
      setContactError("Field cannot be empty.");
      return;
    }
    if (contactFieldType === "contact_email" && !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setContactError("Please enter a valid email address.");
      return;
    }

    setSavingContact(true);
    setContactError("");

    try {
      const formData = new FormData();
      formData.append(contactFieldType, trimmed);

      const response = await API.patch("settings/website/", formData);
      if (response.data) {
        await loadWebsiteSettings();
        const label =
          contactFieldType === "contact_phone"
            ? "Contact Phone Number"
            : "Contact Email";
        setSuccessMessage(`${label} updated successfully!`);
        closeContactModal();
      }
    } catch (err) {
      console.error("Failed to update contact info:", err);
      setContactError(
        err.response?.data?.[contactFieldType]?.[0] ||
          err.response?.data?.error ||
          "Failed to update. Please try again."
      );
    } finally {
      setSavingContact(false);
    }
  };

  // Handlers for Image Upload
  const openImageModal = (type) => {
    setImageModalType(type);
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setImageError("");
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    if (uploadingImage) return;
    setImageModalOpen(false);
    setImageModalType(null);
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setImageError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file (PNG, JPG, WEBP, SVG).");
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image file size exceeds the 5MB limit. Please choose a smaller image.");
      return;
    }

    setImageError("");
    setSelectedFile(file);

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSaveImage = async () => {
    if (!selectedFile) {
      setImageError("Please choose an image file before saving.");
      return;
    }

    if (!imageModalType) return;

    setUploadingImage(true);
    setImageError("");

    try {
      const formData = new FormData();
      formData.append(imageModalType, selectedFile);

      const response = await API.patch("settings/website/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        await loadWebsiteSettings();
        const labelMap = {
          logo: "Website Logo",
          hero_image: "Landing Page Hero Image",
          about_image: "About Page Image",
        };
        setSuccessMessage(`${labelMap[imageModalType] || "Image"} updated successfully!`);
        closeImageModal();
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      setImageError(
        err.response?.data?.[imageModalType]?.[0] ||
          err.response?.data?.error ||
          "Failed to upload image. Please try again."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // Helper metadata for each setting
  const getModalMeta = () => {
    switch (imageModalType) {
      case "logo":
        return {
          title: "Update Website Logo",
          hint: "Appears in the header and navigation bar. Recommended format: Transparent PNG or SVG (max height 80px).",
          currentImg: websiteSettings?.logo,
          aspectClass: "h-16 w-44 object-contain bg-gray-950 p-2 rounded-xl",
        };
      case "hero_image":
        return {
          title: "Update Landing Page Hero Image",
          hint: "Primary background banner on the homepage. Recommended resolution: 1920x1080 (JPG or WebP).",
          currentImg: websiteSettings?.hero_image,
          aspectClass: "h-40 w-full object-cover rounded-xl",
        };
      case "about_image":
        return {
          title: "Update About Page Image",
          hint: "Featured image in the About Us section. Recommended resolution: 1200x800 (JPG or WebP).",
          currentImg: websiteSettings?.about_image,
          aspectClass: "h-40 w-full object-cover rounded-xl",
        };
      default:
        return {
          title: "Upload Image",
          hint: "Select an image file from your computer.",
          currentImg: null,
          aspectClass: "h-32 w-full object-cover rounded-xl",
        };
    }
  };

  const modalMeta = getModalMeta();

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-green-500/10 text-green-600">
                <FaSlidersH size={24} />
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Master Settings
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage the main branding, website identity, and public imagery for YourTurf.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Global Settings Active
            </span>
          </div>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between animate-fadeIn shadow-sm">
            <div className="flex items-center gap-3 text-sm font-semibold">
              <FaCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-emerald-600 hover:text-emerald-800 text-xs"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center justify-between animate-fadeIn shadow-sm">
            <div className="flex items-center gap-3 text-sm font-semibold">
              <FaTimesCircle className="text-red-500 text-lg flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-red-600 hover:text-red-800 text-xs"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Master Settings Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Website Configuration</h2>
              <p className="text-xs text-gray-500">
                Changes made here reflect across all customer-facing landing pages and navigation.
              </p>
            </div>
            {websiteSettings?.updated_on && (
              <span className="text-[11px] text-gray-400">
                Last modified: {new Date(websiteSettings.updated_on).toLocaleDateString()} at{" "}
                {new Date(websiteSettings.updated_on).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                  <th className="py-4 px-6 w-1/4">Setting</th>
                  <th className="py-4 px-6 w-1/2">Current Value</th>
                  <th className="py-4 px-6 text-right w-1/4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {/* 1. Main Website Name */}
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                        <FaGlobe size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Main Website Name</span>
                        <span className="text-xs text-gray-400">Default brand title</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-gray-900 text-base bg-gray-100 px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-inner">
                        {websiteSettings?.site_name || "YourTurf"}
                      </span>
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                        Active Brand
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right align-middle">
                    <button
                      onClick={openNameModal}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl text-xs transition shadow-sm active:scale-95"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>

                {/* 2. Website Logo */}
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                        <FaFutbol size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Website Logo</span>
                        <span className="text-xs text-gray-400">Header & Navbar logo</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-4">
                      {websiteSettings?.logo ? (
                        <div className="h-14 w-28 bg-gray-950 rounded-xl p-2 border border-gray-200 flex items-center justify-center shadow-inner overflow-hidden">
                          <img
                            src={websiteSettings.logo}
                            alt="Website Logo"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-28 bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                          <FaFutbol className="text-green-500 text-xl" />
                        </div>
                      )}
                      <div>
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            websiteSettings?.logo
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-gray-600 bg-gray-100 border-gray-200"
                          }`}
                        >
                          {websiteSettings?.logo ? "Custom Logo Uploaded" : "Default Icon Active"}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {websiteSettings?.logo
                            ? "Displaying uploaded logo on navigation bar"
                            : "Using default football icon"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right align-middle">
                    <button
                      onClick={() => openImageModal("logo")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-xs transition shadow-sm active:scale-95"
                    >
                      <FaUpload />
                      <span>Change / Upload</span>
                    </button>
                  </td>
                </tr>

                {/* 3. Landing Page Hero Image */}
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                        <FaImage size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Landing Page Hero Image</span>
                        <span className="text-xs text-gray-400">Main hero background banner</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-4">
                      {websiteSettings?.hero_image ? (
                        <div className="h-16 w-28 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <img
                            src={websiteSettings.hero_image}
                            alt="Landing Hero Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-28 bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                          <FaImage className="text-xl text-gray-400" />
                        </div>
                      )}
                      <div>
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            websiteSettings?.hero_image
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-gray-600 bg-gray-100 border-gray-200"
                          }`}
                        >
                          {websiteSettings?.hero_image
                            ? "Custom Hero Image Uploaded"
                            : "Default Hero Active"}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {websiteSettings?.hero_image
                            ? "Applied as background of Landing Hero section"
                            : "Using stock turf photography"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right align-middle">
                    <button
                      onClick={() => openImageModal("hero_image")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-xs transition shadow-sm active:scale-95"
                    >
                      <FaUpload />
                      <span>Change / Upload</span>
                    </button>
                  </td>
                </tr>

                {/* 4. About Page Image */}
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                        <FaImage size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">About Page Image</span>
                        <span className="text-xs text-gray-400">Featured photo in About section</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-4">
                      {websiteSettings?.about_image ? (
                        <div className="h-16 w-28 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <img
                            src={websiteSettings.about_image}
                            alt="About Section Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-28 bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                          <FaImage className="text-xl text-gray-400" />
                        </div>
                      )}
                      <div>
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            websiteSettings?.about_image
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-gray-600 bg-gray-100 border-gray-200"
                          }`}
                        >
                          {websiteSettings?.about_image
                            ? "Custom About Image Uploaded"
                            : "Default About Image Active"}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {websiteSettings?.about_image
                            ? "Displayed on homepage About section"
                            : "Using stock venue showcase photo"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right align-middle">
                    <button
                      onClick={() => openImageModal("about_image")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl text-xs transition shadow-sm active:scale-95"
                    >
                      <FaUpload />
                      <span>Change / Upload</span>
                    </button>
                  </td>
                </tr>

                {/* 5. Contact Phone Number */}
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                        <FaPhoneAlt size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Contact Phone Number</span>
                        <span className="text-xs text-gray-400">Platform helpline & Call Now</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-gray-900 text-base bg-gray-100 px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-inner">
                        {websiteSettings?.contact_phone || "1234567890"}
                      </span>
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                        Active Helpline
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right align-middle">
                    <button
                      onClick={() => openContactModal("contact_phone")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl text-xs transition shadow-sm active:scale-95"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>

                {/* 6. Contact Email */}
                <tr className="hover:bg-gray-50/60 transition">
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                        <FaEnvelope size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Contact Email</span>
                        <span className="text-xs text-gray-400">Inquiries & customer support</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 align-middle">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-sm bg-gray-100 px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-inner">
                        {websiteSettings?.contact_email || "support@yourturf.com"}
                      </span>
                      <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
                        Support Mail
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right align-middle">
                    <button
                      onClick={() => openContactModal("contact_email")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl text-xs transition shadow-sm active:scale-95"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Official Operating Cities Management Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-green-50 text-green-600">
                  <FaCity size={18} />
                </span>
                <h2 className="text-xl font-bold text-gray-900">Official Operating Cities</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only approved cities listed here will appear in the Landing Page City Selector.
              </p>
            </div>

            {/* Quick Add City Form */}
            <form onSubmit={handleAddCity} className="flex items-center gap-2">
              <input
                type="text"
                value={newCityName}
                onChange={(e) => {
                  setNewCityName(e.target.value);
                  setCityError("");
                }}
                placeholder="e.g. Mumbai, Satara"
                className="bg-gray-50 border border-gray-300 text-gray-900 px-3.5 py-2 rounded-xl text-xs outline-none focus:border-green-500 w-48 md:w-56"
              />
              <button
                type="submit"
                disabled={addingCity || !newCityName.trim()}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {addingCity ? (
                  <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaPlus size={12} />
                )}
                <span>Add City</span>
              </button>
            </form>
          </div>

          {cityError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <FaTimesCircle className="flex-shrink-0" />
              <span>{cityError}</span>
            </div>
          )}

          {/* Cities Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                  <th className="py-3.5 px-6">City Name</th>
                  <th className="py-3.5 px-6">Assigned Venues</th>
                  <th className="py-3.5 px-6">Added Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {operatingCities && operatingCities.length > 0 ? (
                  operatingCities.map((city) => (
                    <tr key={city.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-4 px-6 font-bold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-gray-100 text-green-600">
                            <FaMapMarkerAlt size={14} />
                          </span>
                          <span>{city.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            city.turf_count > 0
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {city.turf_count} venue{city.turf_count === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-400">
                        {city.created_at
                          ? new Date(city.created_at).toLocaleDateString()
                          : "Default"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditCityModal(city)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition inline-flex items-center justify-center"
                            title={`Edit ${city.name}`}
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCity(city.id, city.name, city.turf_count)
                            }
                            disabled={deletingCityId === city.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition inline-flex items-center justify-center"
                            title={`Delete ${city.name}`}
                          >
                            {deletingCityId === city.id ? (
                              <span className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin inline-block" />
                            ) : (
                              <FaTrash size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-gray-400">
                      No operating cities added yet. Type a city name above to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. EDIT WEBSITE NAME MODAL                                */}
      {/* ========================================================= */}
      {nameModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={closeNameModal}
              disabled={savingName}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <FaGlobe size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Main Website Name</h3>
                <p className="text-xs text-gray-500">Update the primary brand title of YourTurf</p>
              </div>
            </div>

            <form onSubmit={handleSaveName} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Website Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={siteNameInput}
                  onChange={(e) => {
                    setSiteNameInput(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  placeholder="e.g. YourTurf"
                  maxLength={100}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-3 rounded-xl text-sm outline-none focus:border-green-500 focus:bg-white transition"
                  autoFocus
                />
                <div className="flex justify-between items-center mt-1.5 text-xs text-gray-400">
                  <span>Shown on navbar, title tag, and footer.</span>
                  <span>{siteNameInput.length} / 100</span>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-gray-900 rounded-2xl text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Live Navbar Brand Preview
                </span>
                <div className="flex items-center gap-2">
                  <FaFutbol className="text-green-500 text-xl" />
                  <span className="text-lg font-bold">
                    {siteNameInput.trim() || "YourTurf"}
                  </span>
                </div>
              </div>

              {nameError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <FaTimesCircle className="flex-shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeNameModal}
                  disabled={savingName}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingName}
                  className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {savingName ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CHANGE / UPLOAD IMAGE MODAL (WITH LIVE PREVIEW)        */}
      {/* ========================================================= */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={closeImageModal}
              disabled={uploadingImage}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <FaCloudUploadAlt size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{modalMeta.title}</h3>
                <p className="text-xs text-gray-500">{modalMeta.hint}</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Image Previews Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Currently Active */}
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block mb-2">
                    Current Active Asset
                  </span>
                  <div className="h-32 rounded-xl overflow-hidden flex items-center justify-center bg-gray-900 border border-gray-200">
                    {modalMeta.currentImg ? (
                      <img
                        src={modalMeta.currentImg}
                        alt="Current"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400 p-2">
                        <FaImage size={24} className="mx-auto mb-1 opacity-50" />
                        <span className="text-[11px]">Using Default</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* New Preview (Before Saving) */}
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                      New Preview (Before Saving)
                    </span>
                    {previewUrl && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                        Ready to Save
                      </span>
                    )}
                  </div>

                  <div className="h-32 rounded-xl overflow-hidden flex items-center justify-center bg-gray-900 border border-emerald-300">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="New Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400 p-2">
                        <FaCloudUploadAlt size={24} className="mx-auto mb-1 text-emerald-500 opacity-60" />
                        <span className="text-[11px]">Select a file below to preview</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* File Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Choose New Image File
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 hover:border-green-500 p-4 rounded-2xl text-center bg-gray-50 hover:bg-green-50/20 transition">
                      <FaUpload className="mx-auto text-gray-400 mb-1" />
                      <span className="text-xs font-semibold text-gray-700 block">
                        {selectedFile ? selectedFile.name : "Click to browse image file"}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {selectedFile
                          ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                          : "PNG, JPG, WEBP, or SVG up to 5MB"}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (previewUrl && previewUrl.startsWith("blob:")) {
                          URL.revokeObjectURL(previewUrl);
                        }
                        setPreviewUrl(null);
                      }}
                      className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition"
                      title="Clear selection"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>
              </div>

              {imageError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <FaTimesCircle className="flex-shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeImageModal}
                  disabled={uploadingImage}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={uploadingImage || !selectedFile}
                  className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Uploading & Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Save & Apply Asset</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. EDIT OPERATING CITY MODAL                              */}
      {/* ========================================================= */}
      {editCityModalOpen && editingCity && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={closeEditCityModal}
              disabled={savingCity}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <FaCity size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Operating City</h3>
                <p className="text-xs text-gray-500">Update city name across the platform</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditCity} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  City Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editCityNameInput}
                  onChange={(e) => {
                    setEditCityNameInput(e.target.value);
                    if (editCityError) setEditCityError("");
                  }}
                  placeholder="e.g. Pune, Sangli, Kolhapur"
                  maxLength={100}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-3 rounded-xl text-sm outline-none focus:border-green-500 focus:bg-white transition"
                  autoFocus
                />
                <div className="flex justify-between items-center mt-1.5 text-xs text-gray-400">
                  <span>Changes will be reflected in Landing Page filters and venue cards.</span>
                  <span>{editCityNameInput.length} / 100</span>
                </div>
              </div>

              {/* Info notice about assigned venues */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <FaInfoCircle className="text-green-600 flex-shrink-0" />
                  <span>Automatic Venue Sync</span>
                </div>
                <p>
                  {editingCity.turf_count > 0 ? (
                    <>
                      There {editingCity.turf_count === 1 ? "is" : "are"}{" "}
                      <strong className="text-green-700">{editingCity.turf_count} venue(s)</strong> currently assigned to{" "}
                      <strong>{editingCity.name}</strong>. Their city assignment will automatically be updated to the new name.
                    </>
                  ) : (
                    <>No venues are currently assigned to this city.</>
                  )}
                </p>
              </div>

              {editCityError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <FaTimesCircle className="flex-shrink-0" />
                  <span>{editCityError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditCityModal}
                  disabled={savingCity}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCity || !editCityNameInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {savingCity ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. EDIT CONTACT INFO MODAL (PHONE / EMAIL)                */}
      {/* ========================================================= */}
      {contactModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={closeContactModal}
              disabled={savingContact}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
            >
              <FaTimes size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                {contactFieldType === "contact_phone" ? (
                  <FaPhoneAlt size={20} />
                ) : (
                  <FaEnvelope size={20} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {contactFieldType === "contact_phone"
                    ? "Edit Contact Phone Number"
                    : "Edit Contact Email"}
                </h3>
                <p className="text-xs text-gray-500">
                  {contactFieldType === "contact_phone"
                    ? "Displayed in the Contact Information box, footer & 'Call Now' button"
                    : "Displayed in the Contact Information box and footer inquiries"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  {contactFieldType === "contact_phone"
                    ? "Phone Number"
                    : "Email Address"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type={contactFieldType === "contact_phone" ? "tel" : "email"}
                  value={contactInput}
                  onChange={(e) => {
                    setContactInput(e.target.value);
                    if (contactError) setContactError("");
                  }}
                  placeholder={
                    contactFieldType === "contact_phone"
                      ? "e.g. +91 9876543210 or 1234567890"
                      : "e.g. support@yourturf.com"
                  }
                  maxLength={100}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-3 rounded-xl text-sm outline-none focus:border-green-500 focus:bg-white transition"
                  autoFocus
                />
              </div>

              {contactError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <FaTimesCircle className="flex-shrink-0" />
                  <span>{contactError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeContactModal}
                  disabled={savingContact}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingContact || !contactInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {savingContact ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default MasterSettings;
