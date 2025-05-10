# Full Stack Application

This is a full-stack application with a React frontend and Django backend.

## Project Structure

```
.
├── frontend/          # React frontend application
└── backend/          # Django backend application
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Run migrations:
    ```bash
    python manage.py migrate
    ```
5. Start the development server:
    ```bash
    python manage.py runserver
    ```

### Frontend Setup

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm start
    ```

## Development

-   Backend runs on http://localhost:8000
-   Frontend runs on http://localhost:3000
