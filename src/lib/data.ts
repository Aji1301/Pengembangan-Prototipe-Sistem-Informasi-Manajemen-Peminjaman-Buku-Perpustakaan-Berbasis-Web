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
  password?: string;
  activeLoans: number;
};

const ANIMAL_NAMES = [
  "kancil", "rusa", "merak", "elang", "harimau", "gajah",
  "kuda", "beruang", "kucing", "kelinci", "bangau", "rajawali",
  "domba", "singa", "panda", "lumba", "burung", "zebra",
];

export function generatePassword(): string {
  const animal = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  const digits = Math.floor(100 + Math.random() * 900); // 3 digit (100-999)
  return `${animal}${digits}`;
}

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
  { name: "Fiksi", emoji: "📖" },
  { name: "Non-Fiksi", emoji: "📚" },
  { name: "Sains", emoji: "🔬" },
  { name: "Sejarah", emoji: "🏛️" },
  { name: "Matematika", emoji: "🔢" },
  { name: "Bahasa", emoji: "🗣️" },
  { name: "Agama", emoji: "🕌" },
  { name: "Seni & Budaya", emoji: "🎨" },
  { name: "Teknologi", emoji: "💻" },
  { name: "Ensiklopedia", emoji: "📕" },
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
