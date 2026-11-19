from datetime import timedelta, time

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory

from bookings.models import Booking, BookingSlot, Slot
from bookings.views import (
    AvailableTurfsAPIView,
    get_slot_availability,
    has_overlapping_slots,
)
from turf.models import Turf, TurfClosure


class BookingAvailabilityTests(TestCase):

    def setUp(self):
        self.booking_date = timezone.now().date() + timedelta(days=1)
        self.turf = self.create_turf("Main Turf")
        self.other_turf = self.create_turf("Second Turf")
        self.morning_slot = Slot.objects.create(
            start_time=time(10, 0),
            end_time=time(11, 0),
        )
        self.later_slot = Slot.objects.create(
            start_time=time(11, 0),
            end_time=time(12, 0),
        )

    def create_turf(self, name, is_active=True):
        return Turf.objects.create(
            name=name,
            description="",
            location="Test location",
            phone="1234567890",
            is_active=is_active,
            opening_time=time(6, 0),
            closing_time=time(23, 0),
        )

    def test_partial_closure_removes_overlapping_slot(self):
        TurfClosure.objects.create(
            turf=self.turf,
            date=self.booking_date,
            start_time=time(10, 0),
            end_time=time(11, 0),
        )

        availability = get_slot_availability(self.turf, self.booking_date)

        self.assertEqual(
            list(availability["available_slots"].values_list("id", flat=True)),
            [self.later_slot.id],
        )
        self.assertEqual(
            list(availability["closed_slots"].values_list("id", flat=True)),
            [self.morning_slot.id],
        )

    def test_full_day_closure_marks_turf_unavailable(self):
        TurfClosure.objects.create(
            turf=self.turf,
            date=self.booking_date,
            is_full_day=True,
            reason="Maintenance",
        )

        availability = get_slot_availability(self.turf, self.booking_date)

        self.assertFalse(availability["available_slots"].exists())
        self.assertEqual(availability["closure"]["reason"], "Maintenance")

    def test_bookings_are_scoped_to_the_selected_turf(self):
        booking = Booking.objects.create(
            turf=self.other_turf,
            customer_name="Test Customer",
            mobile="1234567890",
            email="test@example.com",
            booking_date=self.booking_date,
            total_amount=800,
        )
        BookingSlot.objects.create(booking=booking, slot=self.morning_slot)

        availability = get_slot_availability(self.turf, self.booking_date)

        self.assertIn(
            self.morning_slot.id,
            availability["available_slots"].values_list("id", flat=True),
        )

    def test_overlapping_slot_reservation_blocks_conflicting_times(self):
        overlapping_slot = Slot.objects.create(
            start_time=time(10, 30),
            end_time=time(11, 30),
        )
        booking = Booking.objects.create(
            turf=self.turf,
            customer_name="Test Customer",
            mobile="1234567890",
            email="test@example.com",
            booking_date=self.booking_date,
            total_amount=800,
        )
        BookingSlot.objects.create(booking=booking, slot=overlapping_slot)

        availability = get_slot_availability(self.turf, self.booking_date)
        available_ids = set(
            availability["available_slots"].values_list("id", flat=True)
        )
        booked_ids = set(
            availability["booked_slots"].values_list("id", flat=True)
        )

        self.assertNotIn(self.morning_slot.id, available_ids)
        self.assertNotIn(self.later_slot.id, available_ids)
        self.assertIn(self.morning_slot.id, booked_ids)
        self.assertIn(self.later_slot.id, booked_ids)

    def test_selected_slots_cannot_overlap_each_other(self):
        overlapping_slot = Slot.objects.create(
            start_time=time(10, 30),
            end_time=time(11, 30),
        )

        self.assertTrue(
            has_overlapping_slots(
                [self.morning_slot, overlapping_slot],
                self.booking_date,
            )
        )
        self.assertFalse(
            has_overlapping_slots(
                [self.morning_slot, self.later_slot],
                self.booking_date,
            )
        )

    def test_overnight_booking_blocks_overlapping_next_day_slot(self):
        overnight_slot = Slot.objects.create(
            start_time=time(23, 0),
            end_time=time(1, 0),
        )
        early_slot = Slot.objects.create(
            start_time=time(0, 0),
            end_time=time(1, 0),
        )
        booking = Booking.objects.create(
            turf=self.turf,
            customer_name="Test Customer",
            mobile="1234567890",
            email="test@example.com",
            booking_date=self.booking_date - timedelta(days=1),
            total_amount=1000,
        )
        BookingSlot.objects.create(booking=booking, slot=overnight_slot)

        availability = get_slot_availability(self.turf, self.booking_date)

        self.assertIn(
            early_slot.id,
            availability["booked_slots"].values_list("id", flat=True),
        )

    def test_bookable_turf_list_excludes_inactive_turfs(self):
        inactive_turf = self.create_turf("Inactive Turf", is_active=False)
        request = APIRequestFactory().get(
            "/api/bookable-turfs/",
            {"date": self.booking_date.isoformat()},
        )

        response = AvailableTurfsAPIView.as_view()(request)
        turf_ids = [item["id"] for item in response.data]

        self.assertIn(self.turf.id, turf_ids)
        self.assertIn(self.other_turf.id, turf_ids)
        self.assertNotIn(inactive_turf.id, turf_ids)
        self.assertTrue(response.data[0]["availability"]["is_bookable"])
