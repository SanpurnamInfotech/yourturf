import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useTurf } from "../context/TurfContext";
import { FaFutbol, FaCalendarAlt, FaArrowLeft, FaHome } from "react-icons/fa";

function CalendarView() {
  const { turfs, selectedTurfId, setSelectedTurfId } = useTurf();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [turfId, setTurfId] = useState(selectedTurfId || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTurfId) {
      setTurfId(selectedTurfId);
    }
  }, [selectedTurfId]);

  const loadCalendar = async () => {
    if (!date) return;
    try {
      setLoading(true);
      const params = { date };
      if (turfId) {
        params.turf_id = turfId;
      }
      const response = await API.get("calendar/", { params });
      setData(response.data);
    } catch (err) {
      console.error("Calendar fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) {
      loadCalendar();
    }
  }, [date, turfId]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-4 py-2 bg-white text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl font-bold text-sm shadow-sm border border-gray-200 hover:border-green-300 transition-all group"
        >
          <FaArrowLeft className="text-gray-400 group-hover:text-green-600 group-hover:-translate-x-0.5 transition-transform" />
          <FaHome className="text-gray-400 group-hover:text-green-600 transition-colors" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <FaCalendarAlt size={28} className="text-green-600" />
        <h1 className="text-3xl font-extrabold text-gray-800">Calendar View</h1>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Turf Venue</label>
          <select
            value={turfId}
            onChange={(e) => {
              setTurfId(e.target.value);
              if (e.target.value) setSelectedTurfId(Number(e.target.value));
            }}
            className="border border-gray-300 rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">🌐 All Turfs</option>
            {turfs.map((t) => (
              <option key={t.id} value={t.id}>
                🏟️ {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-5">
          <button
            onClick={loadCalendar}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-sm"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {data && (
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200">
            <h2 className="text-red-600 text-xl font-bold mb-4 flex items-center justify-between">
              <span>Booked Slots</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                {data.booked_slots?.length || 0} slots
              </span>
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.booked_slots?.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No bookings on this date</p>
              ) : (
                data.booked_slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 bg-red-50 text-red-800 rounded-xl font-medium text-sm flex justify-between"
                  >
                    <span>{slot.start_time} - {slot.end_time}</span>
                    <span className="text-xs bg-red-200 px-2 py-0.5 rounded font-bold">Booked</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-200">
            <h2 className="text-green-600 text-xl font-bold mb-4 flex items-center justify-between">
              <span>Available Slots</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                {data.available_slots?.length || 0} slots
              </span>
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.available_slots?.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No available slots</p>
              ) : (
                data.available_slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 bg-green-50 text-green-800 rounded-xl font-medium text-sm flex justify-between"
                  >
                    <span>{slot.start_time} - {slot.end_time}</span>
                    <span className="text-xs bg-green-200 px-2 py-0.5 rounded font-bold">Available</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;