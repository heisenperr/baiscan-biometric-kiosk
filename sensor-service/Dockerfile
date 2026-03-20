# Lightweight Python image for Raspberry Pi
FROM python:3.11-slim

# Prevent Python from buffering logs
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies (I2C)
RUN apt-get update && apt-get install -y \
    build-essential \
    i2c-tools \
    libi2c-dev \
    libgpiod2 \
    python3-dev \
    python3-setuptools \
    python3-wheel \
    swig \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# Run main service
CMD ["python", "main.py"]