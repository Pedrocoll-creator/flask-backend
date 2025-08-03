# Stage 1: Build React frontend
FROM node:18 AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src/ src/
COPY public/ public/
COPY index.html .
COPY vite.config.js .
COPY tailwind.config.js .
COPY postcss.config.js .
RUN npm run build

# Stage 2: Flask backend
FROM python:3.11
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy React build to Flask static folder
COPY --from=frontend-build /app/dist ./static/

# Expose port
EXPOSE 5000

# Start Flask app
CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "app:app"]