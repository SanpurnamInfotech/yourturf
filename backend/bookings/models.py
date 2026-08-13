from django.db import models
import uuid
from django.utils import timezone


class Slot(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.start_time} - {self.end_time}"


class Booking(models.Model):

    STATUS_CHOICES = [
        ("Confirmed", "Confirmed"),
        ("Cancelled", "Cancelled"),
        ("Completed", "Completed"),
    ]
    PAYMENT_STATUS = [
    ("Pending", "Pending"),
    ("Paid", "Paid"),
    ("Failed", "Failed"),
]

    PAYMENT_METHOD = [
    ("UPI", "UPI"),
    ("Card", "Card"),
    ("Net Banking", "Net Banking"),
]
    

    booking_code = models.CharField(
        max_length=20,
        unique=True,
        blank=True
    )

    customer_name = models.CharField(
        max_length=100
    )

    mobile = models.CharField(
        max_length=10
    )

    email = models.EmailField()

    booking_date = models.DateField()

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Confirmed",
    )

    payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
   )

    created_on = models.DateTimeField(
        default=timezone.now

    )

    payment_status = models.CharField(
    max_length=20,
    choices=PAYMENT_STATUS,
    default="Pending"
)

    payment_method = models.CharField(
    max_length=30,
    choices=PAYMENT_METHOD,
    blank=True,
    null=True
)

    transaction_id = models.CharField(
    max_length=100,
    blank=True,
    null=True
)

    payment_date = models.DateTimeField(
    blank=True,
    null=True
)

    def save(self, *args, **kwargs):

        if not self.booking_code:

            while True:

                code = "DT" + uuid.uuid4().hex[:6].upper()

                if not Booking.objects.filter(
                    booking_code=code
                ).exists():

                    self.booking_code = code

                    break

        super().save(*args, **kwargs)

    def __str__(self):
        return self.booking_code


class BookingSlot(models.Model):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE
    )

    slot = models.ForeignKey(
        Slot,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.booking.booking_code} - {self.slot}"