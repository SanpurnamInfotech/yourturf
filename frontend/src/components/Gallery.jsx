import { useEffect, useState } from "react";
import API from "../services/api";
import { useTurf } from "../context/TurfContext";
import { FaFutbol, FaMapMarkerAlt, FaTimes, FaImages } from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Gallery() {
  const { turfs } = useTurf();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadAllImages();
  }, [turfs]);

  const loadAllImages = async () => {
    try {
      setLoading(true);

      // 1. Fetch all gallery images from existing API
      let galleryList = [];
      try {
        const response = await API.get("gallery/");
        galleryList = Array.isArray(response.data) ? response.data : [];
      } catch (err) {
        console.error("Error loading gallery images:", err);
      }

      // 2. Fetch turfs if not yet loaded in context
      let turfsList = turfs;
      if (!turfsList || turfsList.length === 0) {
        try {
          const tRes = await API.get("turfs/");
          turfsList = Array.isArray(tRes.data) ? tRes.data : [];
        } catch (err) {
          console.error("Error loading turfs for gallery:", err);
        }
      }

      // 3. Deduplicate and combine images from all turfs
      const seenUrls = new Set();
      const combined = [];

      const normalizeUrl = (url) => {
        if (!url) return "";
        try {
          const pathname = new URL(url, window.location.origin).pathname;
          return pathname.toLowerCase();
        } catch {
          return url.toLowerCase();
        }
      };

      // Add uploaded gallery images
      galleryList.forEach((item) => {
        if (item.image) {
          const key = normalizeUrl(item.image);
          if (!seenUrls.has(key)) {
            seenUrls.add(key);
            const matchedTurf = turfsList.find(
              (t) => String(t.id) === String(item.turf)
            );
            combined.push({
              id: `gallery-${item.id}`,
              image: item.image,
              turf_name: item.turf_name || matchedTurf?.name || "Premium Turf",
              location: matchedTurf?.location || "Maharashtra",
            });
          }
        }
      });

      // Ensure every active turf's main_image and about_image are also included in the common gallery
      if (Array.isArray(turfsList)) {
        turfsList.forEach((t) => {
          if (t.main_image) {
            const key = normalizeUrl(t.main_image);
            if (!seenUrls.has(key)) {
              seenUrls.add(key);
              combined.push({
                id: `turf-${t.id}-main`,
                image: t.main_image,
                turf_name: t.name,
                location: t.location || "Maharashtra",
              });
            }
          }
          if (t.about_image) {
            const key = normalizeUrl(t.about_image);
            if (!seenUrls.has(key)) {
              seenUrls.add(key);
              combined.push({
                id: `turf-${t.id}-about`,
                image: t.about_image,
                turf_name: t.name,
                location: t.location || "Maharashtra",
              });
            }
          }
        });
      }

      setImages(combined);
    } catch (error) {
      console.error("Error building common gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="gallery" className="py-24 bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <h2 className="text-xl font-bold text-gray-700">Loading Gallery...</h2>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="text-green-600 uppercase tracking-[4px] font-bold text-sm block">
            Multi-Venue Photo Showcase
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 text-gray-900 tracking-tight">
            Explore All <span className="text-green-600">Turfs Gallery</span>
          </h2>

          <p className="text-gray-600 mt-4 max-w-3xl mx-auto text-lg">
            Experience our premium football and cricket venues through real photos from all our grounds across Maharashtra.
          </p>
        </div>

        {/* Empty State */}
        {images.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 max-w-lg mx-auto">
            <FaImages className="text-4xl text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No venue photos available yet.</p>
          </div>
        ) : (
          /* Gallery Carousel */
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            loop={images.length > 2}
            centeredSlides={images.length > 2}
            spaceBetween={30}
            navigation={true}
            pagination={{ clickable: true }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              320: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="pb-14"
          >
            {images.map((img) => (
              <SwiperSlide key={img.id}>
                <div
                  onClick={() => setSelectedImage(img)}
                  className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-xl hover:shadow-2xl transition-all duration-500 bg-gray-900"
                >
                  <img
                    src={img.image}
                    alt={`${img.turf_name} Turf`}
                    className="h-[430px] w-full object-cover duration-700 transition-all group-hover:scale-110"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80";
                    }}
                  />

                  {/* Top-Left Turf Badge: Indicates which turf the photo belongs to */}
                  <div className="absolute top-4 left-4 z-10 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white border border-white/20 flex items-center gap-1.5 shadow-lg">
                    <FaFutbol className="text-green-400" />
                    <span>{img.turf_name} Turf</span>
                  </div>

                  {/* Top-Right City/Location Tag */}
                  {img.location && (
                    <div className="absolute top-4 right-4 z-10 bg-green-500 text-black px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-md">
                      <FaMapMarkerAlt size={10} />
                      <span>{img.location.split(",")[0]}</span>
                    </div>
                  )}

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                  {/* Bottom Caption on Hover */}
                  <div className="absolute bottom-0 left-0 w-full p-6 translate-y-6 group-hover:translate-y-0 transition-all duration-500">
                    <h3 className="text-white text-2xl font-extrabold tracking-tight">
                      {img.turf_name} Turf
                    </h3>
                    <p className="text-green-400 mt-1 text-sm font-semibold flex items-center gap-1.5">
                      <FaMapMarkerAlt />
                      <span>{img.location || "Premium Sports Ground"}</span>
                    </p>
                    <span className="inline-block mt-2 text-xs text-gray-300 font-medium">
                      Click to view full photo &rarr;
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Fullscreen Lightbox Modal */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[999] p-4 backdrop-blur-sm animate-fadeIn"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center bg-gray-950 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl"
            >
              {/* Header Bar */}
              <div className="w-full p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaFutbol className="text-green-400" />
                  <span className="text-white font-bold text-base">
                    {selectedImage.turf_name} Turf
                  </span>
                  {selectedImage.location && (
                    <span className="text-xs text-gray-400 ml-2 border-l border-gray-700 pl-2 flex items-center gap-1">
                      <FaMapMarkerAlt className="text-green-400" />
                      {selectedImage.location}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 text-gray-400 hover:text-white rounded-full bg-gray-800 hover:bg-gray-700 transition"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              {/* Photo Display */}
              <div className="p-2 flex items-center justify-center max-h-[75vh] w-full overflow-hidden">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.turf_name}
                  className="max-h-[75vh] max-w-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Gallery;
