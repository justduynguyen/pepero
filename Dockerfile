# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Compile seed script
RUN npx tsc prisma/seed.ts --module CommonJS --moduleResolution node --target ES2020 --skipLibCheck --esModuleInterop

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set production environment
ENV NODE_ENV=production

# Copy package files and install production dependencies (needed for seed script)
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Copy Prisma configuration and schema
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/prisma/schema.prisma ./prisma/
COPY --from=builder /app/prisma/migrations ./prisma/migrations
RUN npx prisma generate

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma/seed.js ./prisma/seed.js

# Expose port
EXPOSE 3000

# Set environment variables (will be overridden by docker-compose or Portainer)
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
