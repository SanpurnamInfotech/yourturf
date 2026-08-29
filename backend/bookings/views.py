
from django.conf import settings

import razorpay

from rest_framework.views import APIView
from rest_framework.response import Response

from .models import *
from .serializers import *
from django.db.models import *
from settings.models import *
from django.utils import timezone
from django.db.models.functions import TruncMonth
from datetime import datetime ,date ,timedelta
from django.http import HttpResponse


from reportlab.platypus import (SimpleDocTemplate,Table,TableStyle,Paragraph,Spacer,)

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

from turf.models import Turf, TurfClosure



class AvailableSlotsAPIView(APIView):

    def get(self, request):

        booking_date = request.GET.get("date")

        if not booking_date:
            return Response(
                {"error": "Date is required."},
                status=400
            )

        try:
            booking_date = datetime.strptime(
                booking_date,
                "%Y-%m-%d"
            ).date()

        except ValueError:

            return Response(
                {"error": "Invalid date format."},
                status=400
            )

        today = timezone.now().date()

        # --------------------------------
        # PAST DATE
        # --------------------------------

        if booking_date < today:

            return Response({
                "available_slots": [],
                "booked_slots": [],
                "expired_slots": []
            })


        # --------------------------------
        # GET CURRENT TURF
        # --------------------------------

        turf = Turf.objects.first()


        # --------------------------------
        # CHECK FULL DAY CLOSURE
        # --------------------------------

        full_day_closure = TurfClosure.objects.filter(
            turf=turf,
            date=booking_date,
            is_full_day=True
        ).first()


        # --------------------------------
        # ACTUALLY BOOKED SLOTS
        # --------------------------------

        booked_slot_ids = BookingSlot.objects.filter(

            booking__booking_date=booking_date,

            booking__status__in=[
                "Confirmed",
                "Completed"
            ]

        ).values_list(
            "slot_id",
            flat=True
        )


        booked_slots = Slot.objects.filter(
            id__in=booked_slot_ids
        )


        # --------------------------------
        # ALL NON-BOOKED SLOTS
        # --------------------------------

        available_slots = Slot.objects.exclude(
            id__in=booked_slot_ids
        )


        # --------------------------------
        # FULL DAY CLOSED
        # --------------------------------

        if full_day_closure:

            return Response({

                "available_slots": [],

                "booked_slots": SlotSerializer(
                    booked_slots,
                    many=True
                ).data,

                "expired_slots": [],

                "closed_slots": SlotSerializer(
                    available_slots,
                    many=True
                ).data,

                "closure": {
                    "type": "full_day",
                    "reason":
                        full_day_closure.reason
                }

            })


        # --------------------------------
        # SPECIFIC HOUR CLOSURES
        # --------------------------------

        closures = TurfClosure.objects.filter(
            turf=turf,
            date=booking_date,
            is_full_day=False
        )


        closed_slot_ids = []


        for slot in available_slots:

            for closure in closures:

                if not closure.start_time or not closure.end_time:
                    continue


                slot_start = slot.start_time

                slot_end = slot.end_time


                # --------------------------------
                # NORMAL SLOT
                # --------------------------------

                if slot_end > slot_start:

                    overlaps = (
                        slot_start <
                        closure.end_time
                        and
                        slot_end >
                        closure.start_time
                    )


                # --------------------------------
                # SLOT CROSSES MIDNIGHT
                # --------------------------------

                else:

                    # Slot is something like:
                    # 11 PM → 1 AM

                    overlaps = (
                        slot_start <
                        closure.end_time
                        or
                        slot_end >
                        closure.start_time
                    )


                if overlaps:

                    closed_slot_ids.append(
                        slot.id
                    )

                    break


        # --------------------------------
        # REMOVE CLOSED SLOTS
        # --------------------------------

        available_slots = available_slots.exclude(
            id__in=closed_slot_ids
        )


        # --------------------------------
        # EXPIRED SLOTS
        # --------------------------------

        expired_slots = []


        if booking_date == today:

            current_datetime = timezone.now()


            for slot in available_slots:

                slot_start = datetime.combine(
                    booking_date,
                    slot.start_time
                )

                slot_end = datetime.combine(
                    booking_date,
                    slot.end_time
                )


                # Slot crosses midnight

                if slot.end_time <= slot.start_time:

                    slot_end += timedelta(days=1)


                if current_datetime >= slot_end:

                    expired_slots.append(
                        slot.id
                    )


            available_slots = available_slots.exclude(
                id__in=expired_slots
            )


        # --------------------------------
        # RESPONSE
        # --------------------------------

        return Response({

            "available_slots": SlotSerializer(
                available_slots,
                many=True
            ).data,

            "booked_slots": SlotSerializer(
                booked_slots,
                many=True
            ).data,

            "expired_slots": SlotSerializer(
                Slot.objects.filter(
                    id__in=expired_slots
                ),
                many=True
            ).data,

            "closed_slots": SlotSerializer(
                Slot.objects.filter(
                    id__in=closed_slot_ids
                ),
                many=True
            ).data

        })

