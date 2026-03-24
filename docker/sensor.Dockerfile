# Lightweight Python image for Raspberry Pi
FROM python:3.11-slim

# Prevent Python from buffering logs
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    swig \
    python3-dev \
    python3-pip \
    i2c-tools \
    libi2c-dev \
    git \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# Run main service unbuffered
CMD ["python3", "-u", "main.py"]