# Lightweight Python image for Raspberry Pi
FROM python:3.11-slim

# Prevent Python from buffering logs
ENV PYTHONUNBUFFERED=1
# Force Adafruit-Blinka to use libgpiod backend
ENV BLINKA_GPIO_MODE=libgpiod
# Link system-installed libraries if necessary
ENV PYTHONPATH="${PYTHONPATH}:/usr/lib/python3/dist-packages"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    i2c-tools \
    libi2c-dev \
    libgpiod-dev \
    gpiod \
    python3-dev \
    python3-setuptools \
    python3-wheel \
    swig \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# Run main service
CMD ["python", "main.py"]