FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build once to ensure dist exists, but CMD will run dev
RUN npm run build

EXPOSE 3001

# Default to production, but compose can override to 'npm run dev'
CMD ["npm", "start"]
