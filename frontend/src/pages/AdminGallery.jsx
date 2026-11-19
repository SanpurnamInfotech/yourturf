import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  FaUpload,
  FaTrash,
  FaImages,
  FaImage,
  FaFilter,
  FaLayerGroup,
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { useTurf } from "../context/TurfContext";

function AdminGallery() {
  const { turfs, selectedTurfId } = useTurf();
  const [galleryTurfId, setGalleryTurfId] = useState(selectedTurfId || "");
  const [uploadTurfId, setUploadTurfId] = useState(selectedTurfId || "");
  const [image, setImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (localStorage.getItem("isAdmin") !== "true") {
    return <Navigate to="/admin-login" />;
  }

  useEffect(() => {
    if (selectedTurfId) {
      setGalleryTurfId(selectedTurfId);
      setUploadTurfId(selectedTurfId);
    } else if (turfs.length > 0) {
      setUploadTurfId(turfs[0].id);
    }
  }, [selectedTurfId, turfs]);

  const loadGalleryImages = async () => {
    try {
      setLoading(true);
      let url = "gallery/";
      if (galleryTurfId) {
        url += `?turf_id=${galleryTurfId}`;
      }
      const response = await API.get(url);
      setGalleryImages(response.data || []);
    } catch (error) {
      console.error("Failed to load gallery images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryImages();
  }, [galleryTurfId]);

  const uploadImage = async () => {
    if (!image) {
      alert("Please select an image to upload");
      return;
    }
    const targetTurf = uploadTurfId || turfs[0]?.id;
    if (!targetTurf) {
      alert("Please select a target turf");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", image);
      formData.append("turf", targetTurf);

      await API.post("upload-image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Image Uploaded Successfully");
      setImage(null);
      loadGalleryImages();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this gallery image?");
    if (!confirmDelete) return;

    try {
      await API.delete(`delete-image/${id}/`);
      alert("Image Deleted Successfully");
      loadGalleryImages();
    } catch (error) {
      console.error(error);
      alert("Failed to delete image.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Gallery Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload and manage photo galleries for your venues
          </p>
        </div>

        {/* Turf Filter */}
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-200">
          <FaFilter className="text-gray-400 text-xs" />
          <span className="text-xs font-bold text-gray-600">Filter Venue:</span>
          <select
            value={galleryTurfId}
            onChange={(e) => setGalleryTurfId(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 px-3 py-1.5 rounded-xl text-xs font-semibold outline-none focus:border-green-600 cursor-pointer"
          >
            <option value="">All Venues</option>
            {turfs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaUpload className="text-green-600" />
          <span>Upload New Image</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Target Turf */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Target Turf</label>
            <select
              value={uploadTurfId}
              onChange={(e) => setUploadTurfId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 p-2.5 rounded-xl text-sm outline-none focus:border-green-600 cursor-pointer"
            >
              {turfs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.location})
                </option>
              ))}
            </select>
          </div>

          {/* File Input */}
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Select Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-2 rounded-xl text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-200 file:text-xs file:font-bold hover:file:bg-gray-300 cursor-pointer"
            />
          </div>

          {/* Upload Button */}
          <div>
            <button
              onClick={uploadImage}
              disabled={uploading}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <FaUpload />
              <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaImages className="text-green-600" />
            <span>Venue Photos ({galleryImages.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading gallery...</div>
        ) : galleryImages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaImage className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No photos found for the selected venue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="group relative bg-gray-900 rounded-2xl overflow-hidden shadow border border-gray-200 flex flex-col"
              >
                <div className="relative h-48 bg-gray-800">
                  <img
                    src={img.image}
                    alt={img.turf_name || "Gallery"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80"></div>

                  <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10">
                    {img.turf_name || "Primary Turf"}
                  </span>
                </div>

                <div className="p-3 bg-white flex items-center justify-between border-t border-gray-100">
                  <span className="text-[11px] text-gray-500 font-medium">
                    {img.uploaded_on ? new Date(img.uploaded_on).toLocaleDateString() : ""}
                  </span>
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                    title="Delete Image"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminGallery;