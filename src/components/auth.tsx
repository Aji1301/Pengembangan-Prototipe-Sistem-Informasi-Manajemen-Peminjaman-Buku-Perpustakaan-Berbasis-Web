import { useState, useEffect } from "react";
import { Logo, Button, Field, inputCls } from "./ui";
import { CATEGORIES } from "../lib/data";
import { api, setAuthToken } from "../lib/api";

type Mode = "login" | "register" | "staff";

export default function AuthScreen({
  initialMode = "login",
  onEnter,
  onBackLanding,
}: {
  initialMode?: "student" | "staff" | "login";
  onEnter: (role: "student" | "admin", user: any) => void;
  onBackLanding?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(initialMode === "staff" ? "staff" : "login");

  const [booksCount, setBooksCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);

  useEffect(() => {
    api.getStats().then((res) => {
      if (res) {
        setBooksCount(res.booksCount || 0);
        setMembersCount(res.membersCount || 0);
        setCategoriesCount(res.categoriesCount || 0);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen w-full flex-1 grid lg:grid-cols-[1.05fr_1fr] bg-paper">
      {/* Left brand panel - Original UI */}
      <aside className="relative hidden overflow-hidden bg-forest text-paper lg:flex lg:flex-col lg:justify-between p-12 min-h-screen">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 15%, #fff 0 2px, transparent 2px), radial-gradient(circle at 65% 60%, #fff 0 2px, transparent 2px)",
            backgroundSize: "70px 70px",
          }}
        />



        <div className="relative">
          <p className="font-display text-[2.9rem] leading-[1.05] font-700">
            Setiap buku<br />adalah petualangan<br /><span className="text-amber">baru.</span>
          </p>
          <p className="mt-5 max-w-md text-paper/80 text-lg">
            Jelajahi Buku Dongeng Nusantara, Mata Pelajaran, Sains & Alam, Sejarah. Pinjam, baca, dan tumbuh bersama Kancil.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <span key={c.name} className="rounded-full bg-paper/12 px-3 py-1.5 text-sm font-600">
                {c.name}
              </span>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-6 text-sm">
          <Stat n={String(booksCount)} l="Koleksi buku" />
          <span className="h-8 w-px bg-paper/25" />
          <Stat n={String(membersCount)} l="Anggota aktif" />
          <span className="h-8 w-px bg-paper/25" />
          <Stat n={String(categoriesCount)} l="Kategori" />
        </div>
      </aside>

      {/* Right form panel - Original UI */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          {mode === "staff" ? (
            <StaffForm setMode={setMode} onEnter={onEnter} />
          ) : (
            <StudentForms mode={mode} setMode={setMode} onEnter={onEnter} />
          )}

          {onBackLanding && (
            <div className="pt-4 text-center border-t border-border/60">
              <button
                type="button"
                onClick={onBackLanding}
                className="font-700 text-xs text-ink-soft hover:text-forest transition cursor-pointer"
              >
                ← Kembali ke Halaman Utama
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-700">{n}</div>
      <div className="text-paper/70">{l}</div>
    </div>
  );
}

function StudentForms({
  mode,
  setMode,
  onEnter,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  onEnter: (role: "student" | "admin", user: any) => void;
}) {
  // Login States
  const [loginEmail, setLoginEmail] = useState("siswa@kancil.com");
  const [loginPassword, setLoginPassword] = useState("student123");
  const [rememberMe, setRememberMe] = useState(true);

  // Register States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regNim, setRegNim] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState<"STUDENT" | "TEACHER">("STUDENT");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.login({ email: loginEmail, password: loginPassword });
      setAuthToken(res.token);
      onEnter(res.user.role === "ADMIN" ? "admin" : "student", res.user);
    } catch (err: any) {
      setError(err.message || "Email/NIS atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        nim: regNim,
        phone: regPhone,
        role: regRole,
      });
      setAuthToken(res.token);
      onEnter("student", res.user);
    } catch (err: any) {
      setError(err.message || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "register") {
    return (
      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <h2 className="font-display text-3xl font-800 text-ink flex items-center gap-2">
            <span>Daftar Akun Baru</span> <span className="text-2xl"></span>
          </h2>
          <p className="text-sm text-ink-soft mt-1">Daftarkan akun Siswa atau Guru di perpustakaan Kancil.</p>
        </div>

        {error && <div className="p-3.5 rounded-2xl bg-danger/10 text-danger text-sm font-700">{error}</div>}

        <div>
          <label className="block text-sm font-700 text-ink mb-1.5">Nama Lengkap</label>
          <input
            className="w-full rounded-full px-5 py-3 border border-border bg-white focus:border-[#009BF2] focus:ring-2 focus:ring-[#009BF2]/20 outline-none font-600 text-sm transition"
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            required
            placeholder="Ahmad Rizky"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-700 text-ink mb-1.5">Email</label>
            <input
              type="email"
              className="w-full rounded-full px-5 py-3 border border-border bg-white focus:border-[#009BF2] focus:ring-2 focus:ring-[#009BF2]/20 outline-none font-600 text-sm transition"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
              placeholder="siswa@kancil.com"
            />
          </div>
          <div>
            <label className="block text-sm font-700 text-ink mb-1.5">Kata Sandi</label>
            <input
              type="password"
              className="w-full rounded-full px-5 py-3 border border-border bg-white focus:border-[#009BF2] focus:ring-2 focus:ring-[#009BF2]/20 outline-none font-600 text-sm transition"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-700 text-ink mb-1.5">NIS / NIP</label>
            <input
              className="w-full rounded-full px-5 py-3 border border-border bg-white focus:border-[#009BF2] focus:ring-2 focus:ring-[#009BF2]/20 outline-none font-600 text-sm transition"
              value={regNim}
              onChange={(e) => setRegNim(e.target.value)}
              placeholder="2026101"
            />
          </div>
          <div>
            <label className="block text-sm font-700 text-ink mb-1.5">No HP</label>
            <input
              className="w-full rounded-full px-5 py-3 border border-border bg-white focus:border-[#009BF2] focus:ring-2 focus:ring-[#009BF2]/20 outline-none font-600 text-sm transition"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              placeholder="08123456789"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-700 text-ink mb-1.5">Peran</label>
          <select
            value={regRole}
            onChange={(e) => setRegRole(e.target.value as "STUDENT" | "TEACHER")}
            className="w-full rounded-full px-5 py-3 border border-border bg-white focus:border-[#009BF2] focus:ring-2 focus:ring-[#009BF2]/20 outline-none font-600 text-sm transition"
          >
            <option value="STUDENT">Siswa (STUDENT)</option>
            <option value="TEACHER">Guru (TEACHER)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#009BF2] hover:bg-[#0086d4] text-white py-3.5 px-6 font-800 text-base shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{loading ? "Mendaftar..." : "Daftar Akun Anggota"}</span>
          <span className="text-lg"></span>
        </button>

        <p className="text-center text-xs font-700 text-ink-soft pt-1">
          Sudah punya akun?{" "}
          <button type="button" onClick={() => setMode("login")} className="text-[#009BF2] hover:underline cursor-pointer font-800">
            Login di sini
          </button>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-800 text-ink flex items-center gap-2">
          <span>Halo lagi!</span> <span className="text-2xl"></span>
        </h2>
        <p className="text-sm text-ink-soft mt-1">Masuk untuk melanjutkan membaca.</p>
      </div>

      {error && <div className="p-3.5 rounded-2xl bg-danger/10 text-danger text-sm font-700">{error}</div>}

      <div>
        <label className="block text-sm font-700 text-ink mb-1.5">Email atau NIS</label>
        <input
          type="text"
          className="w-full rounded-full px-5 py-3 border border-border bg-white focus:border-[#009BF2] focus:ring-2 focus:ring-[#009BF2]/20 outline-none font-600 text-sm transition"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="kirana@kancil.sch.id"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-700 text-ink mb-1.5">Kata Sandi</label>
        <input
          type="password"
          className="w-full rounded-full px-5 py-3 border border-border bg-white focus:border-[#009BF2] focus:ring-2 focus:ring-[#009BF2]/20 outline-none font-600 text-sm transition"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      {/* Checkbox Ingat saya & Lupa sandi */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-700 text-ink-soft select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-border text-[#009BF2] focus:ring-[#009BF2]"
          />
          <span>Ingat saya</span>
        </label>

        <button type="button" onClick={() => alert("Silakan hubungi petugas perpustakaan sekolah untuk mereset kata sandi Anda.")} className="text-xs font-800 text-[#009BF2] hover:underline cursor-pointer">
          Lupa sandi?
        </button>
      </div>

      {/* Main Login Button matching screenshot */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#009BF2] hover:bg-[#0086d4] text-white py-3.5 px-6 font-800 text-base shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>{loading ? "Memproses..." : "Masuk"}</span>
        <span className="text-lg"></span>
      </button>
    </form>
  );
}

function StaffForm({ setMode, onEnter }: { setMode: (m: Mode) => void; onEnter: (role: "student" | "admin", user: any) => void }) {
  const [email, setEmail] = useState("admin@kancil.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.login({ email, password });
      setAuthToken(res.token);
      onEnter("admin", res.user);
    } catch (err: any) {
      setError(err.message || "Email atau password petugas salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <h2 className="font-display text-3xl font-800 text-ink flex items-center gap-2">
          <span>Halo Petugas!</span> <span className="text-2xl"></span>
        </h2>
        <p className="text-sm text-ink-soft mt-1">Masuk untuk mengelola administrasi perpustakaan.</p>
      </div>

      {error && <div className="p-3.5 rounded-2xl bg-danger/10 text-danger text-sm font-700">{error}</div>}

      <div>
        <label className="block text-sm font-700 text-ink mb-1.5">Email Petugas Admin</label>
        <input
          type="email"
          className="w-full rounded-full px-5 py-3 border border-border bg-white focus:border-[#009BF2] focus:ring-2 focus:ring-[#009BF2]/20 outline-none font-600 text-sm transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@kancil.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-700 text-ink mb-1.5">Kata Sandi</label>
        <input
          type="password"
          className="w-full rounded-full px-5 py-3 border border-border bg-white focus:border-[#009BF2] focus:ring-2 focus:ring-[#009BF2]/20 outline-none font-600 text-sm transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#A7D02C] hover:bg-[#96bd22] text-[#1D3A05] py-3.5 px-6 font-800 text-base shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>{loading ? "Memproses..." : "Masuk sebagai Admin"}</span>
        <span className="text-lg"></span>
      </button>
    </form>
  );
}
