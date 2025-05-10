from django.db import models
from django.utils import timezone

class Project(models.Model):
    project_id = models.UUIDField(primary_key=True, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField()
    creation_date = models.DateTimeField(default=timezone.now)
    last_update_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-creation_date']
