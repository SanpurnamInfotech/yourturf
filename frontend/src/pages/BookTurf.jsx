import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

import {
  FaCalendarAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaFutbol,
  FaParking,
  FaTint,
} from "react-icons/fa";


function BookTurf() {

  const navigate = useNavigate();


  const [date, setDate] = useState("");

  const [availableSlots, setAvailableSlots] =
    useState([]);

  const [bookedSlots, setBookedSlots] =
    useState([]);

  const [expiredSlots, setExpiredSlots] =
    useState([]);

  const [selectedSlots, setSelectedSlots] =
    useState([]);


  const [customerName, setCustomerName] =
    useState("");

  const [mobile, setMobile] =
    useState("");

  const [email, setEmail] =
    useState("");


  const [turf, setTurf] =
    useState(null);

  const [settings, setSettings] =
    useState(null);

  const [isHoliday, setIsHoliday] =
    useState(false);


  /* =========================
     LOAD SLOTS
  ========================= */

  const loadSlots = async () => {

    if (!date) {

      alert("Please select a date");

      return;

    }

    try {

      const response =
        await API.get(
          `slots/?date=${date}`
        );


      setAvailableSlots(
        response.data.available_slots
      );


      setBookedSlots(
        response.data.booked_slots
      );


      setExpiredSlots(
        response.data.expired_slots || []
      );


      setSelectedSlots([]);

    }

    catch (error) {

      console.log(error);

      alert("Unable to load slots");

    }

  };


  /* =========================
     FORMAT TIME
  ========================= */

  const formatTimeRange = (
    startTime,
    endTime
  ) => {

    const start =
      new Date(
        `2000-01-01T${startTime}`
      ).toLocaleTimeString(
        [],
        {
          hour: "numeric",
          hour12: true,
        }
      );


    const end =
      new Date(
        `2000-01-01T${endTime}`
      ).toLocaleTimeString(
        [],
        {
          hour: "numeric",
          hour12: true,
        }
      );


    return `${start} - ${end}`;

  };


  /* =========================
     SELECT SLOT
  ========================= */

  const handleSlotSelect = (
    slotId
  ) => {

    if (
      selectedSlots.includes(slotId)
    ) {

      setSelectedSlots(
        selectedSlots.filter(
          (id) =>
            id !== slotId
        )
      );

    }

    else {

      setSelectedSlots([
        ...selectedSlots,
        slotId,
      ]);

    }

  };


  /* =========================
     SLOT PRICE
  ========================= */

  const getSlotPrice = (
    slot
  ) => {

    if (!settings) {

      return 0;

    }


    const hour =
      parseInt(
        slot.start_time.split(":")[0]
      );


    if (
      hour >= 6 &&
      hour < 18
    ) {

      return Number(
        settings.day_price
      );

    }


    return Number(
      settings.night_price
    );

  };


  /* =========================
     TOTAL AMOUNT
  ========================= */

  const totalAmount =
    selectedSlots.reduce(
      (
        total,
        slotId
      ) => {

        const slot =
          availableSlots.find(
            (s) =>
              s.id === slotId
          );


        if (!slot)
          return total;


        return (
          total +
          getSlotPrice(slot)
        );

      },
      0
    );


  /* =========================
     SELECTED SLOT DETAILS
  ========================= */

  const selectedSlotDetails =
    availableSlots
      .filter(
        (slot) =>
          selectedSlots.includes(
            slot.id
          )
      )
      .sort(
        (a, b) =>
          a.id - b.id
      );


  /* =========================
     CUSTOMER VALIDATION
  ========================= */

  const validateCustomerDetails =
    () => {

      if (
        !customerName.trim()
      ) {

        alert(
          "Please enter Full Name"
        );

        return false;

      }


      if (
        !/^[A-Za-z\s]+$/.test(
          customerName
        )
      ) {

        alert(
          "Name should contain only letters"
        );

        return false;

      }


      if (
        !/^[0-9]{10}$/.test(
          mobile
        )
      ) {

        alert(
          "Mobile number must be exactly 10 digits"
        );

        return false;

      }


      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {

        alert(
          "Please enter a valid email address"
        );

        return false;

      }


      if (!date) {

        alert(
          "Please select booking date"
        );

        return false;

      }


      if (
        selectedSlots.length === 0
      ) {

        alert(
          "Please select at least one slot"
        );

        return false;

      }


      return true;

    };


  /* =========================
     START PAYMENT
  ========================= */

  const startPayment =
    async () => {

      /*
       * FIRST VALIDATE CUSTOMER
       * DETAILS
       */

      if (
        !validateCustomerDetails()
      ) {

        return;

      }


      try {

        /*
         * CREATE RAZORPAY ORDER
         */

        const order =
          await API.post(
            "create-order/",
            {
              amount:
                totalAmount,
            }
          );


        /*
         * RAZORPAY OPTIONS
         */

        const options = {

          key:
            order.data.key,

          amount:
            order.data.amount,

          currency:
            order.data.currency,

          name:
            turf?.name ||
            "Dream Turf",

          description:
            "Turf Booking",

          order_id:
            order.data.order_id,


          prefill: {

            name:
              customerName,

            email:
              email,

            contact:
              mobile,

          },


          theme: {

            color:
              "#16a34a",

          },


          /*
           * PAYMENT SUCCESS
           */

          handler:
            async function (
              response
            ) {

              try {

                const booking =
                  await API.post(
                    "book/",
                    {

                      customer_name:
                        customerName,

                      mobile:
                        mobile,

                      email:
                        email,

                      booking_date:
                        date,

                      total_amount:
                        totalAmount,

                      slots:
                        selectedSlots,

                      payment_id:
                        response
                          .razorpay_payment_id,

                      order_id:
                        response
                          .razorpay_order_id,

                      signature:
                        response
                          .razorpay_signature,

                    }
                  );


                /*
                 * GO TO SUCCESS PAGE
                 */

                navigate(
                  "/booking-success",
                  {
                    state: {

                      booking_code:
                        booking.data
                          .booking_code,

                      customer_name:
                        customerName,

                      mobile:
                        mobile,

                      email:
                        email,

                      booking_date:
                        date,

                      payment_date:
                        booking.data
                          .created_on,

                      total_amount:
                        totalAmount,

                      payment_id:
                        response
                          .razorpay_payment_id,

                      order_id:
                        response
                          .razorpay_order_id,

                      selected_slots:
                        selectedSlotDetails.map(
                          (slot) => ({

                            time:
                              formatTimeRange(
                                slot.start_time,
                                slot.end_time
                              ),

                            price:
                              getSlotPrice(
                                slot
                              ),

                          })
                        ),

                    },
                  }
                );

              }


              catch (
                error
              ) {

                console.log(
                  error
                );


                alert(

                  error.response
                    ?.data
                    ?.error ||

                  "Booking failed after payment."

                );

              }

            },

        };


        /*
         * OPEN RAZORPAY
         */

        const razorpay =
          new window.Razorpay(
            options
          );


        razorpay.open();

      }


      catch (
        error
      ) {

        console.log(
          error
        );


        alert(
          "Unable to start payment."
        );

      }

    };


  /* =========================
     OLD BOOKING FUNCTION
  ========================= */

  const handleBooking =
    async () => {

      if (
        !validateCustomerDetails()
      ) {

        return;

      }


      try {

        const response =
          await API.post(
            "book/",
            {

              customer_name:
                customerName,

              mobile:
                mobile,

              email:
                email,

              booking_date:
                date,

              total_amount:
                totalAmount,

              slots:
                selectedSlots,

            }
          );


        navigate(
          "/booking-success",
          {
            state: {

              booking_code:
                response.data
                  .booking_code,

              customer_name:
                customerName,

              booking_date:
                date,

              total_amount:
                totalAmount,

              selected_slots:
                selectedSlotDetails.map(
                  (slot) => ({

                    time:
                      formatTimeRange(
                        slot.start_time,
                        slot.end_time
                      ),

                    price:
                      getSlotPrice(
                        slot
                      ),

                  })
                ),

            },
          }
        );

      }


      catch (
        error
      ) {

        console.log(
          error
        );


        alert(

          error.response
            ?.data
            ?.error ||

          "Booking Failed"

        );

      }

    };


  /* =========================
     LOAD TURF
  ========================= */

  const loadTurf =
    async () => {

      try {

        const response =
          await API.get(
            "turf/"
          );


        setTurf(
          response.data
        );

      }


      catch (
        error
      ) {

        console.log(
          error
        );

      }

    };


  /* =========================
     LOAD SETTINGS
  ========================= */

  const loadSettings =
    async () => {

      try {

        const response =
          await API.get(
            "settings/"
          );


        setSettings(
          response.data
        );

      }


      catch (
        error
      ) {

        console.log(
          error
        );

      }

    };


  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(
    () => {

      loadTurf();

      loadSettings();

    },
    []
  );


  /* =========================
     HOLIDAY CHECK
  ========================= */

  useEffect(
    () => {

      if (
        !settings ||
        !date
      ) {

        setIsHoliday(
          false
        );

        return;

      }


      if (

        settings.holiday_from &&
        settings.holiday_to &&

        date >=
          settings.holiday_from &&

        date <=
          settings.holiday_to

      ) {

        setIsHoliday(
          true
        );

      }


      else {

        setIsHoliday(
          false
        );

      }

    },
    [
      date,
      settings
    ]
  );


  return (

    <div
      className="
      min-h-screen
      bg-gray-100
      py-10
      px-4
      "
    >

      <div
        className="
        max-w-6xl
        mx-auto
        "
      >


        {/* =========================
            HERO
        ========================= */}

        <div
          className="
          bg-gradient-to-r
          from-green-700
          to-green-500
          text-white
          rounded-3xl
          p-6
          md:p-10
          mb-10
          shadow-xl
          "
        >

          <div
            className="
            flex
            flex-col
            lg:flex-row
            justify-between
            gap-8
            "
          >

            <div>

              <h1
                className="
                text-4xl
                md:text-6xl
                font-bold
                "
              >

                {turf?.name ||
                  "Dream Turf"}

              </h1>


              <p
                className="mt-4 text-lg"
              >

                Play. Compete. Win.

              </p>


              <div
                className="
                mt-6
                space-y-3
                "
              >

                <div
                  className="
                  flex
                  items-center
                  gap-2
                  "
                >

                  <FaMapMarkerAlt />

                  {turf?.location}

                </div>


                <div
                  className="
                  flex
                  items-center
                  gap-2
                  "
                >

                  <FaPhone />

                  {turf?.phone}

                </div>

              </div>

            </div>


            {/* PRICING */}

            <div
              className="
              bg-white/20
              rounded-2xl
              p-6
              min-w-[280px]
              "
            >

              <h3
                className="
                text-xl
                font-semibold
                mb-4
                "
              >

                Pricing

              </h3>


              <div
                className="
                space-y-4
                "
              >

                <div>

                  <p className="text-sm">
                    ☀️ Day Slot
                  </p>


                  <p
                    className="
                    text-3xl
                    font-bold
                    "
                  >

                    ₹
                    {settings?.day_price ||
                      800}

                  </p>


                  <p
                    className="
                    text-xs
                    opacity-80
                    "
                  >

                    6 AM - 6 PM

                  </p>

                </div>


                <hr
                  className="
                  border-white/30
                  "
                />


                <div>

                  <p className="text-sm">
                    🌙 Night Slot
                  </p>


                  <p
                    className="
                    text-3xl
                    font-bold
                    "
                  >

                    ₹
                    {settings?.night_price ||
                      1000}

                  </p>


                  <p
                    className="
                    text-xs
                    opacity-80
                    "
                  >

                    6 PM - 6 AM

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =========================
            FACILITIES
        ========================= */}

        <div
          className="
          bg-white
          rounded-3xl
          shadow-lg
          p-6
          mb-8
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            mb-5
            "
          >

            Facilities

          </h2>


          <div
            className="
            grid
            grid-cols-2
            md:grid-cols-4
            gap-5
            "
          >

            <div className="text-center">

              <FaFutbol
                size={35}
                className="
                mx-auto
                text-green-600
                "
              />

              <p className="mt-2">
                Football Turf
              </p>

            </div>


            <div className="text-center">

              <FaParking
                size={35}
                className="
                mx-auto
                text-blue-600
                "
              />

              <p className="mt-2">
                Parking
              </p>

            </div>


            <div className="text-center">

              <FaTint
                size={35}
                className="
                mx-auto
                text-cyan-600
                "
              />

              <p className="mt-2">
                Drinking Water
              </p>

            </div>


            <div className="text-center">

              <FaCalendarAlt
                size={35}
                className="
                mx-auto
                text-orange-500
                "
              />

              <p className="mt-2">
                Advance Booking
              </p>

            </div>

          </div>

        </div>


        {/* =========================
            PROGRESS
        ========================= */}

        <div
          className="
          bg-white
          p-6
          rounded-2xl
          shadow-lg
          mb-8
          "
        >

          <div
            className="
            flex
            justify-between
            text-sm
            md:text-base
            font-semibold
            "
          >

            <span
              className="
              text-green-600
              "
            >
              1. Date
            </span>


            <span
              className="
              text-green-600
              "
            >
              2. Slots
            </span>


            <span
              className="
              text-green-600
              "
            >
              3. Details
            </span>


            <span
              className="
              text-green-600
              "
            >
              4. Confirm
            </span>

          </div>


          <div
            className="
            h-2
            bg-gray-200
            rounded-full
            mt-4
            "
          >

            <div
              className="
              h-2
              bg-green-500
              rounded-full
              w-full
              "
            />

          </div>

        </div>


        {/* =========================
            DATE
        ========================= */}

        <div
          className="
          bg-white
          rounded-2xl
          shadow-lg
          p-6
          mb-8
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            mb-4
            "
          >

            Step 1: Select Date

          </h2>


          <div
            className="
            flex
            flex-col
            md:flex-row
            gap-4
            "
          >

            <input
              type="date"

              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }

              value={date}

              onChange={
                (e) =>
                  setDate(
                    e.target.value
                  )
              }

              className="
              border
              border-gray-300
              rounded-xl
              p-4
              flex-1
              "
            />


            <button
              onClick={loadSlots}
              disabled={isHoliday}
              className="
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-gray-400
              disabled:cursor-not-allowed
              text-white
              px-8
              py-4
              rounded-xl
              "
            >

              Check Slots

            </button>

          </div>

        </div>


        {/* =========================
            HOLIDAY
        ========================= */}

        {isHoliday && (

          <div
            className="
            bg-red-100
            border
            border-red-400
            rounded-2xl
            p-6
            mb-8
            text-red-700
            "
          >

            <h2
              className="
              text-2xl
              font-bold
              "
            >

              ⚠ Turf Closed

            </h2>


            <p className="mt-3">

              <strong>
                Reason:
              </strong>

              {" "}

              {settings?.holiday_reason}

            </p>


            <p className="mt-2">

              <strong>
                Holiday:
              </strong>

              {" "}

              {settings?.holiday_from}

              {" - "}

              {settings?.holiday_to}

            </p>


            <p className="mt-3">

              Please select another date.

            </p>

          </div>

        )}


        {/* =========================
            SLOT SELECTION
        ========================= */}

        <div
          className="
          bg-white
          rounded-2xl
          shadow-lg
          p-6
          mb-8
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            mb-6
            "
          >

            Step 2: Select Slots

          </h2>


          {/* Legend */}

          <div
            className="
            flex
            flex-wrap
            gap-6
            mb-6
            "
          >

            <div
              className="
              flex
              items-center
              gap-2
              "
            >

              <div
                className="
                w-5
                h-5
                border-2
                border-gray-400
                rounded
                "
              />

              <span>
                Available
              </span>

            </div>


            <div
              className="
              flex
              items-center
              gap-2
              "
            >

              <div
                className="
                w-5
                h-5
                bg-green-500
                rounded
                "
              />

              <span>
                Selected
              </span>

            </div>


            <div
              className="
              flex
              items-center
              gap-2
              "
            >

              <div
                className="
                w-5
                h-5
                bg-red-500
                rounded
                "
              />

              <span>
                Booked
              </span>

            </div>


            <div
              className="
              flex
              items-center
              gap-2
              "
            >

              <div
                className="
                w-5
                h-5
                bg-gray-400
                rounded
                "
              />

              <span>
                Time Passed
              </span>

            </div>

          </div>


          <div
            className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-6
            gap-3
            "
          >

            {[
              ...availableSlots,
              ...bookedSlots,
            ]

              .sort(
                (a, b) =>
                  a.id - b.id
              )

              .map(
                (slot) => {

                  const isBooked =
                    bookedSlots.some(
                      (s) =>
                        s.id === slot.id
                    );


                  const isExpired =
                    expiredSlots.some(
                      (s) =>
                        s.id === slot.id
                    );


                  const isSelected =
                    selectedSlots.includes(
                      slot.id
                    );


                  return (

                    <button
                      key={slot.id}

                      disabled={
                        isBooked ||
                        isExpired ||
                        isHoliday
                      }

                      onClick={() =>
                        !isBooked &&
                        !isExpired &&
                        handleSlotSelect(
                          slot.id
                        )
                      }

                      className={`
                        h-20
                        rounded-xl
                        border-2
                        transition-all
                        duration-200
                        font-medium
                        px-2

                        ${
                          isBooked

                            ? "bg-red-500 text-white border-red-500 cursor-not-allowed"

                            : isExpired

                            ? "bg-gray-400 text-white border-gray-400 cursor-not-allowed"

                            : isSelected

                            ? "bg-green-500 text-white border-green-500"

                            : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:shadow-md"
                        }
                      `}
                    >

                      <div
                        className="
                        text-center
                        "
                      >

                        <div
                          className="
                          text-xs
                          md:text-sm
                          font-semibold
                          "
                        >

                          {formatTimeRange(
                            slot.start_time,
                            slot.end_time
                          )}

                        </div>


                        <div
                          className="
                          text-xs
                          mt-1
                          "
                        >

                          ₹
                          {getSlotPrice(
                            slot
                          )}

                        </div>

                      </div>

                    </button>

                  );

                }
              )}

          </div>

        </div>


        {/* =========================
            BOOKING SUMMARY
        ========================= */}

        <div
          className="
          bg-gradient-to-r
          from-green-600
          to-green-800
          text-white
          rounded-3xl
          p-6
          shadow-xl
          mb-8
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            mb-5
            "
          >

            Booking Summary

          </h2>


          <div
            className="
            space-y-3
            "
          >

            <div
              className="
              flex
              justify-between
              "
            >

              <span>
                Date
              </span>

              <span>
                {date ||
                  "Not Selected"}
              </span>

            </div>


            <hr
              className="
              border-white/30
              "
            />


            <div>

              <h3
                className="
                font-semibold
                mb-3
                "
              >

                Selected Slots

              </h3>


              {selectedSlotDetails.length >
              0 ? (

                <div
                  className="
                  space-y-2
                  "
                >

                  {selectedSlotDetails.map(
                    (slot) => (

                      <div
                        key={slot.id}
                        className="
                        bg-white/20
                        rounded-lg
                        px-4
                        py-3
                        flex
                        justify-between
                        "
                      >

                        <span>

                          {formatTimeRange(
                            slot.start_time,
                            slot.end_time
                          )}

                        </span>


                        <span>

                          ₹
                          {getSlotPrice(
                            slot
                          )}

                        </span>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <p>
                  No Slot Selected
                </p>

              )}

            </div>


            <hr
              className="
              border-white/30
              "
            />


            <div
              className="
              flex
              justify-between
              items-center
              "
            >

              <h3
                className="
                text-xl
                font-bold
                "
              >

                Total Amount

              </h3>


              <h2
                className="
                text-3xl
                font-bold
                "
              >

                ₹
                {totalAmount}

              </h2>

            </div>

          </div>

        </div>


        {/* =========================
            CUSTOMER DETAILS
        ========================= */}

        <div
          className="
          bg-white
          rounded-2xl
          shadow-lg
          p-6
          mb-8
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            mb-6
            "
          >

            Step 3: Customer Details

          </h2>


          <div
            className="
            grid
            gap-4
            "
          >

            <input
              type="text"
              placeholder="Full Name"
              value={customerName}

              onChange={
                (e) =>
                  setCustomerName(
                    e.target.value.replace(
                      /[^A-Za-z\s]/g,
                      ""
                    )
                  )
              }

              className="
              w-full
              border
              border-gray-300
              rounded-xl
              p-4
              "
            />


            <input
              type="tel"
              placeholder="Mobile Number"
              value={mobile}
              maxLength={10}

              onChange={
                (e) =>
                  setMobile(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
              }

              className="
              w-full
              border
              border-gray-300
              rounded-xl
              p-4
              "
            />


            <input
              type="email"
              placeholder="Email Address"
              value={email}

              onChange={
                (e) =>
                  setEmail(
                    e.target.value
                  )
              }

              className="
              w-full
              border
              border-gray-300
              rounded-xl
              p-4
              "
            />

          </div>

        </div>


        {/* =========================
            CONFIRM BOOKING
        ========================= */}

        <button
          onClick={startPayment}

          className="
          w-full
          bg-green-600
          hover:bg-green-700
          text-white
          py-5
          rounded-3xl
          text-xl
          font-bold
          shadow-xl
          transition
          "
        >

          ⚽ Confirm Booking

        </button>


        {/* =========================
            RULES
        ========================= */}

        <div
          className="
          mt-8
          bg-yellow-50
          border
          border-yellow-300
          rounded-2xl
          p-6
          "
        >

          <h3
            className="
            text-xl
            font-bold
            "
          >

            Turf Rules

          </h3>


          <ul
            className="
            mt-4
            space-y-3
            "
          >

            <li>
              ⚽ Arrive 10 minutes before
              your slot.
            </li>


            <li>
              ⚽ No smoking inside turf.
            </li>


            <li>
              ⚽ Keep the premises clean.
            </li>


            <li>
              ⚽ Booking amount is
              non-refundable.
            </li>

          </ul>

        </div>


      </div>

    </div>

  );

}


export default BookTurf;