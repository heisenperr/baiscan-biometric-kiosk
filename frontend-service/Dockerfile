# Development Dockerfile for Next.js
FROM node:20-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the development port
EXPOSE 3000

# Set environment variables for Hot Reloading correctly
ENV WATCHPACK_POLLING=true

# Start Next.js in development mode
CMD ["npm", "run", "dev"]
