import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import API from "../services/api";

const TurfContext = createContext(null);

export function TurfProvider({ children }) {
  const [turfs, setTurfs] = useState([]);
  const [selectedTurfId, setSelectedTurfId] = useState(() => {
    return localStorage.getItem("selectedTurfId") || "";
  });
  const [operatingCities, setOperatingCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(true);

  // Global Master Website Settings
  const [websiteSettings, setWebsiteSettings] = useState({
    site_name: "YourTurf",
    logo: null,
    hero_image: null,
    about_image: null,
    contact_phone: "1234567890",
    contact_email: "support@yourturf.com",
  });

  const loadWebsiteSettings = async () => {
    try {
      const response = await API.get("settings/website/");
      if (response.data) {
        setWebsiteSettings(response.data);
      }
    } catch (error) {
      console.error("Failed to load website settings:", error);
    }
  };

  const loadCities = async () => {
    try {
      const response = await API.get("settings/cities/");
      if (Array.isArray(response.data)) {
        setOperatingCities(response.data);
      }
    } catch (error) {
      console.error("Failed to load operating cities:", error);
    }
  };

  const loadTurfs = async (includeAll = false) => {
    try {
      setLoading(true);
      const url = includeAll ? "turfs/?all=true" : "turfs/";
      const response = await API.get(url);
      const list = response.data || [];
      setTurfs(list);

      // Auto-select first turf if nothing is selected or current selection is invalid
      setSelectedTurfId((prev) => {
        if (prev && list.some((t) => String(t.id) === String(prev))) {
          return prev;
        }
        const firstId = list[0]?.id ? String(list[0].id) : "";
        if (firstId) {
          localStorage.setItem("selectedTurfId", firstId);
        }
        return firstId;
      });
    } catch (error) {
      console.error("Failed to load turfs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    loadTurfs(isAdmin);
    loadWebsiteSettings();
    loadCities();
  }, []);

  // Compute official operating cities list
  const cities = useMemo(() => {
    if (operatingCities.length > 0) {
      return operatingCities.map((c) => c.name);
    }
    // Fallback: derive from turfs if operating cities endpoint returns empty
    const set = new Set();
    turfs.forEach((t) => {
      if (t.city) {
        set.add(t.city.trim());
      } else if (t.location) {
        const raw = t.location.split(/[,/]/)[0].trim();
        if (raw) {
          const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
          set.add(capitalized);
        }
      }
    });
    return Array.from(set).sort();
  }, [operatingCities, turfs]);

  const changeSelectedTurf = (id) => {
    const stringId = id ? String(id) : "";
    setSelectedTurfId(stringId);
    if (stringId) {
      localStorage.setItem("selectedTurfId", stringId);
    } else {
      localStorage.removeItem("selectedTurfId");
    }
  };

  const selectedTurf =
    turfs.find((t) => String(t.id) === String(selectedTurfId)) ||
    turfs[0] ||
    null;

  return (
    <TurfContext.Provider
      value={{
        turfs,
        selectedTurf,
        selectedTurfId,
        setSelectedTurfId: changeSelectedTurf,
        operatingCities,
        loadCities,
        selectedCity,
        setSelectedCity,
        cities,
        loadTurfs,
        loading,
        websiteSettings,
        setWebsiteSettings,
        loadWebsiteSettings,
      }}
    >
      {children}
    </TurfContext.Provider>
  );
}

export function useTurf() {
  const context = useContext(TurfContext);
  if (!context) {
    throw new Error("useTurf must be used within a TurfProvider");
  }
  return context;
}

export default TurfContext;
