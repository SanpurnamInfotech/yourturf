from django.conf import settings
from django.db import transaction
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal

import razorpay
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

from .models import Slot, Booking, BookingSlot
from turf.serializers import TurfSerializer
from .serializers import (
    SlotSerializer,
    SlotListSerializer,
    BookingSerializer,
    BookingListSerializer,
    BookingHistorySerializer,
)
from turf.models import Turf, TurfClosure
from settings.models import TurfSettings, Holiday


def calculate_slot_price(turf, slot):
    """
    Calculate price for a slot based on turf day/night pricing:
    Day price: 06:00 to 17:59
    Night price: 18:00 to 05:59
    """
    hour = slot.start_time.hour
    if 6 <= hour < 18:
        return turf.day_price
    return turf.night_price


def get_turf_for_request(request, param_name="turf_id"):
    """
    Helper to resolve turf from request query params or body,
    falling back to first active turf for backward compatibility.
    """
    turf_id = (
        request.GET.get(param_name)
        or request.GET.get("turf")
        or (request.data.get(param_name) if hasattr(request, "data") else None)
        or (request.data.get("turf") if hasattr(request, "data") else None)
    )
    if turf_id:
        return get_object_or_404(Turf, id=turf_id)
    return Turf.objects.filter(is_active=True).first() or Turf.objects.first()


def get_slot_interval(slot, booking_date):
    start = datetime.combine(booking_date, slot.start_time)
    end = datetime.combine(booking_date, slot.end_time)
    if end <= start:
        end += timedelta(days=1)
    return start, end


def intervals_overlap(first_start, first_end, second_start, second_end):
    return first_start < second_end and first_end > second_start


def has_overlapping_slots(slots, booking_date):
    intervals = [get_slot_interval(slot, booking_date) for slot in slots]
    return any(
        intervals_overlap(first_start, first_end, second_start, second_end)
        for index, (first_start, first_end) in enumerate(intervals)
        for second_start, second_end in intervals[index + 1:]
    )


