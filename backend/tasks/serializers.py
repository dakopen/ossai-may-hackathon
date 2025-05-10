from rest_framework import serializers
from .models import Task, TaskStatus

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'task_id', 'project', 'title', 'description', 'status',
            'estimated_effort', 'actual_effort',
            'creation_date', 'due_date', 'completion_date', 'dependencies'
        ]
        read_only_fields = ['task_id', 'creation_date'] 