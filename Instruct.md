cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py migrate
python manage.py runserver



cd frontend
npm start