def get_slot_availability(turf, booking_date):
    all_slots = list(Slot.objects.all().order_by("start_time", "id"))
    booked_reservations = list(BookingSlot.objects.filter(
        booking__turf=turf,
        booking__booking_date__range=(
            booking_date - timedelta(days=1),
            booking_date + timedelta(days=1),
        ),
        booking__status__in=["Confirmed", "Completed"],
    ).select_related("booking", "slot"))

    booked_slot_ids = set()
    for slot in all_slots:
        slot_start, slot_end = get_slot_interval(slot, booking_date)
        for reservation in booked_reservations:
            reserved_start, reserved_end = get_slot_interval(
                reservation.slot,
                reservation.booking.booking_date,
            )
            if intervals_overlap(
                slot_start,
                slot_end,
                reserved_start,
                reserved_end,
            ):
                booked_slot_ids.add(slot.id)
                break

    booked_slots = Slot.objects.filter(
        id__in=booked_slot_ids,
    ).order_by("start_time", "id")
    unbooked_slots = Slot.objects.exclude(
        id__in=booked_slot_ids,
    ).order_by("start_time", "id")

    full_day_closure = TurfClosure.objects.filter(
        turf=turf,
        date=booking_date,
        is_full_day=True,
    ).first()
    holiday = Holiday.objects.filter(
        Q(turf=turf) | Q(turf__isnull=True),
        holiday_from__lte=booking_date,
        holiday_to__gte=booking_date,
    ).first()
    settings_holiday = TurfSettings.objects.filter(
        Q(turf=turf) | Q(turf__isnull=True),
        holiday_from__lte=booking_date,
        holiday_to__gte=booking_date,
    ).first()
    closure_reason = (
        full_day_closure.reason
        if full_day_closure
        else holiday.reason
        if holiday
        else settings_holiday.holiday_reason
        if settings_holiday
        else None
    )

    if full_day_closure or holiday or settings_holiday:
        return {
            "available_slots": Slot.objects.none(),
            "booked_slots": booked_slots,
            "expired_slots": Slot.objects.none(),
            "closed_slots": Slot.objects.exclude(
                id__in=booked_slot_ids,
            ).order_by("start_time", "id"),
            "closure": {
                "type": "full_day",
                "reason": closure_reason or "Turf is closed for the selected date.",
            },
        }

    closed_slot_ids = []
    closures = TurfClosure.objects.filter(
        turf=turf,
        date=booking_date,
        is_full_day=False,
    )

    for slot in unbooked_slots:
        outside_operating_hours = False
        if turf.opening_time and turf.closing_time:
            if turf.closing_time > turf.opening_time:
                outside_operating_hours = (
                    slot.start_time < turf.opening_time
                    or slot.end_time > turf.closing_time
                )
            else:
                outside_operating_hours = not (
                    slot.start_time >= turf.opening_time
                    or slot.end_time <= turf.closing_time
                )

        if outside_operating_hours:
            closed_slot_ids.append(slot.id)
            continue

        for closure in closures:
            if not closure.start_time or not closure.end_time:
                continue
            if slot.end_time > slot.start_time:
                overlaps = (
                    slot.start_time < closure.end_time
                    and slot.end_time > closure.start_time
                )
            else:
                overlaps = (
                    slot.start_time < closure.end_time
                    or slot.end_time > closure.start_time
                )
            if overlaps:
                closed_slot_ids.append(slot.id)
                break

    available_slots = unbooked_slots.exclude(id__in=closed_slot_ids)
    expired_slot_ids = []
    if booking_date == timezone.now().date():
        now = timezone.now()
        for slot in available_slots:
            slot_end = datetime.combine(booking_date, slot.end_time)
            if slot.end_time <= slot.start_time:
                slot_end += timedelta(days=1)
            if timezone.is_aware(now):
                slot_end = timezone.make_aware(
                    slot_end,
                    timezone.get_current_timezone(),
                )
            if now >= slot_end:
                expired_slot_ids.append(slot.id)
        available_slots = available_slots.exclude(id__in=expired_slot_ids)

    return {
        "available_slots": available_slots,
        "booked_slots": booked_slots,
        "expired_slots": Slot.objects.filter(id__in=expired_slot_ids).order_by("start_time", "id"),
        "closed_slots": Slot.objects.filter(id__in=closed_slot_ids).order_by("start_time", "id"),
        "closure": None,
    }


def serialize_available_slots(turf, availability):
    available_slots = SlotSerializer(
        availability["available_slots"],
        many=True,
    ).data
    for slot_data in available_slots:
        hour = int(slot_data["start_time"].split(":")[0])
        slot_data["price"] = float(
            turf.day_price if 6 <= hour < 18 else turf.night_price
        )

    return {
        "turf": {
            "id": turf.id,
            "name": turf.name,
            "day_price": turf.day_price,
            "night_price": turf.night_price,
        },
        "available_slots": available_slots,
        "booked_slots": SlotSerializer(
            availability["booked_slots"],
            many=True,
        ).data,
        "expired_slots": SlotSerializer(
            availability["expired_slots"],
            many=True,
        ).data,
        "closed_slots": SlotSerializer(
            availability["closed_slots"],
            many=True,
        ).data,
        "closure": availability["closure"],
    }


