from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    user_id = models.UUIDField(primary_key=True, editable=False)
    description = models.TextField(help_text="Description of user's aptitudes, skills, and workload capacity")
    
    def __str__(self):
        return self.email

    class Meta:
        ordering = ['username']
