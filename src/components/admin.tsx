import { useState, useEffect } from "react";
import {
  BOOKS, MEMBERS, LOANS, CATEGORIES, bookById, memberById,
  formatDate, daysUntil,
} from "../lib/data";
import { Logo, Icon, Button, Card, StatusBadge, inputCls, Field } from "./ui";
import { api } from "../lib/api";

type View = "dashboard" | "books" | "members" | "admins" | "loans" | "returns" | "reports";

const NAV: { id: View; label: string; icon: keyof typeof Icon }[] = [
  { id: "dashboard", label: "Dashboard", icon: "chart" },
  { id: "books", label: "Data Buku", icon: "books" },
  { id: "members", label: "Data Anggota", icon: "users" },
  { id: "admins", label: "Data Admin", icon: "user" },
  { id: "loans", label: "Peminjaman", icon: "swap" },
  { id: "returns", label: "Pengembalian", icon: "refresh" },
  { id: "reports", label: "Laporan", icon: "download" },
];

export default function AdminApp({ user, onLogout }: { user?: any; onLogout: () => void }) {
  const [view, setView] = useState<View>("dashboard");
  const [borrowings, setBorrowings] = useState<any[]>([]);

  const fetchBorrowings = () => {
    api.getAllBorrowings().then((res) => {
      if (res && res.borrowings) {
        setBorrowings(res.borrowings);
      }
    }).catch(() => { });
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.updateBorrowStatus(id, status);
      fetchBorrowings();
    } catch (err: any) {
      console.error(err);
    }
  };
  const active = view;

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-forest-deep p-5 text-paper lg:flex">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-center pt-2">
            <Logo size={60} />
          </div>
          <div className="text-center text-[0.65rem] font-800 uppercase tracking-[0.18em] text-paper/70">
            Panel Petugas
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
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 border-b border-border bg-paper/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Logo size={34} />
              <span className="text-[0.65rem] font-800 uppercase tracking-wider bg-forest-soft text-forest px-2 py-0.5 rounded-full">Petugas</span>
            </div>
            <button onClick={onLogout} title="Keluar" className="p-1.5 text-ink-soft hover:text-danger rounded-lg transition">
              <Icon.logout className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-2">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => setView(n.id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-700 ${active === n.id ? "bg-forest text-paper" : "text-ink-soft"}`}>{n.label}</button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:py-9">
          {view === "dashboard" && <Dashboard borrowings={borrowings} onUpdateStatus={handleUpdateStatus} goto={setView} />}
          {view === "books" && <BooksManager />}
          {view === "members" && <MembersManager />}
          {view === "admins" && <AdminManager />}
          {view === "loans" && <LoansManager borrowings={borrowings} onUpdateStatus={handleUpdateStatus} />}
          {view === "returns" && <ReturnsManager borrowings={borrowings} onUpdateStatus={handleUpdateStatus} />}
          {view === "reports" && <Reports borrowings={borrowings} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ borrowings = [], onUpdateStatus, goto }: { borrowings?: any[]; onUpdateStatus: (id: number, status: string) => void; goto: (v: View) => void }) {
  const pendingLoans = borrowings.filter((l) => l.status === "PENDING");
  const activeLoans = borrowings.filter((l) => l.status === "BORROWED");

  const stats = [
    { label: "Pengajuan Menunggu", value: pendingLoans.length, sub: "perlu konfirmasi admin", icon: "alert" as const, tone: "amber" },
    { label: "Sedang Dipinjam", value: activeLoans.length, sub: "transaksi aktif", icon: "swap" as const, tone: "forest" },
    { label: "Total Peminjaman", value: borrowings.length, sub: "di Perpustakaan", icon: "clock" as const, tone: "ok" },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-700">Dashboard Admin</h1>
          <p className="mt-1 text-ink-soft">Ringkasan aktivitas Perpustakaan KANCIL & Konfirmasi Peminjaman.</p>
        </div>
        <Button onClick={() => goto("loans")}><Icon.plus className="w-5 h-5" /> Kelola Semua Peminjaman</Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      {/* Permohonan Menunggu Konfirmasi */}
      <Card className="p-6 border-amber/30 bg-amber-soft/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-xl font-700 flex items-center gap-2">
              Pengajuan Peminjaman Menunggu Konfirmasi ({pendingLoans.length})
            </h3>
            <p className="text-sm text-ink-soft">Konfirmasi pengajuan peminjaman dari siswa di bawah ini.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => goto("loans")}>Lihat Semua Peminjaman</Button>
        </div>

        {pendingLoans.length === 0 ? (
          <div className="p-6 text-center text-ink-soft text-sm bg-white/60 rounded-xl border border-dashed border-border">
            Belum ada pengajuan peminjaman baru yang perlu dikonfirmasi.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingLoans.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
                <div>
                  <p className="font-700 text-ink">{l.user?.name || "Siswa"} <span className="text-xs text-ink-soft">({l.user?.email || "Email"})</span></p>
                  <p className="text-sm text-forest font-600">Buku: {l.book?.title || "Buku"}</p>
                  <p className="text-xs text-ink-soft">Tanggal Pengajuan: {l.borrowDate ? String(l.borrowDate).split("T")[0] : "Hari ini"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => onUpdateStatus(l.id, "BORROWED")}>
                    <Icon.check className="w-4 h-4" /> Setujui Peminjaman
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onUpdateStatus(l.id, "REJECTED")}>
                    Tolak
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Books Manager ---------------- */
function BooksManager() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [cover, setCover] = useState<string | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for adding & editing book
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState("2026");
  const [stock, setStock] = useState("3");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Mata Pelajaran");
  const [editingBook, setEditingBook] = useState<any | null>(null);

  const fetchBooks = () => {
    api.getBooks().then((res) => {
      if (res && res.books) {
        setBooks(res.books);
      }
    }).catch(() => { });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function closeAdd() {
    setShowAdd(false);
    setEditingBook(null);
    setCover(null);
    setCoverUrl(null);
    setTitle("");
    setAuthor("");
    setPublisher("");
    setDescription("");
    setSelectedCategory("Mata Pelajaran");
  }

  const openEditBook = (b: any) => {
    setEditingBook(b);
    setTitle(b.title || "");
    setAuthor(b.author || "");
    setPublisher(b.publisher || "");
    setYear(String(b.year || 2026));
    setStock(String(b.stock !== undefined ? b.stock : b.copies || 1));
    setDescription(b.description || "");
    setSelectedCategory(b.category?.name || b.category || "Dongeng");
    setCoverUrl(b.coverUrl || (b.cover && b.cover.startsWith("data:") ? b.cover : null));
  };

  const handleSaveBook = async () => {
    if (!title || !author) {
      alert("Judul dan Penulis buku wajib diisi!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title,
        author,
        publisher,
        year: Number(year) || 2026,
        stock: Number(stock) || 1,
        description,
        categoryName: selectedCategory,
        coverUrl: coverUrl || undefined,
      };

      if (editingBook) {
        await api.updateBook(Number(editingBook.id), payload);
      } else {
        await api.createBook(payload);
      }
      closeAdd();
      fetchBooks();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan buku.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus buku ini?")) return;
    try {
      await api.deleteBook(id);
      fetchBooks();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus buku.");
    }
  };
  const rows = books.filter((b) => {
    const bCat = typeof b.category === "object" ? b.category?.name : (b.category || "Umum");
    const okC = !cat || (bCat && String(bCat).toLowerCase().trim() === cat.toLowerCase().trim());
    const okQ = !q || b.title.toLowerCase().includes(q.toLowerCase()) || b.author.toLowerCase().includes(q.toLowerCase());
    return okC && okQ;
  });

  return (
    <div className="space-y-6">
      <PageHead title="Kelola Data Buku" desc={`${rows.length} judul ditampilkan.`} action={<Button onClick={() => { closeAdd(); setShowAdd(true); }}><Icon.plus className="w-5 h-5" /> Tambah Buku</Button>} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Cari judul atau penulis…" />
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 mt-4">
        {CATEGORIES.map((c) => {
          const active = cat === c.name;
          return (
            <button
              key={c.name}
              onClick={() => setCat(active ? "" : c.name)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-600 transition ${active
                ? "bg-forest text-paper shadow-sm border border-forest"
                : "border border-border bg-white text-ink hover:border-forest hover:text-forest"
                }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <TableHead cols={["Buku", "Kategori", "Tahun", "Stok Available", "Status", "Aksi"]} widths="grid-cols-[2.4fr_1.2fr_.7fr_.8fr_1fr_.8fr]" />
        {rows.map((b) => {
          const avail = b.availableStock !== undefined ? b.availableStock : b.available;
          const totalCopies = b.stock !== undefined ? b.stock : b.copies;
          const catName = b.category?.name || b.category || "Umum";
          const coverImg = b.coverUrl || b.cover;
          const shortTitle = b.title.length > 25 ? b.title.substring(0, 25) + "…" : b.title;
          const statusText = avail > 0 ? "Tersedia" : "Tidak Tersedia";

          return (
            <Row key={b.id} widths="grid-cols-[2.4fr_1.2fr_.7fr_.8fr_1fr_.8fr]">
              <div className="flex items-center gap-3">
                {coverImg && (coverImg.startsWith("http") || coverImg.startsWith("data:")) ? (
                  <img src={coverImg} alt="" className="h-10 w-8 shrink-0 rounded-md object-cover bg-paper-2 border border-border" />
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper-2 text-ink-soft text-xs">{b.title[0]}</span>
                )}
                <div className="min-w-0" title={b.title}>
                  <p className="truncate font-700">{shortTitle}</p>
                  <p className="truncate text-xs text-ink-soft">{b.author}</p>
                </div>
              </div>
              <span className="text-sm text-ink-soft">{catName}</span>
              <span className="text-sm">{b.year || 2026}</span>
              <span className="text-sm font-700">{avail}/{totalCopies}</span>
              <StatusBadge status={statusText} />
              <div className="flex gap-1">
                <IconBtn icon="edit" label="Edit Buku" onClick={() => openEditBook(b)} />
                <IconBtn icon="trash" label="Hapus Buku" danger onClick={() => handleDeleteBook(Number(b.id))} />
              </div>
            </Row>
          );
        })}
      </Card>

      {(showAdd || editingBook) && (
        <Modal title={editingBook ? "Edit Data Buku" : "Tambah Buku Baru ke Katalog"} onClose={closeAdd}>
          <div className="space-y-5">
            {/* Cover Upload Area */}
            <div className="rounded-2xl border-2 border-dashed border-forest/30 bg-forest-soft/30 p-4 transition-all hover:border-forest hover:bg-forest-soft/50">
              <label className="block text-xs font-800 uppercase tracking-wider text-forest mb-2">Foto Cover Buku</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {coverUrl ? (
                  <div className="relative aspect-[3/4] w-24 overflow-hidden rounded-xl border-2 border-white shadow-md shrink-0 group">
                    <img src={coverUrl} alt="Preview Cover" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverUrl(null)}
                      className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-danger/90 text-white text-xs font-bold shadow-md hover:bg-danger"
                      title="Hapus Foto"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="grid aspect-[3/4] w-24 shrink-0 place-items-center rounded-xl border-2 border-dashed border-border bg-white text-ink-soft text-xs text-center p-2 shadow-inner">
                    <div>
                      <Icon.image className="w-6 h-6 mx-auto mb-1 text-forest/60" />
                      <span className="text-[0.65rem] font-700">Preview Cover</span>
                    </div>
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="cover-upload-input"
                  />
                  <label
                    htmlFor="cover-upload-input"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-700 text-paper shadow-sm hover:bg-forest-deep transition transform active:scale-95"
                  >
                    <Icon.image className="w-4 h-4" /> {coverUrl ? "Ganti Foto Cover" : "Pilih Foto Gambar"}
                  </label>
                  <p className="mt-2 text-xs text-ink-soft">Format gambar: JPG, PNG, atau WebP. Foto akan langsung ditampilkan di katalog siswa.</p>
                </div>
              </div>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Judul Buku">
                  <input
                    className={inputCls}
                    placeholder="Masukkan judul buku lengkap…"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Kategori Buku">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={inputCls}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Penulis / Pengarang">
                <input
                  className={inputCls}
                  placeholder="Nama penulis"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </Field>

              <Field label="Penerbit">
                <input
                  className={inputCls}
                  placeholder="Nama penerbit"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                />
              </Field>

              <Field label="Tahun Terbit">
                <input
                  className={inputCls}
                  placeholder="2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </Field>

              <Field label="Jumlah Stok Buku">
                <input
                  type="number"
                  min="1"
                  className={inputCls}
                  placeholder="3"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Ringkasan & Deskripsi Buku">
                  <textarea
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="Tuliskan ringkasan singkat isi buku..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
              <Button variant="ghost" onClick={closeAdd}>
                Batal
              </Button>
              <Button onClick={handleSaveBook} disabled={loading} size="lg" className="px-7">
                <Icon.check className="w-5 h-5" /> {loading ? "Menyimpan Data Buku." : editingBook ? "Perbarui Buku" : "Simpan data Buku"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Members Manager (Siswa & Guru) ---------------- */
function MembersManager() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("Semua");
  const [showAdd, setShowAdd] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  // States for adding member
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nim, setNim] = useState("");
  const [phone, setPhone] = useState("");
  const [kelas, setKelas] = useState("");
  const [memberRole, setMemberRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [loading, setLoading] = useState(false);

  const fetchUsersList = () => {
    api.getUsers().then((res) => {
      if (res && res.users) {
        setMembers(res.users.filter((u: any) => u.role === "STUDENT" || u.role === "TEACHER"));
      }
    }).catch(() => { });
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleAddMember = async () => {
    if (!name || !email || !password) {
      alert("Nama, Email, dan Password wajib diisi!");
      return;
    }
    setLoading(true);
    try {
      await api.register({
        name,
        email,
        password,
        nim: nim || undefined,
        phone: phone || undefined,
        kelas: kelas || undefined,
        role: memberRole,
      });
      setShowAdd(false);
      setName("");
      setEmail("");
      setPassword("");
      setNim("");
      setPhone("");
      setKelas("");
      setMemberRole("STUDENT");

      fetchUsersList();
    } catch (err: any) {
      alert(err.message || "Gagal menambahkan anggota.");
    } finally {
      setLoading(false);
    }
  };

  const rows = members.filter((m) => {
    const okR = role === "Semua" || m.role === role;
    const okQ = !q || m.name?.toLowerCase().includes(q.toLowerCase()) || (m.nim && m.nim.includes(q)) || m.email?.toLowerCase().includes(q.toLowerCase());
    return okR && okQ;
  });

  return (
    <div className="space-y-6">
      <PageHead
        title="Kelola Data Anggota (Siswa & Guru)"
        desc={`${members.length} anggota terdaftar.`}
        action={<Button onClick={() => setShowAdd(true)}><Icon.plus className="w-5 h-5" /> Tambah Anggota</Button>}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Cari nama, email, atau NIS/NIP…" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputCls} w-auto font-700`}>
          <option value="Semua">Semua Peran (Siswa & Guru)</option>
          <option value="STUDENT">Siswa (STUDENT)</option>
          <option value="TEACHER">Guru (TEACHER)</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        <TableHead cols={["Anggota", "NIS / NIP", "Peran", "Total Pinjaman", "No HP"]} widths="grid-cols-[2fr_1fr_1fr_1fr_1fr]" />
        {rows.length === 0 ? (
          <div className="p-8 text-center text-ink-soft font-600">Tidak ada data anggota yang ditemukan.</div>
        ) : (
          rows.map((m) => (
            <Row key={m.id} widths="grid-cols-[2fr_1fr_1fr_1fr_1fr]">
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-800 ${m.role === "TEACHER" ? "bg-berry text-paper" : "bg-forest text-paper"}`}>{m.name ? m.name[0] : "U"}</span>
                <div className="min-w-0"><p className="truncate font-700">{m.name}</p><p className="truncate text-xs text-ink-soft">{m.email}</p></div>
              </div>
              <span className="text-sm">{m.nim || m.idNumber || "-"}</span>
              <span className="text-sm font-700 text-ink-soft">{m.role === "TEACHER" ? "Guru" : "Siswa"}</span>
              <span className="text-sm"><b>{m._count?.borrowings !== undefined ? m._count.borrowings : m.activeLoans || 0}</b> buku</span>
              <span className="text-sm text-ink-soft">{m.phone || "-"}</span>
            </Row>
          ))
        )}
      </Card>

      {showAdd && (
        <Modal title="Tambah Anggota Baru (Siswa / Guru)" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <Field label="Nama Lengkap">
              <input
                className={inputCls}
                placeholder="Ahmad Rizky / Ibu Siti"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email">
                <input
                  type="email"
                  className={inputCls}
                  placeholder="email@sekolah.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field label="Kata Sandi">
                <input
                  type="password"
                  className={inputCls}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="NIS / NIP">
                <input
                  className={inputCls}
                  placeholder="19850101..."
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                />
              </Field>
              <Field label="No HP">
                <input
                  className={inputCls}
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Peran Anggota">
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as "STUDENT" | "TEACHER")}
                  className={inputCls}
                >
                  <option value="STUDENT">Siswa (STUDENT)</option>
                  <option value="TEACHER">Guru (TEACHER)</option>
                </select>
              </Field>
              <Field label="Kelas / Jurusan">
                <input
                  className={inputCls}
                  placeholder="Mis. X IPA 1 (Kosongkan jika Guru)"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Batal</Button>
              <Button onClick={handleAddMember} disabled={loading}>
                <Icon.check className="w-5 h-5" /> {loading ? "Menyimpan..." : "Simpan Anggota"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Admin Manager (Petugas Admin Utama) ---------------- */
function AdminManager() {
  const [q, setQ] = useState("");
  const [admins, setAdmins] = useState<any[]>([]);

  useEffect(() => {
    api.getUsers().then((res) => {
      if (res && res.users) {
        setAdmins(res.users.filter((u: any) => u.role === "ADMIN"));
      }
    }).catch(() => { });
  }, []);

  const rows = admins.filter((m) => !q || m.name?.toLowerCase().includes(q.toLowerCase()) || m.email?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHead
        title="Data Petugas Admin (Pengelola Utama)"
        desc="Akun terautentikasi pengelola sistem & administrasi perpustakaan."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Cari nama atau email admin…" />
      </div>

      <Card className="overflow-hidden">
        <TableHead cols={["Nama Petugas Admin", "Email Utama", "NIP / ID", "Peran Hak Akses", "No Telepon"]} widths="grid-cols-[2fr_1.8fr_1fr_1.2fr_1fr]" />
        {rows.length === 0 ? (
          <div className="p-8 text-center text-ink-soft font-600">Tidak ada data admin yang ditemukan.</div>
        ) : (
          rows.map((m) => (
            <Row key={m.id} widths="grid-cols-[2fr_1.8fr_1fr_1.2fr_1fr]">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber text-ink font-800">{m.name ? m.name[0] : "A"}</span>
                <div className="min-w-0">
                  <p className="truncate font-700">{m.name}</p>
                  <p className="truncate text-xs text-ink-soft">Admin KANCIL</p>
                </div>
              </div>
              <span className="text-sm font-600">{m.email}</span>
              <span className="text-sm">{m.nim || m.idNumber || "ADMIN-01"}</span>
              <span className="text-sm font-800 text-forest">Administrator</span>
              <span className="text-sm text-ink-soft">{m.phone || "-"}</span>
            </Row>
          ))
        )}
      </Card>
    </div>
  );
}

/* ---------------- Loans Manager ---------------- */
function LoansManager({ borrowings, onUpdateStatus }: { borrowings: any[]; onUpdateStatus: (id: number, status: string) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("Semua");
  const [membersList, setMembersList] = useState<any[]>([]);
  const [booksList, setBooksList] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [selectedBookId, setSelectedBookId] = useState<number | "">("");
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAddData = () => {
    api.getUsers().then((res) => {
      if (res && res.users) {
        setMembersList(res.users);
        if (res.users.length > 0) setSelectedUserId(res.users[0].id);
      }
    }).catch(() => { });

    api.getBooks().then((res) => {
      if (res && res.books) {
        setBooksList(res.books);
        const availBooks = res.books.filter((b: any) => b.availableStock > 0);
        if (availBooks.length > 0) setSelectedBookId(availBooks[0].id);
      }
    }).catch(() => { });
  };

  useEffect(() => {
    fetchAddData();
  }, []);

  const openAddModal = () => {
    fetchAddData();
    setShowAdd(true);
  };

  const handleCreateBorrow = async () => {
    if (!selectedUserId || !selectedBookId) {
      alert("Silakan pilih Anggota dan Buku terlebih dahulu.");
      return;
    }
    setSubmitLoading(true);
    try {
      await api.createBorrowByAdmin({
        userId: Number(selectedUserId),
        bookId: Number(selectedBookId),
        borrowDate,
        dueDate,
      });
      setShowAdd(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Gagal mencatat peminjaman.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const rows = borrowings.length > 0 ? borrowings.filter((l) => {
    if (filter === "Semua") return true;
    if (filter === "Dipinjam") return l.status === "BORROWED" || l.status === "PENDING";
    if (filter === "Terlambat") return l.status === "OVERDUE";
    if (filter === "Dikembalikan") return l.status === "RETURNED";
    return true;
  }) : LOANS.filter((l) => filter === "Semua" || l.status === filter);

  return (
    <div className="space-y-6">
      <PageHead title="Data Peminjaman" desc="Semua transaksi peminjaman buku dari siswa." action={<Button onClick={openAddModal}><Icon.plus className="w-5 h-5" /> Tambah Peminjaman</Button>} />

      <div className="flex flex-wrap gap-2">
        {["Semua", "Dipinjam", "Terlambat", "Dikembalikan"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-700 transition ${filter === f ? "bg-forest text-paper" : "border border-border bg-card text-ink-soft hover:border-forest"}`}>{f}</button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <TableHead cols={["Anggota", "Buku", "Tgl Pinjam", "Batas Kembali", "Status / Aksi"]} widths="grid-cols-[1.4fr_1.8fr_1fr_1fr_1.5fr]" />
        {rows.map((l) => {
          const userName = l.user?.name || "Siswa";
          const userNim = l.user?.nim || "NIS";
          const bookTitle = l.book?.title || "Buku";
          const borrowDateStr = l.borrowDate ? String(l.borrowDate).split("T")[0] : "2026-09-03";
          const dueDateStr = l.dueDate ? String(l.dueDate).split("T")[0] : "2026-09-10";

          return (
            <Row key={l.id} widths="grid-cols-[1.4fr_1.8fr_1fr_1fr_1.5fr]">
              <div className="min-w-0"><p className="truncate font-700">{userName}</p><p className="text-xs text-ink-soft">{userNim}</p></div>
              <div className="flex items-center gap-2 min-w-0"><span className="grid h-5 w-5 place-items-center rounded bg-paper-2 text-ink-soft text-[0.6rem]">{bookTitle[0]}</span><span className="truncate text-sm">{bookTitle}</span></div>
              <span className="text-sm text-ink-soft">{borrowDateStr}</span>
              <span className="text-sm text-ink-soft">{dueDateStr}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={l.status === "BORROWED" ? "Dipinjam" : l.status === "RETURNED" ? "Dikembalikan" : l.status === "PENDING" ? "Tersedia" : l.status} />
                {l.status === "PENDING" && (
                  <Button size="sm" onClick={() => onUpdateStatus(l.id, "BORROWED")} className="py-1 px-2 text-xs">Setujui</Button>
                )}
                {l.status === "BORROWED" && (
                  <Button size="sm" variant="secondary" onClick={() => onUpdateStatus(l.id, "RETURNED")} className="py-1 px-2 text-xs">Kembalikan</Button>
                )}
              </div>
            </Row>
          );
        })}
      </Card>

      {showAdd && (
        <Modal title="Catat Peminjaman Baru" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <Field label="Anggota / Siswa Peminjam">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                className={inputCls}
              >
                {membersList.length === 0 ? (
                  <option value="">Belum ada anggota terdaftar</option>
                ) : (
                  membersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.nim || m.email} ({m.role})
                    </option>
                  ))
                )}
              </select>
            </Field>

            <Field label="Pilih Buku Yang Dipinjam">
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(Number(e.target.value))}
                className={inputCls}
              >
                {booksList.length === 0 ? (
                  <option value="">Belum ada buku tersedia</option>
                ) : (
                  booksList.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.availableStock < 1}>
                      {b.title} — {b.author} ({b.availableStock > 0 ? `Stok: ${b.availableStock}` : "Habis"})
                    </option>
                  ))
                )}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tanggal Pinjam">
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Batas Kembali">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Batal</Button>
              <Button onClick={handleCreateBorrow} disabled={submitLoading}>
                <Icon.check className="w-5 h-5" /> {submitLoading ? "Mencatat..." : "Catat Peminjaman"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Returns Manager ---------------- */
function ReturnsManager({ borrowings = [], onUpdateStatus }: { borrowings?: any[]; onUpdateStatus: (id: number, status: string) => void }) {
  const activeLoans = borrowings.filter((l) => l.status === "BORROWED");
  const returnedLoans = borrowings.filter((l) => l.status === "RETURNED");

  return (
    <div className="space-y-6">
      <PageHead title="Data Pengembalian Buku" desc={`Total ${returnedLoans.length} buku telah berhasil dikembalikan.`} />

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 bg-forest-soft/30 border-forest/20">
          <p className="text-sm font-700 text-forest">Sedang Dipinjam Siswa</p>
          <p className="text-3xl font-display font-700 text-forest-deep mt-1">{activeLoans.length} Buku</p>
        </Card>
        <Card className="p-5 bg-amber-soft/30 border-amber/20">
          <p className="text-sm font-700 text-warn">Total Telah Dikembalikan</p>
          <p className="text-3xl font-display font-700 text-ink mt-1">{returnedLoans.length} Buku</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <h3 className="p-4 font-700 text-lg border-b border-border bg-paper-2/40">Buku Yang Sedang Dipinjam (Menunggu Pengembalian)</h3>
        <TableHead cols={["Peminjam", "Buku", "Tgl Pinjam", "Batas Kembali", "Status", "Aksi"]} widths="grid-cols-[1.3fr_1.6fr_1fr_1fr_1fr_1.1fr]" />
        {activeLoans.length === 0 && <div className="p-8 text-center text-ink-soft">Semua buku yang dipinjam telah dikembalikan ke rak. </div>}
        {activeLoans.map((l) => {
          const userName = l.user?.name || "Siswa";
          const userNim = l.user?.nim || "NIS";
          const bookTitle = l.book?.title || "Buku";
          const borrowDateStr = l.borrowDate ? String(l.borrowDate).split("T")[0] : "2026-09-03";
          const dueDateStr = l.dueDate ? String(l.dueDate).split("T")[0] : "2026-09-10";

          return (
            <Row key={l.id} widths="grid-cols-[1.3fr_1.6fr_1fr_1fr_1fr_1.1fr]">
              <div className="min-w-0"><p className="truncate font-700">{userName}</p><p className="text-xs text-ink-soft">{userNim}</p></div>
              <div className="flex items-center gap-2 min-w-0"><span className="grid h-5 w-5 place-items-center rounded bg-paper-2 text-ink-soft text-[0.6rem]">{bookTitle[0]}</span><span className="truncate text-sm">{bookTitle}</span></div>
              <span className="text-sm text-ink-soft">{borrowDateStr}</span>
              <span className="text-sm text-ink-soft">{dueDateStr}</span>
              <StatusBadge status="Dipinjam" />
              <Button size="sm" variant="secondary" onClick={() => onUpdateStatus(l.id, "RETURNED")}>
                <Icon.check className="w-4 h-4" /> Kembalikan
              </Button>
            </Row>
          );
        })}
      </Card>

      {returnedLoans.length > 0 && (
        <Card className="overflow-hidden mt-6">
          <h3 className="p-4 font-700 text-lg border-b border-border bg-paper-2/40">Riwayat Pengembalian Buku Selesai ({returnedLoans.length})</h3>
          <TableHead cols={["Peminjam", "Buku", "Tgl Pinjam", "Tgl Pengembalian", "Status"]} widths="grid-cols-[1.4fr_1.8fr_1fr_1fr_1fr]" />
          {returnedLoans.map((l) => {
            const userName = l.user?.name || "Siswa";
            const bookTitle = l.book?.title || "Buku";
            const borrowDateStr = l.borrowDate ? String(l.borrowDate).split("T")[0] : "-";
            const returnDateStr = l.returnDate ? String(l.returnDate).split("T")[0] : "Hari ini";

            return (
              <Row key={l.id} widths="grid-cols-[1.4fr_1.8fr_1fr_1fr_1fr]">
                <span className="truncate font-700">{userName}</span>
                <span className="truncate text-sm font-600 text-forest">{bookTitle}</span>
                <span className="text-sm text-ink-soft">{borrowDateStr}</span>
                <span className="text-sm text-ink-soft font-700">{returnDateStr}</span>
                <StatusBadge status="Dikembalikan" />
              </Row>
            );
          })}
        </Card>
      )}
    </div>
  );
}

/* ---------------- Reports ---------------- */
function Reports({ borrowings = [] }: { borrowings?: any[] }) {
  const [tab, setTab] = useState<"pinjam" | "kembali" | "telat">("pinjam");
  const borrowed = borrowings;
  const returnedRows = borrowings.filter((l) => l.status === "RETURNED");
  const lateRows = borrowings.filter((l) => l.status === "OVERDUE");
  const dataset = tab === "pinjam" ? borrowed : tab === "kembali" ? returnedRows : lateRows;

  return (
    <div className="space-y-6">
      <PageHead title="Laporan" desc="Rekap peminjaman, pengembalian, dan keterlambatan." />

      <div className="grid grid-cols-3 gap-4">
        <ReportCard active={tab === "pinjam"} onClick={() => setTab("pinjam")} label="Total Peminjaman" value={borrowed.length} icon="swap" />
        <ReportCard active={tab === "kembali"} onClick={() => setTab("kembali")} label="Total Pengembalian" value={returnedRows.length} icon="refresh" />
        <ReportCard active={tab === "telat"} onClick={() => setTab("telat")} label="Total Keterlambatan" value={lateRows.length} icon="alert" />
      </div>

      <Card className="overflow-hidden">
        <TableHead cols={["Anggota", "Buku", "Tgl Pinjam", tab === "kembali" ? "Tgl Kembali" : "Batas Kembali", "Status"]} widths="grid-cols-[1.4fr_1.8fr_1fr_1fr_1fr]" />
        {dataset.length === 0 && <div className="p-8 text-center text-ink-soft">Belum ada data pada kategori ini.</div>}
        {dataset.map((l) => {
          const userName = l.user?.name || "Siswa";
          const bookTitle = l.book?.title || "Buku";
          const borrowDateStr = l.borrowDate ? String(l.borrowDate).split("T")[0] : "-";
          const returnDateStr = l.returnDate ? String(l.returnDate).split("T")[0] : l.dueDate ? String(l.dueDate).split("T")[0] : "-";

          return (
            <Row key={l.id} widths="grid-cols-[1.4fr_1.8fr_1fr_1fr_1fr]">
              <span className="truncate font-700">{userName}</span>
              <span className="truncate text-sm">{bookTitle}</span>
              <span className="text-sm text-ink-soft">{borrowDateStr}</span>
              <span className="text-sm text-ink-soft">{returnDateStr}</span>
              <StatusBadge status={l.status === "RETURNED" ? "Dikembalikan" : l.status === "BORROWED" ? "Dipinjam" : l.status} />
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
    <button onClick={onClick} aria-label={label} title={label} className={`grid h-8 w-8 place-items-center rounded-lg transition ${danger ? "text-ink-soft hover:bg-danger/10 hover:text-danger" : "text-ink-soft hover:bg-forest-soft hover:text-forest"}`}>
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
