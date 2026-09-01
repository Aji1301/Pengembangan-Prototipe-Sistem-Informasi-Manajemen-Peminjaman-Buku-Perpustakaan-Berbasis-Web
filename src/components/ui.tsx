import type { ReactNode } from "react";
import type { Book, LoanStatus } from "../lib/data";

/* ---------- Kancil mascot logo ---------- */
export function Logo({ size = 40, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className="grid place-items-center rounded-2xl bg-forest text-paper shadow-sm"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <svg viewBox="0 0 48 48" width={size * 0.66} height={size * 0.66} fill="none">
          {/* antlers */}
          <path d="M16 15c-2-4-6-5-8-4 3 1 4 4 4 7M32 15c2-4 6-5 8-4-3 1-4 4-4 7" stroke="#fbf5e9" strokeWidth="2.4" strokeLinecap="round" />
          {/* head */}
          <path d="M24 12c7 0 11 5 11 12 0 8-5 14-11 14S13 32 13 24c0-7 4-12 11-12Z" fill="#fbf5e9" />
          {/* ears */}
          <ellipse cx="14" cy="20" rx="3" ry="5" fill="#fbf5e9" transform="rotate(-25 14 20)" />
          <ellipse cx="34" cy="20" rx="3" ry="5" fill="#fbf5e9" transform="rotate(25 34 20)" />
          {/* eyes + nose */}
          <circle cx="20" cy="24" r="2" fill="#2f6b4f" />
          <circle cx="28" cy="24" r="2" fill="#2f6b4f" />
          <path d="M24 29c-1.6 0-2.6 1-2.6 2.2 0 1.4 1.3 2.3 2.6 2.3s2.6-.9 2.6-2.3c0-1.2-1-2.2-2.6-2.2Z" fill="#e08a3c" />
        </svg>
      </div>
      {withText && (
        <div className="leading-none">
          <div className="font-display font-700 text-[1.35rem] tracking-tight text-forest">KANCIL</div>
          <div className="text-[0.6rem] font-700 uppercase tracking-[0.18em] text-ink-soft">Perpustakaan Sekolah</div>
        </div>
      )}
    </div>
  );
}

/* ---------- Icons (inline, lightweight) ---------- */
type IconProps = { className?: string };
const S = ({ children, className }: { children: ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className ?? "w-5 h-5"}>
    {children}
  </svg>
);

