from rest_framework import serializers
from .models import *


class SlotSerializer(serializers.ModelSerializer):

    class Meta:
        model = Slot
        fields = "__all__"


class BookingSerializer(serializers.ModelSerializer):

    slots = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )

    class Meta:
        model = Booking
        fields = [
            "customer_name",
            "mobile",
            "email",
            "booking_date",
            "total_amount",
            "slots",
        ]

class BookingListSerializer(serializers.ModelSerializer):

    slots = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "booking_code",
            "customer_name",
            "mobile",
            "email",
            "booking_date",
            "total_amount",
            "status",
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

    slots = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "booking_code",
            "customer_name",
            "mobile",
            "email",
            "booking_date",
            "total_amount",
            "status",
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