from django.shortcuts import render
from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer

# Create your views here.

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        project_id = self.request.query_params.get('project', None)
        if not project_id:
            return Task.objects.none()  # Return empty queryset if no project_id provided
        return Task.objects.filter(project__project_id=project_id).order_by('-creation_date')
