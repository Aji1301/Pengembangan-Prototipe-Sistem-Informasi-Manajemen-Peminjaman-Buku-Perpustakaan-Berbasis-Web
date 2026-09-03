import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Password hashing
  const adminPassword = await bcrypt.hash("admin123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  // 2. Create Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@kancil.com" },
    update: {},
    create: {
      email: "admin@kancil.com",
      password: adminPassword,
      name: "Administrator Perpustakaan",
      role: "ADMIN",
      phone: "081234567890",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "siswa@kancil.com" },
    update: {},
    create: {
      email: "siswa@kancil.com",
      password: studentPassword,
      name: "Siswa Teladan",
      role: "STUDENT",
      nim: "2026001",
      phone: "089876543210",
    },
  });

  // 3. Create Categories
  const catFiksi = await prisma.category.upsert({
    where: { name: "Fiksi & Novel" },
    update: {},
    create: { name: "Fiksi & Novel", description: "Novel, cerpen, dan cerita fiksi" },
  });

  const catSains = await prisma.category.upsert({
    where: { name: "Sains & Teknologi" },
    update: {},
    create: { name: "Sains & Teknologi", description: "Buku seputar komputer, pemrograman, dan sains" },
  });

  const catSejarah = await prisma.category.upsert({
    where: { name: "Sejarah & Budaya" },
    update: {},
    create: { name: "Sejarah & Budaya", description: "Buku sejarah Indonesia dan dunia" },
  });

  // 4. Create Books
  await prisma.book.createMany({
    data: [
      {
        isbn: "978-602-03-3160-7",
        title: "Laskar Pelangi",
        author: "Andrea Hirata",
        publisher: "Bentang Pustaka",
        year: 2005,
        categoryId: catFiksi.id,
        stock: 5,
        availableStock: 5,
        description: "Cerita inspiratif 10 anak di Belitung.",
      },
      {
        isbn: "978-602-06-3317-6",
        title: "Pemrograman Web Modern dengan React & TypeScript",
        author: "Tim KANCIL",
        publisher: "Informatika Press",
        year: 2024,
        categoryId: catSains.id,
        stock: 3,
        availableStock: 3,
        description: "Panduan lengkap membangun aplikasi web modern.",
      },
      {
        isbn: "978-979-40-7080-2",
        title: "Sejarah Nusantara",
        author: "Prof. Sartono Kartodirdjo",
        publisher: "Gramedia",
        year: 2018,
        categoryId: catSejarah.id,
        stock: 4,
        availableStock: 4,
        description: "Sejarah perkembangan bangsa Indonesia dari masa ke masa.",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed database selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
