/* ───────────────── ui.jsx — shared building blocks ───────────────── */

// Minimal stroke-icon set (24×24, currentColor)
const ICON_PATHS = {
  sun: "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4 M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
  plane: "M10.5 13.5 3 11l2-3 6 1 4.5-5.5a2 2 0 0 1 3 2.6L14 11l1 6-3 1.5-1.5-5Z",
  calendar: "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  minus: "M5 12h14",
  plus: "M12 5v14M5 12h14",
  chevron: "m9 6 6 6-6 6",
  chevronDown: "m6 9 6 6 6-6",
  check: "m5 12.5 4.5 4.5L19 7",
  wand: "m5 19 9-9M14 6l1.2-2.6L18 2.2 15.4 1 14.2-1.6 13 1 10.4 2.2 13 3.4 14 6ZM18 11l.7-1.6L20.4 8.7 18.8 8 18 6.3 17.2 8l-1.6.7 1.6.7L18 11Z",
  back: "m15 18-6-6 6-6",
  pin: "M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  clock: "M12 7v5l3 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
  kids: "M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  sparkle: "M12 3v6M12 15v6M3 12h6M15 12h6 M7 7l3 3M14 14l3 3M17 7l-3 3M10 14l-3 3",
  sun2: "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4 M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z",
  snow: "M12 2v20M4 6l16 12M20 6 4 18M12 2l-2.5 2.5M12 2l2.5 2.5M12 22l-2.5-2.5M12 22l2.5-2.5",
  shield: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z M9 12l2 2 4-4",
  shell: "M12 21V3M12 21c-5 0-9-4-9-9a9 9 0 0 1 18 0c0 5-4 9-9 9ZM6.5 9.5 12 12M17.5 9.5 12 12M9 17l3-5M15 17l-3-5",
  coins: "M9 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM15 22a6 6 0 0 0 0-12M9 8h.01",
  trash: "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9Z",
  star: "m12 3 2.6 5.6 6.1.7-4.5 4.1 1.2 6L12 16.9 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z",
  edit: "M4 20h4L19 9a2 2 0 0 0-3-3L5 16v4ZM14 7l3 3",
};

function Icon({ name, size = 20, stroke = 2, fill = "none", className = "", style = {} }) {
  const d = ICON_PATHS[name] || "";
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}
         style={{ display: "block", ...style }} fill={fill}
         stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((seg, i) => <path key={i} d={(i === 0 ? "" : "M") + seg} />)}
    </svg>
  );
}

// Convert hex → "r g b"
function hexRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

// Category pill with style variants: soft | solid | outline
function CategoryPill({ cat, variant = "soft", size = "md" }) {
  const meta = window.CATEGORIES[cat];
  if (!meta) return null;
  const rgb = hexRgb(meta.hex);
  const pad = size === "sm" ? "3px 9px" : "4px 11px";
  const fs = size === "sm" ? 11 : 12;
  let style;
  if (variant === "solid") {
    style = { background: `rgb(${rgb})`, color: "#fff", border: "1px solid transparent" };
  } else if (variant === "outline") {
    style = { background: "transparent", color: `rgb(${rgb})`, border: `1.5px solid rgb(${rgb} / .55)` };
  } else {
    style = { background: `rgb(${rgb} / .15)`, color: `rgb(${rgb})`, border: `1px solid rgb(${rgb} / .28)` };
  }
  return (
    <span style={{
      ...style, display: "inline-flex", alignItems: "center", gap: 6,
      padding: pad, fontSize: fs, fontWeight: 600, borderRadius: 999, lineHeight: 1,
      letterSpacing: ".01em", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: variant === "solid" ? "#fff" : `rgb(${rgb})`, opacity: variant === "outline" ? 1 : .9 }} />
      {meta.label}
    </span>
  );
}

function KidsBadge({ variant = "soft", size = "md" }) {
  const rgb = hexRgb(window.KIDS.hex);
  const fs = size === "sm" ? 11 : 12;
  let style;
  if (variant === "solid") style = { background: `rgb(${rgb})`, color: "#fff" };
  else if (variant === "outline") style = { background: "transparent", color: `rgb(${rgb})`, border: `1.5px solid rgb(${rgb} / .55)` };
  else style = { background: `rgb(${rgb} / .15)`, color: `rgb(${rgb})`, border: `1px solid rgb(${rgb} / .28)` };
  return (
    <span style={{
      ...style, display: "inline-flex", alignItems: "center", gap: 5,
      padding: size === "sm" ? "3px 8px" : "4px 10px", fontSize: fs, fontWeight: 600,
      borderRadius: 999, lineHeight: 1, whiteSpace: "nowrap",
    }}>
      <Icon name="kids" size={fs + 2} stroke={2.2} />
      {window.KIDS.label}
    </span>
  );
}

// Stepper row for demographics
function Stepper({ label, sub, value, onChange, min = 0, max = 12, accent }) {
  const btn = (dir, disabled, icon) => (
    <button type="button" disabled={disabled}
      onClick={() => onChange(Math.max(min, Math.min(max, value + dir)))}
      className="focus-ring"
      style={{
        width: 36, height: 36, borderRadius: 12, display: "grid", placeItems: "center",
        border: "1px solid rgb(var(--border))", background: "rgb(var(--surface-2))",
        color: disabled ? "rgb(var(--faint))" : "rgb(var(--text))",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1,
        transition: "transform .12s, background .15s, border-color .15s",
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(.9)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <Icon name={icon} size={18} stroke={2.4} />
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 4px" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{label}</div>
        {sub && <div style={{ fontSize: 12.5, color: "rgb(var(--muted))", marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {btn(-1, value <= min, "minus")}
        <span style={{ minWidth: 26, textAlign: "center", fontWeight: 700, fontSize: 18, fontVariantNumeric: "tabular-nums",
          color: value > 0 ? "rgb(var(--accent))" : "rgb(var(--faint))" }}>{value}</span>
        {btn(1, value >= max, "plus")}
      </div>
    </div>
  );
}

// Decorative gradient cover with soft pattern + label
function Cover({ gradient, label, sub, height = 170, big = false }) {
  return (
    <div style={{
      position: "relative", height, borderRadius: big ? 0 : "var(--r-card)",
      background: gradient, overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0,
        background: "radial-gradient(120% 90% at 85% 10%, rgba(255,255,255,.35), transparent 55%), radial-gradient(80% 70% at 10% 100%, rgba(0,0,0,.28), transparent 60%)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: .5,
        backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,.10) 0 2px, transparent 2px 22px)" }} />
      {label && (
        <div style={{ position: "absolute", left: 18, bottom: 14, color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,.35)" }}>
          <div style={{ fontWeight: 800, fontSize: big ? 40 : 22, letterSpacing: "-.02em", lineHeight: 1.05 }}>{label}</div>
          {sub && <div style={{ fontSize: big ? 15 : 12.5, opacity: .92, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Icon, hexRgb, CategoryPill, KidsBadge, Stepper, Cover });
