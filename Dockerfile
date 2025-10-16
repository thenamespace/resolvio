# Multi-stage build for NestJS backend + React frontend

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/landing-page

# Copy frontend package files
COPY landing-page/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY landing-page/ ./

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install backend dependencies
RUN npm ci

# Copy backend source
COPY src/ ./src/
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Build backend
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production

WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built backend from builder
COPY --from=backend-builder /app/dist ./dist

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/landing-page/dist ./public

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/main"]
