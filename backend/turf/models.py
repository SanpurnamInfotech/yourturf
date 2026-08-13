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