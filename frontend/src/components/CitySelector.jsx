import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaCheck,
  FaCity,
} from "react-icons/fa";
import { useTurf } from "../context/TurfContext";

export default function CitySelector({ isMobile = false, onSelect }) {
  const { selectedCity, setSelectedCity, cities, turfs } = useTurf();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Calculate venue count per city
  const getVenueCount = (cityName) => {
    if (!turfs || turfs.length === 0) return 0;
    if (!cityName) return turfs.length;
    const target = cityName.trim().toLowerCase();
    return turfs.filter((t) => {
      if (t.city && t.city.trim().toLowerCase() === target) return true;
      if (t.location && t.location.toLowerCase().includes(target)) return true;
      return false;
    }).length;
  };

  // Filtered cities list based on search input
  const filteredCities = useMemo(() => {
    if (!cities || cities.length === 0) return [];
    const term = search.trim().toLowerCase();
    if (!term) return cities;
    return cities.filter((city) => city.toLowerCase().includes(term));
  }, [cities, search]);

  const matchesAllCities = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return "all cities".includes(term) || "all".includes(term);
  }, [search]);

  const handleSelectCity = (cityName) => {
    setSelectedCity(cityName);
    setIsOpen(false);
    setSearch("");
    if (onSelect) {
      onSelect(cityName);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // If exactly one city matches, select it on Enter
      if (filteredCities.length === 1) {
        handleSelectCity(filteredCities[0]);
      } else if (filteredCities.length === 0 && matchesAllCities) {
        handleSelectCity("");
      }
    }
  };

  const currentLabel = selectedCity || "All Cities";

  return (
    <div
      ref={containerRef}
      className={`relative ${isMobile ? "w-full" : "inline-block"}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 bg-gray-900 border px-3 py-1.5 rounded-xl text-xs text-gray-200 transition shadow-sm active:scale-95 ${
          isOpen
            ? "border-green-500 ring-2 ring-green-500/20 bg-gray-850"
            : "border-gray-700 hover:border-green-500/50"
        } ${isMobile ? "w-full py-2.5 text-sm" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 truncate">
          <FaMapMarkerAlt className="text-green-400 flex-shrink-0" />
          <span className="font-semibold truncate">{currentLabel}</span>
        </div>
        <FaChevronDown
          size={10}
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180 text-green-400" : ""
          }`}
        />
      </button>

      {/* Searchable Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 bg-gray-900/98 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn ${
            isMobile
              ? "left-0 right-0 w-full"
              : "right-0 w-72 md:w-80"
          }`}
        >
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-gray-800 bg-gray-950/60">
            <div className="relative flex items-center">
              <FaSearch className="absolute left-3 text-gray-400 text-xs pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search operating city..."
                className="w-full bg-gray-900 text-white pl-8 pr-7 py-2 rounded-xl text-xs outline-none border border-gray-700 focus:border-green-500 focus:bg-gray-850 transition placeholder-gray-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 text-gray-400 hover:text-white transition p-1"
                  title="Clear search"
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>
          </div>

          {/* City Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-gray-800/30">
            {/* "All Cities" Option */}
            {matchesAllCities && (
              <button
                type="button"
                onClick={() => handleSelectCity("")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition group ${
                  !selectedCity
                    ? "bg-green-500/15 text-green-400 font-bold border border-green-500/30"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`p-1.5 rounded-lg ${
                      !selectedCity
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-800 text-gray-400 group-hover:text-green-400"
                    }`}
                  >
                    <FaCity size={12} />
                  </span>
                  <div className="truncate">
                    <span className="block truncate">All Cities</span>
                    <span className="text-[10px] text-gray-400 font-normal block">
                      All locations
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">
                    {getVenueCount("")} venues
                  </span>
                  {!selectedCity && (
                    <FaCheck className="text-green-400 text-xs" />
                  )}
                </div>
              </button>
            )}

            {/* Filtered Cities */}
            {filteredCities.map((city) => {
              const isSelected =
                selectedCity &&
                selectedCity.trim().toLowerCase() === city.trim().toLowerCase();
              const count = getVenueCount(city);

              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition group ${
                    isSelected
                      ? "bg-green-500/15 text-green-400 font-bold border border-green-500/30"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-800 text-gray-400 group-hover:text-green-400"
                      }`}
                    >
                      <FaMapMarkerAlt size={12} />
                    </span>
                    <span className="truncate">{city}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        count > 0
                          ? "bg-gray-800 text-gray-300 border-gray-700"
                          : "bg-gray-850 text-gray-500 border-gray-800"
                      }`}
                    >
                      {count} venue{count === 1 ? "" : "s"}
                    </span>
                    {isSelected && (
                      <FaCheck className="text-green-400 text-xs" />
                    )}
                  </div>
                </button>
              );
            })}

            {/* Empty Search State */}
            {filteredCities.length === 0 && !matchesAllCities && (
              <div className="py-6 px-4 text-center text-xs text-gray-400">
                <FaSearch className="mx-auto text-gray-600 mb-2 text-sm" />
                <p className="font-semibold text-gray-300">
                  No cities found
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  No operating city matches "{search}"
                </p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-2 text-green-400 hover:underline text-[11px]"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Dropdown Footer Hint */}
          <div className="px-3 py-2 bg-gray-950/80 border-t border-gray-800 text-[10px] text-gray-500 flex items-center justify-between">
            <span>Official Operating Cities</span>
            <span className="text-gray-400">
              {cities?.length || 0} available
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

