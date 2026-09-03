# Library Management System

Sistem Informasi Manajemen Perpustakaan (Library Management System) berbasis Web. Dibangun menggunakan teknologi modern dengan performa tinggi.

## Teknologi yang Digunakan
- **Frontend**: React 19 + TypeScript, Tailwind CSS v4, Vite 8
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: MySQL
- **Package Manager**: pnpm

---

## Prasyarat (Prerequisites)

Pilih salah satu metode instalasi yang ingin Anda gunakan.
Jika Anda bekerja dalam tim, **Sangat disarankan menggunakan Metode 1 (Docker)**.

* **Untuk Metode 1:** Pastikan Anda sudah menginstal [Docker Desktop](https://www.docker.com/products/docker-desktop/).
* **Untuk Metode 2:** Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi 22 disarankan) dan mengaktifkan pnpm (`corepack enable pnpm`).

---

## Cara Instalasi & Menjalankan (Metode 1: Menggunakan Docker - DIREKOMENDASIKAN)

Metode ini memastikan seluruh anggota tim menggunakan sistem dan konfigurasi yang sama persis tanpa perlu repot menginstal Node.js secara manual.

1. **Clone repositori ini** (jika menggunakan Git):
   ```bash
   git clone <url-repositori-anda>
   cd "Library Management System"
   ```

2. **Siapkan Database MySQL Lokal:**
   Pastikan Anda memiliki database MySQL (melalui XAMPP, Laragon, dll.) yang berjalan di komputer lokal Anda dengan nama database sesuai konfigurasi.

3. **Jalankan Aplikasi (Frontend & Backend):**
   ```bash
   docker-compose up -d --build
   ```

4. **Akses Aplikasi:**
   - **Frontend**: Kunjungi `http://localhost:5173` atau `http://localhost:8443`
   - **Backend API**: Berjalan di `http://localhost:5050`
   
   > 💡 **Info:** Sistem *Hot Reload* sudah aktif. Jika Anda mengubah kode di dalam folder `src/` atau `server/`, tampilan dan logika akan otomatis diperbarui.

5. **Mematikan Aplikasi:**
   ```bash
   docker-compose down
   ```

---

## Cara Instalasi & Menjalankan (Metode 2: Tanpa Docker)

Jika Anda ingin menjalankannya secara lokal tanpa Docker:

1. **Install Dependencies (Frontend & Backend):**
   ```bash
   # Di folder utama (Frontend)
   pnpm install
   
   # Buka tab terminal baru, masuk ke folder server (Backend)
   cd server
   npm install
   npx prisma generate
   ```

2. **Jalankan Development Server:**
   ```bash
   # Di tab terminal utama (Frontend)
   pnpm run dev
   
   # Di tab terminal server (Backend)
   npm run dev
   ```

---

## Panduan Deployment (Production)

Proyek ini sudah dilengkapi dengan konfigurasi *Multi-stage Docker build* menggunakan **Nginx** untuk performa tinggi saat production.

1. **Build Docker Image:**
   ```bash
   docker build --target production -t library-app-prod .
   ```

2. **Jalankan Container (Production):**
   ```bash
   docker run -d -p 80:80 library-app-prod
   ```
   Aplikasi sekarang dapat diakses secara publik pada server Anda melalui port 80.
