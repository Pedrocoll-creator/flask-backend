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

FROM python:3.11
WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

COPY --from=frontend-build /app/dist ./static/

EXPOSE 5000

CMD gunicorn --bind 0.0.0.0:$PORT app:app