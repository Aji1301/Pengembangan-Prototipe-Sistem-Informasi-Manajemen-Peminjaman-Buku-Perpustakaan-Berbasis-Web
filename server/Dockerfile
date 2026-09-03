# ==========================================
# STAGE 1: Base (Setup Environment)
# ==========================================
FROM node:22-alpine AS base
WORKDIR /app
# Enable corepack for pnpm if needed, but we can also just use npm since package-lock is present
# The server folder has package-lock.json so we'll use npm.
RUN npm install -g typescript tsx

# ==========================================
# STAGE 2: Development (Hot Reloading)
# ==========================================
FROM base AS development
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Default port
EXPOSE 5050

# Run development server
CMD ["npm", "run", "dev"]
