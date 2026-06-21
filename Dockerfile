# ---------------------------------------------------------
# Stage 1: Build the React Frontend
# ---------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Build the frontend
COPY frontend/ ./
RUN npm run build

# ---------------------------------------------------------
# Stage 2: Build the FastAPI Backend & Serve
# ---------------------------------------------------------
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from Stage 1 into the location expected by main.py
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (Cloud Run uses 8080 by default, but we can set it via env)
ENV PORT=8080
EXPOSE $PORT

# Command to run the FastAPI app
CMD ["sh", "-c", "cd backend && uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
