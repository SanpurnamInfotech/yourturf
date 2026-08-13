import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  FaFutbol,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaSave,
  FaRupeeSign,
} from "react-icons/fa";

import API from "../services/api";
import AdminLayout from "../components/AdminLayout";


function MasterSettings() {

  const [turf, setTurf] = useState({
    name: "",
    description: "",
    location: "",
    phone: "",
    email: "",
    // price_per_hour: "",
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [mainImage, setMainImage] = useState(null);

  const [aboutImage, setAboutImage] = useState(null);


  if (
    localStorage.getItem("isAdmin") !== "true"
  ) {
    return (
      <Navigate
        to="/admin-login"
      />
    );
  }


  // Load Master Turf Information
  const loadTurf = async () => {

    try {

      const response =
        await API.get("turf/");

      setTurf(response.data);

    } catch (error) {

      console.log(error);

      alert(
        "Unable to load turf information."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadTurf();

  }, []);


  // Handle Input Changes
  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setTurf({
      ...turf,
      [name]: value,
    });

  };

  const handleImageChange = (e) => {

  const file = e.target.files[0];

  if (file) {
    setMainImage(file);
  }

};


  const handleAboutImageChange = (e) => {

  const file = e.target.files[0];

  if (file) {
    setAboutImage(file);
  }

};


  // Save Master Information
  const handleSave = async (e) => {

    e.preventDefault();

    setSaving(true);

    try {

      const formData = new FormData();

formData.append(
  "name",
  turf.name
);

formData.append(
  "description",
  turf.description
);

formData.append(
  "location",
  turf.location
);

formData.append(
  "phone",
  turf.phone
);

formData.append(
  "email",
  turf.email || ""
);

// formData.append(
//   "price_per_hour",
//   turf.price_per_hour || ""
// );

if (mainImage) {

  formData.append(
    "main_image",
    mainImage
  );

}

if (aboutImage) {

  formData.append(
    "about_image",
    aboutImage
  );

}

const response =
  await API.put(
    "turf/",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

      setTurf(
        response.data
      );

      alert(
        "Turf information updated successfully!"
      );

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data ||
        "Unable to update turf information."
      );

    } finally {

      setSaving(false);

    }

  };


  if (loading) {

    return (

      <AdminLayout>

        <div className="flex justify-center items-center min-h-[400px]">

          <p className="text-xl font-semibold">
            Loading Master Settings...
          </p>

        </div>

      </AdminLayout>

    );

  }


  return (

    <AdminLayout>

      {/* Header */}

      <div
        className="
        bg-gradient-to-r
        from-green-600
        to-green-800
        text-white
        rounded-3xl
        p-6
        md:p-10
        mb-8
        shadow-xl
        "
      >

        <div className="flex items-center gap-5">

          <div
            className="
            bg-white/20
            p-4
            rounded-2xl
            "
          >

            <FaFutbol
              size={40}
            />

          </div>

          <div>

            <h1
              className="
              text-3xl
              md:text-4xl
              font-bold
              "
            >
              Master Settings
            </h1>

            <p
              className="
              mt-2
              text-green-100
              "
            >
              Manage your turf information
              from one place.
            </p>

          </div>

        </div>

      </div>


      {/* Form */}

      <form
        onSubmit={handleSave}
        className="
        bg-white
        rounded-3xl
        shadow-xl
        p-6
        md:p-10
        "
      >

        <h2
          className="
          text-2xl
          font-bold
          mb-8
          "
        >
          Turf Information
        </h2>


        {/* Turf Name */}

        <div className="mb-6">

          <label
            className="
            block
            font-semibold
            mb-2
            "
          >
            Turf Name
          </label>

          <div className="relative">

            <FaFutbol
              className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-green-600
              "
            />

            <input
              type="text"
              name="name"
              value={turf.name}
              onChange={handleChange}
              required
              className="
              w-full
              border
              border-gray-300
              rounded-xl
              py-4
              pl-12
              pr-4
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
              "
              placeholder="Enter turf name"
            />

          </div>

        </div>


        {/* Description */}

        <div className="mb-6">

          <label
            className="
            block
            font-semibold
            mb-2
            "
          >
            Description
          </label>

          <textarea
            name="description"
            value={turf.description}
            onChange={handleChange}
            rows="5"
            className="
            w-full
            border
            border-gray-300
            rounded-xl
            p-4
            focus:outline-none
            focus:ring-2
            focus:ring-green-500
            "
            placeholder="Enter turf description"
          />

        </div>

        <div className="mb-8">

  <label
    className="
    block
    font-semibold
    mb-2
    "
  >
    Main Website Image
  </label>

  {/* Current Image */}

  {turf.main_image && (

    <div className="mb-4">

      <img
        src={turf.main_image}
        alt="Main Turf"
        className="
        w-full
        max-w-2xl
        h-64
        object-cover
        rounded-2xl
        shadow-md
        "
      />

    </div>

  )}

  <input
    type="file"
    accept="image/*"
    onChange={handleImageChange}
    className="
    w-full
    border
    border-gray-300
    rounded-xl
    p-3
    "
  />

  {mainImage && (

    <p className="text-sm text-green-600 mt-2">

      New image selected:
      {" "}
      {mainImage.name}

    </p>

  )}

  <p className="text-sm text-gray-500 mt-2">

    This image will be used as the main background
    image on your website.

  </p>

</div>

{/* About Section Image */}

<div className="mb-8">

  <label
    className="
    block
    font-semibold
    mb-2
    "
  >
    About Section Image
  </label>

  {/* Current About Image */}

  {turf.about_image && (
    <div className="mb-4">

      <img
        src={turf.about_image}
        alt="About Turf"
        className="
        w-full
        max-w-2xl
        h-64
        object-cover
        rounded-2xl
        shadow-md
        "
      />

    </div>
  )}

  {/* Select Image */}

  <input
    type="file"
    accept="image/*"
    onChange={handleAboutImageChange}
    className="
    w-full
    border
    border-gray-300
    rounded-xl
    p-3
    "
  />

  {/* Selected File */}

  {aboutImage && (
    <p className="text-sm text-green-600 mt-2">
      New image selected: {aboutImage.name}
    </p>
  )}

  <p className="text-sm text-gray-500 mt-2">
    This image will be used in the About section
    of your website.
  </p>

</div>



        {/* Location */}

        <div className="mb-6">

          <label
            className="
            block
            font-semibold
            mb-2
            "
          >
            Location
          </label>

          <div className="relative">

            <FaMapMarkerAlt
              className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-red-500
              "
            />

            <input
              type="text"
              name="location"
              value={turf.location}
              onChange={handleChange}
              required
              className="
              w-full
              border
              border-gray-300
              rounded-xl
              py-4
              pl-12
              pr-4
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
              "
              placeholder="Enter turf location"
            />

          </div>

        </div>


        {/* Phone + Email */}

        <div
          className="
          grid
          md:grid-cols-2
          gap-6
          mb-6
          "
        >

          {/* Phone */}

          <div>

            <label
              className="
              block
              font-semibold
              mb-2
              "
            >
              Phone Number
            </label>

            <div className="relative">

              <FaPhone
                className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-blue-600
                "
              />

              <input
                type="tel"
                name="phone"
                value={turf.phone}
                onChange={handleChange}
                maxLength="15"
                className="
                w-full
                border
                border-gray-300
                rounded-xl
                py-4
                pl-12
                pr-4
                focus:outline-none
                focus:ring-2
                focus:ring-green-500
                "
                placeholder="Enter phone number"
              />

            </div>

          </div>


          {/* Email */}

          <div>

            <label
              className="
              block
              font-semibold
              mb-2
              "
            >
              Email Address
            </label>

            <div className="relative">

              <FaEnvelope
                className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-green-600
                "
              />

              <input
                type="email"
                name="email"
                value={turf.email || ""}
                onChange={handleChange}
                className="
                w-full
                border
                border-gray-300
                rounded-xl
                py-4
                pl-12
                pr-4
                focus:outline-none
                focus:ring-2
                focus:ring-green-500
                "
                placeholder="Enter email address"
              />

            </div>

          </div>

        </div>


        {/* Price */}
{/* 
        <div className="mb-8">

          <label
            className="
            block
            font-semibold
            mb-2
            "
          >
            Price Per Hour
          </label> */}

          {/* <div className="relative">

            <FaRupeeSign
              className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-green-600
              "
            />

            <input
              type="number"
              name="price_per_hour"
              value={
                turf.price_per_hour
              }
              onChange={handleChange}
              min="0"
              step="0.01"
              className="
              w-full
              border
              border-gray-300
              rounded-xl
              py-4
              pl-12
              pr-4
              focus:outline-none
              focus:ring-2
              focus:ring-green-500
              "
              placeholder="Enter price per hour"
            />

          </div>

          <p className="text-sm text-gray-500 mt-2">
            Note: Your current booking system
            uses Day/Night prices from Turf Settings.
          </p>

        </div> */}


        {/* Save Button */}

        <div
          className="
          flex
          justify-end
          "
        >

          <button
            type="submit"
            disabled={saving}
            className="
            flex
            items-center
            gap-3
            bg-green-600
            hover:bg-green-700
            disabled:bg-gray-400
            text-white
            px-8
            py-4
            rounded-xl
            font-bold
            shadow-lg
            transition
            "
          >

            <FaSave />

            {saving
              ? "Saving..."
              : "Save Changes"
            }

          </button>

        </div>

      </form>

    </AdminLayout>

  );

}

export default MasterSettings;