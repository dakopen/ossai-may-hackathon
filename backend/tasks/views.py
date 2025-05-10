from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
import logging
import re

# Set up logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get API key and configure Gemini AI
api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    logger.error("GOOGLE_API_KEY not found in environment variables")
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')
except Exception as e:
    logger.error(f"Failed to configure Gemini AI: {str(e)}")
    raise

# Create your views here.

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    lookup_field = 'task_id'

    def get_queryset(self):
        queryset = Task.objects.all()
        project = self.request.query_params.get('project', None)
        if project is not None:
            queryset = queryset.filter(project=project)
        return queryset

    def get_object(self):
        task_id = self.kwargs.get('task_id')
        return Task.objects.get(task_id=task_id)

    @action(detail=True, methods=['post'])
    def generate_prompt(self, request, task_id=None):
        try:
            task = self.get_object()
            logger.info(f"Generating prompt for task: {task.title}")
            
            # Create a prompt for Gemini
            prompt = f"""Given the following task, generate a detailed prompt that can be used with an AI coding assistant (like Cursor or GitHub Copilot) to implement this task. 
            The prompt should be clear, specific, and include any necessary context or requirements.

            Task Title: {task.title}
            Task Description: {task.description}
            Estimated Effort: {task.estimated_effort} hours

            Generate a prompt that:
            1. Clearly states the objective
            2. Includes any specific requirements or constraints
            3. Suggests the approach or implementation strategy
            4. Mentions any relevant technologies or frameworks
            5. Specifies any performance or quality requirements

            Return ONLY the prompt text itself, without any markdown formatting, JSON, or other special formatting. The response should be plain text that can be directly used with an AI coding assistant."""

            logger.info("Sending request to Gemini API")
            # Generate response from Gemini
            response = model.generate_content(prompt)
            
            # Extract text from response
            if response.text:
                generated_prompt = response.text
            else:
                # Try to get text from parts if direct text is not available
                generated_prompt = response.parts[0].text if response.parts else ""
            
            logger.info("Received response from Gemini API")

            if not generated_prompt:
                raise ValueError("Empty response from Gemini")

            # Clean up the response
            # Remove any markdown code blocks
            generated_prompt = re.sub(r'^```.*\n', '', generated_prompt)
            generated_prompt = re.sub(r'\n```$', '', generated_prompt)
            # Remove any JSON formatting
            generated_prompt = re.sub(r'^json\n', '', generated_prompt)
            # Remove any leading/trailing whitespace
            generated_prompt = generated_prompt.strip()

            return Response({
                'prompt': generated_prompt
            })
        except Exception as e:
            logger.error(f"Error generating prompt: {str(e)}", exc_info=True)
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
