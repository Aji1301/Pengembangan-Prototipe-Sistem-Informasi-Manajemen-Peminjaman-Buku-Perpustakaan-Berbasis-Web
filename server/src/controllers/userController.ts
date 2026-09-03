import { Request, Response } from "express";
import { prisma } from "../prisma.js";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const members = await prisma.member.findMany({
      include: {
        _count: { select: { borrowings: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const petugasList = await prisma.petugas.findMany({
      include: {
        _count: { select: { borrowings: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedMembers = members.map((m) => ({
      ...m,
      nim: m.nisNip,
    }));

    const mappedPetugas = petugasList.map((p) => ({
      ...p,
      role: "ADMIN",
      nim: "ADMIN-01",
    }));

    res.json({ users: [...mappedPetugas, ...mappedMembers] });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal mengambil data pengguna.", error: error.message });
  }
};
