from django.urls import path
from .views import *

urlpatterns = [
    path(
        'slots/',
        AvailableSlotsAPIView.as_view(),
        name='available-slots'
    ),

    path(
        "book/",
        CreateBookingAPIView.as_view()
    ),

    path(
        "dashboard/",
        DashboardAPIView.as_view(),
    ),

    path(
    "bookings/",
    BookingListAPIView.as_view(),
    ),

    path(
    "calendar/",
    CalendarAPIView.as_view(),
    ),

    path(
    "cancel/<int:booking_id>/",
    CancelBookingAPIView.as_view(),
    ),

     path(
    "revenue/",
    RevenueAPIView.as_view(),
    ),

     path(
    "revenue-analytics/",
    RevenueAnalyticsAPIView.as_view(),
    ),

    path(
    "export-pdf/",
    ExportRevenuePDFAPIView.as_view(),
    ),

    path(
    "revenue-report/",
    RevenueReportAPIView.as_view(),
    ),

    path(
    "revenue-summary/",
    RevenueSummaryAPIView.as_view(),
    ),

    path(
    "revenue-report/",
    RevenueReportAPIView.as_view(),
    ),

     path(
    "booking-history/",
    BookingHistoryAPIView.as_view(),
    ),

    path(
    "export-report/",
    ExportReportPDFAPIView.as_view(),
    ),

    path(
    "customer-cancel/",
    CustomerCancelBookingAPIView.as_view(),
    ),

    path(
    "create-order/",
    CreateRazorpayOrderAPIView.as_view(),
    ),

]