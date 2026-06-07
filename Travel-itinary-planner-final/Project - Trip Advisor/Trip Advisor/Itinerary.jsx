/* ───────────────── Itinerary.jsx — the core screen ───────────────── */

// Activity card on the timeline
function ActivityCard({ item, currency, pillStyle, animDelay }) {
  const [expanded, setExpanded] = React.useState(false);
  const [hover, setHover] = React.useState(false);

  return (
    <div className="card anim-rise"
      style={{ padding: 0, overflow: "hidden", animationDelay: `${animDelay}ms`,
        boxShadow: hover || expanded ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hover ? "translateY(-2px)" : "none",
        transition: "transform .25s cubic-bezier(.22,.61,.36,1), box-shadow .25s, border-color .2s",
        borderColor: expanded ? "rgb(var(--accent) / .45)" : hover ? "rgb(var(--muted) / .5)" : "rgb(var(--border))",
        cursor: "pointer" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => setExpanded(e => !e)}
    >
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Time badge */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 68 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgb(var(--accent))", background: "rgb(var(--accent) / .12)",
            padding: "4px 8px", borderRadius: 8, whiteSpace: "nowrap", border: "1px solid rgb(var(--accent) / .25)" }}>
            {item.time}
          </span>
        </div>
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, marginBottom: 8 }}>{item.title}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            <CategoryPill cat={item.cat} variant={pillStyle} size="sm" />
            {item.kids && <KidsBadge variant={pillStyle} size="sm" />}
          </div>
        </div>
        {/* Cost + expand arrow */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14.5, color: item.cost === 0 ? "rgb(var(--accent))" : "rgb(var(--text))" }}>
            {item.cost === 0 ? "Free" : window.money(item.cost, currency)}
          </span>
          <Icon name="chevronDown" size={16} stroke={2.5} style={{
            color: "rgb(var(--faint))", transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform .25s cubic-bezier(.22,.61,.36,1)" }} />
        </div>
      </div>
      {/* Expandable tip */}
      <div style={{
        maxHeight: expanded ? 120 : 0, overflow: "hidden",
        transition: "max-height .35s cubic-bezier(.22,.61,.36,1)",
      }}>
        <div style={{ padding: "0 16px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 10, background: "rgb(var(--accent) / .12)",
            display: "grid", placeItems: "center", color: "rgb(var(--accent))" }}>
            <Icon name="sparkle" size={14} stroke={2} />
          </div>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "rgb(var(--muted))", fontStyle: "italic" }}>
            {item.tip}
          </p>
        </div>
      </div>
    </div>
  );
}