class AvailableTurfsAPIView(APIView):

    def get(self, request):
        date_value = request.GET.get("date")
        if not date_value:
            return Response(
                {"error": "Date is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            booking_date = datetime.strptime(date_value, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if booking_date < timezone.now().date():
            return Response(
                {"error": "Past dates are not allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        turfs = Turf.objects.filter(is_active=True).order_by("id")
        results = []
        for turf in turfs:
            availability = get_slot_availability(turf, booking_date)
            turf_data = TurfSerializer(
                turf,
                context={"request": request},
            ).data
            turf_data["availability"] = {
                "is_bookable": availability["available_slots"].exists(),
                "available_slots": availability["available_slots"].count(),
                "closure": availability["closure"],
            }
            results.append(turf_data)

        return Response(results)


class AvailableSlotsAPIView(APIView):

    def get(self, request):
        booking_date = request.GET.get("date")

        if not booking_date:
            return Response(
                {"error": "Date is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            booking_date = datetime.strptime(booking_date, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        today = timezone.now().date()

        if booking_date < today:
            return Response({
                "available_slots": [],
                "booked_slots": [],
                "expired_slots": [],
                "closed_slots": [],
                "closure": None,
            })

        turf = get_turf_for_request(request)
        if not turf or not turf.is_active:
            return Response(
                {"error": "No active turf found."},
                status=status.HTTP_404_NOT_FOUND
            )

        availability = get_slot_availability(turf, booking_date)
        return Response(serialize_available_slots(turf, availability))


class CreateRazorpayOrderAPIView(APIView):

    def post(self, request):
        turf_id = request.data.get("turf_id") or request.data.get("turf")
        booking_date_str = request.data.get("date") or request.data.get("booking_date")
        slot_ids = request.data.get("slot_ids") or request.data.get("slots", [])

        if not turf_id:
            return Response(
                {"error": "Turf is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        turf = get_object_or_404(Turf, id=turf_id)
        if not turf.is_active:
            return Response(
                {"error": "This turf is not available for booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not booking_date_str:
            return Response(
                {"error": "Booking date is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            booking_date = datetime.strptime(booking_date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if booking_date < timezone.now().date():
            return Response(
                {"error": "Past dates are not allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(slot_ids, list) or not slot_ids:
            return Response(
                {"error": "Select at least one time slot."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(set(map(str, slot_ids))) != len(slot_ids):
            return Response(
                {"error": "Duplicate time slots are not allowed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slots = Slot.objects.filter(id__in=slot_ids)
        if slots.count() != len(slot_ids):
            return Response(
                {"error": "One or more invalid slots selected."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if has_overlapping_slots(slots, booking_date):
            return Response(
                {"error": "Selected time slots overlap each other."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        availability = get_slot_availability(turf, booking_date)
        available_ids = set(
            availability["available_slots"].values_list("id", flat=True)
        )
        if not set(slot_ids).issubset(available_ids):
            return Response(
                {
                    "error": "One or more selected slots are no longer available.",
                    "reason": (
                        availability["closure"]["reason"]
                        if availability["closure"]
                        else None
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount = sum(
            (calculate_slot_price(turf, slot) for slot in slots),
            Decimal("0.00"),
        )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        order = client.order.create({
            "amount": int(amount * 100),
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "turf_id": str(turf.id),
                "turf_name": turf.name,
            }
        })

        return Response({
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key": settings.RAZORPAY_KEY_ID,
            "turf_id": turf.id,
            "turf_name": turf.name,
            "calculated_amount": float(amount),
        })


class CreateBookingAPIView(APIView):

    def post(self, request):
        data = request.data.copy()

        # Resolve and validate turf
        turf_id = data.get("turf_id") or data.get("turf")
        if turf_id:
            turf = get_object_or_404(Turf, id=turf_id)
        else:
            turf = Turf.objects.filter(is_active=True).first() or Turf.objects.first()

        if not turf or not turf.is_active:
            return Response({"error": "Turf not found."}, status=status.HTTP_400_BAD_REQUEST)

        data["turf"] = turf.id

        payment_id = data.get("payment_id")
        order_id = data.get("order_id")
        signature = data.get("signature")

        # -----------------------------------------------
        # IDEMPOTENCY CHECK: Prevent duplicate booking
        # on retry of payment verification
        # -----------------------------------------------
        if payment_id:
            existing_booking = Booking.objects.filter(payment_id=payment_id).first()
            if existing_booking:
                return Response({
                    "message": "Booking already verified and confirmed.",
                    "booking_code": existing_booking.booking_code,
                    "created_on": existing_booking.created_on,
                    "payment_id": existing_booking.payment_id,
                    "order_id": existing_booking.order_id,
                    "total_amount": existing_booking.total_amount,
                    "turf_name": existing_booking.turf.name if existing_booking.turf else "Default",
                })

        # Verify payment signature
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
                {"error": "Payment verification failed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = BookingSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        slot_ids = serializer.validated_data.pop("slots")
        booking_date = serializer.validated_data["booking_date"]

        if booking_date < timezone.now().date():
            return Response({"error": "Past dates are not allowed."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            turf = Turf.objects.select_for_update().get(pk=turf.pk)
            if not turf.is_active:
                return Response(
                    {"error": "This turf is not available for booking."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if payment_id:
                existing_booking = Booking.objects.filter(payment_id=payment_id).first()
                if existing_booking:
                    return Response({
                        "message": "Booking already verified and confirmed.",
                        "booking_code": existing_booking.booking_code,
                        "created_on": existing_booking.created_on,
                        "payment_id": existing_booking.payment_id,
                        "order_id": existing_booking.order_id,
                        "total_amount": existing_booking.total_amount,
                        "turf_name": existing_booking.turf.name if existing_booking.turf else "Default",
                    })

            availability = get_slot_availability(turf, booking_date)
            available_ids = set(
                availability["available_slots"].values_list("id", flat=True)
            )
            if len(set(slot_ids)) != len(slot_ids):
                return Response(
                    {"error": "Duplicate time slots are not allowed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not set(slot_ids).issubset(available_ids):
                return Response(
                    {
                        "error": "One or more selected slots are no longer available.",
                        "reason": (
                            availability["closure"]["reason"]
                            if availability["closure"]
                            else None
                        ),
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            slots = Slot.objects.filter(id__in=slot_ids)
            if slots.count() != len(slot_ids):
                return Response(
                    {"error": "One or more invalid slots selected."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if has_overlapping_slots(slots, booking_date):
                return Response(
                    {"error": "Selected time slots overlap each other."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            verified_amount = sum(
                (calculate_slot_price(turf, slot) for slot in slots),
                Decimal("0.00"),
            )

            # Fetch payment details from Razorpay to record payment method
            payment_method = "UPI"
            try:
                payment_details = client.payment.fetch(payment_id)
                razorpay_method = payment_details.get("method")
                payment_method_map = {
                    "upi": "UPI",
                    "card": "Card",
                    "netbanking": "Net Banking",
                }
                payment_method = payment_method_map.get(razorpay_method, "Online")
            except Exception:
                pass

            # Create booking with server-verified amount and selected turf
            booking_data = serializer.validated_data.copy()
            booking_data["total_amount"] = verified_amount
            booking_data["turf"] = turf

            booking = Booking.objects.create(
                **booking_data,
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

        return Response({
            "message": "Booking Successful",
            "booking_code": booking.booking_code,
            "created_on": booking.created_on,
            "payment_id": booking.payment_id,
            "order_id": booking.order_id,
            "total_amount": booking.total_amount,
            "turf_id": turf.id,
            "turf_name": turf.name,
        })


class DashboardAPIView(APIView):

    def get(self, request):
        today = timezone.now().date()
        turf_id = request.GET.get("turf_id")

        bookings = Booking.objects.exclude(status="Cancelled")
        if turf_id:
            bookings = bookings.filter(turf_id=turf_id)

        total_bookings = bookings.count()
        today_bookings = bookings.filter(booking_date=today).count()
        today_revenue = (
            bookings.filter(booking_date=today).aggregate(total=Sum("total_amount"))["total"] or 0
        )
        total_revenue = (
            bookings.aggregate(total=Sum("total_amount"))["total"] or 0
        )

        total_slots = Slot.objects.count()
        total_turfs = Turf.objects.count()
        active_turfs = Turf.objects.filter(is_active=True).count()

        # Turf breakdown list for multi-turf dashboard view
        turf_breakdown = []
        for t in Turf.objects.all().order_by("id"):
            t_bookings = Booking.objects.filter(turf=t).exclude(status="Cancelled")
            t_today = t_bookings.filter(booking_date=today)
            turf_breakdown.append({
                "id": t.id,
                "name": t.name,
                "location": t.location,
                "is_active": t.is_active,
                "total_bookings": t_bookings.count(),
                "today_bookings": t_today.count(),
                "total_revenue": float(t_bookings.aggregate(total=Sum("total_amount"))["total"] or 0),
                "today_revenue": float(t_today.aggregate(total=Sum("total_amount"))["total"] or 0),
            })

        return Response({
            "total_turfs": total_turfs,
            "active_turfs": active_turfs,
            "total_bookings": total_bookings,
            "today_bookings": today_bookings,
            "today_revenue": float(today_revenue),
            "total_revenue": float(total_revenue),
            "total_slots": total_slots,
            "selected_turf_id": int(turf_id) if turf_id else None,
            "turf_breakdown": turf_breakdown,
        })


class BookingListAPIView(APIView):

    def get(self, request):
        booking_date = request.GET.get("date")
        mobile = request.GET.get("mobile")
        booking_code = request.GET.get("booking_code")
        turf_id = request.GET.get("turf_id")

        today = timezone.now().date()

        # Mark past confirmed bookings as completed
        Booking.objects.filter(
            booking_date__lt=today,
            status="Confirmed"
        ).update(status="Completed")

        bookings = Booking.objects.all()

        if turf_id:
            bookings = bookings.filter(turf_id=turf_id)

        if booking_date:
            bookings = bookings.filter(booking_date=booking_date)

        if mobile:
            bookings = bookings.filter(mobile__icontains=mobile)

        if booking_code:
            bookings = bookings.filter(booking_code__icontains=booking_code)

        serializer = BookingListSerializer(
            bookings.select_related("turf").order_by("-created_on"),
            many=True
        )

        return Response(serializer.data)


class CalendarAPIView(APIView):

    def get(self, request):
        booking_date = request.GET.get("date")
        if not booking_date:
            return Response({"error": "Date is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking_date = datetime.strptime(booking_date, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format."}, status=status.HTTP_400_BAD_REQUEST)

        turf = get_turf_for_request(request)
        if not turf:
            return Response({"error": "Turf not found."}, status=status.HTTP_404_NOT_FOUND)

        booked_slot_ids = BookingSlot.objects.filter(
            booking__turf=turf,
            booking__booking_date=booking_date,
            booking__status__in=["Confirmed", "Completed"]
        ).values_list("slot_id", flat=True)

        booked_slots = Slot.objects.filter(id__in=booked_slot_ids)
        all_slots = Slot.objects.all()

        full_day_closure = TurfClosure.objects.filter(
            turf=turf,
            date=booking_date,
            is_full_day=True
        ).first()

        if full_day_closure:
            closed_slots = all_slots.exclude(id__in=booked_slot_ids)
            available_slots = Slot.objects.none()
        else:
            closures = TurfClosure.objects.filter(
                turf=turf,
                date=booking_date,
                is_full_day=False
            )

            closed_slot_ids = []
            for slot in all_slots:
                if slot.id in booked_slot_ids:
                    continue

                for closure in closures:
                    if not closure.start_time or not closure.end_time:
                        continue

                    if slot.end_time > slot.start_time:
                        overlaps = (
                            slot.start_time < closure.end_time
                            and slot.end_time > closure.start_time
                        )
                    else:
                        overlaps = (
                            slot.start_time < closure.end_time
                            or slot.end_time > closure.start_time
                        )

                    if overlaps:
                        closed_slot_ids.append(slot.id)
                        break

            closed_slots = Slot.objects.filter(id__in=closed_slot_ids)
            available_slots = all_slots.exclude(
                id__in=booked_slot_ids
            ).exclude(
                id__in=closed_slot_ids
            )

        return Response({
            "turf": {
                "id": turf.id,
                "name": turf.name,
            },
            "booked_slots": SlotListSerializer(booked_slots, many=True).data,
            "available_slots": SlotListSerializer(available_slots, many=True).data,
            "closed_slots": SlotListSerializer(closed_slots, many=True).data,
            "closure": {
                "type": "full_day",
                "reason": full_day_closure.reason
            } if full_day_closure else None
        })


class CancelBookingAPIView(APIView):

    def delete(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        BookingSlot.objects.filter(booking=booking).delete()
        booking.status = "Cancelled"
        booking.save()
        return Response({"message": "Booking Cancelled Successfully"})


class CustomerCancelBookingAPIView(APIView):

    def post(self, request):
        booking_code = request.data.get("booking_code")
        if not booking_code:
            return Response({"error": "Booking Code is required."}, status=status.HTTP_400_BAD_REQUEST)

        booking = Booking.objects.filter(booking_code=booking_code).first()
        if not booking:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.status == "Cancelled":
            return Response({"error": "Booking is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        if booking.status == "Completed":
            return Response({"error": "Completed booking cannot be cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        BookingSlot.objects.filter(booking=booking).delete()
        booking.status = "Cancelled"
        booking.save()

        return Response({"message": "Booking cancelled successfully."})


class RevenueAPIView(APIView):

    def get(self, request):
        turf_id = request.GET.get("turf_id")
        bookings = Booking.objects.exclude(status="Cancelled")
        if turf_id:
            bookings = bookings.filter(turf_id=turf_id)

        revenue = (
            bookings
            .annotate(month=TruncMonth("booking_date"))
            .values("month")
            .annotate(revenue=Sum("total_amount"))
            .order_by("month")
        )
        return Response(revenue)


class RevenueAnalyticsAPIView(APIView):

    def get(self, request):
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)
        turf_id = request.GET.get("turf_id")

        bookings = Booking.objects.all()
        if turf_id:
            bookings = bookings.filter(turf_id=turf_id)

        non_cancelled = bookings.exclude(status="Cancelled")

        today_revenue = (
            non_cancelled.filter(booking_date=today).aggregate(total=Sum("total_amount"))["total"] or 0
        )
        weekly_revenue = (
            non_cancelled.filter(booking_date__gte=week_start).aggregate(total=Sum("total_amount"))["total"] or 0
        )
        monthly_revenue = (
            non_cancelled.filter(booking_date__gte=month_start).aggregate(total=Sum("total_amount"))["total"] or 0
        )
        total_revenue = (
            non_cancelled.aggregate(total=Sum("total_amount"))["total"] or 0
        )

        today_bookings = non_cancelled.filter(booking_date=today).count()
        confirmed = bookings.filter(status="Confirmed").count()
        cancelled = bookings.filter(status="Cancelled").count()
        completed = bookings.filter(status="Completed").count()

        # Include turf-wise revenue summary
        turf_summary = []
        for t in Turf.objects.all().order_by("id"):
            t_rev = Booking.objects.filter(turf=t).exclude(status="Cancelled").aggregate(total=Sum("total_amount"))["total"] or 0
            turf_summary.append({
                "turf_id": t.id,
                "turf_name": t.name,
                "revenue": float(t_rev),
                "bookings_count": Booking.objects.filter(turf=t).exclude(status="Cancelled").count(),
            })

        return Response({
            "today_revenue": float(today_revenue),
            "weekly_revenue": float(weekly_revenue),
            "monthly_revenue": float(monthly_revenue),
            "total_revenue": float(total_revenue),
            "today_bookings": today_bookings,
            "confirmed": confirmed,
            "cancelled": cancelled,
            "completed": completed,
            "turf_summary": turf_summary,
        })


class RevenueSummaryAPIView(APIView):

    def get(self, request):
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)
        turf_id = request.GET.get("turf_id")

        bookings = Booking.objects.exclude(status="Cancelled")
        if turf_id:
            bookings = bookings.filter(turf_id=turf_id)

        today_revenue = bookings.filter(booking_date=today).aggregate(total=Sum("total_amount"))["total"] or 0
        weekly_revenue = bookings.filter(booking_date__gte=week_start).aggregate(total=Sum("total_amount"))["total"] or 0
        monthly_revenue = bookings.filter(booking_date__gte=month_start).aggregate(total=Sum("total_amount"))["total"] or 0

        return Response({
            "today_revenue": float(today_revenue),
            "weekly_revenue": float(weekly_revenue),
            "monthly_revenue": float(monthly_revenue),
        })


class RevenueReportAPIView(APIView):

    def get(self, request):
        from_date = request.GET.get("from_date")
        to_date = request.GET.get("to_date")
        turf_id = request.GET.get("turf_id")

        if not from_date or not to_date:
            return Response(
                {"error": "from_date and to_date are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        bookings_qs = Booking.objects.filter(
            booking_date__range=[from_date, to_date]
        )
        if turf_id:
            bookings_qs = bookings_qs.filter(turf_id=turf_id)

        report = (
            bookings_qs.exclude(status="Cancelled")
            .values("booking_date")
            .annotate(
                bookings=Count("id"),
                revenue=Sum("total_amount"),
                completed=Count("id", filter=Q(status="Completed")),
                confirmed=Count("id", filter=Q(status="Confirmed")),
                cancelled=Count("id", filter=Q(status="Cancelled")),
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
                "revenue": float(item["revenue"] or 0),
                "completed": item["completed"],
                "confirmed": item["confirmed"],
                "cancelled": item["cancelled"],
            })
            totals["bookings"] += item["bookings"]
            totals["revenue"] += float(item["revenue"] or 0)
            totals["completed"] += item["completed"]
            totals["confirmed"] += item["confirmed"]
            totals["cancelled"] += item["cancelled"]

        return Response({
            "period": {"from": from_date, "to": to_date},
            "generated_on": timezone.now(),
            "rows": rows,
            "totals": totals,
        })


class BookingHistoryAPIView(APIView):

    def get(self, request):
        booking_code = request.GET.get("booking_code")
        mobile = request.GET.get("mobile")

        if booking_code:
            booking = Booking.objects.select_related("turf").filter(booking_code=booking_code).first()
            if not booking:
                return Response({"error": "Booking Not Found"}, status=status.HTTP_404_NOT_FOUND)
            serializer = BookingHistorySerializer(booking)
            return Response({"type": "single", "booking": serializer.data})

        if mobile:
            bookings = Booking.objects.select_related("turf").filter(mobile=mobile).order_by("-booking_date")
            if not bookings.exists():
                return Response({"error": "No Bookings Found"}, status=status.HTTP_404_NOT_FOUND)
            serializer = BookingHistorySerializer(bookings, many=True)
            return Response({"type": "multiple", "bookings": serializer.data})

        return Response(
            {"error": "Booking Code or Mobile Number is required"},
            status=status.HTTP_400_BAD_REQUEST
        )


class ExportRevenuePDFAPIView(APIView):

    def get(self, request):
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)
        turf_id = request.GET.get("turf_id")

        bookings = Booking.objects.all()
        turf_title = "All Turfs Combined"
        if turf_id:
            turf = Turf.objects.filter(id=turf_id).first()
            if turf:
                turf_title = turf.name
            bookings = bookings.filter(turf_id=turf_id)

        non_cancelled = bookings.exclude(status="Cancelled")

        today_revenue = non_cancelled.filter(booking_date=today).aggregate(total=Sum("total_amount"))["total"] or 0
        weekly_revenue = non_cancelled.filter(booking_date__gte=week_start).aggregate(total=Sum("total_amount"))["total"] or 0
        monthly_revenue = non_cancelled.filter(booking_date__gte=month_start).aggregate(total=Sum("total_amount"))["total"] or 0
        total_revenue = non_cancelled.aggregate(total=Sum("total_amount"))["total"] or 0

        today_bookings = non_cancelled.filter(booking_date=today).count()
        confirmed = bookings.filter(status="Confirmed").count()
        cancelled = bookings.filter(status="Cancelled").count()
        completed = bookings.filter(status="Completed").count()

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{turf_title.replace(" ", "_")}_Revenue_Report.pdf"'

        doc = SimpleDocTemplate(response)
        styles = getSampleStyleSheet()
        elements = []

        elements.append(Paragraph(f"<b><font size=20>{turf_title}</font></b>", styles["Title"]))
        elements.append(Paragraph("<b>Revenue Report</b>", styles["Heading2"]))
        elements.append(Paragraph(f"Generated On : {today}", styles["Normal"]))
        elements.append(Spacer(1, 20))

        data = [
            ["Metric", "Value"],
            ["Today's Revenue", f"₹ {today_revenue}"],
            ["Weekly Revenue", f"₹ {weekly_revenue}"],
            ["Monthly Revenue", f"₹ {monthly_revenue}"],
            ["Total Revenue", f"₹ {total_revenue}"],
            ["Today's Bookings", str(today_bookings)],
            ["Confirmed", str(confirmed)],
            ["Cancelled", str(cancelled)],
            ["Completed", str(completed)],
        ]

        table = Table(data)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.green),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
        ]))

        elements.append(table)
        doc.build(elements)
        return response


class ExportReportPDFAPIView(APIView):

    def get(self, request):
        from_date = request.GET.get("from_date")
        to_date = request.GET.get("to_date")
        turf_id = request.GET.get("turf_id")

        if not from_date or not to_date:
            return Response(
                {"error": "from_date and to_date are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        turf_title = "All Turfs Combined"
        bookings = Booking.objects.filter(booking_date__range=[from_date, to_date])
        if turf_id:
            turf = Turf.objects.filter(id=turf_id).first()
            if turf:
                turf_title = turf.name
            bookings = bookings.filter(turf_id=turf_id)

        report = (
            bookings.exclude(status="Cancelled")
            .values("booking_date")
            .annotate(
                bookings=Count("id"),
                revenue=Sum("total_amount"),
                completed=Count("id", filter=Q(status="Completed")),
                confirmed=Count("id", filter=Q(status="Confirmed")),
            )
            .order_by("booking_date")
        )

        totals = {"bookings": 0, "revenue": 0, "completed": 0, "confirmed": 0}
        for item in report:
            totals["bookings"] += item["bookings"]
            totals["revenue"] += (item["revenue"] or 0)
            totals["completed"] += item["completed"]
            totals["confirmed"] += item["confirmed"]

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{turf_title.replace(" ", "_")}_Report.pdf"'

        doc = SimpleDocTemplate(response)
        styles = getSampleStyleSheet()
        elements = []

        elements.append(Paragraph(f"<b><font size='22' color='green'>{turf_title}</font></b>", styles["Title"]))
        elements.append(Paragraph("<b>Turf Booking Management System</b>", styles["Heading2"]))
        elements.append(Spacer(1, 20))
        elements.append(Paragraph(f"<b>Report Period :</b> {from_date} to {to_date}", styles["Normal"]))
        elements.append(Paragraph(f"<b>Generated On :</b> {timezone.now().strftime('%d-%m-%Y %I:%M %p')}", styles["Normal"]))
        elements.append(Spacer(1, 15))

        summary_data = [
            ["Metric", "Value"],
            ["Total Bookings", str(totals["bookings"])],
            ["Total Revenue", f"₹ {totals['revenue']}"],
            ["Completed", str(totals["completed"])],
            ["Confirmed", str(totals["confirmed"])],
        ]
        summary_table = Table(summary_data, colWidths=[220, 220])
        summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkgreen),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))

        table_data = [["Date", "Bookings", "Revenue", "Completed", "Confirmed"]]
        for item in report:
            table_data.append([
                item["booking_date"].strftime("%d-%m-%Y"),
                str(item["bookings"]),
                f"₹ {item['revenue'] or 0}",
                str(item["completed"]),
                str(item["confirmed"]),
            ])

        table_data.append([
            "TOTAL",
            str(totals["bookings"]),
            f"₹ {totals['revenue']}",
            str(totals["completed"]),
            str(totals["confirmed"]),
        ])

        report_table = Table(table_data, colWidths=[90, 80, 100, 90, 90])
        report_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkgreen),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
            ("BACKGROUND", (0, 1), (-1, -2), colors.beige),
            ("BACKGROUND", (0, -1), (-1, -1), colors.lightgreen),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ]))
        elements.append(report_table)

        doc.build(elements)
        return response