class CreateBookingAPIView(APIView):

    def post(self, request):

        serializer = BookingSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        payment_id = request.data.get("payment_id")
        order_id = request.data.get("order_id")
        signature = request.data.get("signature")

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        try:

            client.utility.verify_payment_signature({

                "razorpay_order_id": order_id,

                "razorpay_payment_id": payment_id,

                "razorpay_signature": signature,

            })

        except razorpay.errors.SignatureVerificationError:

            return Response(
                {
                    "error": "Payment verification failed."
                },
                status=400
          )

        slot_ids = serializer.validated_data.pop(
            "slots"
        )

        booking_date = serializer.validated_data[
            "booking_date"
        ]


        holiday = Holiday.objects.filter(
         holiday_from__lte=booking_date,
         holiday_to__gte=booking_date
        ).first()

        if holiday:

           return Response(
        {
            "error": (
                f"Turf is closed from "
                f"{holiday.holiday_from} "
                f"to {holiday.holiday_to}. "
                f"Reason: {holiday.reason}"
            )
        },
        status=400
    )

        if booking_date < date.today():
          return Response(
        {
            "error":
            "Past dates are not allowed"
        },
        status=400
    )

                # --------------------------------
        # CHECK NEW TURF CLOSURES
        # --------------------------------

        turf = Turf.objects.first()


        # Full day closure

        full_day_closure = TurfClosure.objects.filter(
            turf=turf,
            date=booking_date,
            is_full_day=True
        ).first()


        if full_day_closure:

            return Response(
                {
                    "error":
                        "Turf is closed for the selected date.",
                    "reason":
                        full_day_closure.reason
                },
                status=400
            )


        # Specific-hour closures

        closures = TurfClosure.objects.filter(
            turf=turf,
            date=booking_date,
            is_full_day=False
        )


        for slot_id in slot_ids:

            slot = Slot.objects.filter(
                id=slot_id
            ).first()


            if not slot:

                return Response(
                    {
                        "error":
                            f"Slot {slot_id} does not exist."
                    },
                    status=400
                )


            for closure in closures:

                if (
                    not closure.start_time
                    or
                    not closure.end_time
                ):
                    continue


                # Normal slot

                if slot.end_time > slot.start_time:

                    overlaps = (
                        slot.start_time <
                        closure.end_time
                        and
                        slot.end_time >
                        closure.start_time
                    )


                # Slot crosses midnight

                else:

                    overlaps = (
                        slot.start_time <
                        closure.end_time
                        or
                        slot.end_time >
                        closure.start_time
                    )


                if overlaps:

                    return Response(
                        {
                            "error":
                                "Selected slot is closed.",
                            "reason":
                                closure.reason
                        },
                        status=400
                    )

        for slot_id in slot_ids:

            already_booked = BookingSlot.objects.filter(
                slot_id=slot_id,
                booking__booking_date=booking_date
            ).exists()

            if already_booked:

                return Response(
                    {
                        "error":
                        f"Slot {slot_id} already booked"
                    },
                    status=400
                )

        # Get payment details from Razorpay
        try:

            payment_details = client.payment.fetch(
                payment_id
       )

        except Exception:

            return Response(
                {
                    "error": "Unable to fetch payment details."
                },
                status=400
       )


        # Convert Razorpay payment method
        razorpay_method = payment_details.get(
            "method"
        )

        payment_method_map = {
            "upi": "UPI",
            "card": "Card",
            "netbanking": "Net Banking",
        }

        payment_method = payment_method_map.get(
            razorpay_method
       )


        # Create booking with complete payment details
        booking = Booking.objects.create(

            **serializer.validated_data,

            payment_id=payment_id,

            order_id=order_id,

            transaction_id=payment_id,

            payment_status="Paid",

            payment_method=payment_method,

            payment_date=timezone.now(),

    )

        for slot_id in slot_ids:

            BookingSlot.objects.create(
                booking=booking,
                slot_id=slot_id
            )

        return Response(
    {
        "message": "Booking Successful",

        "booking_code": booking.booking_code,

        "created_on": booking.created_on,

        "payment_id": booking.payment_id,

        "order_id": booking.order_id,

        "total_amount": booking.total_amount,
    }
)


