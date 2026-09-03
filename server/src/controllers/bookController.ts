import { Request, Response } from "express";
import { prisma } from "../prisma.js";

let cachedBooks: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 detik cache

export const invalidateBooksCache = () => {
  cachedBooks = null;
  cacheTimestamp = 0;
};

export const prewarmBooksCache = async () => {
  try {
    const books = await prisma.book.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    cachedBooks = books;
    cacheTimestamp = Date.now();
    console.log(`⚡ Cache buku berhasil dimuat (${books.length} buku).`);
  } catch (err: any) {
    console.warn("⚠️ Gagal memuat cache awal buku:", err.message);
  }
};

export const getBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, categoryId } = req.query;

    const isCacheValid = cachedBooks !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;

    // Jika cache masih valid, gunakan cache untuk respons super cepat (instant)
    if (isCacheValid && cachedBooks) {
      let result = cachedBooks;

      if (search) {
        const q = String(search).toLowerCase();
        result = result.filter(
          (b) =>
            b.title?.toLowerCase().includes(q) ||
            b.author?.toLowerCase().includes(q) ||
            (b.isbn && b.isbn.toLowerCase().includes(q))
        );
      }

      if (categoryId) {
        const catId = Number(categoryId);
        result = result.filter((b) => b.categoryId === catId);
      }

      res.json({ books: result, cached: true });
      return;
    }

    // Ambil dari database jika cache kosong atau kedaluwarsa
    const books = await prisma.book.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    cachedBooks = books;
    cacheTimestamp = Date.now();

    let result = books;
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          (b.isbn && b.isbn.toLowerCase().includes(q))
      );
    }
    if (categoryId) {
      const catId = Number(categoryId);
      result = result.filter((b) => b.categoryId === catId);
    }

    res.json({ books: result });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal mengambil data buku.", error: error.message });
  }
};

export const getBookById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const book = await prisma.book.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!book) {
      res.status(404).json({ message: "Buku tidak ditemukan." });
      return;
    }

    res.json({ book });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal mengambil detail buku.", error: error.message });
  }
};

export const createBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isbn, title, author, publisher, year, categoryId, categoryName, category, stock, description, coverUrl } = req.body;

    if (!title || !author) {
      res.status(400).json({ message: "Judul dan Penulis buku wajib diisi." });
      return;
    }

    let targetCategoryId = categoryId ? Number(categoryId) : null;
    const catInput = categoryName || category;
    if (!targetCategoryId && catInput && typeof catInput === "string") {
      const catObj = await prisma.category.upsert({
        where: { name: catInput },
        update: {},
        create: { name: catInput },
      });
      targetCategoryId = catObj.id;
    }

    const initialStock = Number(stock) || 1;

    const book = await prisma.book.create({
      data: {
        title,
        author,
        publisher: publisher || null,
        year: year ? Number(year) : null,
        categoryId: targetCategoryId,
        stock: initialStock,
        availableStock: initialStock,
        description: description || null,
        coverUrl: coverUrl || null,
      },
      include: { category: true },
    });

    invalidateBooksCache();
    res.status(201).json({ message: "Buku berhasil ditambahkan.", book });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal menambahkan buku.", error: error.message });
  }
};

export const updateBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { title, author, publisher, year, categoryId, categoryName, category, stock, availableStock, description, coverUrl } = req.body;

    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      res.status(404).json({ message: "Buku tidak ditemukan." });
      return;
    }

    let targetCategoryId = categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : existingBook.categoryId;
    const catInput = categoryName || category;
    if (catInput && typeof catInput === "string") {
      const catObj = await prisma.category.upsert({
        where: { name: catInput },
        update: {},
        create: { name: catInput },
      });
      targetCategoryId = catObj.id;
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingBook.title,
        author: author !== undefined ? author : existingBook.author,
        publisher: publisher !== undefined ? publisher : existingBook.publisher,
        year: year !== undefined ? Number(year) : existingBook.year,
        categoryId: targetCategoryId,
        stock: stock !== undefined ? Number(stock) : existingBook.stock,
        availableStock: availableStock !== undefined ? Number(availableStock) : existingBook.availableStock,
        description: description !== undefined ? description : existingBook.description,
        coverUrl: coverUrl !== undefined ? coverUrl : existingBook.coverUrl,
      },
      include: { category: true },
    });

    invalidateBooksCache();
    res.json({ message: "Buku berhasil diperbarui.", book: updatedBook });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal memperbarui buku.", error: error.message });
  }
};

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await prisma.book.delete({ where: { id } });
    invalidateBooksCache();
    res.json({ message: "Buku berhasil dihapus." });
  } catch (error: any) {
    res.status(500).json({ message: "Gagal menghapus buku.", error: error.message });
  }
};
