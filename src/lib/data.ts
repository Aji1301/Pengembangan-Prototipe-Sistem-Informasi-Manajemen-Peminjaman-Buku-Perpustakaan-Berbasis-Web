export type BookStatus = "Tersedia" | "Dipinjam";

export type Book = {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  category: string;
  cover: string; // image URL

  status: BookStatus;
  description: string;
  copies: number;
  available: number;
  rating: number;
  popularity: number;
};

export type Member = {
  id: string;
  name: string;
  idNumber: string; // NIS / NIP
  role: "Siswa" | "Guru";
  kelas: string; // class or subject
  email: string;
  activeLoans: number;
};

export type LoanStatus = "Dipinjam" | "Dikembalikan" | "Terlambat";

export type Loan = {
  id: string;
  bookId: string;
  memberId: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
};

export const CATEGORIES: { name: string; emoji: string }[] = [
  { name: "Mata Pelajaran", emoji: "" },
  { name: "Dongeng Nusantara", emoji: "" },
  { name: "Sains dan Alam", emoji: "" },
  { name: "Sejarah", emoji: "" },
];

const covers = [
  "from-forest to-forest-deep",
  "from-amber to-berry",
  "from-sky to-forest",
  "from-berry to-amber",
  "from-forest-deep to-sky",
  "from-amber to-forest",
];

export const BOOKS: Book[] = [];

export const MEMBERS: Member[] = [];

export const LOANS: Loan[] = [];

export const CURRENT_USER: Member = {
  id: "",
  name: "Pengguna",
  idNumber: "",
  role: "Siswa",
  kelas: "",
  email: "",
  activeLoans: 0
};

export function bookById(id: string) {
  return BOOKS.find((b) => b.id === id);
}
export function memberById(id: string) {
  return MEMBERS.find((m) => m.id === id);
}

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const TODAY = new Date("2026-08-30T00:00:00");

export function daysUntil(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return Math.round((d.getTime() - TODAY.getTime()) / 86400000);
}