export const Icon = {
  home: (p: IconProps) => <S className={p.className}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></S>,
  books: (p: IconProps) => <S className={p.className}><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5Z" /><path d="M13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13Z" /></S>,
  bookmark: (p: IconProps) => <S className={p.className}><path d="M6 3h12v18l-6-4-6 4Z" /></S>,
  clock: (p: IconProps) => <S className={p.className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>,
  user: (p: IconProps) => <S className={p.className}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" /></S>,
  search: (p: IconProps) => <S className={p.className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></S>,
  grid: (p: IconProps) => <S className={p.className}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></S>,
  users: (p: IconProps) => <S className={p.className}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" /><path d="M16 5.2A3.5 3.5 0 0 1 16 12M21 20c0-2.4-1.6-4.2-4-4.8" /></S>,
  swap: (p: IconProps) => <S className={p.className}><path d="M4 8h13l-3-3M20 16H7l3 3" /></S>,
  refresh: (p: IconProps) => <S className={p.className}><path d="M20 11a8 8 0 0 0-14-4.5L4 9" /><path d="M4 5v4h4" /><path d="M4 13a8 8 0 0 0 14 4.5L20 15" /><path d="M20 19v-4h-4" /></S>,
  chart: (p: IconProps) => <S className={p.className}><path d="M4 20V4" /><path d="M4 20h16" /><rect x="7" y="12" width="3" height="5" rx="1" /><rect x="12" y="8" width="3" height="9" rx="1" /><rect x="17" y="5" width="3" height="12" rx="1" /></S>,
  plus: (p: IconProps) => <S className={p.className}><path d="M12 5v14M5 12h14" /></S>,
  edit: (p: IconProps) => <S className={p.className}><path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17Z" /><path d="M14 7l3 3" /></S>,
  trash: (p: IconProps) => <S className={p.className}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></S>,
  logout: (p: IconProps) => <S className={p.className}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 12h10l-3-3M20 12l-3 3" /></S>,
  arrow: (p: IconProps) => <S className={p.className}><path d="M5 12h14M13 6l6 6-6 6" /></S>,
  back: (p: IconProps) => <S className={p.className}><path d="M19 12H5M11 6l-6 6 6 6" /></S>,
  star: (p: IconProps) => <svg viewBox="0 0 24 24" fill="currentColor" className={p.className ?? "w-4 h-4"}><path d="m12 2 2.9 6 6.6.6-5 4.3 1.5 6.4L12 16.9 6 19.3l1.5-6.4-5-4.3L9.1 8Z" /></svg>,
  alert: (p: IconProps) => <S className={p.className}><path d="M12 3 2 20h20Z" /><path d="M12 10v4M12 17.5v.1" /></S>,
  check: (p: IconProps) => <S className={p.className}><path d="M5 12.5 10 17l9-10" /></S>,
  download: (p: IconProps) => <S className={p.className}><path d="M12 3v11m0 0 4-4m-4 4-4-4" /><path d="M5 20h14" /></S>,
  info: (p: IconProps) => <S className={p.className}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.1" /></S>,
  building: (p: IconProps) => <S className={p.className}><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h.1M14.9 7H15M9 11h.1M14.9 11H15M9 15h.1M14.9 15H15M10 21v-3h4v3" /></S>,
  image: (p: IconProps) => <S className={p.className}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L18 19" /><path d="m14 15 1.5-1.5a2 2 0 0 1 2.8 0L21 16" /></S>,
};

/* ---------- Button ---------- */
type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  full?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};
export function Button({ children, onClick, variant = "primary", size = "md", full, type = "button", disabled, className = "" }: BtnProps) {
  const base = "inline-flex items-center justify-center gap-2 font-700 rounded-full transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
  const sizes = { sm: "text-sm px-3.5 py-1.5", md: "px-5 py-2.5", lg: "text-lg px-7 py-3.5" };
  const variants = {
    primary: "bg-forest text-paper hover:bg-forest-deep shadow-sm shadow-forest/20",
    secondary: "bg-amber text-ink hover:brightness-105 shadow-sm shadow-amber/25",
    ghost: "text-ink hover:bg-forest-soft",
    outline: "border-2 border-border text-ink hover:border-forest hover:text-forest bg-card",
    danger: "bg-danger/10 text-danger hover:bg-danger hover:text-white",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${full ? "w-full" : ""} ${className}`}>
      {children}
    </button>
  );
}

/* ---------- Field ---------- */
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-700 text-ink mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-ink-soft mt-1">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-2xl border-2 border-border bg-card px-4 py-2.5 text-ink placeholder:text-ink-soft/60 outline-none transition focus:border-forest focus:bg-white";

/* ---------- Card ---------- */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card ${className}`}>{children}</div>;
}

/* ---------- Status badge ---------- */
export function StatusBadge({ status }: { status: LoanStatus | "Tersedia" | "Dipinjam" }) {
  const map: Record<string, string> = {
    Tersedia: "bg-forest-soft text-forest",
    Dipinjam: "bg-amber-soft text-warn",
    Dikembalikan: "bg-forest-soft text-forest",
    Terlambat: "bg-danger/12 text-danger",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-800 ${map[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* ---------- Book cover ---------- */
export function BookCover({ book, className = "" }: { book: Book; className?: string }) {
  return (
    <div className={`relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-paper-2 shadow-sm ${className}`}>
      {book.cover ? (
        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center p-3 text-center text-ink-soft">
          <div className="font-display font-700 leading-tight line-clamp-3">{book.title}</div>
        </div>
      )}
    </div>
  );
}

/* ---------- Rating stars ---------- */
export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-amber">
      <Icon.star className="w-4 h-4" />
      <span className="text-sm font-800 text-ink">{value.toFixed(1)}</span>
    </span>
  );
}
