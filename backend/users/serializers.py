from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'username', 'email', 'description', 'first_name', 'last_name']
        read_only_fields = ['user_id']
        extra_kwargs = {'password': {'write_only': True}} 