import { useState } from "react";
import API from "../services/api";

function CalendarView() {

  const [date, setDate] = useState("");
  const [data, setData] = useState(null);

  const loadCalendar = async () => {

    const response = await API.get(
      `calendar/?date=${date}`
    );

    setData(response.data);
  };

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Calendar View
      </h1>

      <input
        type="date"
        value={date}
        onChange={(e) =>
          setDate(e.target.value)
        }
        className="border p-2"
      />

      <button
        onClick={loadCalendar}
        className="
          ml-2
          bg-blue-500
          text-white
          px-4
          py-2
        "
      >
        Load
      </button>

      {data && (

        <div className="grid grid-cols-2 gap-8 mt-8">

          <div>

            <h2 className="text-red-600 text-xl font-bold">
              Booked Slots
            </h2>

            {data.booked_slots.map(slot => (
              <div key={slot.id}>
                {slot.start_time} - {slot.end_time}
              </div>
            ))}

          </div>

          <div>

            <h2 className="text-green-600 text-xl font-bold">
              Available Slots
            </h2>

            {data.available_slots.map(slot => (
              <div key={slot.id}>
                {slot.start_time} - {slot.end_time}
              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}

export default CalendarView;