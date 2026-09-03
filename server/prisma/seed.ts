import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Categories
  await prisma.category.upsert({ where: { name: "Mata Pelajaran" }, update: {}, create: { name: "Mata Pelajaran" } });
  await prisma.category.upsert({ where: { name: "Dongeng Nusantara" }, update: {}, create: { name: "Dongeng Nusantara" } });
  await prisma.category.upsert({ where: { name: "Sains dan Alam" }, update: {}, create: { name: "Sains dan Alam" } });
  await prisma.category.upsert({ where: { name: "Sejarah" }, update: {}, create: { name: "Sejarah" } });

  // 2. Default Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.petugas.upsert({
    where: { email: "admin@kancil.com" },
    update: {},
    create: {
      name: "Admin Utama KANCIL",
      email: "admin@kancil.com",
      password: adminPassword,
      phone: "081234567890",
    },
  });

  // 3. Default Student Member
  const studentPassword = await bcrypt.hash("student123", 10);
  await prisma.member.upsert({
    where: { email: "siswa@kancil.com" },
    update: {},
    create: {
      name: "Ahmad Rizky",
      email: "siswa@kancil.com",
      password: studentPassword,
      nisNip: "2026101",
      kelas: "X-A",
      role: "STUDENT",
      phone: "089876543210",
    },
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

