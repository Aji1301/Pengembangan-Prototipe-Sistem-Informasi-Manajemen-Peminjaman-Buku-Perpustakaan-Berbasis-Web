import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../middlewares/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "kancil_jwt_secret_key_super_secure_2026";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role = "STUDENT", nim, phone, kelas } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: "Email, password, dan nama wajib diisi." });
      return;
    }

    if (role === "ADMIN") {
      const existingPetugas = await prisma.petugas.findUnique({ where: { email } });
      if (existingPetugas) {
        res.status(400).json({ message: "Email petugas admin sudah terdaftar." });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const petugas = await prisma.petugas.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone: phone || null,
        },
      });

      const token = jwt.sign({ id: petugas.id, email: petugas.email, role: "ADMIN" }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        message: "Petugas admin berhasil dibuat.",
        token,
        user: { ...petugas, role: "ADMIN" },
      });
    } else {
      const existingMember = await prisma.member.findUnique({ where: { email } });
      if (existingMember) {
        res.status(400).json({ message: "Email anggota sudah terdaftar." });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const member = await prisma.member.create({
        data: {
          email,
          password: hashedPassword,
          name,
          nisNip: nim || null,
          phone: phone || null,
          kelas: kelas || null,
          role: role === "TEACHER" ? "TEACHER" : "STUDENT",
        },
      });

      const token = jwt.sign({ id: member.id, email: member.email, role: member.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        message: "Anggota berhasil dibuat.",
        token,
        user: member,
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email dan password wajib diisi." });
      return;
    }

    // 1. Check Petugas (Admin)
    const petugas = await prisma.petugas.findUnique({ where: { email } });
    if (petugas) {
      const isPasswordValid = await bcrypt.compare(password, petugas.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Email atau password salah." });
        return;
      }

      const token = jwt.sign({ id: petugas.id, email: petugas.email, role: "ADMIN" }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const { password: _, ...userData } = petugas;
      res.json({
        message: "Login Petugas berhasil.",
        token,
        user: { ...userData, role: "ADMIN" },
      });
      return;
    }

    // 2. Check Member (Siswa / Guru) by Email or NIS/NIP
    const member = await prisma.member.findFirst({
      where: {
        OR: [{ email }, { nisNip: email }],
      },
    });
    if (member) {
      const isPasswordValid = await bcrypt.compare(password, member.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Email atau password salah." });
        return;
      }

      const token = jwt.sign({ id: member.id, email: member.email, role: member.role }, JWT_SECRET, {
        expiresIn: "7d",
      });

      const { password: _, ...userData } = member;
      res.json({
        message: "Login Anggota berhasil.",
        token,
        user: userData,
      });
      return;
    }

    res.status(401).json({ message: "Email atau password tidak ditemukan." });
  } catch (error: any) {
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Tidak terautentikasi." });
      return;
    }

    if (req.user.role === "ADMIN") {
      const petugas = await prisma.petugas.findUnique({ where: { id: req.user.id } });
      if (!petugas) {
        res.status(404).json({ message: "Petugas tidak ditemukan." });
        return;
      }
      const { password: _, ...userData } = petugas;
      res.json({ user: { ...userData, role: "ADMIN" } });
    } else {
      const member = await prisma.member.findUnique({ where: { id: req.user.id } });
      if (!member) {
        res.status(404).json({ message: "Anggota tidak ditemukan." });
        return;
      }
      const { password: _, ...userData } = member;
      res.json({ user: userData });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};
