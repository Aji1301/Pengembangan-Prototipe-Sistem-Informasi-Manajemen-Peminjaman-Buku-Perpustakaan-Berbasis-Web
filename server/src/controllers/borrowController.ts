import { Response } from "express";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../middlewares/auth.js";

export const requestBorrow = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Pengguna tidak terautentikasi." });
      return;
    }

    const { bookId, days = 7, notes } = req.body;

    if (!bookId) {
      res.status(400).json({ message: "ID Buku wajib diisi." });
      return;
    }

    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } });
    if (!book) {
      res.status(404).json({ message: "Buku tidak ditemukan." });
      return;
    }

    if (book.availableStock < 1) {
      res.status(400).json({ message: "Stok buku tidak tersedia untuk dipinjam saat ini." });
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(days));

    const borrowing = await prisma.borrowing.create({
      data: {
        memberId: req.user.id,
        bookId: Number(bookId),
        dueDate,
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        book: true,
        member: { select: { id: true, name: true, email: true, nisNip: true } },
      },
    });

    const mapped = {
      ...borrowing,
      user: { ...borrowing.member, nim: borrowing.member.nisNip },
    };

    res.status(201).json({ message: "Permohonan peminjaman berhasil dibuat.", borrowing: mapped });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal membuat permohonan peminjaman.", error: error.message });
  }
};

export const createBorrowByAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, bookId, days = 7, borrowDate, dueDate, notes } = req.body;

    if (!userId || !bookId) {
      res.status(400).json({ message: "Anggota (userId) dan Buku (bookId) wajib dipilih." });
      return;
    }

    const book = await prisma.book.findUnique({ where: { id: Number(bookId) } });
    if (!book) {
      res.status(404).json({ message: "Buku tidak ditemukan." });
      return;
    }

    if (book.availableStock < 1) {
      res.status(400).json({ message: "Stok buku habis." });
      return;
    }

    const parsedBorrowDate = borrowDate ? new Date(borrowDate) : new Date();
    let parsedDueDate: Date;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
    } else {
      parsedDueDate = new Date(parsedBorrowDate);
      parsedDueDate.setDate(parsedDueDate.getDate() + Number(days));
    }

    const borrowing = await prisma.borrowing.create({
      data: {
        memberId: Number(userId),
        bookId: Number(bookId),
        petugasId: req.user?.id || null,
        borrowDate: parsedBorrowDate,
        dueDate: parsedDueDate,
        notes: notes || null,
        status: "BORROWED",
      },
      include: {
        book: true,
        member: { select: { id: true, name: true, email: true, nisNip: true } },
        petugas: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.book.update({
      where: { id: Number(bookId) },
      data: { availableStock: { decrement: 1 } },
    });

    const mapped = {
      ...borrowing,
      user: { ...borrowing.member, nim: borrowing.member.nisNip },
    };

    res.status(201).json({ message: "Peminjaman berhasil dicatat.", borrowing: mapped });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal mencatat peminjaman.", error: error.message });
  }
};

export const getMyBorrowings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Pengguna tidak terautentikasi." });
      return;
    }

    const borrowings = await prisma.borrowing.findMany({
      where: { memberId: req.user.id },
      include: { book: true, member: true },
      orderBy: { createdAt: "desc" },
    });

    const mapped = borrowings.map((b) => ({
      ...b,
      user: { ...b.member, nim: b.member.nisNip },
    }));

    res.json({ borrowings: mapped });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal mengambil data peminjaman.", error: error.message });
  }
};

export const getAllBorrowings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: any = {};

    if (status) {
      where.status = String(status);
    }

    const borrowings = await prisma.borrowing.findMany({
      where,
      include: {
        book: true,
        member: { select: { id: true, name: true, email: true, nisNip: true, phone: true } },
        petugas: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = borrowings.map((b) => ({
      ...b,
      user: { ...b.member, nim: b.member.nisNip },
    }));

    res.json({ borrowings: mapped });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal mengambil semua data peminjaman.", error: error.message });
  }
};

export const updateBorrowStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const existingBorrowing = await prisma.borrowing.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!existingBorrowing) {
      res.status(404).json({ message: "Data peminjaman tidak ditemukan." });
      return;
    }

    if (existingBorrowing.status !== "BORROWED" && status === "BORROWED") {
      if (existingBorrowing.book.availableStock > 0) {
        await prisma.book.update({
          where: { id: existingBorrowing.bookId },
          data: { availableStock: { decrement: 1 } },
        });
      }
    } else if (existingBorrowing.status === "BORROWED" && status === "RETURNED") {
      await prisma.book.update({
        where: { id: existingBorrowing.bookId },
        data: { availableStock: { increment: 1 } },
      });
    }

    const returnDate = status === "RETURNED" ? new Date() : existingBorrowing.returnDate;

    const updatedBorrowing = await prisma.borrowing.update({
      where: { id },
      data: {
        status,
        returnDate,
        petugasId: req.user?.id || existingBorrowing.petugasId,
      },
      include: {
        book: true,
        member: { select: { id: true, name: true, email: true, nisNip: true } },
        petugas: { select: { id: true, name: true, email: true } },
      },
    });

    const mapped = {
      ...updatedBorrowing,
      user: { ...updatedBorrowing.member, nim: updatedBorrowing.member.nisNip },
    };

    res.json({ message: `Status peminjaman diperbarui menjadi ${status}.`, borrowing: mapped });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal memperbarui status peminjaman.", error: error.message });
  }
};
