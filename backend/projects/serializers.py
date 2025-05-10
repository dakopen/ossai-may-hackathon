from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['project_id', 'name', 'description', 'creation_date', 'last_update_date']
        read_only_fields = ['project_id', 'creation_date', 'last_update_date'] 