from django.db import models


class Turf(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True,null=True)
    main_image = models.ImageField(upload_to="turf_main/",blank=True,null=True)
    about_image = models.ImageField(upload_to="turf_about/",blank=True,null=True)

    def __str__(self):
        return self.name


class TurfImage(models.Model):

    image = models.ImageField(
        upload_to="turf_images/"
    )

    uploaded_on = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.image.name

class TurfClosure(models.Model):

    turf = models.ForeignKey(
        Turf,
        on_delete=models.CASCADE,
        related_name="closures"
    )

    date = models.DateField()

    start_time = models.TimeField(
        null=True,
        blank=True
    )

    end_time = models.TimeField(
        null=True,
        blank=True
    )

    is_full_day = models.BooleanField(
        default=False
    )

    reason = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["date", "start_time"]

    def __str__(self):

        if self.is_full_day:
            return f"{self.turf.name} - {self.date} - Full Day"

        return (
            f"{self.turf.name} - "
            f"{self.date} - "
            f"{self.start_time} to {self.end_time}"
        )