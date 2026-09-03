import { useMemo, useState, useEffect } from "react";
import {
  BOOKS, CATEGORIES, LOANS, CURRENT_USER, bookById,
  formatDate, daysUntil, type Book,
} from "../lib/data";
import {
  Logo, Icon, Button, Card, BookCover, StatusBadge, Stars, inputCls, Field,
} from "./ui";
import { api } from "../lib/api";

type View = "home" | "catalog" | "detail" | "myloans" | "history" | "profile";

const NAV: { id: View; label: string; icon: keyof typeof Icon }[] = [
  { id: "home", label: "Beranda", icon: "home" },
  { id: "catalog", label: "Katalog", icon: "books" },
  { id: "myloans", label: "Pinjaman Saya", icon: "bookmark" },
  { id: "history", label: "Riwayat", icon: "clock" },
  { id: "profile", label: "Profil", icon: "user" },
];

export default function StudentApp({ user, onLogout }: { user?: any; onLogout: () => void }) {
  const [view, setView] = useState<View>("home");
  const [selected, setSelected] = useState<Book | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Semua");
  const [reserved, setReserved] = useState<Set<string>>(new Set());
  const [booksList, setBooksList] = useState<Book[]>(BOOKS);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(user || null);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
    api.getMe().then((res) => {
      if (res && res.user) {
        setCurrentUser(res.user);
      }
    }).catch(() => { });
  }, [user]);

  const fetchBooks = () => {
    api.getBooks().then((res) => {
      if (res && res.books && res.books.length > 0) {
        const mappedBooks: Book[] = res.books.map((b: any) => ({
          id: String(b.id),
          title: b.title,
          author: b.author,
          publisher: b.publisher || "-",
          year: b.year || 2026,
          category: b.category?.name || "Umum",
          cover: b.coverUrl || b.cover || "from-forest to-forest-deep",
          coverUrl: b.coverUrl,
          status: b.availableStock > 0 ? "Tersedia" : "Dipinjam",
          description: b.description || "-",
          copies: b.stock,
          available: b.availableStock,
          rating: 4.8,
          popularity: 95,
        }));
        setBooksList(mappedBooks);
      }
    }).catch(() => { });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBorrowBook = async (bookId: string) => {
    setBorrowLoading(true);
    try {
      await api.requestBorrow({ bookId: Number(bookId), days: 7 });
      setReserved((s) => new Set(s).add(bookId));
      fetchBooks();
    } catch (err: any) {
      setReserved((s) => new Set(s).add(bookId));
    } finally {
      setBorrowLoading(false);
    }
  };

  function openBook(b: Book) {
    setSelected(b);
    setView("detail");
  }
  function goCatalog(cat?: string) {
    if (cat) setCategory(cat);
    setView("catalog");
  }

  const [returnedCount, setReturnedCount] = useState(0);

  useEffect(() => {
    api.getMyBorrowings().then((res) => {
      if (res && res.borrowings) {
        setReturnedCount(res.borrowings.filter((l: any) => l.status === "RETURNED").length);
      }
    }).catch(() => { });
  }, []);

  const progressPercent = Math.min(100, Math.round((returnedCount / 5) * 100));

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card p-5 lg:flex">
        <Logo />
        <nav className="mt-9 space-y-1">
          {NAV.map((n) => {
            const IconC = Icon[n.icon];
            const active = view === n.id || (view === "detail" && n.id === "catalog");
            return (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-700 transition ${active ? "bg-forest text-paper shadow-sm" : "text-ink-soft hover:bg-forest-soft hover:text-forest"
                  }`}
              >
                <IconC className="w-5 h-5" /> {n.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto">
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-700 text-ink-soft hover:bg-danger/10 hover:text-danger">
            <Icon.logout className="w-5 h-5" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-paper/90 px-5 py-3 backdrop-blur lg:hidden">
          <Logo size={38} />
          <button onClick={onLogout} className="text-ink-soft"><Icon.logout /></button>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:py-10 pb-28 lg:pb-10">
          {view === "home" && <Home user={currentUser} booksList={booksList} onOpen={openBook} onCategory={goCatalog} onSeeAll={() => setView("catalog")} query={query} setQuery={setQuery} />}
          {view === "catalog" && <Catalog booksList={booksList} onOpen={openBook} query={query} setQuery={setQuery} category={category} setCategory={setCategory} />}
          {view === "detail" && selected && <Detail booksList={booksList} book={selected} onBack={() => setView("catalog")} reserved={reserved.has(selected.id)} onReserve={() => handleBorrowBook(selected.id)} onOpen={openBook} />}
          {view === "myloans" && <MyLoans onOpen={openBook} />}
          {view === "history" && <History />}
          {view === "profile" && <Profile user={currentUser} onLogout={onLogout} />}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-card px-2 py-2 lg:hidden">
        {NAV.map((n) => {
          const IconC = Icon[n.icon];
          const active = view === n.id || (view === "detail" && n.id === "catalog");
          return (
            <button key={n.id} onClick={() => setView(n.id)} className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[0.65rem] font-700 ${active ? "text-forest" : "text-ink-soft"}`}>
              <IconC className="w-5 h-5" /> {n.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ---------------- Home ---------------- */
function Home({ user, booksList, onOpen, onCategory, onSeeAll, query, setQuery }: { user?: any; booksList: Book[]; onOpen: (b: Book) => void; onCategory: (c: string) => void; onSeeAll: () => void; query: string; setQuery: (s: string) => void }) {
  const popular = [...booksList].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
  const newest = [...booksList].sort((a, b) => b.year - a.year).slice(0, 5);

  return (
    <div className="space-y-9">
      <header>
        <p className="text-ink-soft font-600">{greeting()}, {user?.name || "Siswa"}! </p>
        <h1 className="font-display text-4xl font-700">Mau baca buku apa hari ini? </h1>
      </header>

      <SearchBar value={query} onChange={setQuery} onSubmit={onSeeAll} />

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.name}
            onClick={() => onCategory(c.name)}
            className="inline-flex shrink-0 items-center rounded-full border border-border bg-white px-4 py-2 text-sm font-700 hover:border-forest hover:bg-forest-soft transition"
          >
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      <Shelf title="Paling Populer " books={popular} onOpen={onOpen} onSeeAll={onSeeAll} />
      <Shelf title="Rilisan Terbaru " books={newest} onOpen={onOpen} onSeeAll={onSeeAll} />
    </div>
  );
}

/* ---------------- Catalog ---------------- */
function Catalog({ booksList, onOpen, query, setQuery, category, setCategory }: { booksList: Book[]; onOpen: (b: Book) => void; query: string; setQuery: (s: string) => void; category: string; setCategory: (c: string) => void }) {
  const cats = ["Semua", ...CATEGORIES.map((c) => c.name)];
  const results = useMemo(() => {
    return booksList.filter((b) => {
      const matchQ =
        !query.trim() ||
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.author.toLowerCase().includes(query.toLowerCase());
      const matchC = category === "Semua" || b.category === category;
      return matchQ && matchC;
    });
  }, [query, category, booksList]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-700">Katalog Perpustakaan </h1>
        <p className="mt-1 text-ink-soft">{results.length} buku ditemukan dari total {booksList.length} koleksi.</p>
      </header>

      <SearchBar value={query} onChange={setQuery} placeholder="Cari judul atau penulis…" />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-700 transition ${category === c ? "bg-forest text-paper" : "border border-border bg-card text-ink-soft hover:border-forest"
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <EmptyState emoji="" title="Buku tidak ditemukan" desc="Coba kata kunci atau kategori yang berbeda." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6">
          {results.map((b) => (
            <BookTile key={b.id} book={b} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Detail ---------------- */
function Detail({ booksList, book, onBack, reserved, onReserve, onOpen }: { booksList: Book[]; book: Book; onBack: () => void; reserved: boolean; onReserve: () => void; onOpen: (b: Book) => void }) {
  const related = booksList.filter((b) => b.category === book.category && b.id !== book.id).slice(0, 5);
  const available = book.available > 0;
  return (
    <div className="space-y-8">
      <button onClick={onBack} className="inline-flex items-center gap-2 font-700 text-ink-soft hover:text-forest">
        <Icon.back className="w-5 h-5" /> Kembali ke katalog
      </button>

      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <div className="mx-auto w-48 md:mx-0 md:w-full">
          <BookCover book={book} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-forest-soft px-3 py-1 text-xs font-800 text-forest">{book.category}</span>
            <Stars value={book.rating} />
          </div>
          <h1 className="mt-3 font-display text-4xl font-700 leading-tight">{book.title}</h1>
          <p className="mt-1 text-lg text-ink-soft">oleh <span className="font-700 text-ink">{book.author}</span></p>

          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Meta label="Penerbit" value={book.publisher} />
            <Meta label="Tahun Terbit" value={String(book.year)} />
            <Meta label="Ketersediaan" value={`${book.available} dari ${book.copies} eksemplar`} />
          </dl>

          <div className="mt-6">
            <h3 className="font-700">Deskripsi</h3>
            <p className="mt-1.5 leading-relaxed text-ink-soft">{book.description}</p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <StatusBadge status={available ? "Tersedia" : "Dipinjam"} />
            {available ? (
              <Button size="lg" disabled={reserved} onClick={onReserve}>
                {reserved ? <><Icon.check className="w-5 h-5" /> Reservasi Diajukan</> : <><Icon.bookmark className="w-5 h-5" /> Ajukan Peminjaman</>}
              </Button>
            ) : (
              <Button size="lg" variant="secondary" disabled={reserved} onClick={onReserve}>
                {reserved ? <><Icon.check className="w-5 h-5" /> Masuk Antrean</> : <><Icon.clock className="w-5 h-5" /> Reservasi (Antre)</>}
              </Button>
            )}
          </div>
          {reserved && (
            <p className="mt-3 flex items-center gap-2 text-sm font-600 text-forest">
              <Icon.info className="w-4 h-4" /> Petugas akan memproses pengajuanmu. Cek "Pinjaman Saya" untuk statusnya.
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && <Shelf title="Buku Serupa" books={related} onOpen={onOpen} />}
    </div>
  );
}

/* ---------------- My Loans ---------------- */
function MyLoans({ onOpen }: { onOpen: (b: Book) => void }) {
  const [loansList, setLoansList] = useState<any[]>([]);

  useEffect(() => {
    api.getMyBorrowings().then((res) => {
      if (res && res.borrowings) {
        setLoansList(res.borrowings);
      }
    }).catch(() => { });
  }, []);

  const active = loansList.length > 0 ? loansList : LOANS.filter((l) => l.memberId === CURRENT_USER.id && l.status !== "Dikembalikan");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl font-700">Pinjaman Saya</h1>
        <p className="mt-1 text-ink-soft">Kamu sedang meminjam {active.length} buku · maksimal 3 buku.</p>
      </header>

      {active.length === 0 ? (
        <EmptyState emoji="" title="Belum ada pinjaman aktif" desc="Jelajahi katalog dan pinjam buku pertamamu!" />
      ) : (
        <div className="space-y-4">
          {active.map((l) => {
            const b: Book = l.book ? {
              id: String(l.book.id),
              title: l.book.title,
              author: l.book.author,
              publisher: l.book.publisher || "-",
              year: l.book.year || 2024,
              category: l.book.category?.name || "Umum",
              cover: l.book.coverUrl || l.book.cover || "from-forest to-forest-deep",
              status: "Dipinjam",
              description: l.book.description || "",
              copies: l.book.stock || 1,
              available: l.book.availableStock || 0,
              rating: 4.8,
              popularity: 90
            } : bookById(l.bookId)!;

            const borrowDateStr = l.borrowDate ? String(l.borrowDate).split("T")[0] : "2026-09-03";
            const dueDateStr = l.dueDate ? String(l.dueDate).split("T")[0] : "2026-09-10";
            const left = daysUntil(dueDateStr);
            const late = l.status === "OVERDUE" || l.status === "Terlambat" || left < 0;
            const statusLabel = l.status === "PENDING" ? "Pengajuan Peminjaman" : l.status === "BORROWED" ? "Dipinjam" : l.status;

            return (
              <Card key={l.id} className={`flex gap-4 p-4 ${late ? "border-danger/40 bg-danger/[0.03]" : ""}`}>
                <button onClick={() => b && onOpen(b)} className="w-20 shrink-0">{b && <BookCover book={b} />}</button>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <button onClick={() => b && onOpen(b)} className="text-left font-display text-lg font-700 leading-tight hover:text-forest">{b ? b.title : "Buku"}</button>
                    <p className="text-sm text-ink-soft">{b ? b.author : "-"}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                    <span className="text-ink-soft">Dipinjam <b className="text-ink">{borrowDateStr}</b></span>
                    <span className="text-ink-soft">Kembali sebelum <b className="text-ink">{dueDateStr}</b></span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between text-right">
                  <StatusBadge status={statusLabel === "Dipinjam" ? "Dipinjam" : "Tersedia"} />
                  <span className={`text-sm font-800 ${late ? "text-danger" : left <= 3 ? "text-warn" : "text-forest"}`}>
                    {statusLabel}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {active.some((l) => l.status === "Terlambat" || l.status === "OVERDUE") && (
        <Card className="flex items-start gap-3 border-danger/30 bg-danger/[0.05] p-4">
          <Icon.alert className="mt-0.5 w-5 h-5 shrink-0 text-danger" />
          <div className="text-sm">
            <p className="font-800 text-danger">Ada buku yang terlambat dikembalikan!</p>
            <p className="text-ink-soft">Segera kembalikan ke petugas perpustakaan untuk menghindari denda keterlambatan.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------- History ---------------- */
function History() {
  const [historyList, setHistoryList] = useState<any[]>([]);

  useEffect(() => {
    api.getMyBorrowings().then((res) => {
      if (res && res.borrowings) {
        setHistoryList(res.borrowings);
      }
    }).catch(() => { });
  }, []);

  const rows = historyList;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl font-700">Riwayat Peminjaman</h1>
        <p className="mt-1 text-ink-soft">Semua riwayat pengajuan & peminjaman buku kamu di database MySQL.</p>
      </header>

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[2fr_1.2fr_1.2fr_1fr] gap-4 border-b border-border bg-paper-2/50 px-5 py-3 text-xs font-800 uppercase tracking-wide text-ink-soft sm:grid">
          <span>Buku</span><span>Tanggal Pinjam</span><span>Tanggal Kembali</span><span>Status</span>
        </div>

        {rows.length === 0 ? (
          <div className="p-10 text-center text-ink-soft">Belum ada riwayat peminjaman buku.</div>
        ) : (
          rows.map((l) => {
            const bookTitle = l.book?.title || "Buku";
            const bookAuthor = l.book?.author || "-";
            const borrowDateStr = l.borrowDate ? String(l.borrowDate).split("T")[0] : "-";
            const returnDateStr = l.returnDate ? String(l.returnDate).split("T")[0] : l.dueDate ? String(l.dueDate).split("T")[0] : "—";
            const statusLabel = l.status === "RETURNED" ? "Dikembalikan" : l.status === "BORROWED" ? "Dipinjam" : l.status === "PENDING" ? "Tersedia" : l.status;

            return (
              <div key={l.id} className="grid gap-2 border-b border-border px-5 py-4 last:border-0 sm:grid-cols-[2fr_1.2fr_1.2fr_1fr] sm:items-center sm:gap-4">
                <div className="flex items-center gap-3">
                  {l.book?.coverUrl ? (
                    <img src={l.book.coverUrl} alt={bookTitle} className="h-10 w-8 shrink-0 rounded object-cover border border-border" />
                  ) : (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper-2 text-ink-soft text-xs font-700">{bookTitle[0]}</span>
                  )}
                  <div className="min-w-0">
                    <p className="font-700 leading-tight truncate">{bookTitle}</p>
                    <p className="text-xs text-ink-soft truncate">{bookAuthor}</p>
                  </div>
                </div>
                <span className="text-sm text-ink-soft">{borrowDateStr}</span>
                <span className="text-sm text-ink-soft">{returnDateStr}</span>
                <div><StatusBadge status={statusLabel} /></div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}

/* ---------------- Profile ---------------- */
function Profile({ user, onLogout }: { user?: any; onLogout: () => void }) {
  const u = user || CURRENT_USER;
  const [myLoans, setMyLoans] = useState<any[]>([]);

  useEffect(() => {
    api.getMyBorrowings().then((res) => {
      if (res && res.borrowings) {
        setMyLoans(res.borrowings);
      }
    }).catch(() => { });
  }, []);

  const nisValue = u.nisNip || u.nim || u.idNumber || "-";
  const roleLabel = u.role === "TEACHER" ? "Guru" : u.role === "ADMIN" ? "Admin" : "Siswa";

  const activeLoansCount = myLoans.filter((l) => l.status === "BORROWED").length;
  const returnedLoansCount = myLoans.filter((l) => l.status === "RETURNED").length;

  return (
    <div className="max-w-4xl space-y-7">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-700">Profil Saya</h1>
          <p className="text-ink-soft font-600 mt-1">Kelola data informasi akun dan statistik aktivitas membaca Anda.</p>
        </div>
        <Button variant="danger" onClick={onLogout} className="px-5">
          <Icon.logout className="w-5 h-5" /> Keluar (Logout)
        </Button>
      </header>

      {/* Main Profile Header Card */}
      <Card className="overflow-hidden p-0 border border-border shadow-sm">
        <div className="bg-gradient-to-r from-forest to-forest-deep px-8 py-8 text-paper flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-white text-forest text-3xl font-900 shadow-md font-display border-4 border-white/20">
              {(u.name || "Siswa").split(" ").map((s: string) => s[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber text-ink px-3 py-1 text-xs font-900 uppercase tracking-wider">{roleLabel}</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-700">Aktif</span>
              </div>
              <h2 className="font-display text-3xl font-700 mt-2">{u.name || "Siswa"}</h2>
              <p className="text-paper/80 text-sm font-600 mt-0.5">{u.email || "-"}</p>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 border-b border-border bg-paper-2/40 divide-x divide-border">
          <div className="p-5 text-center">
            <p className="text-xs font-800 uppercase text-ink-soft">Total Pinjaman</p>
            <p className="font-display text-3xl font-700 text-forest mt-1">{myLoans.length}</p>
          </div>
          <div className="p-5 text-center">
            <p className="text-xs font-800 uppercase text-ink-soft">Sedang Dipinjam</p>
            <p className="font-display text-3xl font-700 text-warn mt-1">{activeLoansCount}</p>
          </div>
          <div className="p-5 text-center">
            <p className="text-xs font-800 uppercase text-ink-soft">Sudah Dikembalikan</p>
            <p className="font-display text-3xl font-700 text-ok mt-1">{returnedLoansCount}</p>
          </div>
        </div>

        {/* Profile Info Details Form */}
        <div className="p-8 space-y-6">
          <h3 className="font-display text-xl font-700 text-ink">Informasi Akun & Kontak</h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nama Lengkap">
              <input
                className={`${inputCls} bg-paper-2/60 font-700 text-ink-soft cursor-not-allowed`}
                value={u.name || ""}
                disabled
              />
            </Field>

            <Field label="NIS / NIP / NIM">
              <input
                className={`${inputCls} bg-paper-2/60 font-700 text-ink-soft cursor-not-allowed`}
                value={nisValue}
                disabled
              />
            </Field>

            <Field label="Email Utama">
              <input
                className={`${inputCls} bg-paper-2/60 font-700 text-ink-soft cursor-not-allowed`}
                value={u.email || "-"}
                disabled
              />
            </Field>

            <Field label="No HP / WhatsApp">
              <input
                className={`${inputCls} bg-paper-2/60 font-700 text-ink-soft cursor-not-allowed`}
                value={u.phone || "-"}
                disabled
              />
            </Field>

            <Field label="Kelas / Jurusan">
              <input
                className={`${inputCls} bg-paper-2/60 font-700 text-ink-soft cursor-not-allowed`}
                value={u.kelas || "-"}
                disabled
              />
            </Field>

            <Field label="Peran Hak Akses">
              <input
                className={`${inputCls} bg-paper-2/60 font-700 text-ink-soft cursor-not-allowed`}
                value={roleLabel}
                disabled
              />
            </Field>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Shared bits ---------------- */
function SearchBar({ value, onChange, onSubmit, placeholder = "Cari buku, penulis, atau kategori…" }: { value: string; onChange: (s: string) => void; onSubmit?: () => void; placeholder?: string }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }} className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-sm ring-1 ring-black/5">
      <Icon.search className="w-5 h-5 shrink-0 text-ink-soft" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent py-1.5 text-ink outline-none placeholder:text-ink-soft/70" />
      <Button size="sm" type="submit" className="px-4 py-2">Cari</Button>
    </form>
  );
}

function Shelf({ title, books, onOpen, onSeeAll }: { title: string; books: Book[]; onOpen: (b: Book) => void; onSeeAll?: () => void }) {
  return (
    <section>
      <SectionHead title={title} action={onSeeAll ? { label: "Lihat semua", onClick: onSeeAll } : undefined} />
      <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
        {books.map((b) => (
          <div key={b.id} className="w-36 shrink-0 snap-start sm:w-40">
            <BookTile book={b} onOpen={onOpen} />
          </div>
        ))}
      </div>
    </section>
  );
}

function BookTile({ book, onOpen }: { book: Book; onOpen: (b: Book) => void }) {
  return (
    <button onClick={() => onOpen(book)} className="group block w-full text-left">
      <div className="transition group-hover:-translate-y-1">
        <BookCover book={book} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="truncate font-700 leading-tight group-hover:text-forest">{book.title}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="truncate text-xs text-ink-soft">{book.author}</p>
        <span className={`shrink-0 text-[0.65rem] font-800 ${book.available > 0 ? "text-forest" : "text-warn"}`}>
          {book.available > 0 ? "Tersedia" : "Dipinjam"}
        </span>
      </div>
    </button>
  );
}

function SectionHead({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-2xl font-700">{title}</h2>
      {action && (
        <button onClick={action.onClick} className="inline-flex items-center gap-1 text-sm font-700 text-forest hover:gap-2 transition-all">
          {action.label} <Icon.arrow className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-800 uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="mt-0.5 font-700">{value}</dd>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-forest-soft p-3 text-center">
      <div className="font-display text-2xl font-700 text-forest-deep">{value}</div>
      <div className="text-xs font-600 text-ink-soft">{label}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Icon; label: string; value: string }) {
  const IconC = Icon[icon];
  return (
    <div className="flex items-center gap-2">
      <IconC className="w-5 h-5 text-forest" />
      <div><span className="text-ink-soft">{label}: </span><b>{value}</b></div>
    </div>
  );
}

function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
      <div className="text-5xl">{emoji}</div>
      <p className="mt-3 font-display text-xl font-700">{title}</p>
      <p className="mt-1 text-ink-soft">{desc}</p>
    </div>
  );
}

function greeting() {
  const h = 9;
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  return "Selamat sore";
}
