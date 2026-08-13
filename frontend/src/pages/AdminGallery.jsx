import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  FaUpload,
  FaTrash,
  FaImages,
  FaImage,
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminGallery() {
  const [image, setImage] = useState(null);
  const [galleryImages, setGalleryImages] =
    useState([]);
  const [loading, setLoading] =
    useState(false);

  if (
    localStorage.getItem("isAdmin") !==
    "true"
  ) {
    return (
      <Navigate to="/admin-login" />
    );
  }

  const loadGalleryImages = async () => {
    try {
      const response =
        await API.get("gallery/");

      setGalleryImages(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadImage = async () => {
    if (!image) {
      alert(
        "Please select an image"
      );
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "image",
        image
      );

      await API.post(
        "upload-image/",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      alert(
        "Image Uploaded Successfully"
      );

      setImage(null);

      loadGalleryImages();
    } catch (error) {
      console.log(error);

      alert(
        "Failed to upload image"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id) => {
    const confirmDelete =
      window.confirm(
        "Delete this image?"
      );

    if (!confirmDelete) return;

    try {
      await API.delete(
        `delete-image/${id}/`
      );

      loadGalleryImages();

      alert(
        "Image Deleted Successfully"
      );
    } catch (error) {
      console.log(error);

      alert(
        "Failed to delete image"
      );
    }
  };

  useEffect(() => {
    loadGalleryImages();
  }, []);

  return (
    <AdminLayout>

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl md:text-5xl font-bold">
          Gallery Management
        </h1>

        <p className="text-gray-500 mt-2">
          Upload and manage turf gallery images
        </p>

      </div>

      {/* Stats Card */}
      <div
        className="
        bg-gradient-to-r
        from-green-600
        to-green-800
        text-white
        rounded-3xl
        p-6 md:p-8
        shadow-xl
        mb-8
        "
      >

        <div className="flex items-center gap-5">

          <FaImages
            size={50}
          />

          <div>

            <h2 className="text-4xl font-bold">
              {galleryImages.length}
            </h2>

            <p className="text-green-100">
              Total Gallery Images
            </p>

          </div>

        </div>

      </div>

      {/* Upload Section */}
      <div
        className="
        bg-white
        rounded-3xl
        shadow-lg
        p-5 md:p-8
        mb-10
        "
      >

        <h2
          className="
          text-2xl
          font-bold
          mb-5
          "
        >
          Upload New Image
        </h2>

        <div
          className="
          flex
          flex-col
          lg:flex-row
          gap-4
          "
        >

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(
                e.target.files[0]
              )
            }
            className="
            border
            rounded-xl
            p-3
            w-full
            "
          />

          <button
            onClick={uploadImage}
            disabled={loading}
            className="
            w-full lg:w-auto
            bg-green-600
            hover:bg-green-700
            text-white
            px-8
            py-3
            rounded-xl
            font-semibold
            flex
            items-center
            justify-center
            gap-2
            "
          >
            <FaUpload />

            {loading
              ? "Uploading..."
              : "Upload Image"}
          </button>

        </div>

      </div>

      {/* Gallery Grid */}
      {galleryImages.length > 0 ? (

        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-6
          "
        >

          {galleryImages.map(
            (img) => (

              <div
                key={img.id}
                className="
                bg-white
                rounded-3xl
                overflow-hidden
                shadow-lg
                hover:shadow-2xl
                transition
                duration-300
                "
              >

                <div className="relative">

                  <img
                    src={img.image}
                    alt="Turf"
                    className="
                    w-full
                    h-52 md:h-64
                    object-cover
                    "
                  />

                  <button
                    onClick={() =>
                      deleteImage(
                        img.id
                      )
                    }
                    className="
                    absolute
                    top-3
                    right-3
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    p-3
                    rounded-full
                    shadow-lg
                    "
                  >
                    <FaTrash />
                  </button>

                </div>

                <div className="p-4">

                  <p className="text-gray-500">
                    Gallery Image
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      ) : (

        <div
          className="
          bg-white
          rounded-3xl
          shadow-lg
          p-12
          text-center
          "
        >

          <FaImage
            size={70}
            className="
            mx-auto
            text-gray-400
            mb-4
            "
          />

          <h2 className="text-2xl font-bold">
            No Images Found
          </h2>

          <p className="text-gray-500 mt-2">
            Upload your first turf image.
          </p>

        </div>

      )}

    </AdminLayout>
  );
}

export default AdminGallery;