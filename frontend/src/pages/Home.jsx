import { useEffect, useState } from "react";
import API from "../services/api";  

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Facilities from "../components/Facilities";
import About from "../components/About";
import Gallery from "../components/Gallery";
import Pricing from "../components/Pricing";
import ContactCTA from "../components/ContactCTA";
import Footer from "../components/Footer";

function Home() {

  const [turf, setTurf] = useState(null);

  useEffect(() => {

    const loadTurf = async () => {

      try {

        const response = await API.get("turf/");

        setTurf(response.data);

      } catch (error) {

        console.log("Failed to load turf:", error);

      }

    };

    loadTurf();

  }, []);
  
  return (
  <>
    <Navbar turf={turf} />

    <Hero turf={turf} />

    <Facilities />

    <About turf={turf} />

    <Gallery turf={turf} />

    <Pricing turf={turf} />

    <ContactCTA turf={turf} />

    <Footer turf={turf} />
  </>
);

}

export default Home;