class DashboardAPIView(APIView):

    def get(self, request):

        today = timezone.now().date()

        total_bookings = Booking.objects.exclude(
            status="Cancelled"
        ).count()

        today_bookings = Booking.objects.filter(
            booking_date=today
        ).exclude(
            status="Cancelled"
        ).count()

        today_revenue = (
            Booking.objects.filter(
                booking_date=today
            ).exclude(
                status="Cancelled"
            ).aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        total_slots = Slot.objects.count()

        return Response({
            "total_bookings": total_bookings,
            "today_bookings": today_bookings,
            "today_revenue": today_revenue,
            "total_slots": total_slots,
        })

class BookingListAPIView(APIView):

    def get(self, request):

        booking_date = request.GET.get("date")
        mobile = request.GET.get("mobile")
        booking_code = request.GET.get("booking_code")

        today = timezone.now().date()

        # Automatically mark old confirmed bookings as completed
        Booking.objects.filter(
        booking_date__lt=today,
        status="Confirmed"
        ).update(status="Completed")

        bookings = Booking.objects.all()

        if booking_date:
            bookings = bookings.filter(
                booking_date=booking_date
            )

        if mobile:
            bookings = bookings.filter(
                mobile__icontains=mobile
            )

        if booking_code:
            bookings = bookings.filter(
                booking_code__icontains=booking_code
            )

        serializer = BookingListSerializer(
            bookings.order_by("-created_on"),
            many=True
        )

        return Response(serializer.data)

class CalendarAPIView(APIView):

    def get(self, request):

        booking_date = request.GET.get("date")

        if not booking_date:
            return Response(
                {
                    "error": "Date is required."
                },
                status=400
            )

        try:

            booking_date = datetime.strptime(
                booking_date,
                "%Y-%m-%d"
            ).date()

        except ValueError:

            return Response(
                {
                    "error": "Invalid date format."
                },
                status=400
            )


        # --------------------------------
        # GET CURRENT TURF
        # --------------------------------

        turf = Turf.objects.first()


        # --------------------------------
        # BOOKED SLOTS
        # --------------------------------

        booked_slot_ids = BookingSlot.objects.filter(

            booking__booking_date=booking_date,

            booking__status__in=[
                "Confirmed",
                "Completed"
            ]

        ).values_list(
            "slot_id",
            flat=True
        )


        booked_slots = Slot.objects.filter(
            id__in=booked_slot_ids
        )


        # --------------------------------
        # ALL SLOTS
        # --------------------------------

        all_slots = Slot.objects.all()


        # --------------------------------
        # FULL DAY CLOSURE
        # --------------------------------

        full_day_closure = TurfClosure.objects.filter(
            turf=turf,
            date=booking_date,
            is_full_day=True
        ).first()


        if full_day_closure:

            closed_slots = all_slots.exclude(
                id__in=booked_slot_ids
            )

            available_slots = Slot.objects.none()

        else:

            # --------------------------------
            # SPECIFIC-HOUR CLOSURES
            # --------------------------------

            closures = TurfClosure.objects.filter(
                turf=turf,
                date=booking_date,
                is_full_day=False
            )


            closed_slot_ids = []


            for slot in all_slots:

                # Don't mark already booked slots
                # as closed.

                if slot.id in booked_slot_ids:
                    continue


                for closure in closures:

                    if (
                        not closure.start_time
                        or
                        not closure.end_time
                    ):
                        continue


                    # Normal slot

                    if slot.end_time > slot.start_time:

                        overlaps = (
                            slot.start_time <
                            closure.end_time
                            and
                            slot.end_time >
                            closure.start_time
                        )


                    # Slot crosses midnight

                    else:

                        overlaps = (
                            slot.start_time <
                            closure.end_time
                            or
                            slot.end_time >
                            closure.start_time
                        )


                    if overlaps:

                        closed_slot_ids.append(
                            slot.id
                        )

                        break


            # --------------------------------
            # CLOSED / AVAILABLE
            # --------------------------------

            closed_slots = Slot.objects.filter(
                id__in=closed_slot_ids
            )


            available_slots = all_slots.exclude(
                id__in=booked_slot_ids
            ).exclude(
                id__in=closed_slot_ids
            )


        # --------------------------------
        # RESPONSE
        # --------------------------------

        return Response({

            "booked_slots": SlotListSerializer(
                booked_slots,
                many=True
            ).data,

            "available_slots": SlotListSerializer(
                available_slots,
                many=True
            ).data,

            "closed_slots": SlotListSerializer(
                closed_slots,
                many=True
            ).data,

            "closure": (
                {
                    "type": "full_day",
                    "reason":
                        full_day_closure.reason
                }
                if full_day_closure
                else None
            )

        }) 


class CancelBookingAPIView(APIView):

    def delete(self, request, booking_id):

        booking = Booking.objects.get(
            id=booking_id
        )

        BookingSlot.objects.filter(
        booking=booking
        ).delete()

        booking.status = "Cancelled"
        booking.save()

        return Response({
         "message": "Booking Cancelled Successfully"
        })     



class RevenueAPIView(APIView):

    def get(self, request):

        revenue = (
            Booking.objects
            .annotate(
                month=TruncMonth(
                    "booking_date"
                )
            )
            .values("month")
            .annotate(
                revenue=Sum(
                    "total_amount"
                )
            )
            .order_by("month")
        )

        return Response(revenue)


class RevenueAnalyticsAPIView(APIView):

    def get(self, request):

        today = timezone.now().date()

        week_start = today - timedelta(days=today.weekday())

        month_start = today.replace(day=1)

        today_revenue = (
            Booking.objects.filter(
                booking_date=today
            ).aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        weekly_revenue = (
            Booking.objects.filter(
                booking_date__gte=week_start
            ).aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        monthly_revenue = (
            Booking.objects.filter(
                booking_date__gte=month_start
            ).aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        total_revenue = (
            Booking.objects.aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        today_bookings = Booking.objects.filter(
            booking_date=today
        ).count()

        confirmed = Booking.objects.filter(
            status="Confirmed"
        ).count()

        cancelled = Booking.objects.filter(
            status="Cancelled"
        ).count()

        completed = Booking.objects.filter(
            status="Completed"
        ).count()

        return Response({

            "today_revenue": today_revenue,

            "weekly_revenue": weekly_revenue,

            "monthly_revenue": monthly_revenue,

            "total_revenue": total_revenue,

            "today_bookings": today_bookings,

            "confirmed": confirmed,

            "cancelled": cancelled,

            "completed": completed,

        })

class ExportRevenuePDFAPIView(APIView):

    def get(self, request):

        today = timezone.now().date()

        week_start = today - timedelta(days=today.weekday())

        month_start = today.replace(day=1)

        today_revenue = (
    Booking.objects.filter(
        booking_date=today
    ).exclude(
        status="Cancelled"
    ).aggregate(
        total=Sum("total_amount")
    )["total"] or 0
)

        weekly_revenue = (
    Booking.objects.filter(
        booking_date__gte=week_start
    ).exclude(
        status="Cancelled"
    ).aggregate(
        total=Sum("total_amount")
    )["total"] or 0
)

        monthly_revenue = (
    Booking.objects.filter(
        booking_date__gte=month_start
    ).exclude(
        status="Cancelled"
    ).aggregate(
        total=Sum("total_amount")
    )["total"] or 0
)

        total_revenue = (
    Booking.objects.exclude(
        status="Cancelled"
    ).aggregate(
        total=Sum("total_amount")
    )["total"] or 0
)

        today_bookings = Booking.objects.filter(
    booking_date=today
).exclude(
    status="Cancelled"
).count()

        confirmed = Booking.objects.filter(
            status="Confirmed"
        ).count()

        cancelled = 0

        completed = Booking.objects.filter(
            status="Completed"
        ).count()

        response = HttpResponse(
            content_type="application/pdf"
        )

        response[
            "Content-Disposition"
        ] = 'attachment; filename="Revenue_Report.pdf"'

        doc = SimpleDocTemplate(response)

        styles = getSampleStyleSheet()

        elements = []

        elements.append(
            Paragraph(
                "<b><font size=20>Sanpurnam Turf</font></b>",
                styles["Title"],
            )
        )

        elements.append(
            Paragraph(
                "<b>Revenue Report</b>",
                styles["Heading2"],
            )
        )

        elements.append(
            Paragraph(
                f"Generated On : {today}",
                styles["Normal"],
            )
        )

        elements.append(
            Spacer(1, 20)
        )

        data = [

            ["Metric", "Value"],

            ["Today's Revenue", f"₹ {today_revenue}"],

            ["Weekly Revenue", f"₹ {weekly_revenue}"],

            ["Monthly Revenue", f"₹ {monthly_revenue}"],

            ["Total Revenue", f"₹ {total_revenue}"],

            ["Today's Bookings", today_bookings],

            ["Confirmed", confirmed],

            ["Cancelled", cancelled],

            ["Completed", completed],

        ]

        table = Table(data)

        table.setStyle(

            TableStyle([

                ("BACKGROUND", (0, 0), (-1, 0), colors.green),

                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),

                ("GRID", (0, 0), (-1, -1), 1, colors.black),

                ("BACKGROUND", (0, 1), (-1, -1), colors.beige),

                ("ALIGN", (0, 0), (-1, -1), "CENTER"),

                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),

                ("BOTTOMPADDING", (0, 0), (-1, 0), 12),

            ])

        )

        elements.append(table)

        doc.build(elements)

        return response 

class RevenueSummaryAPIView(APIView):

    def get(self, request):

        today = timezone.now().date()

        week_start = today - timedelta(
            days=today.weekday()
        )

        month_start = today.replace(
            day=1
        )

        today_revenue = (
    Booking.objects.filter(
        booking_date=today
    ).exclude(
        status="Cancelled"
    ).aggregate(
        total=Sum("total_amount")
    )["total"] or 0
)

        weekly_revenue = (
    Booking.objects.filter(
        booking_date__gte=week_start
    ).exclude(
        status="Cancelled"
    ).aggregate(
        total=Sum("total_amount")
    )["total"] or 0
)

        monthly_revenue = (
    Booking.objects.filter(
        booking_date__gte=month_start
    ).exclude(
        status="Cancelled"
    ).aggregate(
        total=Sum("total_amount")
    )["total"] or 0
)

        return Response({

            "today_revenue": today_revenue,

            "weekly_revenue": weekly_revenue,

            "monthly_revenue": monthly_revenue,

        })


class RevenueReportAPIView(APIView):

    def get(self, request):

        from_date = request.GET.get("from_date")
        to_date = request.GET.get("to_date")

        if not from_date or not to_date:

            return Response(
                {
                    "error": "from_date and to_date are required."
                },
                status=400
            )

        report = (

           Booking.objects.filter(
    booking_date__range=[
        from_date,
        to_date
    ]
).exclude(
    status="Cancelled"
)

            .values("booking_date")

            .annotate(

                bookings=Count("id"),

                revenue=Sum("total_amount"),

                completed=Count(
                    "id",
                    filter=Q(status="Completed")
                ),

                confirmed=Count(
                    "id",
                    filter=Q(status="Confirmed")
                ),

                cancelled=Count(
                    "id",
                    filter=Q(status="Cancelled")
                ),

            )

            .order_by("booking_date")

        )

        totals = {

            "bookings": 0,

            "revenue": 0,

            "completed": 0,

            "confirmed": 0,

            "cancelled": 0,

        }

        rows = []

        for item in report:

            rows.append({

                "date": item["booking_date"],

                "bookings": item["bookings"],

                "revenue": item["revenue"] or 0,

                "completed": item["completed"],

                "confirmed": item["confirmed"],

                "cancelled": item["cancelled"],

            })

            totals["bookings"] += item["bookings"]

            totals["revenue"] += item["revenue"] or 0

            totals["completed"] += item["completed"]

            totals["confirmed"] += item["confirmed"]

            totals["cancelled"] += item["cancelled"]

        return Response({

            "period": {

                "from": from_date,

                "to": to_date,

            },

            "generated_on": timezone.now(),

            "rows": rows,

            "totals": totals,

        })

class ExportReportPDFAPIView(APIView):

    def get(self, request):

        from_date = request.GET.get("from_date")
        to_date = request.GET.get("to_date")

        if not from_date or not to_date:

            return Response(
                {
                    "error": "from_date and to_date are required."
                },
                status=400
            )

        report = (

            Booking.objects.filter(

                booking_date__range=[
                    from_date,
                    to_date
                ]

            )

            .exclude(
                status="Cancelled"
            )

            .values(
                "booking_date"
            )

            .annotate(

                bookings=Count("id"),

                revenue=Sum(
                    "total_amount"
                ),

                completed=Count(
                    "id",
                    filter=Q(
                        status="Completed"
                    )
                ),

                confirmed=Count(
                    "id",
                    filter=Q(
                        status="Confirmed"
                    )
                ),

            )

            .order_by(
                "booking_date"
            )

        )

        totals = {

            "bookings": 0,

            "revenue": 0,

            "completed": 0,

            "confirmed": 0,

        }

        for item in report:

            totals["bookings"] += item["bookings"]

            totals["revenue"] += (
                item["revenue"] or 0
            )

            totals["completed"] += (
                item["completed"]
            )

            totals["confirmed"] += (
                item["confirmed"]
            )

        response = HttpResponse(
            content_type="application/pdf"
        )

        response[
            "Content-Disposition"
        ] = (
            'attachment; filename="Sanpurnam_Turf_Report.pdf"'
        )

        doc = SimpleDocTemplate(
            response
        )

        styles = getSampleStyleSheet()

        elements = []
                # -----------------------------
        # Title
        # -----------------------------

        elements.append(

            Paragraph(

                "<b><font size='22' color='green'>Sanpurnam Turf</font></b>",

                styles["Title"]

            )

        )

        elements.append(

            Paragraph(

                "<b>Turf Booking Management System</b>",

                styles["Heading2"]

            )

        )

        elements.append(
            Spacer(1, 20)
        )

        # -----------------------------
        # Report Information
        # -----------------------------

        elements.append(

            Paragraph(

                f"<b>Report Period :</b> {from_date} to {to_date}",

                styles["Normal"]

            )

        )

        elements.append(

            Paragraph(

                f"<b>Generated On :</b> {timezone.now().strftime('%d-%m-%Y %I:%M %p')}",

                styles["Normal"]

            )

        )

        elements.append(
            Spacer(1, 15)
        )

        # -----------------------------
        # Revenue Summary
        # -----------------------------

        elements.append(

            Paragraph(

                "<b>Revenue Summary</b>",

                styles["Heading2"]

            )

        )

        summary_data = [

            ["Metric", "Value"],

            ["Total Bookings", totals["bookings"]],

            ["Total Revenue", f"₹ {totals['revenue']}"],

            ["Completed", totals["completed"]],

            ["Confirmed", totals["confirmed"]],

        ]

        summary_table = Table(

            summary_data,

            colWidths=[220, 220]

        )

        summary_table.setStyle(

            TableStyle([

                ("BACKGROUND", (0,0), (-1,0), colors.darkgreen),

                ("TEXTCOLOR", (0,0), (-1,0), colors.white),

                ("GRID", (0,0), (-1,-1), 1, colors.black),

                ("BACKGROUND", (0,1), (-1,-1), colors.whitesmoke),

                ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),

                ("ALIGN", (0,0), (-1,-1), "CENTER"),

                ("BOTTOMPADDING", (0,0), (-1,0), 10),

            ])

        )

        elements.append(summary_table)

        elements.append(
            Spacer(1, 20)
        )
                # ----------------------------------
        # Booking Report
        # ----------------------------------

        elements.append(

            Paragraph(

                "<b>Booking Report</b>",

                styles["Heading2"]

            )

        )

        table_data = [

            [

                "Date",

                "Bookings",

                "Revenue",

                "Completed",

                "Confirmed",

            ]

        ]

        for item in report:

            table_data.append(

                [

                    item["booking_date"].strftime("%d-%m-%Y"),

                    item["bookings"],

                    f"₹ {item['revenue'] or 0}",

                    item["completed"],

                    item["confirmed"],

                ]

            )

        table_data.append(

            [

                "TOTAL",

                totals["bookings"],

                f"₹ {totals['revenue']}",

                totals["completed"],

                totals["confirmed"],

            ]

        )

        report_table = Table(

            table_data,

            colWidths=[90, 80, 100, 90, 90]

        )

        report_table.setStyle(

            TableStyle([

                ("BACKGROUND", (0,0), (-1,0), colors.darkgreen),

                ("TEXTCOLOR", (0,0), (-1,0), colors.white),

                ("GRID", (0,0), (-1,-1), 1, colors.black),

                ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),

                ("ALIGN", (0,0), (-1,-1), "CENTER"),

                ("BOTTOMPADDING", (0,0), (-1,0), 10),

                ("BACKGROUND", (0,1), (-1,-2), colors.beige),

                ("BACKGROUND", (0,-1), (-1,-1), colors.lightgreen),

                ("FONTNAME", (0,-1), (-1,-1), "Helvetica-Bold"),

            ])

        )

        elements.append(report_table)

        elements.append(
            Spacer(1, 20)
        )
                # ----------------------------------
        # Footer
        # ----------------------------------

        elements.append(

            Paragraph(

                "<br/><br/><b>Generated by Sanpurnam Turf Booking System</b>",

                styles["Normal"]

            )

        )

        elements.append(

            Paragraph(

                "Thank you for using Sanpurnam Turf.",

                styles["Normal"]

            )

        )

        # ----------------------------------
        # Build PDF
        # ----------------------------------

        doc.build(elements)

        return response  

class BookingHistoryAPIView(APIView):

    def get(self, request):

        booking_code = request.GET.get("booking_code")
        mobile = request.GET.get("mobile")

        # Search by Booking Code
        if booking_code:

            booking = Booking.objects.filter(
                booking_code=booking_code
            ).first()

            if not booking:
                return Response(
                    {"error": "Booking Not Found"},
                    status=404
                )

            serializer = BookingHistorySerializer(
                booking
            )

            return Response({
                "type": "single",
                "booking": serializer.data
            })

        # Search by Mobile Number
        if mobile:

            bookings = Booking.objects.filter(
                mobile=mobile
            ).order_by("-booking_date")

            if not bookings.exists():
                return Response(
                    {"error": "No Bookings Found"},
                    status=404
                )

            serializer = BookingHistorySerializer(
                bookings,
                many=True
            )

            return Response({
                "type": "multiple",
                "bookings": serializer.data
            })

        return Response(
            {
                "error":
                "Booking Code or Mobile Number is required"
            },
            status=400
        )


class CustomerCancelBookingAPIView(APIView):

    def post(self, request):

        booking_code = request.data.get("booking_code")

        if not booking_code:

            return Response(
                {
                    "error": "Booking Code is required."
                },
                status=400
            )

        booking = Booking.objects.filter(
            booking_code=booking_code
        ).first()

        if not booking:

            return Response(
                {
                    "error": "Booking not found."
                },
                status=404
            )

        if booking.status == "Cancelled":

            return Response(
                {
                    "error": "Booking is already cancelled."
                },
                status=400
            )

        if booking.status == "Completed":

            return Response(
                {
                    "error": "Completed booking cannot be cancelled."
                },
                status=400
            )

        BookingSlot.objects.filter(
            booking=booking
        ).delete()

        booking.status = "Cancelled"
        booking.save()

        return Response(
            {
                "message": "Booking cancelled successfully."
            }
        )        


class CreateRazorpayOrderAPIView(APIView):

    def post(self, request):

        amount = request.data.get("amount")

        if not amount:

            return Response(
                {
                    "error": "Amount is required."
                },
                status=400
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        order = client.order.create({

            "amount": int(float(amount) * 100),

            "currency": "INR",

            "payment_capture": 1,

        })

        return Response({

            "order_id": order["id"],

            "amount": order["amount"],

            "currency": order["currency"],

            "key": settings.RAZORPAY_KEY_ID,

        })    