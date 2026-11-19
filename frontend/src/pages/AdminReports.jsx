import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";
import { useTurf } from "../context/TurfContext";

import {
  FaChartLine,
  FaSearch,
  FaPrint,
  FaFilePdf,
  FaFutbol,
  FaLayerGroup,
} from "react-icons/fa";

function AdminReports() {
  const today = new Date().toISOString().split("T")[0];
  const { turfs, selectedTurfId, setSelectedTurfId } = useTurf();

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    today_revenue: 0,
    weekly_revenue: 0,
    monthly_revenue: 0,
  });

  const [report, setReport] = useState(null);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  // Local turf scope (null = All Turfs Combined, or specific turf id)
  const [reportTurfId, setReportTurfId] = useState(selectedTurfId || "");

  // Sync with global selectedTurfId when it changes
  useEffect(() => {
    if (selectedTurfId) {
      setReportTurfId(selectedTurfId);
    }
  }, [selectedTurfId]);

  useEffect(() => {
    loadSummary(reportTurfId);
  }, [reportTurfId]);

  const loadSummary = async (targetTurfId) => {
    try {
      const params = {};
      if (targetTurfId) {
        params.turf_id = targetTurfId;
      }
      const response = await API.get("revenue-summary/", { params });
      setSummary(response.data);
    } catch (error) {
      console.error("Error loading revenue summary:", error);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const params = {
        from_date: fromDate,
        to_date: toDate,
      };
      if (reportTurfId) {
        params.turf_id = reportTurfId;
      }

      const response = await API.get("revenue-report/", { params });
      setReport(response.data);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeTurfObj = turfs.find((t) => t.id === Number(reportTurfId));
  const reportScopeName = activeTurfObj ? activeTurfObj.name : "All Turfs (Combined)";

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center">
              <FaChartLine size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                Revenue Reports
              </h1>
              <p className="text-gray-500 mt-1">
                Turf-specific & combined daily, weekly & monthly financial metrics
              </p>
            </div>
          </div>

          {/* Turf Scope Filter */}
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <FaFutbol className="text-green-600" />
              Venue Scope:
            </span>
            <select
              value={reportTurfId}
              onChange={(e) => {
                const val = e.target.value;
                setReportTurfId(val);
                if (val) {
                  setSelectedTurfId(Number(val));
                }
              }}
              className="bg-transparent font-bold text-sm text-gray-800 outline-none cursor-pointer"
            >
              <option value="">🌐 All Turfs (Combined)</option>
              {turfs.map((t) => (
                <option key={t.id} value={t.id}>
                  🏟️ {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Revenue Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-500">
              <span>Today's Revenue</span>
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">
                {reportScopeName}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-green-600 mt-3">
              ₹{Number(summary.today_revenue || 0).toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-500">
              <span>Weekly Revenue</span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                Last 7 Days
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-blue-600 mt-3">
              ₹{Number(summary.weekly_revenue || 0).toLocaleString("en-IN")}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-500">
              <span>Monthly Revenue</span>
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">
                Current Month
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-purple-600 mt-3">
              ₹{Number(summary.monthly_revenue || 0).toLocaleString("en-IN")}
            </h2>
          </div>
        </div>

        {/* Report Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-10">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Custom Date Range</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* From Date */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
              />
            </div>

            {/* Scope selection */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Filter by Turf
              </label>
              <select
                value={reportTurfId}
                onChange={(e) => setReportTurfId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium bg-white"
              >
                <option value="">🌐 All Turfs Combined</option>
                {turfs.map((t) => (
                  <option key={t.id} value={t.id}>
                    🏟️ {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={generateReport}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-10 py-3.5 rounded-xl flex items-center gap-3 text-base font-bold shadow-md transition"
            >
              <FaSearch />
              {loading ? "Generating Report..." : "Generate Revenue Report"}
            </button>
          </div>
        </div>

        {/* Generated Report */}
        {report && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 text-white px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Generated Financial Report</h2>
                  <p className="mt-1 text-green-100 text-sm">
                    Scope: <strong>{reportScopeName}</strong>
                  </p>
                </div>
                <div className="text-sm bg-white/20 px-3 py-1.5 rounded-xl font-medium">
                  {report.period?.from} to {report.period?.to}
                </div>
              </div>
            </div>

            {/* Report Details */}
            <div className="grid md:grid-cols-3 gap-6 p-6 bg-gray-50 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Report Period
                </p>
                <h3 className="font-bold text-base mt-1 text-gray-800">
                  {new Date(report.period.from).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  →{" "}
                  {new Date(report.period.to).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </h3>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Generated On
                </p>
                <h3 className="font-bold text-base mt-1 text-gray-800">
                  {new Date(report.generated_on).toLocaleString()}
                </h3>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Total Scope Revenue
                </p>
                <h3 className="text-2xl font-extrabold text-green-600 mt-1">
                  ₹{Number(report.totals.revenue || 0).toLocaleString("en-IN")}
                </h3>
              </div>
            </div>

            {/* Report Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-800 text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-center">Bookings</th>
                    <th className="p-4 text-center">Revenue</th>
                    <th className="p-4 text-center">Completed</th>
                    <th className="p-4 text-center">Confirmed</th>
                    <th className="p-4 text-center">Cancelled</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-sm">
                  {report.rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No bookings found for the selected date range and venue.
                      </td>
                    </tr>
                  ) : (
                    report.rows.map((item, index) => (
                      <tr key={index} className="hover:bg-green-50/50 transition">
                        <td className="p-4 font-medium text-gray-800">
                          {new Date(item.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-center">{item.bookings}</td>
                        <td className="p-4 text-center font-bold text-green-700">
                          ₹{Number(item.revenue || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 text-center text-gray-600">{item.completed}</td>
                        <td className="p-4 text-center text-green-600 font-medium">
                          {item.confirmed}
                        </td>
                        <td className="p-4 text-center text-red-600 font-medium">
                          {item.cancelled}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                <tfoot className="bg-green-50 font-bold text-gray-900 border-t-2 border-green-200">
                  <tr>
                    <td className="p-4">TOTAL</td>
                    <td className="p-4 text-center">{report.totals.bookings}</td>
                    <td className="p-4 text-center text-green-700 text-base">
                      ₹{Number(report.totals.revenue || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-center">{report.totals.completed}</td>
                    <td className="p-4 text-center">{report.totals.confirmed}</td>
                    <td className="p-4 text-center text-red-600">
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-10">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Export & Actions</h2>
            <div className="flex flex-col md:flex-row gap-5">
              {/* Print */}
              <button
                type="button"
                onClick={() => {
                  const printWindow = window.open("", "_blank");
                  printWindow.document.write(`
                    <html>
                    <head>
                    <title>${reportScopeName} - Revenue Report</title>
                    <style>
                      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 40px; color: #1f2937; }
                      h1 { text-align: center; margin-bottom: 4px; color: #15803d; }
                      h2 { text-align: center; font-size: 16px; color: #4b5563; margin-top: 0; }
                      .meta { margin: 20px 0; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; font-size: 14px; }
                      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
                      th, td { border: 1px solid #d1d5db; padding: 10px; text-align: center; }
                      th { background: #16a34a; color: white; font-weight: bold; }
                      tfoot tr { background: #f0fdf4; font-weight: bold; }
                    </style>
                    </head>
                    <body>
                      <h1>YourTurf Booking Management</h1>
                      <h2>Scope: ${reportScopeName} - Financial Revenue Report</h2>
                      <div class="meta">
                        <p><strong>Period:</strong> ${report.period.from} to ${report.period.to}</p>
                        <p><strong>Generated On:</strong> ${new Date(report.generated_on).toLocaleString()}</p>
                        <p><strong>Total Revenue:</strong> ₹${report.totals.revenue}</p>
                      </div>
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
                          ${report.rows
                            .map(
                              (row) => `
                            <tr>
                              <td>${row.date}</td>
                              <td>${row.bookings}</td>
                              <td>₹${row.revenue}</td>
                              <td>${row.completed}</td>
                              <td>${row.confirmed}</td>
                              <td>${row.cancelled}</td>
                            </tr>
                          `
                            )
                            .join("")}
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-3 shadow-md transition"
              >
                <FaPrint />
                Print Statement
              </button>

              {/* PDF Export */}
              <button
                type="button"
                onClick={() => {
                  const turfParam = reportTurfId ? `&turf_id=${reportTurfId}` : "";
                  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
                  window.open(
                    `${apiUrl}/export-report/?from_date=${fromDate}&to_date=${toDate}${turfParam}`,
                    "_blank"
                  );
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-3 shadow-md transition"
              >
                <FaFilePdf />
                Download PDF Report
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminReports;