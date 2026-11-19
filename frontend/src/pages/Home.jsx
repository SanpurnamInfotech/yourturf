import { useEffect, useState, useMemo } from "react";
import { useTurf } from "../context/TurfContext";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TurfListSection from "../components/TurfListSection";
import Facilities from "../components/Facilities";
import About from "../components/About";
import Gallery from "../components/Gallery";
import ContactCTA from "../components/ContactCTA";
import Footer from "../components/Footer";

function Home() {
  const { turfs, selectedTurf, setSelectedTurfId, loading, selectedCity } = useTurf();
  const [activeTurf, setActiveTurf] = useState(null);

  useEffect(() => {
    if (selectedTurf) {
      setActiveTurf(selectedTurf);
    } else if (turfs && turfs.length > 0) {
      setActiveTurf(turfs[0]);
    }
  }, [selectedTurf, turfs]);

  // Filter turfs based on active city selection
  const filteredTurfs = useMemo(() => {
    if (!selectedCity) return turfs;
    const target = selectedCity.trim().toLowerCase();
    return turfs.filter((t) => {
      if (t.city && t.city.trim().toLowerCase() === target) {
        return true;
      }
      if (t.location) {
        const cityPart = t.location.split(/[,/]/)[0].trim().toLowerCase();
        return cityPart === target || t.location.toLowerCase().includes(target);
      }
      return false;
    });
  }, [turfs, selectedCity]);

  const handleSelectTurf = (turfId) => {
    setSelectedTurfId(turfId);
    const found = turfs.find((t) => t.id === turfId);
    if (found) {
      setActiveTurf(found);
    }
  };

  return (
    <>
      <Navbar turf={activeTurf} />

      <Hero turf={activeTurf} />

      {/* Multi-Turf Selection Section with City Filter */}
      <TurfListSection
        turfs={filteredTurfs}
        loading={loading}
        onSelectTurf={handleSelectTurf}
      />

      <Facilities turf={activeTurf} />

      <About turf={activeTurf} />

      {/* Multi-Venue Common Photo Gallery */}
      <Gallery />

      <ContactCTA turf={activeTurf} />

      <Footer turf={activeTurf} />
    </>
  );
}

export default Home;
