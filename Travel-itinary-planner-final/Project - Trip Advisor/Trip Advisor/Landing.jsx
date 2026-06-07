/* ───────────────── Landing.jsx — featured wall ───────────────── */

function FeaturedCard({ trip, big, index, onOpen, cur }) {
  const [hover, setHover] = React.useState(false);
  const total = (trip.plan || []).reduce((s, d) => s + d.items.reduce((a, it) => a + it.cost, 0), 0);
  return (
    <button
      onClick={() => onOpen(trip.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="card focus-ring anim-rise"
      style={{
        textAlign: "left", padding: 0, overflow: "hidden", cursor: "pointer",
        display: "flex", flexDirection: "column",
        gridColumn: big ? "span 2" : "span 1",
        gridRow: big ? "span 2" : "span 1",
        animationDelay: `${index * 70}ms`,
        boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transform: hover ? "translateY(-6px)" : "none",
        transition: "transform .3s cubic-bezier(.22,.61,.36,1), box-shadow .3s",
        borderColor: hover ? "rgb(var(--accent) / .5)" : "rgb(var(--border))",
      }}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <Cover gradient={trip.cover} label={trip.city} sub={`${trip.country} · ${trip.days} ${trip.days === 1 ? "day" : "days"}`}
          height={big ? 300 : 168} big={big} />
        <span style={{
          position: "absolute", top: 14, left: 14, padding: "5px 11px", borderRadius: 999,
          fontSize: 12, fontWeight: 700, color: "#fff",
          background: "rgba(0,0,0,.32)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,.25)",
        }}>{trip.persona}</span>
        <span style={{
          position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: 999,
          display: "grid", placeItems: "center", color: "#fff",
          background: "rgba(0,0,0,.32)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,.25)",
          transform: hover ? "translateX(2px)" : "none", transition: "transform .25s",
        }}><Icon name="chevron" size={17} stroke={2.5} /></span>
      </div>
      <div style={{ padding: big ? "20px 22px 22px" : "15px 17px 17px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div style={{ fontSize: big ? 16 : 14, color: "rgb(var(--muted))", fontWeight: 500, lineHeight: 1.45 }}>
          {trip.tagline}
        </div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
            color: hover ? "rgb(var(--accent))" : "rgb(var(--text))", transition: "color .2s" }}>
            <Icon name="wand" size={15} /> View full plan
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "rgb(var(--muted))" }}>
            from {window.money(total, cur)}
          </span>
        </div>
      </div>
    </button>
  );
}

function Landing({ onOpenTrip, onPlan, cur }) {
  const trips = window.TRIPS;
  return (
    <div className="anim-fade" style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 80px" }}>
      {/* Hero */}
      <section style={{ position: "relative", padding: "64px 0 52px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: "0 0 auto 0", height: 320, zIndex: -1, pointerEvents: "none",
          background: "radial-gradient(60% 100% at 50% 0%, rgb(var(--accent) / .16), transparent 70%), radial-gradient(40% 80% at 78% 10%, rgb(var(--accent-2) / .12), transparent 70%)" }} />
        <div className="anim-rise" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px",
          borderRadius: 999, border: "1px solid rgb(var(--border))", background: "rgb(var(--surface))",
          fontSize: 13, fontWeight: 600, color: "rgb(var(--muted))", marginBottom: 26, boxShadow: "var(--shadow-sm)" }}>
          <Icon name="sparkle" size={15} style={{ color: "rgb(var(--accent))" }} />
          AI-built day-by-day plans in seconds
        </div>
        <h1 className="anim-rise" style={{ fontSize: "clamp(40px, 6vw, 68px)", lineHeight: 1.02, letterSpacing: "-.035em",
          fontWeight: 800, margin: "0 0 18px", animationDelay: "60ms" }}>
          Plan a trip you'll<br />actually want to take.
        </h1>
        <p className="anim-rise" style={{ fontSize: "clamp(16px,2vw,19px)", color: "rgb(var(--muted))", maxWidth: 560,
          margin: "0 auto 30px", lineHeight: 1.5, animationDelay: "120ms" }}>
          Tell <span className="grad-text" style={{ fontWeight: 700 }}>Itinera</span> your destination, dates and vibe —
          get a smart, day-by-day itinerary with live pricing and a packing list.
        </p>
        <div className="anim-rise" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animationDelay: "180ms" }}>
          <button onClick={onPlan} className="btn-accent focus-ring" style={{ display: "inline-flex", alignItems: "center", gap: 9,
            padding: "15px 26px", borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            <Icon name="wand" size={19} /> Plan my trip
          </button>
          <button onClick={() => onOpenTrip(trips[0].id)} className="focus-ring" style={{ display: "inline-flex", alignItems: "center", gap: 9,
            padding: "15px 24px", borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: "pointer",
            background: "rgb(var(--surface))", color: "rgb(var(--text))", border: "1px solid rgb(var(--border))" }}>
            Browse a sample <Icon name="chevron" size={16} stroke={2.4} />
          </button>
        </div>
      </section>

      {/* Featured wall */}
      <section>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em", margin: 0 }}>Featured itineraries</h2>
          <span style={{ fontSize: 14, color: "rgb(var(--muted))", fontWeight: 500 }}>Open any plan to explore it live</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(248px, 1fr))", gridAutoRows: "1fr", gap: 18 }}>
          {trips.map((t, i) => (
            <FeaturedCard key={t.id} trip={t} big={i === 0} index={i} onOpen={onOpenTrip} cur={cur} />
          ))}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { Landing });
