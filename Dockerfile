FROM python:3.11

WORKDIR /app/backend

COPY backend/ /app/backend/

RUN pip install -r requirements.txt

CMD ["python", "app.py"]
