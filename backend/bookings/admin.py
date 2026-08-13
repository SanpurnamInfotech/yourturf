from django.contrib import admin
from .models import Slot, Booking, BookingSlot

admin.site.register(Slot)
admin.site.register(Booking)
admin.site.register(BookingSlot)