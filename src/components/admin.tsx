import { useState } from "react";
import {
  BOOKS, MEMBERS, LOANS, CATEGORIES, bookById, memberById,
  formatDate, daysUntil, generatePassword,
} from "../lib/data";
import type { Member, Book, Loan } from "../lib/data";
import { Logo, Icon, Button, Card, StatusBadge, inputCls, Field } from "./ui";

type View = "dashboard" | "books" | "members" | "loans" | "returns" | "reports";

const NAV: { id: View; label: string; icon: keyof typeof Icon }[] = [
  { id: "dashboard", label: "Dashboard", icon: "chart" },
  { id: "books", label: "Data Buku", icon: "books" },
  { id: "members", label: "Data Anggota", icon: "users" },
  { id: "loans", label: "Peminjaman", icon: "swap" },
  { id: "returns", label: "Pengembalian", icon: "refresh" },
  { id: "reports", label: "Laporan", icon: "download" },
];

export default function AdminApp({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>("dashboard");
  const active = view;

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-forest-deep p-5 text-paper lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber text-forest-deep">
            <Icon.building className="w-5 h-5" />
          </div>
          <div className="leading-none">
            <div className="font-display text-xl font-700">KANCIL</div>
            <div className="text-[0.6rem] font-700 uppercase tracking-[0.15em] text-paper/60">Panel Petugas</div>
          </div>
        </div>
        <nav className="mt-9 space-y-1">
          {NAV.map((n) => {
            const IconC = Icon[n.icon];
            const on = active === n.id;
            return (
              <button key={n.id} onClick={() => setView(n.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-700 transition ${on ? "bg-amber text-forest-deep" : "text-paper/70 hover:bg-white/10 hover:text-paper"}`}>
                <IconC className="w-5 h-5" /> {n.label}
              </button>
            );
          })}
        </nav>
        <button onClick={onLogout} className="mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 font-700 text-paper/70 hover:bg-white/10 hover:text-paper">
          <Icon.logout className="w-5 h-5" /> Keluar
        </button>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-20 flex items-center gap-2 overflow-x-auto border-b border-border bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-700 ${active === n.id ? "bg-forest text-paper" : "text-ink-soft"}`}>{n.label}</button>
          ))}
        </div>

        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:py-9">
          {view === "dashboard" && <Dashboard goto={setView} />}
          {view === "books" && <BooksManager />}
          {view === "members" && <MembersManager />}
          {view === "loans" && <LoansManager />}
          {view === "returns" && <ReturnsManager />}
          {view === "reports" && <Reports />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ goto }: { goto: (v: View) => void }) {
  const totalBooks = BOOKS.reduce((s, b) => s + b.copies, 0);
  const available = BOOKS.reduce((s, b) => s + b.available, 0);
  const borrowed = totalBooks - available;
  const activeLoans = LOANS.filter((l) => l.returnDate === null);
  const late = activeLoans.filter((l) => l.status === "Terlambat" || daysUntil(l.dueDate) < 0);

  const stats = [
    { label: "Total Buku", value: totalBooks, sub: `${BOOKS.length} judul`, icon: "books" as const, tone: "forest" },
    { label: "Buku Tersedia", value: available, sub: "siap dipinjam", icon: "check" as const, tone: "ok" },
    { label: "Sedang Dipinjam", value: borrowed, sub: `${activeLoans.length} transaksi`, icon: "swap" as const, tone: "amber" },
    { label: "Total Anggota", value: MEMBERS.length, sub: "siswa & guru", icon: "users" as const, tone: "sky" },
    { label: "Total Peminjaman", value: LOANS.length, sub: "sepanjang waktu", icon: "clock" as const, tone: "forest" },
    { label: "Keterlambatan", value: late.length, sub: "perlu ditindak", icon: "alert" as const, tone: "danger" },
  ];

  // popularity per category for the simple bar chart
  const perCat = CATEGORIES.map((c) => ({
    name: c.name,
    emoji: c.emoji,
    count: LOANS.filter((l) => bookById(l.bookId)?.category === c.name).length,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
  const maxCat = Math.max(...perCat.map((c) => c.count), 1);

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-700">Dashboard</h1>
          <p className="mt-1 text-ink-soft">Ringkasan aktivitas Perpustakaan KANCIL · Sabtu, 30 Agustus 2026.</p>
        </div>
        <Button onClick={() => goto("loans")}><Icon.plus className="w-5 h-5" /> Peminjaman Baru</Button>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => {
          const IconC = Icon[s.icon];
          const tones: Record<string, string> = {
            forest: "bg-forest-soft text-forest", ok: "bg-forest-soft text-ok",
            amber: "bg-amber-soft text-warn", sky: "bg-sky/10 text-sky", danger: "bg-danger/10 text-danger",
          };
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-start justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[s.tone]}`}><IconC className="w-6 h-6" /></span>
                <span className="font-display text-3xl font-700">{s.value}</span>
              </div>
              <p className="mt-3 font-700">{s.label}</p>
              <p className="text-sm text-ink-soft">{s.sub}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <h3 className="font-display text-xl font-700">Peminjaman per Kategori</h3>
          <div className="mt-5 space-y-3">
            {perCat.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-sm font-700">{c.emoji} {c.name}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-paper-2">
                  <div className="h-full rounded-full bg-forest transition-all" style={{ width: `${(c.count / maxCat) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-sm font-800">{c.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-xl font-700">Perlu Perhatian</h3>
          <div className="mt-4 space-y-3">
            {late.length === 0 && <p className="text-sm text-ink-soft">Tidak ada keterlambatan. 🎉</p>}
            {late.map((l) => {
              const b = bookById(l.bookId);
              const m = memberById(l.memberId);
              if (!b || !m) return null;
              return (
                <div key={l.id} className="flex items-center gap-3 rounded-xl bg-danger/[0.06] p-3">
                  {b.cover ? <img src={b.cover} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover bg-paper-2" /> : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper-2 text-ink-soft text-xs">{b.title[0]}</span>}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-700">{b.title}</p>
                    <p className="truncate text-xs text-ink-soft">{m.name} · telat {Math.abs(daysUntil(l.dueDate))} hari</p>
                  </div>
                </div>
              );
            })}
            <button onClick={() => goto("returns")} className="mt-1 inline-flex items-center gap-1 text-sm font-700 text-forest hover:gap-2 transition-all">
              Kelola pengembalian <Icon.arrow className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Books Manager ---------------- */
function BooksManager() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const [books, setBooks] = useState<Book[]>([...BOOKS]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Book | null>(null);
  const [cover, setCover] = useState<string | null>(null);

  // Form state
  const [fTitle, setFTitle] = useState("");
  const [fAuthor, setFAuthor] = useState("");
  const [fPublisher, setFPublisher] = useState("");
  const [fYear, setFYear] = useState("");
  const [fCategory, setFCategory] = useState(CATEGORIES[0]?.name ?? "");
  const [fCopies, setFCopies] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cats = ["Semua", ...CATEGORIES.map((c) => c.name)];

  const rows = books.filter((b) => {
    const okC = cat === "Semua" || b.category === cat;
    const okQ = !q || b.title.toLowerCase().includes(q.toLowerCase()) || b.author.toLowerCase().includes(q.toLowerCase());
    return okC && okQ;
  });

  function resetForm() {
    setFTitle("");
    setFAuthor("");
    setFPublisher("");
    setFYear("");
    setFCategory(CATEGORIES[0]?.name ?? "");
    setFCopies("");
    setFDesc("");
    setCover(null);
    setErrors({});
    setEditingId(null);
  }

  function openAdd() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(book: Book) {
    setEditingId(book.id);
    setFTitle(book.title);
    setFAuthor(book.author);
    setFPublisher(book.publisher);
    setFYear(String(book.year));
    setFCategory(book.category);
    setFCopies(String(book.copies));
    setFDesc(book.description);
    setCover(book.cover || null);
    setErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setCover(null);
    setErrors({});
  }

  function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setCover(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    const newErrors: Record<string, string> = {};
    if (!fTitle.trim()) newErrors.title = "Judul buku wajib diisi.";
    if (!fAuthor.trim()) newErrors.author = "Penulis wajib diisi.";
    if (!fPublisher.trim()) newErrors.publisher = "Penerbit wajib diisi.";
    if (!fYear.trim()) newErrors.year = "Tahun terbit wajib diisi.";
    if (!fCopies.trim()) newErrors.copies = "Jumlah eksemplar wajib diisi.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (editingId) {
      const updated = books.map((b) => {
        if (b.id !== editingId) return b;
        const newCopies = parseInt(fCopies) || b.copies;
        const borrowedCount = b.copies - b.available;
        return {
          ...b,
          title: fTitle.trim(),
          author: fAuthor.trim(),
          publisher: fPublisher.trim(),
          year: parseInt(fYear) || b.year,
          category: fCategory || b.category,
          copies: newCopies,
          available: Math.max(0, newCopies - borrowedCount),
          description: fDesc.trim(),
          cover: cover || "",
        };
      });
      setBooks(updated);
      const idx = BOOKS.findIndex((b) => b.id === editingId);
      if (idx !== -1) BOOKS[idx] = updated.find((b) => b.id === editingId)!;
    } else {
      const copies = parseInt(fCopies) || 1;
      const newBook: Book = {
        id: `b-${Date.now()}`,
        title: fTitle.trim(),
        author: fAuthor.trim(),
        publisher: fPublisher.trim(),
        year: parseInt(fYear) || 2026,
        category: fCategory || CATEGORIES[0]?.name || "Umum",
        cover: cover || "",
        status: "Tersedia",
        description: fDesc.trim(),
        copies,
        available: copies,
        rating: 0,
        popularity: 0,
      };
      BOOKS.unshift(newBook);
      setBooks([newBook, ...books]);
    }

    closeForm();
  }

  function handleDelete(book: Book) {
    const idx = BOOKS.findIndex((b) => b.id === book.id);
    if (idx !== -1) BOOKS.splice(idx, 1);
    setBooks(books.filter((b) => b.id !== book.id));
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-6">
      <PageHead title="Kelola Data Buku" desc={`${books.length} judul dalam koleksi.`} action={<Button onClick={openAdd}><Icon.plus className="w-5 h-5" /> Tambah Buku</Button>} />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Cari judul atau penulis…" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={`${inputCls} w-auto`}>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <Card className="overflow-hidden">
        <TableHead cols={["Buku", "Kategori", "Tahun", "Stok", "Status", ""]} widths="grid-cols-[2.4fr_1.2fr_.7fr_.8fr_1fr_.8fr]" />
        {rows.length === 0 && <div className="p-10 text-center text-ink-soft">Belum ada data buku. Klik "Tambah Buku" untuk menambahkan.</div>}
        {rows.map((b) => (
          <Row key={b.id} widths="grid-cols-[2.4fr_1.2fr_.7fr_.8fr_1fr_.8fr]">
            <div className="flex items-center gap-3">
              {b.cover ? <img src={b.cover} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover bg-paper-2" /> : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper-2 text-ink-soft text-xs">{b.title[0]}</span>}
              <div className="min-w-0"><p className="truncate font-700">{b.title}</p><p className="truncate text-xs text-ink-soft">{b.author}</p></div>
            </div>
            <span className="text-sm text-ink-soft">{b.category}</span>
            <span className="text-sm">{b.year}</span>
            <span className="text-sm font-700">{b.available}/{b.copies}</span>
            <StatusBadge status={b.available > 0 ? "Tersedia" : "Dipinjam"} />
            <div className="flex gap-1">
              <IconBtn icon="edit" label="Edit" onClick={() => openEdit(b)} />
              <IconBtn icon="trash" label="Hapus" danger onClick={() => setConfirmDelete(b)} />
            </div>
          </Row>
        ))}
      </Card>

      {showForm && (
        <Modal title={editingId ? "Edit Buku" : "Tambah Buku Baru"} onClose={closeForm}>
          <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
            {/* Cover uploader */}
            <div>
              <span className="block text-sm font-700 text-ink mb-1.5">Foto Sampul</span>
              <label className="group relative block aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border transition hover:border-forest">
                {cover ? (
                  <>
                    <img src={cover} alt="Pratinjau sampul" className="h-full w-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-forest-deep/70 py-1.5 text-center text-xs font-700 text-paper opacity-0 transition group-hover:opacity-100">Ganti foto</span>
                  </>
                ) : (
                  <span className="flex h-full flex-col items-center justify-center gap-2 bg-forest-soft/40 p-3 text-center text-ink-soft">
                    <Icon.image className="w-8 h-8 text-forest" />
                    <span className="text-xs font-700 leading-tight">Klik untuk unggah sampul</span>
                    <span className="text-[0.65rem]">JPG / PNG</span>
                  </span>
                )}
                <input type="file" accept="image/*" onChange={onPickCover} className="sr-only" />
              </label>
              {cover && (
                <button type="button" onClick={() => setCover(null)} className="mt-2 inline-flex items-center gap-1 text-xs font-700 text-danger hover:underline">
                  <Icon.trash className="w-3.5 h-3.5" /> Hapus foto
                </button>
              )}
            </div>

            {/* Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Judul Buku"><input className={`${inputCls} ${errors.title ? "border-danger" : ""}`} placeholder="Masukkan judul" value={fTitle} onChange={(e) => setFTitle(e.target.value)} /></Field>
                {errors.title && <span className="block text-xs text-danger mt-1">{errors.title}</span>}
              </div>
              <div>
                <Field label="Penulis"><input className={`${inputCls} ${errors.author ? "border-danger" : ""}`} placeholder="Nama penulis" value={fAuthor} onChange={(e) => setFAuthor(e.target.value)} /></Field>
                {errors.author && <span className="block text-xs text-danger mt-1">{errors.author}</span>}
              </div>
              <div>
                <Field label="Penerbit"><input className={`${inputCls} ${errors.publisher ? "border-danger" : ""}`} placeholder="Nama penerbit" value={fPublisher} onChange={(e) => setFPublisher(e.target.value)} /></Field>
                {errors.publisher && <span className="block text-xs text-danger mt-1">{errors.publisher}</span>}
              </div>
              <div>
                <Field label="Tahun Terbit"><input className={`${inputCls} ${errors.year ? "border-danger" : ""}`} placeholder="2026" value={fYear} onChange={(e) => setFYear(e.target.value)} /></Field>
                {errors.year && <span className="block text-xs text-danger mt-1">{errors.year}</span>}
              </div>
              <Field label="Kategori">
                <select className={inputCls} value={fCategory} onChange={(e) => setFCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Jumlah Eksemplar"><input className={`${inputCls} ${errors.copies ? "border-danger" : ""}`} placeholder="3" value={fCopies} onChange={(e) => setFCopies(e.target.value)} /></Field>
                {errors.copies && <span className="block text-xs text-danger mt-1">{errors.copies}</span>}
              </div>
              <div className="sm:col-span-2"><Field label="Deskripsi"><textarea className={`${inputCls} min-h-24`} placeholder="Ringkasan buku…" value={fDesc} onChange={(e) => setFDesc(e.target.value)} /></Field></div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={closeForm}>Batal</Button>
            <Button onClick={handleSubmit}><Icon.check className="w-5 h-5" /> {editingId ? "Simpan Perubahan" : "Simpan Buku"}</Button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Hapus Buku"
          message={`Yakin ingin menghapus buku "${confirmDelete.title}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

/* ---------------- Members Manager ---------------- */
function MembersManager() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("Semua");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([...MEMBERS]);

  // Form state
  const [formNama, setFormNama] = useState("");
  const [formNis, setFormNis] = useState("");
  const [formPeran, setFormPeran] = useState<"Siswa" | "Guru">("Siswa");
  const [formKelas, setFormKelas] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState(() => generatePassword());
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Success banner
  const [successInfo, setSuccessInfo] = useState<{ name: string; email: string; password: string } | null>(null);

  const rows = members.filter((m) => {
    const okR = role === "Semua" || m.role === role;
    const okQ = !q || m.name.toLowerCase().includes(q.toLowerCase()) || m.idNumber.includes(q);
    return okR && okQ;
  });

  function resetForm() {
    setFormNama("");
    setFormNis("");
    setFormPeran("Siswa");
    setFormKelas("");
    setFormEmail("");
    setFormPassword(generatePassword());
    setErrors({});
    setEditingId(null);
  }

  function openAdd() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(member: Member) {
    setEditingId(member.id);
    setFormNama(member.name);
    setFormNis(member.idNumber);
    setFormPeran(member.role);
    setFormKelas(member.kelas);
    setFormEmail(member.email);
    setFormPassword(member.password || "");
    setErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setErrors({});
  }

  function handleSubmit() {
    const newErrors: Record<string, string> = {};

    if (!formNama.trim()) newErrors.nama = "Nama lengkap wajib diisi.";
    if (!formNis.trim()) newErrors.nis = "NIS / NIP wajib diisi.";
    if (!formKelas.trim()) newErrors.kelas = formPeran === "Siswa" ? "Kelas wajib diisi." : "Mata pelajaran wajib diisi.";
    if (!formEmail.trim()) newErrors.email = "Email / Username wajib diisi.";
    if (!formPassword.trim()) newErrors.password = "Kata sandi wajib diisi.";

    // Check NIS/NIP duplicate (exclude self when editing)
    if (formNis.trim()) {
      const duplicate = members.find((m) => m.idNumber === formNis.trim() && m.id !== editingId);
      if (duplicate) newErrors.nis = "NIS / NIP sudah terdaftar. Gunakan nomor lain.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (editingId) {
      // Update existing member
      const updated = members.map((m) => {
        if (m.id !== editingId) return m;
        return {
          ...m,
          name: formNama.trim(),
          idNumber: formNis.trim(),
          role: formPeran,
          kelas: formKelas.trim(),
          email: formEmail.trim(),
          password: formPassword.trim(),
        };
      });
      setMembers(updated);
      const idx = MEMBERS.findIndex((m) => m.id === editingId);
      if (idx !== -1) MEMBERS[idx] = updated.find((m) => m.id === editingId)!;
    } else {
      // Create new member
      const newMember: Member = {
        id: `m-${Date.now()}`,
        name: formNama.trim(),
        idNumber: formNis.trim(),
        role: formPeran,
        kelas: formKelas.trim(),
        email: formEmail.trim(),
        password: formPassword.trim(),
        activeLoans: 0,
      };

      MEMBERS.unshift(newMember);
      setMembers([newMember, ...members]);

      setSuccessInfo({
        name: newMember.name,
        email: newMember.email,
        password: formPassword.trim(),
      });
    }

    closeForm();
  }

  function handleDelete(member: Member) {
    const idx = MEMBERS.findIndex((m) => m.id === member.id);
    if (idx !== -1) MEMBERS.splice(idx, 1);
    setMembers(members.filter((m) => m.id !== member.id));
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-6">
      <PageHead title="Kelola Data Anggota" desc={`${members.length} anggota terdaftar.`} action={<Button onClick={openAdd}><Icon.plus className="w-5 h-5" /> Buat Akun Anggota</Button>} />

      {/* Success banner */}
      {successInfo && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#b1d23a]/40 bg-[#eef5d6] p-4 shadow-sm">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#6fa32a] text-white">
            <Icon.check className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-700 text-[#3c4b62]">Akun berhasil dibuat untuk <b>{successInfo.name}</b></p>
            <p className="mt-1 text-sm text-[#6f7c92]">Bagikan kredensial berikut kepada anggota agar bisa login:</p>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 rounded-xl bg-white/70 px-4 py-2.5 text-sm font-700">
              <span>📧 Email: <b className="text-[#0a96e6]">{successInfo.email}</b></span>
              <span>🔑 Kata Sandi: <b className="text-[#0a96e6]">{successInfo.password}</b></span>
            </div>
          </div>
          <button onClick={() => setSuccessInfo(null)} className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#6f7c92] hover:bg-white/80" aria-label="Tutup">✕</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Cari nama atau NIS/NIP…" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputCls} w-auto`}>
          <option>Semua</option><option>Siswa</option><option>Guru</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        <TableHead cols={["Anggota", "NIS / NIP", "Kelas / Status", "Pinjaman Aktif", ""]} widths="grid-cols-[2fr_1fr_1.3fr_1fr_.8fr]" />
        {rows.length === 0 && <div className="p-10 text-center text-ink-soft">Belum ada data anggota. Klik "Buat Akun Anggota" untuk menambahkan.</div>}
        {rows.map((m) => (
          <Row key={m.id} widths="grid-cols-[2fr_1fr_1.3fr_1fr_.8fr]">
            <div className="flex items-center gap-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-800 ${m.role === "Guru" ? "bg-amber text-ink" : "bg-forest text-paper"}`}>{m.name[0]}</span>
              <div className="min-w-0"><p className="truncate font-700">{m.name}</p><p className="truncate text-xs text-ink-soft">{m.email}</p></div>
            </div>
            <span className="text-sm">{m.idNumber}</span>
            <span className="text-sm text-ink-soft">{m.role} · {m.kelas}</span>
            <span className="text-sm"><b>{m.activeLoans}</b> buku</span>
            <div className="flex gap-1">
              <IconBtn icon="edit" label="Edit" onClick={() => openEdit(m)} />
              <IconBtn icon="trash" label="Hapus" danger onClick={() => setConfirmDelete(m)} />
            </div>
          </Row>
        ))}
      </Card>

      {showForm && (
        <Modal title={editingId ? "Edit Anggota" : "Buat Akun Anggota"} onClose={closeForm}>
          {!editingId && <p className="text-sm text-ink-soft -mt-3 mb-5">Buatkan akun login untuk siswa atau guru. Kredensial akan ditampilkan setelah akun dibuat.</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Nama Lengkap">
                <input className={`${inputCls} ${errors.nama ? "border-danger" : ""}`} placeholder="Kirana Ayu Pratiwi" value={formNama} onChange={(e) => setFormNama(e.target.value)} />
              </Field>
              {errors.nama && <span className="block text-xs text-danger mt-1">{errors.nama}</span>}
            </div>
            <div>
              <Field label="NIS / NIP">
                <input className={`${inputCls} ${errors.nis ? "border-danger" : ""}`} placeholder="20240115" value={formNis} onChange={(e) => setFormNis(e.target.value)} />
              </Field>
              {errors.nis && <span className="block text-xs text-danger mt-1">{errors.nis}</span>}
            </div>
            <Field label="Peran">
              <select className={inputCls} value={formPeran} onChange={(e) => setFormPeran(e.target.value as "Siswa" | "Guru")}>
                <option>Siswa</option><option>Guru</option>
              </select>
            </Field>
            <div>
              <Field label={formPeran === "Siswa" ? "Kelas" : "Mata Pelajaran / Status"}>
                <input className={`${inputCls} ${errors.kelas ? "border-danger" : ""}`} placeholder={formPeran === "Siswa" ? "5A" : "Guru IPA"} value={formKelas} onChange={(e) => setFormKelas(e.target.value)} />
              </Field>
              {errors.kelas && <span className="block text-xs text-danger mt-1">{errors.kelas}</span>}
            </div>
            <div>
              <Field label="Email / Username">
                <input className={`${inputCls} ${errors.email ? "border-danger" : ""}`} placeholder="kirana@kancil.sch.id" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </Field>
              {errors.email && <span className="block text-xs text-danger mt-1">{errors.email}</span>}
            </div>
            <div className="sm:col-span-2">
              <Field label="Kata Sandi">
                <div className="flex gap-2">
                  <input className={`${inputCls} flex-1 ${errors.password ? "border-danger" : ""}`} placeholder="rusa744" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
                  <button
                    type="button"
                    onClick={() => setFormPassword(generatePassword())}
                    className="inline-flex items-center gap-1.5 shrink-0 rounded-2xl border-2 border-border bg-card px-4 py-2.5 text-sm font-700 text-ink transition hover:border-forest hover:text-forest active:scale-[0.97]"
                  >
                    <Icon.refresh className="w-4 h-4" /> Acak
                  </button>
                </div>
              </Field>
              {errors.password && <span className="block text-xs text-danger mt-1">{errors.password}</span>}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={closeForm}>Batal</Button>
            <Button onClick={handleSubmit}><Icon.check className="w-5 h-5" /> {editingId ? "Simpan Perubahan" : "Buat Akun"}</Button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Hapus Anggota"
          message={`Yakin ingin menghapus anggota "${confirmDelete.name}"? Data yang sudah dihapus tidak dapat dikembalikan.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

/* ---------------- Loans Manager ---------------- */
function LoansManager() {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("Semua");
  const [loans, setLoans] = useState<Loan[]>([...LOANS]);

  // Form state
  const [fMemberId, setFMemberId] = useState("");
  const [fBookId, setFBookId] = useState("");
  const [fBorrowDate, setFBorrowDate] = useState(new Date().toISOString().slice(0, 10));
  const [fDueDate, setFDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [loanErrors, setLoanErrors] = useState<Record<string, string>>({});

  const rows = loans.filter((l) => filter === "Semua" || l.status === filter);

  function openAdd() {
    setFMemberId(MEMBERS[0]?.id ?? "");
    const availableBooks = BOOKS.filter((b) => b.available > 0);
    setFBookId(availableBooks[0]?.id ?? "");
    setLoanErrors({});
    setShowAdd(true);
  }

  function handleLoanSubmit() {
    const newErrors: Record<string, string> = {};
    if (!fMemberId) newErrors.member = "Pilih anggota.";
    if (!fBookId) newErrors.book = "Pilih buku.";
    if (!fBorrowDate) newErrors.borrow = "Tanggal pinjam wajib diisi.";
    if (!fDueDate) newErrors.due = "Batas kembali wajib diisi.";

    setLoanErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const newLoan: Loan = {
      id: `l-${Date.now()}`,
      bookId: fBookId,
      memberId: fMemberId,
      borrowDate: fBorrowDate,
      dueDate: fDueDate,
      returnDate: null,
      status: "Dipinjam",
    };

    // Update book availability
    const book = BOOKS.find((b) => b.id === fBookId);
    if (book && book.available > 0) {
      book.available -= 1;
      if (book.available === 0) book.status = "Dipinjam";
    }

    // Update member active loans
    const member = MEMBERS.find((m) => m.id === fMemberId);
    if (member) {
      member.activeLoans += 1;
    }

    LOANS.unshift(newLoan);
    setLoans([newLoan, ...loans]);
    setShowAdd(false);
  }

  return (
    <div className="space-y-6">
      <PageHead title="Data Peminjaman" desc="Semua transaksi peminjaman buku." action={<Button onClick={openAdd}><Icon.plus className="w-5 h-5" /> Tambah Peminjaman</Button>} />

      <div className="flex flex-wrap gap-2">
        {["Semua", "Dipinjam", "Terlambat", "Dikembalikan"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-700 transition ${filter === f ? "bg-forest text-paper" : "border border-border bg-card text-ink-soft hover:border-forest"}`}>{f}</button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <TableHead cols={["Anggota", "Buku", "Tgl Pinjam", "Batas Kembali", "Status"]} widths="grid-cols-[1.4fr_1.8fr_1fr_1fr_1fr]" />
        {rows.length === 0 && <div className="p-10 text-center text-ink-soft">Belum ada data peminjaman.</div>}
        {rows.map((l) => {
          const b = bookById(l.bookId);
          const m = memberById(l.memberId);
          if (!b || !m) return null;
          return (
            <Row key={l.id} widths="grid-cols-[1.4fr_1.8fr_1fr_1fr_1fr]">
              <div className="min-w-0"><p className="truncate font-700">{m.name}</p><p className="text-xs text-ink-soft">{m.role} · {m.kelas}</p></div>
              <div className="flex items-center gap-2 min-w-0">{b.cover ? <img src={b.cover} alt="" className="h-5 w-5 rounded object-cover bg-paper-2" /> : <span className="grid h-5 w-5 place-items-center rounded bg-paper-2 text-ink-soft text-[0.6rem]">{b.title[0]}</span>}<span className="truncate text-sm">{b.title}</span></div>
              <span className="text-sm text-ink-soft">{formatDate(l.borrowDate)}</span>
              <span className="text-sm text-ink-soft">{formatDate(l.dueDate)}</span>
              <StatusBadge status={l.status} />
            </Row>
          );
        })}
      </Card>

      {showAdd && (
        <Modal title="Tambah Peminjaman" onClose={() => setShowAdd(false)}>
          <div className="grid gap-4">
            <div>
              <Field label="Anggota">
                <select className={`${inputCls} ${loanErrors.member ? "border-danger" : ""}`} value={fMemberId} onChange={(e) => setFMemberId(e.target.value)}>
                  {MEMBERS.length === 0 && <option value="">— Belum ada anggota —</option>}
                  {MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.idNumber}</option>)}
                </select>
              </Field>
              {loanErrors.member && <span className="block text-xs text-danger mt-1">{loanErrors.member}</span>}
            </div>
            <div>
              <Field label="Buku">
                <select className={`${inputCls} ${loanErrors.book ? "border-danger" : ""}`} value={fBookId} onChange={(e) => setFBookId(e.target.value)}>
                  {BOOKS.filter((b) => b.available > 0).length === 0 && <option value="">— Tidak ada buku tersedia —</option>}
                  {BOOKS.filter((b) => b.available > 0).map((b) => <option key={b.id} value={b.id}>{b.title} ({b.available} tersedia)</option>)}
                </select>
              </Field>
              {loanErrors.book && <span className="block text-xs text-danger mt-1">{loanErrors.book}</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tanggal Pinjam"><input type="date" className={inputCls} value={fBorrowDate} onChange={(e) => setFBorrowDate(e.target.value)} /></Field>
              <Field label="Batas Kembali"><input type="date" className={inputCls} value={fDueDate} onChange={(e) => setFDueDate(e.target.value)} /></Field>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Batal</Button>
            <Button onClick={handleLoanSubmit}><Icon.check className="w-5 h-5" /> Catat Peminjaman</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Returns Manager ---------------- */
function ReturnsManager() {
  const [returned, setReturned] = useState<Set<string>>(new Set());
  const rows = LOANS.filter((l) => l.returnDate === null && !returned.has(l.id));

  return (
    <div className="space-y-6">
      <PageHead title="Data Pengembalian" desc="Buku yang sedang dipinjam dan menunggu dikembalikan." />

      <Card className="overflow-hidden">
        <TableHead cols={["Peminjam", "Buku", "Tgl Pinjam", "Batas Kembali", "Status", "Aksi"]} widths="grid-cols-[1.3fr_1.6fr_1fr_1fr_1fr_1.1fr]" />
        {rows.length === 0 && <div className="p-10 text-center text-ink-soft">Semua buku sudah dikembalikan. 🎉</div>}
        {rows.map((l) => {
          const b = bookById(l.bookId);
          const m = memberById(l.memberId);
          if (!b || !m) return null;
          const late = l.status === "Terlambat" || daysUntil(l.dueDate) < 0;
          return (
            <Row key={l.id} widths="grid-cols-[1.3fr_1.6fr_1fr_1fr_1fr_1.1fr]">
              <div className="min-w-0"><p className="truncate font-700">{m.name}</p><p className="text-xs text-ink-soft">{m.kelas}</p></div>
              <div className="flex items-center gap-2 min-w-0">{b.cover ? <img src={b.cover} alt="" className="h-5 w-5 rounded object-cover bg-paper-2" /> : <span className="grid h-5 w-5 place-items-center rounded bg-paper-2 text-ink-soft text-[0.6rem]">{b.title[0]}</span>}<span className="truncate text-sm">{b.title}</span></div>
              <span className="text-sm text-ink-soft">{formatDate(l.borrowDate)}</span>
              <span className={`text-sm ${late ? "font-800 text-danger" : "text-ink-soft"}`}>{formatDate(l.dueDate)}</span>
              <StatusBadge status={l.status} />
              <Button size="sm" variant={late ? "secondary" : "primary"} onClick={() => setReturned((s) => new Set(s).add(l.id))}>
                <Icon.check className="w-4 h-4" /> Kembalikan
              </Button>
            </Row>
          );
        })}
      </Card>

      {returned.size > 0 && (
        <p className="flex items-center gap-2 text-sm font-700 text-forest"><Icon.check className="w-4 h-4" /> {returned.size} buku berhasil dikembalikan dan kembali ke rak.</p>
      )}
    </div>
  );
}

/* ---------------- Reports ---------------- */
function Reports() {
  const [tab, setTab] = useState<"pinjam" | "kembali" | "telat">("pinjam");
  const borrowed = LOANS;
  const returnedRows = LOANS.filter((l) => l.returnDate !== null);
  const lateRows = LOANS.filter((l) => l.status === "Terlambat");
  const dataset = tab === "pinjam" ? borrowed : tab === "kembali" ? returnedRows : lateRows;

  return (
    <div className="space-y-6">
      <PageHead title="Laporan" desc="Rekap peminjaman, pengembalian, dan keterlambatan." action={<Button variant="secondary"><Icon.download className="w-5 h-5" /> Export {tab === "pinjam" ? "Peminjaman" : tab === "kembali" ? "Pengembalian" : "Keterlambatan"}</Button>} />

      <div className="grid grid-cols-3 gap-4">
        <ReportCard active={tab === "pinjam"} onClick={() => setTab("pinjam")} label="Total Peminjaman" value={borrowed.length} icon="swap" />
        <ReportCard active={tab === "kembali"} onClick={() => setTab("kembali")} label="Total Pengembalian" value={returnedRows.length} icon="refresh" />
        <ReportCard active={tab === "telat"} onClick={() => setTab("telat")} label="Total Keterlambatan" value={lateRows.length} icon="alert" />
      </div>

      <Card className="overflow-hidden">
        <TableHead cols={["Anggota", "Buku", "Tgl Pinjam", tab === "kembali" ? "Tgl Kembali" : "Batas Kembali", "Status"]} widths="grid-cols-[1.4fr_1.8fr_1fr_1fr_1fr]" />
        {dataset.map((l) => {
          const b = bookById(l.bookId);
          const m = memberById(l.memberId);
          if (!b || !m) return null;
          return (
            <Row key={l.id} widths="grid-cols-[1.4fr_1.8fr_1fr_1fr_1fr]">
              <span className="truncate font-700">{m.name}</span>
              <div className="flex items-center gap-2 min-w-0">{b.cover ? <img src={b.cover} alt="" className="h-5 w-5 rounded object-cover bg-paper-2" /> : <span className="grid h-5 w-5 place-items-center rounded bg-paper-2 text-ink-soft text-[0.6rem]">{b.title[0]}</span>}<span className="truncate text-sm">{b.title}</span></div>
              <span className="text-sm text-ink-soft">{formatDate(l.borrowDate)}</span>
              <span className="text-sm text-ink-soft">{tab === "kembali" && l.returnDate ? formatDate(l.returnDate) : formatDate(l.dueDate)}</span>
              <StatusBadge status={l.status} />
            </Row>
          );
        })}
      </Card>
    </div>
  );
}

/* ---------------- Shared admin bits ---------------- */
function PageHead({ title, desc, action }: { title: string; desc: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-4xl font-700">{title}</h1>
        <p className="mt-1 text-ink-soft">{desc}</p>
      </div>
      {action}
    </header>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (s: string) => void; placeholder: string }) {
  return (
    <div className="relative min-w-56 flex-1">
      <Icon.search className="absolute left-3.5 top-1/2 w-5 h-5 -translate-y-1/2 text-ink-soft" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} pl-11`} />
    </div>
  );
}

function TableHead({ cols, widths }: { cols: string[]; widths: string }) {
  return (
    <div className={`hidden ${widths} gap-4 border-b border-border bg-paper-2/50 px-5 py-3 text-xs font-800 uppercase tracking-wide text-ink-soft md:grid`}>
      {cols.map((c, i) => <span key={i}>{c}</span>)}
    </div>
  );
}

function Row({ children, widths }: { children: React.ReactNode; widths: string }) {
  return (
    <div className={`grid ${widths} items-center gap-x-4 gap-y-2 border-b border-border px-5 py-3.5 text-ink last:border-0 hover:bg-forest-soft/40 max-md:grid-cols-2`}>
      {children}
    </div>
  );
}

function IconBtn({ icon, label, danger, onClick }: { icon: keyof typeof Icon; label: string; danger?: boolean; onClick?: () => void }) {
  const IconC = Icon[icon];
  return (
    <button aria-label={label} title={label} onClick={onClick} className={`grid h-8 w-8 place-items-center rounded-lg transition ${danger ? "text-ink-soft hover:bg-danger/10 hover:text-danger" : "text-ink-soft hover:bg-forest-soft hover:text-forest"}`}>
      <IconC className="w-4 h-4" />
    </button>
  );
}

function ReportCard({ active, onClick, label, value, icon }: { active: boolean; onClick: () => void; label: string; value: number; icon: keyof typeof Icon }) {
  const IconC = Icon[icon];
  return (
    <button onClick={onClick} className={`rounded-2xl border p-5 text-left transition ${active ? "border-forest bg-forest text-paper shadow-sm" : "border-border bg-card hover:border-forest"}`}>
      <div className="flex items-center justify-between">
        <IconC className="w-6 h-6" />
        <span className="font-display text-3xl font-700">{value}</span>
      </div>
      <p className="mt-3 font-700">{label}</p>
    </button>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-forest-deep/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-700">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-paper-2" aria-label="Tutup">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-forest-deep/40 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-danger/10 text-danger">
            <Icon.alert className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-700">{title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>Batal</Button>
          <Button variant="danger" onClick={onConfirm}><Icon.trash className="w-4 h-4" /> Ya, Hapus</Button>
        </div>
      </div>
    </div>
  );
}
