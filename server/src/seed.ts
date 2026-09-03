import { prisma } from "./prisma.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding initial ERD data...");

  // 1. Seed Categories
  const cat1 = await prisma.category.upsert({ where: { name: "Mata Pelajaran" }, update: {}, create: { name: "Mata Pelajaran" } });
  const cat2 = await prisma.category.upsert({ where: { name: "Dongeng Nusantara" }, update: {}, create: { name: "Dongeng Nusantara" } });
  const cat3 = await prisma.category.upsert({ where: { name: "Sains dan Alam" }, update: {}, create: { name: "Sains dan Alam" } });
  const cat4 = await prisma.category.upsert({ where: { name: "Sejarah" }, update: {}, create: { name: "Sejarah" } });

  // 2. Seed Default Admin (Petugas)
  const hashedAdminPass = await bcrypt.hash("admin123", 10);
  const admin = await prisma.petugas.upsert({
    where: { email: "admin@kancil.com" },
    update: {},
    create: {
      name: "Admin Utama KANCIL",
      email: "admin@kancil.com",
      password: hashedAdminPass,
      phone: "081234567890",
    },
  });

  // 3. Seed Default Student Member (Anggota)
  const hashedStudentPass = await bcrypt.hash("student123", 10);
  const student = await prisma.member.upsert({
    where: { email: "siswa@kancil.com" },
    update: {},
    create: {
      name: "Ahmad Rizky",
      email: "siswa@kancil.com",
      password: hashedStudentPass,
      nisNip: "2026101",
      kelas: "X-A",
      role: "STUDENT",
      phone: "089876543210",
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
