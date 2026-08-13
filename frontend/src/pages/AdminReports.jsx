import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

import {
  FaChartLine,
  FaSearch,
  FaPrint,
  FaFilePdf,
} from "react-icons/fa";

function AdminReports() {

  const today = new Date().toISOString().split("T")[0];

  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({
    today_revenue: 0,
    weekly_revenue: 0,
    monthly_revenue: 0,
  });

  const [report, setReport] = useState(null);

  const [turf, setTurf] = useState(null);

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  useEffect(() => {
    loadSummary();
    loadTurf();
  }, []);

  const loadTurf = async () => {

  try {

    const response =
      await API.get("turf/");

    setTurf(response.data);

  } catch (error) {

    console.log(error);

  }

};

  const loadSummary = async () => {
    try {

      const response = await API.get(
        "revenue-summary/"
      );

      setSummary(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  const generateReport = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        "revenue-report/",
        {
          params: {
            from_date: fromDate,
            to_date: toDate,
          },
        }
      );

      setReport(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  return (

    <AdminLayout>

      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <div className="mb-8">

          <div className="flex items-center gap-4">

            <FaChartLine
              size={34}
              className="text-green-600"
            />

            <div>

              <h1 className="text-4xl font-bold">

                Reports

              </h1>

              <p className="text-gray-500 mt-1">

                Daily, Weekly & Monthly Revenue Reports

              </p>

            </div>

          </div>

        </div>

        {/* Revenue Summary */}

        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white rounded-2xl shadow-md border p-6">

            <p className="text-gray-500">

              Today's Revenue

            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-3">

              ₹{summary.today_revenue}

            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-md border p-6">

            <p className="text-gray-500">

              Weekly Revenue

            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-3">

              ₹{summary.weekly_revenue}

            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-md border p-6">

            <p className="text-gray-500">

              Monthly Revenue

            </p>

            <h2 className="text-4xl font-bold text-purple-600 mt-3">

              ₹{summary.monthly_revenue}

            </h2>

          </div>

        </div>

                {/* Report Filter */}

        <div
          className="
          bg-white
          rounded-2xl
          shadow-md
          border
          p-8
          mb-10
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            mb-6
            "
          >

            Report Filter

          </h2>

          <div
            className="
            grid
            md:grid-cols-2
            gap-6
            "
          >

            {/* From Date */}

            <div>

              <label
                className="
                block
                font-semibold
                mb-2
                "
              >

                From Date

              </label>

              <input

                type="date"

                value={fromDate}

                onChange={(e) =>
                  setFromDate(
                    e.target.value
                  )
                }

                className="
                w-full
                border
                border-gray-300
                rounded-xl
                p-3
                focus:outline-none
                focus:ring-2
                focus:ring-green-500
                "

              />

            </div>

            {/* To Date */}

            <div>

              <label
                className="
                block
                font-semibold
                mb-2
                "
              >

                To Date

              </label>

              <input

                type="date"

                value={toDate}

                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }

                className="
                w-full
                border
                border-gray-300
                rounded-xl
                p-3
                focus:outline-none
                focus:ring-2
                focus:ring-green-500
                "

              />

            </div>

          </div>

          <div
            className="
            flex
            justify-center
            mt-8
            "
          >

            <button

              onClick={generateReport}

              disabled={loading}

              className="
              bg-green-600
              hover:bg-green-700
              disabled:bg-gray-400
              text-white
              px-10
              py-3
              rounded-xl
              flex
              items-center
              gap-3
              text-lg
              font-semibold
              transition
              "

            >

              <FaSearch />

              {

                loading

                  ? "Generating Report..."

                  : "Generate Report"

              }

            </button>

          </div>

        </div>

                {/* Generated Report */}

        {report && (

          <div
            className="
            bg-white
            rounded-2xl
            shadow-md
            border
            overflow-hidden
            mb-10
            "
          >

            {/* Report Header */}

            <div
              className="
              bg-green-600
              text-white
              px-8
              py-5
              "
            >

              <h2 className="text-3xl font-bold">

                Generated Report

              </h2>

              <p className="mt-2 text-green-100">

                {turf?.name || "Turf"} Turf Booking Management Report

              </p>

            </div>

            {/* Report Details */}

            <div
              className="
              grid
              md:grid-cols-3
              gap-6
              p-8
              bg-gray-50
              border-b
              "
            >

              <div>

                <p className="text-sm text-gray-500">

                  Report Period

                </p>

                <h3 className="font-bold text-lg mt-2">

                  {new Date(
                    report.period.from
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}

                  {"  →  "}

                  {new Date(
                    report.period.to
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}

                </h3>

              </div>

              <div>

                <p className="text-sm text-gray-500">

                  Generated On

                </p>

                <h3 className="font-bold text-lg mt-2">

                  {new Date(
                    report.generated_on
                  ).toLocaleString()}

                </h3>

              </div>

              <div>

                <p className="text-sm text-gray-500">

                  Total Revenue

                </p>

                <h3
                  className="
                  text-3xl
                  font-bold
                  text-green-600
                  mt-2
                  "
                >

                  ₹ {report.totals.revenue}

                </h3>

              </div>

            </div>

            {/* Report Table */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead
                  className="
                  bg-gray-800
                  text-white
                  "
                >

                  <tr>

                    <th className="p-4">
                      Date
                    </th>

                    <th className="p-4">
                      Bookings
                    </th>

                    <th className="p-4">
                      Revenue
                    </th>

                    <th className="p-4">
                      Completed
                    </th>

                    <th className="p-4">
                      Confirmed
                    </th>

                    <th className="p-4">
                      Cancelled
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {report.rows.map(
                    (item, index) => (

                      <tr
                        key={index}
                        className="
                        border-b
                        hover:bg-green-50
                        "
                      >

                        <td className="p-4">

                          {new Date(
                            item.date
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}

                        </td>

                        <td className="text-center">

                          {item.bookings}

                        </td>

                        <td
                          className="
                          text-center
                          font-bold
                          text-green-600
                          "
                        >

                          ₹ {item.revenue}

                        </td>

                        <td className="text-center">

                          {item.completed}

                        </td>

                        <td className="text-center">

                          {item.confirmed}

                        </td>

                        <td
                          className="
                          text-center
                          text-red-600
                          font-semibold
                          "
                        >

                          {item.cancelled}

                        </td>

                      </tr>

                    )

                  )}

                </tbody>

                <tfoot
                  className="
                  bg-green-100
                  font-bold
                  "
                >

                  <tr>

                    <td className="p-4">

                      TOTAL

                    </td>

                    <td className="text-center">

                      {report.totals.bookings}

                    </td>

                    <td
                      className="
                      text-center
                      text-green-700
                      "
                    >

                      ₹ {report.totals.revenue}

                    </td>

                    <td className="text-center">

                      {report.totals.completed}

                    </td>

                    <td className="text-center">

                      {report.totals.confirmed}

                    </td>

                    <td
                      className="
                      text-center
                      text-red-600
                      "
                    >

                      {report.totals.cancelled}

                    </td>

                  </tr>

                </tfoot>

              </table>

            </div>

          </div>

        )}

                {/* Report Actions */}

        {report && (

          <div
            className="
            bg-white
            rounded-2xl
            shadow-md
            border
            p-8
            mb-10
            "
          >

            <h2
              className="
              text-2xl
              font-bold
              mb-6
              "
            >

              Report Actions

            </h2>

            <div
              className="
              flex
              flex-col
              md:flex-row
              gap-5
              "
            >

              {/* Print */}

              <button

                onClick={() => {

                  const printWindow =
                    window.open(
                      "",
                      "_blank"
                    );

                  printWindow.document.write(`

                    <html>

                    <head>

                    <title>
                    {turf?.name || "Turf"} Turf Report
                    </title>

                    <style>

                    body{

                      font-family:Arial;

                      padding:30px;

                    }

                    h1,h2{

                      text-align:center;

                    }

                    table{

                      width:100%;

                      border-collapse:collapse;

                      margin-top:20px;

                    }

                    table,
                    th,
                    td{

                      border:1px solid #000;

                    }

                    th,td{

                      padding:10px;

                      text-align:center;

                    }

                    th{

                      background:#16a34a;

                      color:white;

                    }

                    </style>

                    </head>

                    <body>

                    <h1>
                    {turf?.name || "Turf"} Turf
                    </h1>

                    <h2>
                    Revenue Report
                    </h2>

                    <p>

                    <b>Period :</b>

                    ${report.period.from}

                    -

                    ${report.period.to}

                    </p>

                    <p>

                    <b>Generated On :</b>

                    ${new Date(
                      report.generated_on
                    ).toLocaleString()}

                    </p>

                    <table>

                    <thead>

                    <tr>

                    <th>Date</th>

                    <th>Bookings</th>

                    <th>Revenue</th>

                    <th>Completed</th>

                    <th>Confirmed</th>

                    <th>Cancelled</th>

                    </tr>

                    </thead>

                    <tbody>

                    ${report.rows.map(row=>`

                    <tr>

                    <td>${row.date}</td>

                    <td>${row.bookings}</td>

                    <td>₹${row.revenue}</td>

                    <td>${row.completed}</td>

                    <td>${row.confirmed}</td>

                    <td>${row.cancelled}</td>

                    </tr>

                    `).join("")}

                    </tbody>

                    <tfoot>

                    <tr>

                    <th>Total</th>

                    <th>${report.totals.bookings}</th>

                    <th>₹${report.totals.revenue}</th>

                    <th>${report.totals.completed}</th>

                    <th>${report.totals.confirmed}</th>

                    <th>${report.totals.cancelled}</th>

                    </tr>

                    </tfoot>

                    </table>

                    </body>

                    </html>

                  `);

                  printWindow.document.close();

                  printWindow.print();

                }}

                className="
                flex-1
                bg-blue-600
                hover:bg-blue-700
                text-white
                py-4
                rounded-xl
                flex
                justify-center
                items-center
                gap-3
                "

              >

                <FaPrint />

                Print Report

              </button>

              {/* PDF */}

              <button

                onClick={()=>

                  window.open(

`http://127.0.0.1:8000/api/export-report/?from_date=${fromDate}&to_date=${toDate}`,

"_blank"

)

                }

                className="
                flex-1
                bg-red-600
                hover:bg-red-700
                text-white
                py-4
                rounded-xl
                flex
                justify-center
                items-center
                gap-3
                "

              >

                <FaFilePdf />

                Download PDF

              </button>

            </div>

          </div>

        )}

      </div>

    </AdminLayout>

  );

}

export default AdminReports;