// Day section with timeline chrome
function DaySection({ day, dayNum, currency, pillStyle }) {
  const total = day.items.reduce((s, it) => s + it.cost, 0);
  return (
    <div style={{ display: "flex", gap: 0 }}>
      {/* Timeline spine */}
      <div style={{ width: 48, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent-2)))",
          display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0,
          boxShadow: "0 4px 12px rgb(var(--accent) / .35)", zIndex: 1 }}>
          {dayNum}
        </div>
        <div style={{ width: 2, flex: 1, background: "linear-gradient(rgb(var(--accent) / .3), rgb(var(--border) / .4))",
          margin: "6px 0", borderRadius: 99 }} />
      </div>
      {/* Cards */}
      <div style={{ flex: 1, minWidth: 0, paddingLeft: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18, letterSpacing: "-.02em" }}>
            Day {dayNum} — <span style={{ fontWeight: 600, color: "rgb(var(--muted))" }}>{day.title}</span>
          </h3>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgb(var(--muted))", whiteSpace: "nowrap" }}>
            {window.money(total, currency)}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {day.items.map((it, i) => (
            <ActivityCard key={i} item={it} currency={currency} pillStyle={pillStyle}
              animDelay={dayNum * 60 + i * 50} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Omitted sidebar card
function OmittedCard({ item, currency, onAdd, pillStyle }) {
  const [added, setAdded] = React.useState(false);
  return (
    <div className="card" style={{ padding: "13px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.3, marginBottom: 5 }}>{item.title}</div>
          <CategoryPill cat={item.cat} variant={pillStyle} size="sm" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{window.money(item.cost, currency)}</span>
      </div>
      <div style={{ fontSize: 12, color: "rgb(var(--muted))", lineHeight: 1.5 }}>{item.tip}</div>
      <button type="button" onClick={() => { setAdded(true); if (onAdd) onAdd(item); }}
        disabled={added}
        className="focus-ring"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "8px 0",
          borderRadius: 10, border: `1.5px solid ${added ? "rgb(var(--accent))" : "rgb(var(--border))"}`,
          background: added ? "rgb(var(--accent) / .12)" : "transparent",
          color: added ? "rgb(var(--accent))" : "rgb(var(--muted))", fontWeight: 700, fontSize: 13,
          cursor: added ? "default" : "pointer", transition: "all .2s" }}>
        <Icon name={added ? "check" : "plus"} size={15} stroke={2.5} />
        {added ? "Added!" : "+ Add to plan"}
      </button>
    </div>
  );
}

// Packing checklist section
function PackingSection({ section }) {
  const [checked, setChecked] = React.useState({});
  const ICONS = { sun: "sun2", snow: "snow", kids: "kids", shield: "shield" };
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ width: 34, height: 34, borderRadius: 11, background: "rgb(var(--accent) / .14)",
          display: "grid", placeItems: "center", color: "rgb(var(--accent))", flexShrink: 0 }}>
          <Icon name={ICONS[section.icon] || "sparkle"} size={18} stroke={2} />
        </span>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-.01em" }}>{section.heading}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "rgb(var(--muted))", fontWeight: 600 }}>
          {Object.values(checked).filter(Boolean).length}/{section.items.length} packed
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {section.items.map((item, i) => (
          <label key={i} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <span onClick={() => setChecked(c => ({ ...c, [i]: !c[i] }))}
              style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${checked[i] ? "rgb(var(--accent))" : "rgb(var(--border))"}`,
                display: "grid", placeItems: "center", flexShrink: 0, transition: "all .18s",
                background: checked[i] ? "rgb(var(--accent))" : "transparent" }}>
              {checked[i] && <Icon name="check" size={13} stroke={2.8} style={{ color: "#fff" }} />}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4,
              color: checked[i] ? "rgb(var(--faint))" : "rgb(var(--text))",
              textDecoration: checked[i] ? "line-through" : "none", transition: "color .2s" }}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function Itinerary({ trip, currency, setCurrency, pillStyle, form, onBack }) {
  const grandTotal = trip.plan.reduce((s, d) => s + d.items.reduce((a, it) => a + it.cost, 0), 0);
  const packingSections = window.buildPacking(form || {});
  const CURR = window.CURRENCIES;

  return (
    <div className="anim-fade" style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 80px" }}>
      {/* Itinerary hero */}
      <div style={{ marginBottom: 32, borderRadius: 24, overflow: "hidden", position: "relative" }}>
        <Cover gradient={trip.cover} label={`${trip.city}${trip.country ? ", " + trip.country : ""}`}
          sub={`${trip.days} ${trip.days === 1 ? "day" : "days"} · ${trip.persona} · ${window.money(grandTotal, currency)} est.`}
          height={220} big />
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
          {/* Currency switcher */}
          <div className="glass" style={{ display: "flex", borderRadius: 14, overflow: "hidden",
            border: "1px solid rgba(255,255,255,.3)", boxShadow: "var(--shadow-sm)" }}>
            {Object.keys(CURR).map(c => (
              <button key={c} type="button" onClick={() => setCurrency(c)}
                style={{ padding: "8px 12px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                  background: currency === c ? "rgba(255,255,255,.85)" : "transparent",
                  color: currency === c ? "#111" : "rgba(255,255,255,.85)",
                  transition: "all .18s" }}>
                {CURR[c].symbol} {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p style={{ margin: "0 0 28px", fontSize: 16, color: "rgb(var(--muted))", fontStyle: "italic" }}>
        {trip.tagline}
      </p>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, alignItems: "start" }}>
        {/* ── Left: timeline ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {trip.plan.map((day) => (
            <DaySection key={day.day} day={day} dayNum={day.day} currency={currency} pillStyle={pillStyle} />
          ))}

          {/* Pricing summary */}
          <div className="card" style={{ padding: "20px 22px" }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, letterSpacing: "-.01em" }}>
              Cost breakdown
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {trip.plan.map(day => {
                const t = day.items.reduce((a, it) => a + it.cost, 0);
                return (
                  <div key={day.day} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, color: "rgb(var(--muted))", fontWeight: 500 }}>
                      Day {day.day} — {day.title}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{window.money(t, currency)}</span>
                  </div>
                );
              })}
              <div style={{ height: 1, background: "rgb(var(--border))", margin: "4px 0" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.01em" }}>Total estimate</span>
                <span className="grad-text" style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.03em" }}>
                  {window.money(grandTotal, currency)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "rgb(var(--faint))", lineHeight: 1.5 }}>
                Prices are estimates per person, excluding flights and accommodation.
              </p>
            </div>
          </div>

          {/* Packing module */}
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-.02em", marginBottom: 16 }}>
              Before you go ✈️
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {packingSections.map((s, i) => <PackingSection key={i} section={s} />)}
            </div>
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 100 }}>
          <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-.01em", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="edit" size={17} style={{ color: "rgb(var(--accent))" }} />
            Didn't fit the schedule
          </div>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgb(var(--muted))", lineHeight: 1.5 }}>
            Great options that didn't make the cut — add any of these to your plan.
          </p>
          {(trip.omitted || []).map((item, i) => (
            <OmittedCard key={i} item={item} currency={currency} pillStyle={pillStyle} />
          ))}

          {/* Quick summary chip */}
          <div className="card" style={{ padding: "16px 18px", marginTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: "rgb(var(--muted))" }}>QUICK STATS</div>
            {[
              { label: "Activities", val: trip.plan.reduce((s, d) => s + d.items.length, 0) },
              { label: "Free activities", val: trip.plan.reduce((s, d) => s + d.items.filter(it => it.cost === 0).length, 0) },
              { label: "Kids-friendly", val: trip.plan.reduce((s, d) => s + d.items.filter(it => it.kids).length, 0) },
              { label: "Dining spots", val: trip.plan.reduce((s, d) => s + d.items.filter(it => it.cat === "dining").length, 0) },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0",
                borderBottom: "1px solid rgb(var(--border))" }}>
                <span style={{ fontSize: 13, color: "rgb(var(--muted))", fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Itinerary });
