import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import { useTurf } from "../context/TurfContext";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaFutbol,
  FaHome,
  FaMapMarkerAlt,
} from "react-icons/fa";

const today = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

function BookTurf() {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { loading: turfsLoading, setSelectedTurfId } = useTurf();

  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [turfChoices, setTurfChoices] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [expiredSlots, setExpiredSlots] = useState([]);
  const [closedSlots, setClosedSlots] = useState([]);
  const [slotClosure, setSlotClosure] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [loadingTurfs, setLoadingTurfs] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");

  const selectedSlotDetails = availableSlots
    .filter((slot) => selectedSlots.includes(slot.id))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const totalAmount = selectedSlotDetails.reduce(
    (total, slot) => total + Number(slot.price || 0),
    0,
  );

  const formatTimeRange = (startTime, endTime) => {
    const format = (time) =>
      new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    return `${format(startTime)} - ${format(endTime)}`;
  };

  const handleDateChange = (event) => {
    const nextDate = event.target.value;
    setDate(nextDate);
    setStep(1);
    setTurfChoices([]);
    setSelectedTurf(null);
    setSelectedTurfId("");
    setSearchParams({});
    setAvailableSlots([]);
    setBookedSlots([]);
    setExpiredSlots([]);
    setClosedSlots([]);
    setSlotClosure(null);
    setSelectedSlots([]);
    setError("");
  };

  const loadBookableTurfs = async () => {
    if (!date) {
      setError("Please select a booking date first.");
      return false;
    }

    try {
      setError("");
      setLoadingTurfs(true);
      const response = await API.get(`bookable-turfs/?date=${date}`);
      setTurfChoices(response.data || []);
      setStep(2);
      return true;
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Unable to load venues for this date. Please try again.",
      );
      return false;
    } finally {
      setLoadingTurfs(false);
    }
  };

  const selectTurf = (turf) => {
    setSelectedTurf(turf);
    setSelectedTurfId(turf.id);
    setSearchParams({ turf_id: String(turf.id) });
    setAvailableSlots([]);
    setBookedSlots([]);
    setExpiredSlots([]);
    setClosedSlots([]);
    setSlotClosure(null);
    setSelectedSlots([]);
    setError("");
  };

  const loadSlots = async () => {
    if (!date || !selectedTurf) {
      setError("Select a date and venue before continuing.");
      return false;
    }

    try {
      setError("");
      setLoadingSlots(true);
      const response = await API.get(
        `slots/?date=${date}&turf_id=${selectedTurf.id}`,
      );
      setAvailableSlots(response.data.available_slots || []);
      setBookedSlots(response.data.booked_slots || []);
      setExpiredSlots(response.data.expired_slots || []);
      setClosedSlots(response.data.closed_slots || []);
      setSlotClosure(response.data.closure || null);
      setSelectedSlots([]);
      setStep(3);
      return true;
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Unable to load slots for this venue and date.",
      );
      return false;
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slotId) => {
    if (!selectedSlots.includes(slotId)) {
      const selectedSlot = availableSlots.find((slot) => slot.id === slotId);
      const getMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };
      const overlapsSelected = selectedSlotDetails.some((slot) => {
        const selectedStart = getMinutes(slot.start_time);
        const selectedEnd = getMinutes(slot.end_time);
        const nextStart = getMinutes(selectedSlot.start_time);
        let nextEnd = getMinutes(selectedSlot.end_time);
        let currentEnd = selectedEnd;
        if (currentEnd <= selectedStart) currentEnd += 24 * 60;
        if (nextEnd <= nextStart) nextEnd += 24 * 60;
        return selectedStart < nextEnd && currentEnd > nextStart;
      });
      if (overlapsSelected) {
        setError("Choose time slots that do not overlap.");
        return;
      }
    }

    setSelectedSlots((current) =>
      current.includes(slotId)
        ? current.filter((id) => id !== slotId)
        : [...current, slotId],
    );
    setError("");
  };

  const validateCustomerDetails = () => {
    if (!customerName.trim() || !/^[A-Za-z\s]+$/.test(customerName.trim())) {
      return "Enter a full name using letters only.";
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      return "Mobile number must be exactly 10 digits.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Enter a valid email address.";
    }
    return "";
  };

  const continueFromSlots = () => {
    if (selectedSlots.length === 0) {
      setError("Select at least one available time slot.");
      return;
    }
    setError("");
    setStep(4);
  };

  const continueFromCustomerDetails = () => {
    const validationError = validateCustomerDetails();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep(5);
  };

  const startPayment = async () => {
    const validationError = validateCustomerDetails();
    if (validationError || !date || !selectedTurf || selectedSlots.length === 0) {
      setError(validationError || "Complete all booking steps before payment.");
      return;
    }

    try {
      setError("");
      const order = await API.post("create-order/", {
        turf_id: selectedTurf.id,
        date,
        slot_ids: selectedSlots,
      });

      const options = {
        key: order.data.key,
        amount: order.data.amount,
        currency: order.data.currency,
        name: selectedTurf.name,
        description: `Booking for ${selectedTurf.name} on ${date}`,
        order_id: order.data.order_id,
        prefill: {
          name: customerName,
          email,
          contact: mobile,
        },
        theme: { color: "#16a34a" },
        handler: async (paymentResponse) => {
          try {
            const booking = await API.post("book/", {
              customer_name: customerName,
              mobile,
              email,
              booking_date: date,
              total_amount: order.data.calculated_amount,
              slots: selectedSlots,
              turf: selectedTurf.id,
              payment_id: paymentResponse.razorpay_payment_id,
              order_id: paymentResponse.razorpay_order_id,
              signature: paymentResponse.razorpay_signature,
            });

            navigate("/booking-success", {
              state: {
                booking_code: booking.data.booking_code,
                customer_name: customerName,
                mobile,
                email,
                booking_date: date,
                payment_date: booking.data.created_on,
                total_amount: booking.data.total_amount,
                payment_id: paymentResponse.razorpay_payment_id,
                order_id: paymentResponse.razorpay_order_id,
                selected_slots: selectedSlotDetails.map((slot) => ({
                  time: formatTimeRange(slot.start_time, slot.end_time),
                  price: slot.price,
                })),
                turf_id: selectedTurf.id,
                turf_name: selectedTurf.name,
                turf_location: selectedTurf.location,
                turf_phone: selectedTurf.phone,
              },
            });
          } catch (requestError) {
            setError(
              requestError.response?.data?.error ||
                `Booking could not be completed after payment. Contact support with Payment ID: ${paymentResponse.razorpay_payment_id}`,
            );
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Unable to start payment. Please try again.",
      );
    }
  };

  const goBack = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  };

  const stepLabels = [
    "Date",
    "Venue",
    "Time slots",
    "Your details",
    "Summary & payment",
  ];

  const allSlots = [
    ...new Map(
      [...availableSlots, ...bookedSlots, ...expiredSlots, ...closedSlots].map(
        (slot) => [slot.id, slot],
      ),
    ).values(),
  ].sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-5 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-600 sm:text-sm"
          >
            <FaArrowLeft className="text-gray-400 transition group-hover:-translate-x-0.5 group-hover:text-green-600" />
            <FaHome className="text-gray-400 group-hover:text-green-600" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/booking-history"
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-600 sm:text-sm"
          >
            My Bookings
          </Link>
        </div>

        <header className="mb-5 rounded-2xl bg-gradient-to-r from-green-800 to-green-600 p-5 text-white shadow-lg md:p-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
            <FaFutbol /> Turf booking
          </span>
          <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">
            Book your game
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-green-50 sm:text-sm">
            Choose a date first, then pick an available venue and time.
          </p>
        </header>

        <section
          aria-label="Booking progress"
          className="mb-5 rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm md:p-4"
        >
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold sm:grid-cols-5 sm:text-sm">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;
              const isComplete = stepNumber < step;
              const isCurrent = stepNumber === step;
              return (
                <div
                  key={label}
                  className={`flex items-center gap-1.5 ${
                    isCurrent || isComplete ? "text-green-700" : "text-gray-400"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                      isCurrent || isComplete
                        ? "bg-green-600 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {isComplete ? <FaCheckCircle /> : stepNumber}
                  </span>
                  <span>{stepNumber}. {label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${(step / stepLabels.length) * 100}%` }}
            />
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 sm:text-sm"
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <FaCalendarAlt className="text-xl text-green-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-800 md:text-2xl">Step 1: Select a date</h2>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  Past dates are disabled. Venue and time options appear after you continue.
                </p>
              </div>
            </div>
            <label htmlFor="booking-date" className="mb-1.5 block text-xs font-bold text-gray-700 sm:text-sm">
              Booking date
            </label>
            <input
              id="booking-date"
              type="date"
              min={today()}
              value={date}
              onChange={handleDateChange}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 sm:max-w-md"
            />
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={loadBookableTurfs}
                disabled={!date || loadingTurfs || turfsLoading}
                className="w-full rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
              >
                {loadingTurfs || turfsLoading ? "Loading venues..." : "Next: Choose a venue"}
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 md:text-2xl">Step 2: Select a venue</h2>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Available venues for <strong>{date}</strong>. Select one to continue.
              </p>
            </div>
            {turfChoices.length === 0 ? (
              <p className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-600">
                No active venues are available for booking.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {turfChoices.map((turf) => {
                  const isBookable = turf.availability?.is_bookable;
                  const isSelected = selectedTurf?.id === turf.id;
                  return (
                    <button
                      type="button"
                      key={turf.id}
                      disabled={!isBookable}
                      onClick={() => selectTurf(turf)}
                      aria-pressed={isSelected}
                      className={`overflow-hidden rounded-xl border-2 text-left transition ${
                        isSelected
                          ? "border-green-600 ring-2 ring-green-200"
                          : isBookable
                            ? "border-gray-200 hover:border-green-400 hover:shadow-md"
                            : "cursor-not-allowed border-gray-200 opacity-70"
                      }`}
                    >
                      {turf.main_image ? (
                        <img
                          src={turf.main_image}
                          alt={turf.name}
                          className="h-36 w-full object-cover sm:h-40"
                        />
                      ) : (
                        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-green-700 to-green-500 text-4xl text-white sm:h-40">
                          <FaFutbol />
                        </div>
                      )}
                      <div className="p-3.5 sm:p-4">
                        <div className="flex items-start justify-between gap-2.5">
                          <h3 className="text-base font-bold text-gray-900 sm:text-lg">{turf.name}</h3>
                          {isSelected && <FaCheckCircle className="mt-0.5 shrink-0 text-lg text-green-600" />}
                        </div>
                        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-gray-600 sm:text-sm">
                          <FaMapMarkerAlt className="mt-0.5 shrink-0 text-green-600" />
                          <span>{turf.location || "Location not provided"}</span>
                        </p>
                        <p className="mt-2.5 text-xs font-semibold text-gray-700 sm:text-sm">
                          Day ₹{turf.day_price} <span className="px-1 text-gray-300">|</span>
                          Night ₹{turf.night_price} <span className="font-normal text-gray-500">per slot</span>
                        </p>
                        <p className={`mt-2 text-xs font-bold sm:text-sm ${isBookable ? "text-green-700" : "text-red-600"}`}>
                          {turf.availability?.closure
                            ? `Unavailable: ${turf.availability.closure.reason}`
                            : isBookable
                              ? `${turf.availability.available_slots} time slot(s) available`
                              : "Unavailable: no bookable time slots"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="mt-5 flex flex-col-reverse justify-between gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={loadSlots}
                disabled={!selectedTurf || loadingSlots}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loadingSlots ? "Loading slots..." : "Next: Choose time slots"}
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6">
            <div className="mb-4 flex flex-col justify-between gap-1.5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800 md:text-2xl">Step 3: Select time slots</h2>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  {date} at <strong>{selectedTurf?.name}</strong>. You can select multiple available slots.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 sm:text-sm">
                <FaClock className="text-green-600" /> Select one or more
              </span>
            </div>

            {slotClosure && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm">
                Venue closed for this date: {slotClosure.reason}
              </div>
            )}
            <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-gray-600">
              <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded bg-white ring-1 ring-gray-300" />Available</span>
              <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded bg-green-600" />Selected</span>
              <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded bg-red-500" />Booked</span>
              <span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded bg-gray-400" />Expired / Closed</span>
            </div>

            {allSlots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
                No time slots are configured for this venue.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {allSlots.map((slot) => {
                  const isBooked = bookedSlots.some((item) => item.id === slot.id);
                  const isExpired = expiredSlots.some((item) => item.id === slot.id);
                  const isClosed = closedSlots.some((item) => item.id === slot.id);
                  const isAvailable = availableSlots.some((item) => item.id === slot.id);
                  const isSelected = selectedSlots.includes(slot.id);
                  const disabled = !isAvailable;
                  const stateClass = isBooked
                    ? "border-red-500 bg-red-500 text-white"
                    : isExpired || isClosed
                      ? "border-gray-400 bg-gray-400 text-white"
                      : isSelected
                        ? "border-green-600 bg-green-600 text-white shadow-md"
                        : "border-gray-300 bg-white text-gray-700 hover:border-green-500";
                  const stateText = isBooked
                    ? "Booked"
                    : isExpired
                      ? "Expired"
                      : isClosed
                        ? "Closed"
                        : isSelected
                          ? "Selected"
                          : "Available";
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      disabled={disabled}
                      onClick={() => handleSlotSelect(slot.id)}
                      className={`flex min-h-[4.25rem] flex-col items-center justify-center rounded-xl border-2 px-1.5 py-2 transition ${stateClass} disabled:cursor-not-allowed`}
                    >
                      <span className="text-center text-[11px] font-bold sm:text-xs">
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </span>
                      <span className="mt-0.5 text-[11px] font-bold sm:text-xs">
                        {isAvailable ? `₹${slot.price}` : stateText}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {selectedSlots.length > 0 && (
              <p className="mt-4 text-right text-xs font-bold text-gray-800 sm:text-sm">
                {selectedSlots.length} selected · Total ₹{totalAmount}
              </p>
            )}
            <div className="mt-5 flex flex-col-reverse justify-between gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={continueFromSlots}
                disabled={selectedSlots.length === 0}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Next: Customer details
              </button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6">
            <h2 className="text-xl font-bold text-gray-800 md:text-2xl">Step 4: Customer details</h2>
            <p className="mb-4 mt-0.5 text-xs text-gray-500 sm:text-sm">
              Enter the details needed to confirm this booking.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-xs font-bold text-gray-700 sm:text-sm">
                Full name
                <input
                  type="text"
                  autoComplete="name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value.replace(/[^A-Za-z\s]/g, ""))}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 p-2.5 text-sm font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  required
                />
              </label>
              <label className="text-xs font-bold text-gray-700 sm:text-sm">
                Mobile number
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value.replace(/\D/g, ""))}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 p-2.5 text-sm font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  required
                />
              </label>
              <label className="text-xs font-bold text-gray-700 sm:text-sm">
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-300 p-2.5 text-sm font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  required
                />
              </label>
            </div>
            <div className="mt-5 flex flex-col-reverse justify-between gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={continueFromCustomerDetails}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
              >
                Next: Booking summary
              </button>
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-md md:p-6">
            <h2 className="text-xl font-bold text-gray-800 md:text-2xl">Step 5: Booking summary & payment</h2>
            <p className="mb-4 mt-0.5 text-xs text-gray-500 sm:text-sm">
              Review your booking before continuing to secure payment.
            </p>
            <div className="divide-y divide-green-100 rounded-xl bg-green-50 p-4">
              <div className="flex flex-wrap justify-between gap-2 py-2 text-xs sm:text-sm">
                <span className="text-gray-600">Booking date</span>
                <strong className="text-gray-900">{date}</strong>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-2 text-xs sm:text-sm">
                <span className="text-gray-600">Venue</span>
                <strong className="text-gray-900">{selectedTurf?.name}</strong>
              </div>
              <div className="py-2">
                <span className="text-xs text-gray-600 sm:text-sm">Selected time slots</span>
                <div className="mt-2 space-y-1.5">
                  {selectedSlotDetails.map((slot) => (
                    <div key={slot.id} className="flex justify-between gap-4 rounded-lg bg-white px-3 py-2 text-xs sm:text-sm">
                      <span className="font-medium text-gray-800">
                        {formatTimeRange(slot.start_time, slot.end_time)}
                      </span>
                      <strong className="text-green-700">₹{slot.price}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-2.5 text-base sm:text-lg">
                <strong className="text-gray-900">Total amount</strong>
                <strong className="text-xl text-green-700 sm:text-2xl">₹{totalAmount}</strong>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-600 sm:text-sm">
              Customer: <strong>{customerName}</strong> · {mobile} · {email}
            </p>
            <div className="mt-5 flex flex-col-reverse justify-between gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={startPayment}
                className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-green-700"
              >
                Pay ₹{totalAmount} & confirm
              </button>
            </div>
          </section>
        )}

        <aside className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <h3 className="text-sm font-bold">Turf guidelines</h3>
          <p className="mt-1 text-xs text-amber-800 leading-relaxed sm:text-sm">
            Arrive at least 10 minutes before your slot. Appropriate sports shoes or turf studs are required; metal studs are prohibited. Please keep the turf clean and follow the venue cancellation policy.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default BookTurf;
