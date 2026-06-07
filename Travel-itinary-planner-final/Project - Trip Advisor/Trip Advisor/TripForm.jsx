/* ───────────────── TripForm.jsx — trip input form ───────────────── */

const PERSONA_META = [
  { id: "Budget",     icon: "coins",  color: "#16a34a", desc: "Street food, hostels, smart choices" },
  { id: "Mid-range",  icon: "star",   color: "#2563eb", desc: "Comfy stays, curated dining" },
  { id: "Luxurious",  icon: "sparkle",color: "#9333ea", desc: "5-star, private guides, the best" },
  { id: "Adventure",  icon: "shell",  color: "#ea580c", desc: "Hikes, water sports, wild stays" },
];

// ── Inline date-range calendar ──────────────────────────────────────
function dateKey(d) { return d ? d.toDateString() : ""; }

function DateRangePicker({ startDate, endDate, onChange }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [view, setView] = React.useState(() => {
    const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [hover, setHover] = React.useState(null);

  const getDays = (y, m) => {
    const first = new Date(y, m, 1);
    const pad = first.getDay();
    const count = new Date(y, m + 1, 0).getDate();
    const arr = Array(pad).fill(null);
    for (let i = 1; i <= count; i++) arr.push(new Date(y, m, i));
    return arr;
  };

  const prevM = () => setView(v => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 });
  const nextM = () => setView(v => v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 });

  const handleClick = (d) => {
    if (!d || d < today) return;
    if (!startDate || (startDate && endDate)) { onChange(d, null); }
    else if (d < startDate) { onChange(d, null); }
    else { onChange(startDate, d); }
  };

  const days = getDays(view.y, view.m);
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const rangeEnd = hover || endDate;

  return (
    <div style={{ background: "rgb(var(--surface-2))", borderRadius: 18, padding: 16, border: "1px solid rgb(var(--border))" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button type="button" onClick={prevM} className="focus-ring" style={calBtnSt}>
          <Icon name="back" size={16} stroke={2.5} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-.01em" }}>
          {MONTHS[view.m]} {view.y}
        </span>
        <button type="button" onClick={nextM} className="focus-ring" style={calBtnSt}>
          <Icon name="chevron" size={16} stroke={2.5} />
        </button>
      </div>
      {/* Weekday headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign:"center", fontSize:11.5, fontWeight:700, color:"rgb(var(--faint))", padding:"4px 0" }}>{d}</div>)}
      </div>
      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
        {days.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const past = d < today;
          const isStart = startDate && dateKey(d) === dateKey(startDate);
          const isEnd = endDate && dateKey(d) === dateKey(endDate);
          const isToday = dateKey(d) === dateKey(today);
          const inRange = startDate && rangeEnd && d > startDate && d < rangeEnd;
          return (
            <button type="button" key={i} onClick={() => handleClick(d)}
              onMouseEnter={() => !endDate && startDate && setHover(d)}
              onMouseLeave={() => setHover(null)}
              className="focus-ring"
              style={{
                border: "none", borderRadius: (isStart || isEnd) ? 12 : inRange ? 0 : 10,
                padding: "8px 0", fontSize: 13.5, fontWeight: isStart || isEnd ? 700 : isToday ? 600 : 500,
                cursor: past ? "not-allowed" : "pointer",
                opacity: past ? .3 : 1,
                background: (isStart || isEnd) ? "rgb(var(--accent))" : inRange ? "rgb(var(--accent) / .15)" : "transparent",
                color: (isStart || isEnd) ? "#fff" : "inherit",
                position: "relative",
                transition: "background .12s, color .12s",
              }}>
              {d.getDate()}
              {isToday && !isStart && !isEnd && (
                <span style={{ position:"absolute", bottom:3, left:"50%", transform:"translateX(-50%)",
                  width:4, height:4, borderRadius:99, background:"rgb(var(--accent))" }} />
              )}
            </button>
          );
        })}
      </div>
      {/* Selection summary */}
      <div style={{ marginTop: 12, display: "flex", gap: 8, fontSize: 13, fontWeight: 600 }}>
        <span style={{ flex:1, padding:"8px 12px", borderRadius:10, background:"rgb(var(--surface))",
          border:`1.5px solid ${startDate ? "rgb(var(--accent))" : "rgb(var(--border))"}`,
          color: startDate ? "rgb(var(--accent))" : "rgb(var(--faint))" }}>
          {startDate ? startDate.toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "Start date"}
        </span>
        <span style={{ display:"grid", placeItems:"center", color:"rgb(var(--faint))" }}>→</span>
        <span style={{ flex:1, padding:"8px 12px", borderRadius:10, background:"rgb(var(--surface))",
          border:`1.5px solid ${endDate ? "rgb(var(--accent))" : "rgb(var(--border))"}`,
          color: endDate ? "rgb(var(--accent))" : "rgb(var(--faint))" }}>
          {endDate ? endDate.toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "End date"}
        </span>
      </div>
    </div>
  );
}
const calBtnSt = {
  width:32, height:32, borderRadius:10, display:"grid", placeItems:"center",
  border:"1px solid rgb(var(--border))", background:"rgb(var(--surface))", cursor:"pointer",
};

// ── Destination typeahead ───────────────────────────────────────────
function DestinationField({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState(value || "");
  const ref = React.useRef(null);

  const results = React.useMemo(() => {
    if (q.length < 1) return window.PLACES.filter(p => p.kind === "city").slice(0, 6);
    const lower = q.toLowerCase();
    return window.PLACES.filter(p => p.name.toLowerCase().includes(lower)).slice(0, 7);
  }, [q]);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (p) => {
    setQ(p.name);
    onChange(p.name);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Icon name="globe" size={18} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
          color:"rgb(var(--muted))", pointerEvents:"none" }} />
        <input type="text" value={q} placeholder="Where are you going?"
          onChange={e => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="focus-ring"
          style={{ width:"100%", padding:"14px 14px 14px 44px", borderRadius:16, fontSize:15, fontWeight:500,
            background:"rgb(var(--surface))", border:"1.5px solid rgb(var(--border))", color:"rgb(var(--text))",
            outline:"none", boxSizing:"border-box", transition:"border-color .2s" }}
          onMouseEnter={e => e.target.style.borderColor = "rgb(var(--muted))"}
          onMouseLeave={e => e.target.style.borderColor = "rgb(var(--border))"}
        />
        <Icon name="search" size={16} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
          color:"rgb(var(--faint))", pointerEvents:"none" }} />
      </div>
      {open && results.length > 0 && (
        <div className="card elev-lg anim-pop" style={{ position:"absolute", top:"calc(100% + 8px)", left:0, right:0, zIndex:999, overflow:"hidden", padding:6 }}>
          {results.map((p, i) => (
            <button key={i} type="button" onClick={() => select(p)}
              style={{ display:"flex", alignItems:"center", gap:12, width:"100%", textAlign:"left",
                padding:"10px 12px", borderRadius:12, border:"none", background:"transparent", cursor:"pointer", color:"rgb(var(--text))" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgb(var(--surface-2))"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <span style={{ fontSize:22, lineHeight:1 }}>{p.emoji}</span>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{p.name}</div>
                {p.airport && <div style={{ fontSize:12, color:"rgb(var(--muted))", marginTop:2 }}>{p.airport}</div>}
                {p.near && <div style={{ fontSize:12, color:"rgb(var(--muted))", marginTop:2 }}>Near {p.near}</div>}
              </div>
              <span style={{ marginLeft:"auto", fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:999,
                background:"rgb(var(--surface-2))", color:"rgb(var(--muted))", border:"1px solid rgb(var(--border))" }}>
                {p.kind}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Persona selector (style-aware) ─────────────────────────────────
function PersonaGrid({ value, onChange, style: pStyle }) {
  if (pStyle === "chips") {
    return (
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        {PERSONA_META.map(p => {
          const sel = value === p.id;
          return (
            <button key={p.id} type="button" onClick={() => onChange(p.id)}
              className="focus-ring"
              style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 18px",
                borderRadius:999, border:`2px solid ${sel ? p.color : "rgb(var(--border))"}`,
                background: sel ? `${p.color}18` : "rgb(var(--surface))",
                color: sel ? p.color : "rgb(var(--muted))",
                fontWeight:700, fontSize:14, cursor:"pointer", transition:"all .18s" }}>
              <Icon name={p.icon} size={16} stroke={2.2} />
              {p.id}
            </button>
          );
        })}
      </div>
    );
  }
  if (pStyle === "tiles") {
    return (
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {PERSONA_META.map(p => {
          const sel = value === p.id;
          const rgb = window.hexRgb(p.color);
          return (
            <button key={p.id} type="button" onClick={() => onChange(p.id)}
              className="focus-ring"
              style={{ border:`2px solid ${sel ? p.color : "transparent"}`, borderRadius:18,
                background: `linear-gradient(145deg, rgb(${rgb}/.18), rgb(${rgb}/.06))`,
                padding:"20px 12px", cursor:"pointer", display:"flex", flexDirection:"column",
                alignItems:"center", gap:10, transition:"all .2s",
                boxShadow: sel ? `0 4px 18px rgb(${rgb}/.35)` : "none" }}>
              <span style={{ color:p.color, background:`rgb(${rgb}/.18)`, width:44, height:44,
                borderRadius:14, display:"grid", placeItems:"center" }}>
                <Icon name={p.icon} size={22} stroke={2} />
              </span>
              <span style={{ fontSize:13, fontWeight:700, color:"rgb(var(--text))" }}>{p.id}</span>
            </button>
          );
        })}
      </div>
    );
  }
  // default "cards"
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
      {PERSONA_META.map(p => {
        const sel = value === p.id;
        const rgb = window.hexRgb(p.color);
        return (
          <button key={p.id} type="button" onClick={() => onChange(p.id)}
            className="card focus-ring"
            style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
              border:`2px solid ${sel ? p.color : "rgb(var(--border))"}`,
              cursor:"pointer", textAlign:"left", transition:"all .2s",
              background: sel ? `rgb(${rgb}/.10)` : "rgb(var(--surface))",
              boxShadow: sel ? `0 0 0 4px rgb(${rgb}/.15), var(--shadow-sm)` : "var(--shadow-sm)" }}>
            <span style={{ width:40, height:40, borderRadius:12, display:"grid", placeItems:"center",
              background:`rgb(${rgb}/.18)`, color:p.color, flexShrink:0 }}>
              <Icon name={p.icon} size={20} stroke={2} />
            </span>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color: sel ? p.color : "rgb(var(--text))" }}>{p.id}</div>
              <div style={{ fontSize:12.5, color:"rgb(var(--muted))", marginTop:3, lineHeight:1.4 }}>{p.desc}</div>
            </div>
            {sel && <Icon name="check" size={18} stroke={2.5} style={{ marginLeft:"auto", color:p.color, flexShrink:0 }} />}
          </button>
        );
      })}
    </div>
  );
}

// ── Form section wrapper ────────────────────────────────────────────
function FormSection({ label, children, hint }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
        <label style={{ fontWeight:700, fontSize:15, letterSpacing:"-.01em" }}>{label}</label>
        {hint && <span style={{ fontSize:12.5, color:"rgb(var(--muted))" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Main form ───────────────────────────────────────────────────────
function TripForm({ onGenerate, personaStyle }) {
  const [dest, setDest] = React.useState("");
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [adults_m, setAdultsM] = React.useState(1);
  const [adults_f, setAdultsF] = React.useState(1);
  const [kids, setKids] = React.useState(0);
  const [persona, setPersona] = React.useState("Mid-range");
  const [mustHave, setMustHave] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState(null);

  const days = (startDate && endDate) ? Math.max(1, Math.round((endDate - startDate) / 86400000)) : 0;

  const handleGenerate = async () => {
    if (!dest) { setError("Please enter a destination before generating."); return; }
    setError(null);
    setLoading(true);
    try {
      const form = { destination: dest, startDate, endDate, days: days || 3,
                     adults_m, adults_f, kids, persona, mustHave };
      await onGenerate(form);  // onGenerate is now async — awaiting lets us catch errors here
    } catch (err) {
      setError(err.message || "Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anim-fade" style={{ maxWidth: 780, margin: "0 auto", padding: "32px 24px 80px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6, flexWrap:"wrap", gap:12 }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.03em", margin: 0 }}>Plan your trip</h2>
        <span style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"6px 13px", borderRadius:999,
          fontSize:12.5, fontWeight:700, border:"1px solid rgb(var(--border))", background:"rgb(var(--surface-2))",
          color:"rgb(var(--muted))" }}>
          <Icon name="sparkle" size={13} style={{ color:"rgb(var(--accent))" }} />
          Powered by Claude AI
        </span>
      </div>
      <p style={{ fontSize: 15, color: "rgb(var(--muted))", margin: "0 0 28px" }}>Fill in the details — Claude generates your personalised itinerary.</p>

      <div style={{ display:"flex", flexDirection:"column", gap:32 }}>
        <FormSection label="Where to?" hint="Search a city, island or local spot">
          <DestinationField value={dest} onChange={setDest} />
        </FormSection>

        <div style={{ height:1, background:"rgb(var(--border))" }} />

        <FormSection label="When?" hint={days > 0 ? `${days} night${days !== 1 ? "s" : ""}` : "Click a start then end date"}>
          <DateRangePicker startDate={startDate} endDate={endDate}
            onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
        </FormSection>

        <div style={{ height:1, background:"rgb(var(--border))" }} />

        <FormSection label="Who's coming?">
          <div className="card" style={{ padding:"0 20px", overflow:"hidden" }}>
            {[
              { label:"Adults (Male)",   sub:"18+",  val:adults_m, set:setAdultsM },
              { label:"Adults (Female)", sub:"18+",  val:adults_f, set:setAdultsF },
              { label:"Kids",            sub:"under 18", val:kids, set:setKids },
            ].map((r, i) => (
              <div key={i}>
                {i > 0 && <div style={{ height:1, background:"rgb(var(--border))" }} />}
                <Stepper label={r.label} sub={r.sub} value={r.val} onChange={r.set} />
              </div>
            ))}
          </div>
        </FormSection>

        <div style={{ height:1, background:"rgb(var(--border))" }} />

        <FormSection label="Travel persona" hint="Defines your activity + accommodation tier">
          <PersonaGrid value={persona} onChange={setPersona} style={personaStyle} />
        </FormSection>

        <div style={{ height:1, background:"rgb(var(--border))" }} />

        <FormSection label="Must-haves" hint="Optional — anything specific you don't want to miss">
          <textarea value={mustHave} onChange={e => setMustHave(e.target.value)}
            placeholder="e.g. a rooftop dinner, a day at the beach, skip temples..."
            rows={3} className="focus-ring"
            style={{ resize:"vertical", padding:"14px 16px", borderRadius:16, fontSize:14.5,
              background:"rgb(var(--surface))", border:"1.5px solid rgb(var(--border))",
              color:"rgb(var(--text))", outline:"none", fontFamily:"inherit", lineHeight:1.6,
              width:"100%", boxSizing:"border-box", transition:"border-color .2s" }}
            onMouseEnter={e => e.target.style.borderColor = "rgb(var(--muted))"}
            onMouseLeave={e => e.target.style.borderColor = "rgb(var(--border))"}
          />
        </FormSection>

        {/* Error banner */}
        {error && (
          <div style={{ padding:"14px 18px", borderRadius:14, fontSize:14, fontWeight:600, lineHeight:1.5,
            background:"rgb(220 38 38 / .12)", border:"1.5px solid rgb(220 38 38 / .35)",
            color:"#f87171", display:"flex", alignItems:"flex-start", gap:10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <button type="button" onClick={handleGenerate} disabled={loading}
          className="btn-accent focus-ring"
          style={{ padding:"18px 0", borderRadius:18, fontSize:17, fontWeight:800,
            cursor: loading ? "wait" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:12,
            opacity: loading ? .8 : 1, transition:"opacity .2s" }}>
          {loading ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ animation:"spin .9s linear infinite" }}>
                <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2.5" />
                <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Generating with Claude…
            </>
          ) : (
            <><Icon name="wand" size={20} /> Generate Itinerary</>
          )}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}

Object.assign(window, { TripForm });
