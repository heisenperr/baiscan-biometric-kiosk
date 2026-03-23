# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# 2. Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json to identify app
COPY --from=builder /app/package.json ./package.json
# Copy pruned node_modules
COPY --from=builder /app/node_modules ./node_modules
# Copy built dist
COPY --from=builder /app/dist ./dist

# Copy any other required runtime files (e.g. scripts, templates)
# COPY --from=builder /app/scripts ./scripts

EXPOSE 3001

CMD ["node", "dist/server.js"]
