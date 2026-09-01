import { useState } from "react";
import { Logo, Button, Field, inputCls, Icon } from "./ui";
import { CATEGORIES } from "../lib/data";

type Mode = "login" | "staff";

export default function AuthScreen({ onEnter }: { onEnter: (role: "student" | "admin") => void }) {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="min-h-full grid lg:grid-cols-[1.05fr_1fr]">
      {/* Left brand panel */}
      <aside className="relative hidden overflow-hidden bg-forest text-paper lg:flex lg:flex-col lg:justify-between p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{ backgroundImage: "radial-gradient(circle at 15% 15%, #fff 0 2px, transparent 2px), radial-gradient(circle at 65% 60%, #fff 0 2px, transparent 2px)", backgroundSize: "70px 70px" }}
        />
        <Logo size={52} />
        <div className="relative">
          <p className="font-display text-[2.9rem] leading-[1.05] font-700">
            Setiap buku<br />adalah petualangan<br /><span className="text-amber">baru.</span>
          </p>
          <p className="mt-5 max-w-md text-paper/80 text-lg">
            Jelajahi 40.000+ buku anak, dongeng nusantara, dan ensiklopedia. Pinjam, baca, dan tumbuh bersama Kancil.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.slice(0, 5).map((c) => (
              <span key={c.name} className="rounded-full bg-paper/12 px-3 py-1.5 text-sm font-600">
                {c.emoji} {c.name}
              </span>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-6 text-sm">
          <Stat n="40.2rb" l="Koleksi buku" />
          <span className="h-8 w-px bg-paper/25" />
          <Stat n="1.180" l="Anggota aktif" />
          <span className="h-8 w-px bg-paper/25" />
          <Stat n="12" l="Kategori" />
        </div>
      </aside>

      {/* Right form panel */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo size={46} />
          </div>

          {mode !== "staff" ? (
            <StudentForms setMode={setMode} onEnter={() => onEnter("student")} />
          ) : (
            <StaffForm setMode={setMode} onEnter={() => onEnter("admin")} />
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

function StudentForms({ setMode, onEnter }: { setMode: (m: Mode) => void; onEnter: () => void }) {
  return (
    <div>
      <h1 className="mt-6 font-display text-3xl font-700">Halo lagi! 👋</h1>
      <p className="mt-1 text-ink-soft">
        Masuk untuk melanjutkan membaca.
      </p>

      <form className="mt-7 space-y-4" onSubmit={(e) => { e.preventDefault(); onEnter(); }}>
        <Field label="Email atau NIS">
          <input className={inputCls} placeholder="kirana@kancil.sch.id" defaultValue="kirana@kancil.sch.id" />
        </Field>
        <Field label="Kata Sandi">
          <input type="password" className={inputCls} placeholder="••••••••" defaultValue="kancilhebat" />
        </Field>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-soft font-600">
            <input type="checkbox" className="accent-forest w-4 h-4" defaultChecked /> Ingat saya
          </label>
          <button type="button" className="font-700 text-forest hover:underline">Lupa sandi?</button>
        </div>

        <Button type="submit" full size="lg">
          Masuk <Icon.arrow className="w-5 h-5" />
        </Button>
      </form>

      <div className="mt-8 border-t border-border pt-5 text-center">
        <button className="inline-flex items-center gap-2 text-sm font-700 text-ink-soft hover:text-forest" onClick={() => setMode("staff")}>
          <Icon.building className="w-4 h-4" /> Masuk sebagai Petugas / Admin
        </button>
      </div>
    </div>
  );
}

function StaffForm({ setMode, onEnter }: { setMode: (m: Mode) => void; onEnter: () => void }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full bg-amber-soft px-3 py-1.5 text-sm font-800 text-warn">
        <Icon.building className="w-4 h-4" /> Portal Petugas
      </div>
      <h1 className="mt-5 font-display text-3xl font-700">Login Petugas</h1>
      <p className="mt-1 text-ink-soft">Kelola koleksi, anggota, dan transaksi perpustakaan.</p>

      <form className="mt-7 space-y-4" onSubmit={(e) => { e.preventDefault(); onEnter(); }}>
        <Field label="Username / Email"><input className={inputCls} defaultValue="admin@kancil.sch.id" /></Field>
        <Field label="Kata Sandi"><input type="password" className={inputCls} defaultValue="pustakawan" /></Field>
        <Button type="submit" full size="lg" variant="secondary">
          Masuk ke Dashboard <Icon.arrow className="w-5 h-5" />
        </Button>
      </form>

      <div className="mt-8 border-t border-border pt-5 text-center">
        <button className="inline-flex items-center gap-2 text-sm font-700 text-ink-soft hover:text-forest" onClick={() => setMode("login")}>
          <Icon.back className="w-4 h-4" /> Kembali ke login siswa/guru
        </button>
      </div>
    </div>
  );
}

