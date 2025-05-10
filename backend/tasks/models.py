from django.db import models
from django.utils import timezone
from projects.models import Project
import uuid

class TaskStatus(models.TextChoices):
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    BLOCKED = "Blocked"
    IN_REVIEW = "In Review"
    COMPLETED = "Completed"

class Task(models.Model):
    task_id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=TaskStatus.choices,
        default=TaskStatus.TODO
    )
    estimated_effort = models.FloatField(null=True, blank=True)
    actual_effort = models.FloatField(null=True, blank=True)
    creation_date = models.DateTimeField(default=timezone.now)
    due_date = models.DateTimeField(null=True, blank=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    dependencies = models.ManyToManyField('self', symmetrical=False, blank=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-creation_date']
