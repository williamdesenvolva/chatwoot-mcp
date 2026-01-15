# Build stage for backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Build stage for admin panel
FROM node:20-alpine AS admin-builder

WORKDIR /app

# Copy admin panel files
COPY admin-panel/package*.json ./

# Install dependencies
RUN npm ci

# Copy admin panel source
COPY admin-panel/ ./

# Build React app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built backend files
COPY --from=backend-builder /app/dist/ ./dist/

# Copy SQL migrations (they're not compiled, so copy from source)
COPY src/admin/database/migrations/ ./dist/admin/database/migrations/

# Copy admin panel static files
COPY --from=admin-builder /app/dist/ ./admin-panel/dist/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Run the HTTP server
CMD ["node", "dist/http-server.js"]
