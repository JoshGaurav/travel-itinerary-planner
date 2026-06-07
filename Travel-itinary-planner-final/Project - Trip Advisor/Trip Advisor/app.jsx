/* ───────────────── app.jsx — shell, routing, tweaks ───────────────── */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "reef",
  "pillStyle": "soft",
  "personaStyle": "cards"
}/*EDITMODE-END*/;

// Simple compass-diamond logo
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="url(#lg)" />
        <path d="M16 8l3 8-3 3-3-3 3-8Z" fill="white" opacity=".95" />
        <path d="M16 24l-3-8 3-3 3 3-3 8Z" fill="white" opacity=".55" />
        <path d="M8 16l8-3 3 3-3 3-8-3Z" fill="white" opacity=".75" />
        <path d="M24 16l-8 3-3-3 3-3 8 3Z" fill="white" opacity=".4" />
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgb(var(--accent))" />
            <stop offset="1" stopColor="rgb(var(--accent-2))" />
          </linearGradient>
        </defs>
      </svg>
      <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-.03em" }}>
        Itin<span className="grad-text">era</span>
      </span>
    </div>
  );
}

// Top nav bar
function Header({ page, onHome, onPlan, theme, toggleTheme, currency, setCurrency }) {
  const CURR = window.CURRENCIES;
  return (
    <header className="glass" style={{
      position: "sticky", top: 0, zIndex: 100,
      borderBottom: "1px solid rgb(var(--border))",
      padding: "0 24px",
      display: "flex", alignItems: "center", height: 64, gap: 12,
    }}>
      <div onClick={onHome} style={{ flex: "0 0 auto" }}><Logo /></div>

      <nav style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
        {page !== "landing" && (
          <button type="button" onClick={onHome} className="focus-ring"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px",
              borderRadius: 12, border: "1px solid rgb(var(--border))",
              background: "rgb(var(--surface))", fontSize: 13.5, fontWeight: 600,
              color: "rgb(var(--muted))", cursor: "pointer" }}>
            <Icon name="back" size={15} stroke={2.5} /> Home
          </button>
        )}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Currency switcher — always visible */}
      <div style={{ display: "flex", borderRadius: 12, overflow: "hidden",
        border: "1px solid rgb(var(--border))", background: "rgb(var(--surface-2))" }}>
        {Object.keys(CURR).map(c => (
          <button key={c} type="button" onClick={() => setCurrency(c)} className="focus-ring"
            style={{ padding: "7px 10px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12.5,
              background: currency === c ? "rgb(var(--accent))" : "transparent",
              color: currency === c ? "#fff" : "rgb(var(--muted))", transition: "all .18s",
              borderRadius: currency === c ? 10 : 0 }}>
            {CURR[c].symbol} {c}
          </button>
        ))}
      </div>

      {/* Plan a trip CTA */}
      {page !== "form" && (
        <button type="button" onClick={onPlan} className="btn-accent focus-ring"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px",
            borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          <Icon name="wand" size={16} /> Plan a trip
        </button>
      )}

      {/* Theme toggle */}
      <button type="button" onClick={toggleTheme} className="focus-ring"
        style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center",
          border: "1px solid rgb(var(--border))", background: "rgb(var(--surface))",
          cursor: "pointer", color: "rgb(var(--muted))" }}>
        <Icon name={theme === "dark" ? "sun" : "moon"} size={18} stroke={2} />
      </button>
    </header>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Page state
  const [page, setPage] = React.useState("landing"); // landing | form | itinerary
  const [currentTrip, setCurrentTrip] = React.useState(null);
  const [currency, setCurrency] = React.useState("USD");
  const [lastForm, setLastForm] = React.useState({});

  // Apply theme + accent to root
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
    document.documentElement.setAttribute("data-accent", t.accent);
  }, [t.theme, t.accent]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const goHome = () => { setPage("landing"); scrollTop(); };
  const goPlan = () => { setPage("form"); scrollTop(); };

  const openTrip = (tripId) => {
    const trip = window.TRIPS.find(tr => tr.id === tripId);
    if (trip) { setCurrentTrip(trip); setPage("itinerary"); scrollTop(); }
  };

  const generateTrip = async (form) => {
    setLastForm(form);
    const trip = await window.generateItinerary(form); // async — real fetch or mock
    setCurrentTrip(trip);
    setPage("itinerary");
    scrollTop();
  };

  const toggleTheme = () => {
    const next = t.theme === "dark" ? "light" : "dark";
    setTweak("theme", next);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header page={page} onHome={goHome} onPlan={goPlan}
        theme={t.theme} toggleTheme={toggleTheme}
        currency={currency} setCurrency={setCurrency} />

      <main>
        {page === "landing" && (
          <Landing onOpenTrip={openTrip} onPlan={goPlan} cur={currency} />
        )}
        {page === "form" && (
          <TripForm onGenerate={generateTrip} personaStyle={t.personaStyle} />
        )}
        {page === "itinerary" && currentTrip && (
          <Itinerary trip={currentTrip} currency={currency} setCurrency={setCurrency}
            pillStyle={t.pillStyle} form={lastForm} onBack={goHome} />
        )}
      </main>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakToggle label="Dark mode" value={t.theme === "dark"}
          onChange={v => setTweak("theme", v ? "dark" : "light")} />

        <TweakSection label="Accent palette" />
        <TweakSelect label="Palette" value={t.accent}
          options={[
            { label: "🌊 Reef (teal + coral)",    value: "reef"   },
            { label: "🌅 Sunset (orange + rose)",  value: "sunset" },
            { label: "🍇 Grape (violet + cyan)",   value: "grape"  },
            { label: "🌿 Forest (green + amber)",  value: "forest" },
          ]}
          onChange={v => setTweak("accent", v)} />

        <TweakSection label="Badge style" />
        <TweakRadio label="Pill style" value={t.pillStyle}
          options={["soft", "solid", "outline"]}
          onChange={v => setTweak("pillStyle", v)} />

        <TweakSection label="Persona selector" />
        <TweakRadio label="Layout" value={t.personaStyle}
          options={["cards", "chips", "tiles"]}
          onChange={v => setTweak("personaStyle", v)} />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
