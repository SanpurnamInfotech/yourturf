from django.db import models


class TurfSettings(models.Model):

    day_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=800
    )

    night_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1000
    )

    holiday_from = models.DateField(
        null=True,
        blank=True
    )

    holiday_to = models.DateField(
        null=True,
        blank=True
    )

    holiday_reason = models.CharField(
        max_length=200,
        blank=True
    )

    updated_on = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        verbose_name = "Turf Settings"
        verbose_name_plural = "Turf Settings"

    def __str__(self):
        return "Sanpurnam Turf Settings"

class Holiday(models.Model):

    holiday_from = models.DateField()

    holiday_to = models.DateField()

    reason = models.CharField(
        max_length=200
    )

    created_on = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        ordering = ["-holiday_from"]

    def __str__(self):

        return f"{self.holiday_from} - {self.holiday_to}"

    