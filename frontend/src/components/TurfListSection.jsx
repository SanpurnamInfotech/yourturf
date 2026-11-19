import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaFutbol,
  FaCheckCircle,
  FaArrowRight,
  FaInfoCircle,
  FaTimes,
  FaCity,
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaMoon,
  FaTag,
} from "react-icons/fa";
import { useTurf } from "../context/TurfContext";

export default function TurfListSection({ turfs, loading, onSelectTurf }) {
  const navigate = useNavigate();
  const { selectedCity, setSelectedCity, cities, turfs: allTurfs } = useTurf();
  const [selectedTurfModal, setSelectedTurfModal] = useState(null);
  const swiperRef = useRef(null);

  // Reset carousel slide to beginning when city filter changes
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
  }, [selectedCity, turfs]);

  const formatTime = (timeStr) => {
    if (!timeStr) return "24 Hours";
    try {
      const [h, m] = timeStr.split(":");
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  /**
   * Helper to parse and calculate dynamic pricing for each specific venue.
   * Never hardcodes rates or applies shared fallback prices.
   */
  const getTurfPricing = (turf) => {
    const rawDay =
      turf?.day_price !== null && turf?.day_price !== undefined
        ? parseFloat(turf.day_price)
        : null;
    const rawNight =
      turf?.night_price !== null && turf?.night_price !== undefined
        ? parseFloat(turf.night_price)
        : null;

    const hasDay = rawDay !== null && !isNaN(rawDay) && rawDay > 0;
    const hasNight = rawNight !== null && !isNaN(rawNight) && rawNight > 0;

    if (!hasDay && !hasNight) {
      return {
        available: false,
        startingPrice: null,
        dayPrice: null,
        nightPrice: null,
        label: "Contact for Pricing",
      };
    }

    const validPrices = [];
    if (hasDay) validPrices.push(rawDay);
    if (hasNight) validPrices.push(rawNight);

    const startingPrice = Math.min(...validPrices);

    const formatPrice = (val) => {
      if (val === null || val === undefined) return null;
      return Number.isInteger(val) ? val.toString() : val.toFixed(0);
    };

    return {
      available: true,
      startingPrice: formatPrice(startingPrice),
      dayPrice: hasDay ? formatPrice(rawDay) : null,
      nightPrice: hasNight ? formatPrice(rawNight) : null,
      hasDay,
      hasNight,
      hasDifferentDayNight: hasDay && hasNight && rawDay !== rawNight,
    };
  };

  const handleBookNow = (turfId) => {
    if (onSelectTurf) {
      onSelectTurf(turfId);
    }
    navigate(`/book?turf_id=${turfId}`);
  };

  const modalPricing = selectedTurfModal ? getTurfPricing(selectedTurfModal) : null;

  return (
    <section id="turfs" className="py-20 bg-gray-950 text-white relative">
      <style>{`
        .turf-carousel-swiper .swiper-pagination-bullet {
          background: #4b5563;
          opacity: 0.6;
          transition: all 0.3s;
        }
        .turf-carousel-swiper .swiper-pagination-bullet-active {
          background: #22c55e !important;
          width: 24px;
          border-radius: 9999px;
          opacity: 1;
        }
        .turf-carousel-swiper .swiper-button-disabled,
        #turf-carousel-prev.swiper-button-disabled,
        #turf-carousel-next.swiper-button-disabled {
          opacity: 0.25 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-1.5 rounded-full text-green-400 text-sm font-semibold mb-4">
            <FaFutbol className="animate-spin-slow" />
            <span>Multiple Venues Available</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Choose Your <span className="text-green-500">Turf Venue</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">
            Explore our premium multi-sport turfs across Maharashtra. Filter by your city, compare venue facilities and dynamic slot pricing, then book your slot instantly.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          <button
            onClick={() => setSelectedCity("")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              !selectedCity
                ? "bg-green-500 text-black shadow-green-500/20 scale-105"
                : "bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800"
            }`}
          >
            <FaCity className={!selectedCity ? "text-black" : "text-green-400"} />
            <span>All Cities ({allTurfs ? allTurfs.length : 0})</span>
          </button>

          {cities &&
            cities.map((city) => {
              const count = allTurfs
                ? allTurfs.filter(
                    (t) =>
                      t.location &&
                      t.location.toLowerCase().includes(city.toLowerCase())
                  ).length
                : 0;

              const isSelected =
                selectedCity && selectedCity.toLowerCase() === city.toLowerCase();

              return (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                    isSelected
                      ? "bg-green-500 text-black shadow-green-500/20 scale-105"
                      : "bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800"
                  }`}
                >
                  <FaMapMarkerAlt
                    className={isSelected ? "text-black" : "text-green-400"}
                  />
                  <span>
                    {city} ({count})
                  </span>
                </button>
              );
            })}
        </div>

        {/* Selected City Notification Indicator */}
        {selectedCity && (
          <div className="mb-8 flex items-center justify-between bg-gray-900/80 border border-gray-800 px-5 py-3 rounded-2xl max-w-xl mx-auto text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-green-400 text-sm" />
              <span>
                Showing turfs in <strong className="text-white">{selectedCity}</strong> ({turfs.length} found)
              </span>
            </div>
            <button
              onClick={() => setSelectedCity("")}
              className="text-green-400 hover:text-green-300 font-semibold underline ml-4"
            >
              Show All Cities
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-6 animate-pulse"
              >
                <div className="w-full h-52 bg-gray-800 rounded-2xl mb-5"></div>
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-gray-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && (!turfs || turfs.length === 0) && (
          <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-xl mx-auto">
            <FaFutbol className="text-5xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold">
              {selectedCity
                ? `No Turfs Found in ${selectedCity}`
                : "No Active Turfs Found"}
            </h3>
            <p className="text-gray-400 mt-2 text-sm">
              {selectedCity
                ? `We couldn't find any active venues listed under ${selectedCity}. Try selecting All Cities or another region.`
                : "Our venues are currently updating their schedules. Please check back shortly."}
            </p>
            {selectedCity && (
              <button
                onClick={() => setSelectedCity("")}
                className="mt-6 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-black font-bold text-xs rounded-xl transition"
              >
                View All Cities
              </button>
            )}
          </div>
        )}

        {/* Turf Cards Horizontal Carousel Slider */}
        {!loading && turfs && turfs.length > 0 && (
          <div className="relative px-1 md:px-3">
            {/* Left Navigation Arrow */}
            <button
              id="turf-carousel-prev"
              className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 bg-gray-900/90 hover:bg-green-500 text-white hover:text-black rounded-full border border-gray-700/80 hover:border-green-400 flex items-center justify-center transition-all duration-200 shadow-2xl backdrop-blur-md active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
              aria-label="Previous Venues"
            >
              <FaChevronLeft size={16} />
            </button>

            {/* Right Navigation Arrow */}
            <button
              id="turf-carousel-next"
              className="absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 bg-gray-900/90 hover:bg-green-500 text-white hover:text-black rounded-full border border-gray-700/80 hover:border-green-400 flex items-center justify-center transition-all duration-200 shadow-2xl backdrop-blur-md active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
              aria-label="Next Venues"
            >
              <FaChevronRight size={16} />
            </button>

            <Swiper
              key={selectedCity || "all-cities"}
              modules={[Navigation, Pagination]}
              navigation={{
                prevEl: "#turf-carousel-prev",
                nextEl: "#turf-carousel-next",
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              grabCursor={true}
              speed={500}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 16,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 28,
                },
              }}
              className="pb-14 turf-carousel-swiper"
            >
              {turfs.map((turf) => {
                const pricing = getTurfPricing(turf);

                return (
                  <SwiperSlide key={turf.id} className="h-auto pb-4">
                    <div className="group bg-gradient-to-b from-gray-900 to-black border border-gray-800 hover:border-green-500/60 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 flex flex-col h-full">
                      {/* Image Container with Badges */}
                      <div className="relative h-60 overflow-hidden bg-gray-800">
                        <img
                          src={
                            turf.main_image ||
                            "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={turf.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/40"></div>

                        {/* Location Badge */}
                        <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-gray-200 border border-white/10">
                          <FaMapMarkerAlt className="text-green-400" />
                          <span className="truncate max-w-[180px]">
                            {turf.location || "Available Venue"}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                          <span>Open Now</span>
                        </div>

                        {/* Image Bottom Overlay with Operating Hours & Starting Hourly Price Badge */}
                        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-xs">
                          <span className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-gray-200 font-medium flex items-center gap-1.5">
                            <FaClock className="text-green-400" />
                            <span>
                              {formatTime(turf.opening_time)} - {formatTime(turf.closing_time)}
                            </span>
                          </span>

                          {pricing.available ? (
                            <span className="bg-green-500 text-black font-extrabold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1 text-xs">
                              <span className="text-[10px] uppercase font-bold text-black/80">From</span>
                              <span>₹{pricing.startingPrice}</span>
                              <span className="text-[10px] font-normal text-black/80">/hr</span>
                            </span>
                          ) : (
                            <span className="bg-gray-900/90 text-amber-300 border border-amber-400/30 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold">
                              Contact for Pricing
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-2xl font-bold group-hover:text-green-400 transition-colors">
                              {turf.name}
                            </h3>
                            <FaCheckCircle
                              className="text-green-500 text-lg"
                              title="Verified Venue"
                            />
                          </div>

                          <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                            {turf.description ||
                              "Premium turf ground equipped with FIFA-grade artificial grass, floodlights, and professional sports equipment."}
                          </p>

                          {/* Operational Hours */}
                          <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800/60 px-3 py-2 rounded-xl mb-3 border border-gray-700/40">
                            <FaClock className="text-green-400 flex-shrink-0" />
                            <span>
                              Hours: {formatTime(turf.opening_time)} -{" "}
                              {formatTime(turf.closing_time)}
                            </span>
                          </div>

                          {/* Individual Venue Dynamic Pricing Box */}
                          <div className="bg-gray-800/70 rounded-2xl p-3 mb-4 border border-gray-700/50">
                            {pricing.available ? (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <FaTag className="text-green-400" /> Starting Price
                                  </span>
                                  <span className="text-base font-extrabold text-green-400">
                                    ₹{pricing.startingPrice}{" "}
                                    <span className="text-xs text-gray-400 font-normal">/ hour</span>
                                  </span>
                                </div>

                                <div className="pt-2 border-t border-gray-700/60 flex items-center justify-between text-xs gap-2">
                                  {pricing.hasDay ? (
                                    <span className="flex-1 flex items-center justify-center gap-1.5 text-amber-300 font-semibold bg-gray-900/80 py-1.5 px-2 rounded-xl border border-amber-400/20">
                                      <FaSun className="text-amber-400 flex-shrink-0" />
                                      <span>Day: ₹{pricing.dayPrice}/hr</span>
                                    </span>
                                  ) : (
                                    <span className="flex-1 text-center text-gray-500 text-[11px] py-1.5">
                                      Day: N/A
                                    </span>
                                  )}

                                  {pricing.hasNight ? (
                                    <span className="flex-1 flex items-center justify-center gap-1.5 text-blue-300 font-semibold bg-gray-900/80 py-1.5 px-2 rounded-xl border border-blue-400/20">
                                      <FaMoon className="text-blue-400 flex-shrink-0" />
                                      <span>Night: ₹{pricing.nightPrice}/hr</span>
                                    </span>
                                  ) : (
                                    <span className="flex-1 text-center text-gray-500 text-[11px] py-1.5">
                                      Night: N/A
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between py-1">
                                <span className="text-xs text-gray-400 font-medium">Hourly Pricing</span>
                                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">
                                  Contact for Pricing
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Facilities Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            <span className="bg-gray-800 text-gray-300 text-[11px] px-2.5 py-1 rounded-lg border border-gray-700">
                              🏏 Cricket
                            </span>
                            <span className="bg-gray-800 text-gray-300 text-[11px] px-2.5 py-1 rounded-lg border border-gray-700">
                              ⚽ Football
                            </span>
                            <span className="bg-gray-800 text-gray-300 text-[11px] px-2.5 py-1 rounded-lg border border-gray-700">
                              💡 Floodlights
                            </span>
                            <span className="bg-gray-800 text-gray-300 text-[11px] px-2.5 py-1 rounded-lg border border-gray-700">
                              🚗 Parking
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-gray-800/80 flex items-center gap-3">
                          <button
                            onClick={() => setSelectedTurfModal(turf)}
                            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition flex items-center gap-1.5"
                          >
                            <FaInfoCircle />
                            <span>Details</span>
                          </button>

                          <button
                            onClick={() => handleBookNow(turf.id)}
                            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95"
                          >
                            <span>Book This Turf</span>
                            <FaArrowRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedTurfModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setSelectedTurfModal(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 text-white hover:text-red-400 p-2 rounded-full transition"
            >
              <FaTimes size={18} />
            </button>

            {selectedTurfModal.about_image || selectedTurfModal.main_image ? (
              <img
                src={selectedTurfModal.about_image || selectedTurfModal.main_image}
                alt={selectedTurfModal.name}
                className="w-full h-56 object-cover"
              />
            ) : null}

            <div className="p-6">
              <h3 className="text-3xl font-extrabold text-white mb-2">
                {selectedTurfModal.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {selectedTurfModal.description}
              </p>

              <div className="space-y-2.5 text-sm text-gray-300 mb-6 bg-gray-800/60 p-4 rounded-2xl border border-gray-700">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-green-400 w-4" />
                  <span>{selectedTurfModal.location}</span>
                </div>
                {selectedTurfModal.phone && (
                  <div className="flex items-center gap-2">
                    <FaPhoneAlt className="text-green-400 w-4" />
                    <span>{selectedTurfModal.phone}</span>
                  </div>
                )}
                {selectedTurfModal.email && (
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-green-400 w-4" />
                    <span>{selectedTurfModal.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaClock className="text-green-400 w-4" />
                  <span>
                    Operating: {formatTime(selectedTurfModal.opening_time)} -{" "}
                    {formatTime(selectedTurfModal.closing_time)}
                  </span>
                </div>

                {/* Individual Pricing Details in Modal */}
                <div className="border-t border-gray-700/60 pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FaTag className="text-green-400" /> Venue Pricing
                    </span>
                    {modalPricing && modalPricing.available ? (
                      <span className="text-base font-extrabold text-green-400">
                        Starts at ₹{modalPricing.startingPrice}{" "}
                        <span className="text-xs text-gray-400 font-normal">/ hr</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400">Contact for Pricing</span>
                    )}
                  </div>

                  {modalPricing && modalPricing.available && (
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="bg-gray-900/80 p-2.5 rounded-xl border border-amber-400/20 flex items-center gap-2">
                        <FaSun className="text-amber-400 text-sm flex-shrink-0" />
                        <div>
                          <span className="text-gray-400 block text-[10px]">Day Slot (06:00 - 18:00)</span>
                          <span className="font-bold text-amber-300">
                            {modalPricing.hasDay ? `₹${modalPricing.dayPrice} / hr` : "Not available"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-900/80 p-2.5 rounded-xl border border-blue-400/20 flex items-center gap-2">
                        <FaMoon className="text-blue-400 text-sm flex-shrink-0" />
                        <div>
                          <span className="text-gray-400 block text-[10px]">Night Slot (18:00 - 06:00)</span>
                          <span className="font-bold text-blue-300">
                            {modalPricing.hasNight ? `₹${modalPricing.nightPrice} / hr` : "Not available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedTurfModal(null)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const id = selectedTurfModal.id;
                    setSelectedTurfModal(null);
                    handleBookNow(id);
                  }}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                  <span>Select & Book</span>
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
