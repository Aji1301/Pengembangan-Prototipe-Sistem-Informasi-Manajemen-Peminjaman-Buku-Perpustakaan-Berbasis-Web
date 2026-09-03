import { useState, useEffect } from "react";
import { Logo, Icon } from "./ui";
import { api } from "../lib/api";

export default function LandingPage({ onGoAuth }: { onGoAuth: (mode?: "student" | "staff") => void }) {
  const [books, setBooks] = useState<any[]>([]);

  const [booksCount, setBooksCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);

  // Fetch real books and stats from MySQL database concurrently with Promise.all
  useEffect(() => {
    Promise.all([api.getBooks(), api.getStats()])
      .then(([booksRes, statsRes]) => {
        if (booksRes && booksRes.books) setBooks(booksRes.books);
        if (statsRes) {
          setBooksCount(statsRes.booksCount || 0);
          setMembersCount(statsRes.membersCount || 0);
          setCategoriesCount(statsRes.categoriesCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen w-full bg-white text-ink flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-3.5 flex items-center justify-between">
          <Logo size={64} />

          <div className="flex items-center gap-6">
            <a href="#tentang" className="hidden sm:inline-block font-700 text-ink-soft hover:text-ink transition text-sm">
              Tentang Kami
            </a>
            <button
              onClick={() => onGoAuth("student")}
              className="bg-[#009BF2] hover:bg-[#0086d4] text-white px-6 py-2.5 rounded-full font-800 text-sm shadow-sm transition active:scale-95 cursor-pointer"
            >
              Masuk
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-12">
          {/* Left Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-800 text-xs tracking-wide">
              <span>Perpustakaan Digital Sekolah</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-800 leading-[1.15] text-[#222222]">
              Jelajahi Dunia Pengetahuan Bersama <span className="text-[#009BF2]">KANCIL</span>
            </h1>

            <p className="text-ink-soft text-base sm:text-lg leading-relaxed max-w-xl">
              Sistem Perpustakaan Digital SD Negeri 03 Cendekia yang memudahkan kamu meminjam, membaca, dan melacak buku favoritmu kapan saja dan di mana saja.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onGoAuth("student")}
                className="bg-[#009BF2] hover:bg-[#0086d4] text-white px-7 py-3.5 rounded-full font-800 text-sm sm:text-base shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                Masuk sebagai Siswa / Guru
              </button>

              <button
                onClick={() => onGoAuth("staff")}
                className="bg-[#A7D02C] hover:bg-[#96bd22] text-[#1D3A05] px-7 py-3.5 rounded-full font-800 text-sm sm:text-base shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                Masuk sebagai Petugas
              </button>
            </div>

            {/* Realtime MySQL Stats */}
            <div className="pt-6 grid grid-cols-3 gap-6 max-w-md border-t border-border/60">
              <div>
                <p className="font-display text-2xl sm:text-3xl font-800 text-ink">{booksCount}</p>
                <p className="text-xs sm:text-sm text-ink-soft font-600">Koleksi buku</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-800 text-ink">{membersCount}</p>
                <p className="text-xs sm:text-sm text-ink-soft font-600">Anggota aktif</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-800 text-ink">{categoriesCount}</p>
                <p className="text-xs sm:text-sm text-ink-soft font-600">Kategori</p>
              </div>
            </div>
          </div>

          {/* Right Image Frame */}
          <div className="relative max-w-md mx-auto lg:max-w-none w-full">
            <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-paper-2">
              <img
                src="/hero-kid.jpg"
                alt="Siswa membaca buku digital KANCIL"
                className="w-full h-[400px] sm:h-[450px] object-cover"
              />

              {/* Floating Top Right Tag */}
              <div className="absolute top-4 right-4 bg-[#A7D02C] text-[#1D3A05] px-4 py-1.5 rounded-full font-900 text-xs shadow-lg transform rotate-2">
                Gratis untuk siswa!
              </div>

              {/* Floating Bottom Badge */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur px-4 py-2.5 rounded-2xl shadow-xl border border-border flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white grid place-items-center text-white text-xs font-900 overflow-hidden p-1 border border-border shadow-xs">
                  <img src="/logo.png" alt="Kancil" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="font-800 text-xs text-ink leading-tight">Halo, aku Kancil! 🦌</p>
                  <p className="text-[0.7rem] text-ink-soft font-600">Temanmu membaca</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature Section ("Mengapa menggunakan KANCIL?") */}
      <section id="tentang" className="bg-[#F8FAFC] py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center space-y-12">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-800 text-ink">Mengapa menggunakan KANCIL?</h2>
            <p className="text-ink-soft text-base mt-2">Semua yang kamu butuhkan untuk membaca lebih banyak, dalam satu tempat.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <FeatureCard
              icon={<Icon.search className="w-6 h-6 text-[#009BF2]" />}
              iconBg="bg-[#E5F4FD]"
              title="Pencarian Mudah"
              desc="Temukan ribuan koleksi buku hanya dalam hitungan detik lewat pencarian pintar."
            />

            <FeatureCard
              icon={<Icon.clock className="w-6 h-6 text-[#8BAF1F]" />}
              iconBg="bg-[#F2F8E3]"
              title="Pantau Peminjaman"
              desc="Cek batas waktu pengembalian dengan pengingat agar kamu tidak pernah terlambat."
            />

            <FeatureCard
              icon={<Icon.books className="w-6 h-6 text-[#009BF2]" />}
              iconBg="bg-[#E5F4FD]"
              title="Akses Kapan Saja"
              desc="Lihat katalog dan riwayat bacaanmu dari smartphone maupun laptop, di mana saja."
            />
          </div>
        </div>
      </section>

      {/* 4. Koleksi Buku Section ("Intip Koleksi Kami") */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-800 text-ink">Intip Koleksi Kami</h2>
              <p className="text-ink-soft text-base mt-1">Sebagian buku populer yang menantimu di dalam.</p>
            </div>

            <button
              onClick={() => onGoAuth("student")}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-800 text-ink hover:bg-paper-2 transition cursor-pointer"
            >
              <span>Masuk untuk meminjam</span>
              <span className="text-lg"></span>
            </button>
          </div>

          {/* Real Books Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {(books.length > 0 ? books.slice(0, 6) : DEFAULT_PREVIEW_BOOKS).map((b) => (
              <div
                key={b.id}
                onClick={() => onGoAuth("student")}
                className="group cursor-pointer space-y-3"
              >
                <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden border border-border bg-paper-2 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition duration-200">
                  {b.coverUrl ? (
                    <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-forest/80 to-forest-deep text-paper p-4 flex flex-col justify-between">
                      <span className="text-xs uppercase font-800 opacity-75">{b.category?.name || "Buku"}</span>
                      <p className="font-display font-700 text-sm line-clamp-3">{b.title}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-display font-700 text-sm text-ink line-clamp-1 group-hover:text-[#009BF2] transition">{b.title}</h3>
                  <p className="text-xs text-ink-soft truncate">{b.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA Section ("Siap memulai petualangan membaca?") */}
      <section className="py-12 px-6 sm:px-10 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-[#009BF2] text-white p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-display text-3xl sm:text-4xl font-800">Siap memulai petualangan membaca?</h2>
            <p className="text-white/85 text-base sm:text-lg">Pilih peranmu dan masuk ke perpustakaan digital KANCIL sekarang.</p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => onGoAuth("student")}
                className="bg-[#A7D02C] hover:bg-[#96bd22] text-[#1D3A05] px-7 py-3.5 rounded-full font-800 text-base shadow-md transition active:scale-95 cursor-pointer"
              >
                Masuk sebagai Siswa / Guru
              </button>

              <button
                onClick={() => onGoAuth("staff")}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-7 py-3.5 rounded-full font-800 text-base transition active:scale-95 cursor-pointer"
              >
                Masuk sebagai Petugas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer Section */}
      <footer className="bg-[#0A73B7] text-white mt-auto pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/20">
          {/* Col 1: Logo & Info */}
          <div className="space-y-4">
            <div className="bg-white p-2.5 rounded-xl inline-block">
              <Logo size={42} />
            </div>
            <p className="text-white/80 text-sm leading-relaxed max-w-sm">
              Perpustakaan digital SD Negeri 03 Cendekia — menumbuhkan generasi anak Indonesia yang cinta literasi.
            </p>
          </div>

          {/* Col 2: Perpustakaan */}
          <div className="space-y-3">
            <h4 className="font-display font-800 text-base text-white">Perpustakaan</h4>
            <p className="text-white/80 text-sm flex items-center gap-2">
              <span></span> Jl. Cendekia No. 3, Lt. 2 Gedung Utama
            </p>
            <p className="text-white/80 text-sm flex items-center gap-2">
              <span></span> Senin - Jumat : 07.00 - 15.00 WIB
            </p>
          </div>

          {/* Col 3: Kontak */}
          <div className="space-y-3">
            <h4 className="font-display font-800 text-base text-white">Kontak</h4>
            <p className="text-white/80 text-sm flex items-center gap-2">
              <span></span> perpus@kancil.sch.id
            </p>
            <p className="text-white/80 text-sm flex items-center gap-2">
              <span></span> WhatsApp Admin: 0812-3003-0303
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-6 text-center text-xs text-white/60 font-600">
          © 2026 Perpustakaan KANCIL - Katalog Anak Cinta Literasi.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, iconBg, title, desc }: { icon: React.ReactNode; iconBg: string; title: string; desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-border shadow-xs space-y-4 hover:shadow-md transition">
      <div className={`h-12 w-12 rounded-2xl ${iconBg} grid place-items-center`}>
        {icon}
      </div>
      <h3 className="font-display text-xl font-800 text-ink">{title}</h3>
      <p className="text-ink-soft text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

const DEFAULT_PREVIEW_BOOKS = [
  { id: "1", title: "Si Kancil dan Harimau", author: "R. A. Kosasih", category: { name: "Dongeng" } },
  { id: "2", title: "Timun Mas", author: "Prof. Bambang Hidayat", category: { name: "Dongeng" } },
  { id: "3", title: "Ilmu Pengetahuan Alam", author: "Dewi", category: { name: "Sains" } },
  { id: "4", title: "Berkarakter Pancasila", author: "Studio Garuda", category: { name: "Pancasila" } },
  { id: "5", title: "Matematika SD", author: "Olivia Wilson", category: { name: "Pelajaran" } },
  { id: "6", title: "Legenda Malin Kundang", author: "Elang Jowi", category: { name: "Sejarah" } },
];
