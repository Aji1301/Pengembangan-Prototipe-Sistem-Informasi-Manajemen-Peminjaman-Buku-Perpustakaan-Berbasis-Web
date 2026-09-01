# ==========================================
# STAGE 1: Base (Setup Environment & pnpm)
# ==========================================
FROM node:22-alpine AS base
# Mengaktifkan corepack agar bisa menggunakan pnpm
RUN corepack enable && corepack prepare pnpm@10.34.3 --activate
WORKDIR /app

# ==========================================
# STAGE 2: Development (Untuk tim / lokal)
# ==========================================
FROM base AS development
# Copy konfigurasi package
COPY package.json pnpm-lock.yaml ./
# Install semua dependencies
RUN pnpm install
# Copy seluruh kode sumber
COPY . .
# Ekspos port Vite (default Vite biasanya 5173, tapi konfigurasi lokal bisa berbeda)
EXPOSE 5173 8443
# Jalankan development server
CMD ["pnpm", "run", "dev"]

# ==========================================
# STAGE 3: Builder (Persiapan untuk Production)
# ==========================================
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
# Install dependencies untuk build
RUN pnpm install --frozen-lockfile
COPY . .
# Lakukan proses build (hasilnya akan ada di folder /app/dist)
RUN pnpm run build

# ==========================================
# STAGE 4: Production (Deploy menggunakan Nginx)
# ==========================================
FROM nginx:alpine AS production
# Hapus default nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy hasil build dari stage builder ke folder public nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Ekspos port 80 untuk web server nginx
EXPOSE 80
# Jalankan nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
