from rest_framework import serializers
from .models import Slot, Booking, BookingSlot


class SlotSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, read_only=True)

    class Meta:
        model = Slot
        fields = "__all__"


class BookingSerializer(serializers.ModelSerializer):
    slots = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        allow_empty=False,
    )

    class Meta:
        model = Booking
        fields = [
            "turf",
            "customer_name",
            "mobile",
            "email",
            "booking_date",
            "total_amount",
            "slots",
        ]


class BookingListSerializer(serializers.ModelSerializer):
    turf_id = serializers.IntegerField(source="turf.id", read_only=True)
    turf_name = serializers.CharField(source="turf.name", read_only=True)
    slots = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "turf",
            "turf_id",
            "turf_name",
            "booking_code",
            "customer_name",
            "mobile",
            "email",
            "booking_date",
            "total_amount",
            "status",
            "payment_status",
            "payment_id",
            "order_id",
            "slots",
        ]

    def get_slots(self, obj):
        booking_slots = BookingSlot.objects.filter(
            booking=obj
        ).select_related("slot")

        return [
            {
                "id": slot.slot.id,
                "start_time": slot.slot.start_time.strftime("%I:%M %p"),
                "end_time": slot.slot.end_time.strftime("%I:%M %p"),
            }
            for slot in booking_slots
        ]


class SlotListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Slot
        fields = "__all__"


class BookingHistorySerializer(serializers.ModelSerializer):
    turf_name = serializers.CharField(source="turf.name", read_only=True)
    turf_location = serializers.CharField(source="turf.location", read_only=True)
    turf_city = serializers.CharField(source="turf.city", read_only=True)
    turf_phone = serializers.CharField(source="turf.phone", read_only=True)
    slots = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "booking_code",
            "turf_name",
            "turf_location",
            "turf_city",
            "turf_phone",
            "customer_name",
            "mobile",
            "email",
            "booking_date",
            "total_amount",
            "status",
            "payment_status",
            "payment_method",
            "created_on",
            "slots",
        ]

    def get_slots(self, obj):
        booking_slots = BookingSlot.objects.filter(
            booking=obj
        ).select_related("slot")

        return [
            {
                "start_time": item.slot.start_time.strftime("%I %p"),
                "end_time": item.slot.end_time.strftime("%I %p"),
            }
            for item in booking_slots
        ]