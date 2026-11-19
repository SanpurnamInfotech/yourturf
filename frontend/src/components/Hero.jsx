import { useNavigate } from "react-router-dom";
import { useTurf } from "../context/TurfContext";

function Hero({ turf }) {
  const navigate = useNavigate();
  const { websiteSettings } = useTurf();

  const brandName = websiteSettings?.site_name || "YourTurf";

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url("${
          websiteSettings?.hero_image ||
          turf?.main_image ||
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80"
        }")`,
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white py-24">
        <span className="inline-block bg-green-500 text-black px-4 py-2 rounded-full text-sm font-bold mb-6 tracking-wide shadow-md">
          Premium Cricket & Football Venues
        </span>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
          {brandName}
        </h1>

        <h2 className="text-2xl md:text-4xl font-semibold mt-4 text-green-400">
          Play. Compete. Win.
        </h2>

        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-200 leading-relaxed">
          Discover top-tier sports turf grounds with floodlights, professional pitch surfaces,
          parking, and instant online slot reservation.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <a
            href="#turfs"
            className="bg-green-500 hover:bg-green-600 text-black px-8 py-4 rounded-xl text-lg font-bold transition shadow-lg shadow-green-500/20 active:scale-95"
          >
            Explore Venues
          </a>

          <button
            onClick={() => navigate("/book")}
            className="border-2 border-white hover:bg-white hover:text-black px-8 py-4 rounded-xl text-lg font-semibold transition active:scale-95"
          >
            Book Turf 
          </button>
        </div>

        {/* Highlights / Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h3 className="text-3xl font-extrabold text-green-400">500+</h3>
            <p className="text-gray-300 text-sm mt-1">Happy Players & Teams</p>
          </div>

          <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h3 className="text-3xl font-extrabold text-green-400">Multiple</h3>
            <p className="text-gray-300 text-sm mt-1">Cities & Verified Venues</p>
          </div>

          <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h3 className="text-3xl font-extrabold text-green-400">100%</h3>
            <p className="text-gray-300 text-sm mt-1">Instant Online Booking</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
