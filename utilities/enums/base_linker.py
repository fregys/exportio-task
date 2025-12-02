from django.db import models

class BaseLinkStatus(models.TextChoices):
    ERROR = "ERROR"
    SUCCESS = "SUCCESS"