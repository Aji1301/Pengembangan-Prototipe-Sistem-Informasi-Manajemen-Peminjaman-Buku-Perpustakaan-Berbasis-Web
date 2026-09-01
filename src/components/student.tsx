import { useMemo, useState } from "react";
import {
  BOOKS, CATEGORIES, LOANS, CURRENT_USER, bookById,
  formatDate, daysUntil, type Book,
} from "../lib/data";
import {
  Logo, Icon, Button, Card, BookCover, StatusBadge, Stars, inputCls, Field,
} from "./ui";

type View = "home" | "catalog" | "detail" | "myloans" | "history" | "profile";

const NAV: { id: View; label: string; icon: keyof typeof Icon }[] = [
  { id: "home", label: "Beranda", icon: "home" },
  { id: "catalog", label: "Katalog", icon: "books" },
  { id: "myloans", label: "Pinjaman Saya", icon: "bookmark" },
  { id: "history", label: "Riwayat", icon: "clock" },
  { id: "profile", label: "Profil", icon: "user" },
];

export default function StudentApp({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>("home");
  const [selected, setSelected] = useState<Book | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Semua");
  const [reserved, setReserved] = useState<Set<string>>(new Set());

  function openBook(b: Book) {
    setSelected(b);
    setView("detail");
  }
  function goCatalog(cat?: string) {
    if (cat) setCategory(cat);
    setView("catalog");
  }

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
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-700 transition ${
                  active ? "bg-forest text-paper shadow-sm" : "text-ink-soft hover:bg-forest-soft hover:text-forest"
                }`}
              >
                <IconC className="w-5 h-5" /> {n.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto">
          <Card className="bg-amber-soft border-amber/20 p-4">
            <div className="text-2xl">📚</div>
            <p className="mt-1 font-display font-700 text-ink">Target Baca Bulan Ini</p>
            <p className="text-sm text-ink-soft">3 dari 5 buku selesai</p>
            <div className="mt-2 h-2 rounded-full bg-white/70">
              <div className="h-full w-3/5 rounded-full bg-amber" />
            </div>
          </Card>
          <button onClick={onLogout} className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-700 text-ink-soft hover:bg-danger/10 hover:text-danger">
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
          {view === "home" && <Home onOpen={openBook} onCategory={goCatalog} onSeeAll={() => setView("catalog")} query={query} setQuery={setQuery} />}
          {view === "catalog" && <Catalog onOpen={openBook} query={query} setQuery={setQuery} category={category} setCategory={setCategory} />}
          {view === "detail" && selected && <Detail book={selected} onBack={() => setView("catalog")} reserved={reserved.has(selected.id)} onReserve={() => setReserved((s) => new Set(s).add(selected.id))} onOpen={openBook} />}
          {view === "myloans" && <MyLoans onOpen={openBook} />}
          {view === "history" && <History />}
          {view === "profile" && <Profile onLogout={onLogout} />}
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
function Home({ onOpen, onCategory, onSeeAll, query, setQuery }: { onOpen: (b: Book) => void; onCategory: (c: string) => void; onSeeAll: () => void; query: string; setQuery: (s: string) => void }) {
  const popular = [...BOOKS].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
  const newest = [...BOOKS].sort((a, b) => b.year - a.year).slice(0, 5);

  return (
    <div className="space-y-9">
      <header>
        <p className="text-ink-soft font-600">{greeting()}, Sabtu 30 Agustus</p>
        <h1 className="mt-1 font-display text-4xl font-700">Halo, {CURRENT_USER.name.split(" ")[0]}! ✨</h1>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-forest p-7 text-paper sm:p-9">
        <div className="pointer-events-none absolute -right-8 -top-8 text-[10rem] opacity-15 select-none">🦌</div>
        <div className="relative max-w-xl">
          <span className="rounded-full bg-amber px-3 py-1 text-xs font-800 uppercase tracking-wide text-ink">Buku Pilihan Minggu Ini</span>
          <h2 className="mt-3 font-display text-3xl font-700 leading-tight">Akses instan ke 40.000+ buku anak & lainnya</h2>
          <p className="mt-2 text-paper/80">Temukan dongeng nusantara favorit, jelajahi sains, dan mulai petualangan membacamu hari ini.</p>
          <div className="mt-5">
            <SearchBar value={query} onChange={setQuery} onSubmit={onSeeAll} />
          </div>
        </div>
      </div>

      {/* Categories */}
      <section>
        <SectionHead title="Jelajahi Kategori" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <button key={c.name} onClick={() => onCategory(c.name)} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-forest hover:shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-forest-soft text-xl transition group-hover:scale-110">{c.emoji}</span>
              <span className="font-700 leading-tight">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      <Shelf title="Populer & Rekomendasi" books={popular} onOpen={onOpen} onSeeAll={onSeeAll} />
      <Shelf title="Baru Ditambahkan" books={newest} onOpen={onOpen} onSeeAll={onSeeAll} />

      {/* Library info */}
      <Card className="grid gap-6 p-6 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <h3 className="font-display text-xl font-700">Perpustakaan KANCIL</h3>
          <p className="mt-1 text-ink-soft">SD Negeri 03 Cendekia · Lantai 2, Gedung Utama. Ruang baca yang nyaman untuk semua siswa dan guru.</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <InfoRow icon="clock" label="Senin–Jumat" value="07.00 – 15.00" />
            <InfoRow icon="swap" label="Maks. pinjam" value="3 buku / 14 hari" />
          </div>
        </div>
        <div className="rounded-2xl bg-forest-soft p-5">
          <div className="text-3xl">💡</div>
          <p className="mt-2 font-700 text-forest-deep">Tahukah kamu?</p>
          <p className="text-sm text-ink-soft">Kancil adalah simbol kecerdikan dalam dongeng Nusantara — sama seperti pembaca yang gemar berpikir!</p>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Catalog ---------------- */
function Catalog({ onOpen, query, setQuery, category, setCategory }: { onOpen: (b: Book) => void; query: string; setQuery: (s: string) => void; category: string; setCategory: (c: string) => void }) {
  const cats = ["Semua", ...CATEGORIES.map((c) => c.name)];
  const results = useMemo(() => {
    return BOOKS.filter((b) => {
      const okCat = category === "Semua" || b.category === category;
      const q = query.trim().toLowerCase();
      const okQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [query, category]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl font-700">Katalog Buku</h1>
        <p className="mt-1 text-ink-soft">{results.length} buku ditemukan dari total {BOOKS.length} koleksi.</p>
      </header>

      <SearchBar value={query} onChange={setQuery} placeholder="Cari judul atau penulis…" />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {cats.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-700 transition ${category === c ? "bg-forest text-paper" : "border border-border bg-card text-ink-soft hover:border-forest"}`}>
            {c}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <EmptyState emoji="🔎" title="Tidak ada buku yang cocok" desc="Coba kata kunci lain atau ganti kategori." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((b) => (
            <BookTile key={b.id} book={b} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Detail ---------------- */
function Detail({ book, onBack, reserved, onReserve, onOpen }: { book: Book; onBack: () => void; reserved: boolean; onReserve: () => void; onOpen: (b: Book) => void }) {
  const related = BOOKS.filter((b) => b.category === book.category && b.id !== book.id).slice(0, 5);
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
  const active = LOANS.filter((l) => l.memberId === CURRENT_USER.id && l.status !== "Dikembalikan" && l.returnDate === null);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl font-700">Pinjaman Saya</h1>
        <p className="mt-1 text-ink-soft">Kamu sedang meminjam {active.length} buku · maksimal 3 buku.</p>
      </header>

      {active.length === 0 ? (
        <EmptyState emoji="📖" title="Belum ada pinjaman aktif" desc="Jelajahi katalog dan pinjam buku pertamamu!" />
      ) : (
        <div className="space-y-4">
          {active.map((l) => {
            const b = bookById(l.bookId)!;
            const left = daysUntil(l.dueDate);
            const late = l.status === "Terlambat" || left < 0;
            return (
              <Card key={l.id} className={`flex gap-4 p-4 ${late ? "border-danger/40 bg-danger/[0.03]" : ""}`}>
                <button onClick={() => onOpen(b)} className="w-20 shrink-0"><BookCover book={b} /></button>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <button onClick={() => onOpen(b)} className="text-left font-display text-lg font-700 leading-tight hover:text-forest">{b.title}</button>
                    <p className="text-sm text-ink-soft">{b.author}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                    <span className="text-ink-soft">Dipinjam <b className="text-ink">{formatDate(l.borrowDate)}</b></span>
                    <span className="text-ink-soft">Kembali sebelum <b className="text-ink">{formatDate(l.dueDate)}</b></span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between text-right">
                  <StatusBadge status={l.status} />
                  <span className={`text-sm font-800 ${late ? "text-danger" : left <= 3 ? "text-warn" : "text-forest"}`}>
                    {late ? `Terlambat ${Math.abs(left)} hari` : `${left} hari lagi`}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {active.some((l) => l.status === "Terlambat" || daysUntil(l.dueDate) < 0) && (
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
  const rows = LOANS.filter((l) => l.memberId === CURRENT_USER.id && l.returnDate !== null);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl font-700">Riwayat Peminjaman</h1>
        <p className="mt-1 text-ink-soft">Semua buku yang pernah kamu pinjam.</p>
      </header>

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[2.2fr_1fr_1fr_1fr] gap-4 border-b border-border bg-paper-2/50 px-5 py-3 text-xs font-800 uppercase tracking-wide text-ink-soft sm:grid">
          <span>Buku</span><span>Tanggal Pinjam</span><span>Tanggal Kembali</span><span>Status</span>
        </div>
        {rows.map((l) => {
          const b = bookById(l.bookId)!;
          return (
            <div key={l.id} className="grid gap-2 border-b border-border px-5 py-4 last:border-0 sm:grid-cols-[2.2fr_1fr_1fr_1fr] sm:items-center sm:gap-4">
              <div className="flex items-center gap-3">
                {b.cover ? <img src={b.cover} alt="" className="h-9 w-9 rounded-lg object-cover bg-paper-2" /> : <span className="grid h-9 w-9 place-items-center rounded-lg bg-paper-2 text-ink-soft text-xs">{b.title[0]}</span>}
                <div>
                  <p className="font-700 leading-tight">{b.title}</p>
                  <p className="text-xs text-ink-soft">{b.author}</p>
                </div>
              </div>
              <span className="text-sm text-ink-soft">{formatDate(l.borrowDate)}</span>
              <span className="text-sm text-ink-soft">{l.returnDate ? formatDate(l.returnDate) : "—"}</span>
              <div><StatusBadge status={l.status} /></div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ---------------- Profile ---------------- */
function Profile({ onLogout }: { onLogout: () => void }) {
  const u = CURRENT_USER;
  const [edit, setEdit] = useState(false);
  const active = LOANS.filter((l) => l.memberId === u.id && l.returnDate === null).length;
  const total = LOANS.filter((l) => l.memberId === u.id).length;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-4xl font-700">Profil</h1>

      <Card className="p-6">
        <div className="flex items-center gap-5">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-forest text-3xl font-800 text-paper font-display">
            {u.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h2 className="font-display text-2xl font-700">{u.name}</h2>
            <span className="mt-1 inline-block rounded-full bg-amber-soft px-3 py-1 text-sm font-800 text-warn">{u.role} · Kelas {u.kelas}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <MiniStat label="Sedang dipinjam" value={active} />
          <MiniStat label="Total pinjaman" value={total} />
          <MiniStat label="Poin baca" value={240} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nama Lengkap"><input className={inputCls} defaultValue={u.name} disabled={!edit} /></Field>
          <Field label="NIS / NIP"><input className={inputCls} defaultValue={u.idNumber} disabled /></Field>
          <Field label="Kelas / Status"><input className={inputCls} defaultValue={u.kelas} disabled={!edit} /></Field>
          <Field label="Email"><input className={inputCls} defaultValue={u.email} disabled={!edit} /></Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {edit ? (
            <>
              <Button onClick={() => setEdit(false)}><Icon.check className="w-5 h-5" /> Simpan Perubahan</Button>
              <Button variant="ghost" onClick={() => setEdit(false)}>Batal</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEdit(true)}><Icon.edit className="w-5 h-5" /> Edit Profil</Button>
          )}
          <Button variant="danger" onClick={onLogout} className="ml-auto"><Icon.logout className="w-5 h-5" /> Logout</Button>
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
