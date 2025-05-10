from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project
from .serializers import ProjectSerializer
from tasks.models import Task, TaskStatus
import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging
import json
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
    #model = genai.GenerativeModel('gemini-2.5-pro-exp-03-25')
    model = genai.GenerativeModel('gemini-2.0-flash')

except Exception as e:
    logger.error(f"Failed to configure Gemini AI: {str(e)}")
    raise

# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    @action(detail=True, methods=['post'])
    def generate_tasks(self, request, pk=None):
        project = self.get_object()
        
        try:
            # Get existing tasks to avoid duplicates
            existing_tasks = Task.objects.filter(project=project).values_list('title', flat=True)
            
            # Prepare prompt for Gemini
            prompt = f"""Given the following project details, generate a list of tasks that need to be completed. 
            For each task, provide a title, description, and estimated effort in hours.
            Format each task as a JSON object with 'title', 'description', and 'estimated_effort' fields.
            Return only a JSON array of tasks.

            Project Name: {project.name}
            Project Description: {project.description}
            
            Existing tasks (avoid duplicates): {list(existing_tasks)}
            
            Generate tasks that are specific, measurable, and achievable. Include tasks for planning, development, testing, and deployment phases."""

            logger.info(f"Generating tasks for project: {project.name}")
            
            # Generate tasks using Gemini
            response = model.generate_content(prompt)
            
            # Extract text from response
            if response.text:
                tasks_data = response.text
            else:
                # Try to get text from parts if direct text is not available
                tasks_data = response.parts[0].text if response.parts else ""
            
            logger.info(f"Received response from Gemini: {tasks_data}")
            
            if not tasks_data:
                raise ValueError("Empty response from Gemini")
            
            # Clean up the response by removing markdown code block markers
            tasks_data = re.sub(r'^```json\s*', '', tasks_data)
            tasks_data = re.sub(r'\s*```$', '', tasks_data)
            tasks_data = tasks_data.strip()
            
            # Parse the response and create tasks
            tasks = json.loads(tasks_data)
            
            created_tasks = []
            for task_data in tasks:
                # Skip if task with same title already exists
                if task_data['title'] in existing_tasks:
                    logger.info(f"Skipping duplicate task: {task_data['title']}")
                    continue
                    
                task = Task.objects.create(
                    project=project,
                    title=task_data['title'],
                    description=task_data['description'],
                    estimated_effort=task_data['estimated_effort'],
                    status=TaskStatus.TODO
                )
                created_tasks.append(task)
                logger.info(f"Created task: {task.title}")
            
            return Response({
                'message': f'Successfully generated {len(created_tasks)} tasks',
                'tasks': [{
                    'task_id': str(task.task_id),
                    'title': task.title,
                    'description': task.description,
                    'estimated_effort': task.estimated_effort,
                    'status': task.status
                } for task in created_tasks]
            }, status=status.HTTP_201_CREATED)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {str(e)}")
            logger.error(f"Raw response: {tasks_data}")
            return Response({
                'error': f'Failed to parse AI response: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Failed to generate tasks: {str(e)}")
            return Response({
                'error': f'Failed to generate tasks: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
