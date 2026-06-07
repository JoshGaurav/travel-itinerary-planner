/* ───────────────── data.jsx — content + helpers ───────────────── */

// Category metadata
const CATEGORIES = {
  dining:      { label: "Dining",      hex: "#16a34a" },
  cruise:      { label: "Cruise",      hex: "#2563eb" },
  adventure:   { label: "Adventure",   hex: "#ea580c" },
  relaxing:    { label: "Relaxing",    hex: "#7c3aed" },
  sightseeing: { label: "Sightseeing", hex: "#db2777" },
};
const KIDS = { label: "Kids-Friendly", hex: "#d97706" };

// Currencies
const CURRENCIES = {
  USD: { symbol: "$",  rate: 1,    name: "US Dollar" },
  INR: { symbol: "₹", rate: 83.4, name: "Indian Rupee" },
  EUR: { symbol: "€", rate: 0.92, name: "Euro" },
  GBP: { symbol: "£", rate: 0.79, name: "British Pound" },
};
function money(usd, cur) {
  const c = CURRENCIES[cur];
  const v = usd * c.rate;
  const rounded = cur === "INR" ? Math.round(v / 10) * 10 : Math.round(v);
  return c.symbol + rounded.toLocaleString("en-US");
}

// Typeahead corpus
const PLACES = [
  { name: "Kyoto, Japan",         kind: "city",   airport: "KIX · Kansai Intl",        emoji: "🏯" },
  { name: "Lisbon, Portugal",     kind: "city",   airport: "LIS · Humberto Delgado",   emoji: "🚋" },
  { name: "Reykjavík, Iceland",   kind: "city",   airport: "KEF · Keflavík Intl",      emoji: "🌋" },
  { name: "Bali, Indonesia",      kind: "island", airport: "DPS · Ngurah Rai Intl",    emoji: "🌴" },
  { name: "Marrakech, Morocco",   kind: "city",   airport: "RAK · Menara",             emoji: "🕌" },
  { name: "Santorini, Greece",    kind: "island", airport: "JTR · Santorini Natl",     emoji: "🏖️" },
  { name: "Queenstown, NZ",       kind: "city",   airport: "ZQN · Queenstown",         emoji: "🏔️" },
  { name: "Barcelona, Spain",     kind: "city",   airport: "BCN · El Prat",            emoji: "🎨" },
  { name: "Fushimi Inari Shrine", kind: "spot",   near: "Kyoto",                       emoji: "⛩️" },
  { name: "Belém Tower",          kind: "spot",   near: "Lisbon",                      emoji: "🗼" },
  { name: "Blue Lagoon",          kind: "spot",   near: "Reykjavík",                   emoji: "♨️" },
  { name: "Jemaa el-Fnaa",        kind: "spot",   near: "Marrakech",                   emoji: "🪔" },
];

// Gradient covers
const COVERS = {
  Kyoto:     "linear-gradient(135deg,#7b2d4e,#c2410c 55%,#f59e0b)",
  Lisbon:    "linear-gradient(135deg,#0e7490,#0891b2 45%,#fbbf24)",
  Reykjavik: "linear-gradient(140deg,#1e3a8a,#0ea5e9 55%,#a5f3fc)",
  Bali:      "linear-gradient(135deg,#047857,#10b981 50%,#fde68a)",
  Marrakech: "linear-gradient(135deg,#9a3412,#dc2626 50%,#f59e0b)",
  Generic:   "linear-gradient(135deg,#5b21b6,#0d9488 55%,#fcd34d)",
};

// ───────────── Featured itineraries ─────────────
const TRIPS = [
  {
    id: "kyoto", city: "Kyoto", country: "Japan", cover: COVERS.Kyoto,
    persona: "Culture", days: 5, tagline: "Temples, tea houses & lantern-lit alleys",
    omitted: [
      { time: "Afternoon", title: "Nijō Castle nightingale floors", cat: "sightseeing", cost: 9, tip: "The squeaking floors were a deliberate intruder alarm — listen for them." },
      { time: "Evening",   title: "Pontochō kaiseki dinner",        cat: "dining",      cost: 95, tip: "Riverside terraces open in summer; book the kawayuka seating for the breeze." },
      { time: "Morning",   title: "Saihō-ji moss garden",           cat: "relaxing",    cost: 30, tip: "Requires a postcard reservation in advance — copy a sutra before you enter." },
    ],
    plan: [
      { day: 1, title: "Eastern Higashiyama", items: [
        { time: "9:00 AM",  title: "Kiyomizu-dera at opening",  cat: "sightseeing", cost: 4,  tip: "Arrive 15 min early to beat the tour buses and catch soft morning light on the veranda." },
        { time: "12:30 PM", title: "Noodles on Ninenzaka",      cat: "dining",      cost: 18, tip: "The stepped lane bans rolling suitcases — go hands-free. Try the yuba udon." },
        { time: "3:00 PM",  title: "Kennin-ji zen gardens",     cat: "relaxing",    cost: 6,  tip: "Kyoto's oldest zen temple is rarely crowded — sit with the twin-dragon ceiling." },
        { time: "7:00 PM",  title: "Gion lantern stroll",       cat: "sightseeing", cost: 0,  tip: "Hanami-kōji glows after dark; be respectful — geiko are working, not posing." },
      ]},
      { day: 2, title: "Arashiyama & bamboo", items: [
        { time: "8:00 AM",  title: "Bamboo Grove early walk",   cat: "sightseeing", cost: 0,  tip: "The grove is busiest by 10 — the 8am hush and filtered light are worth the alarm." },
        { time: "10:30 AM", title: "Hozugawa river boat",       cat: "cruise",      cost: 45, tip: "A 2-hr traditional flat-boat down the gorge; sit on the right for the best canyon views.", kids: true },
        { time: "1:30 PM",  title: "Tofu lunch by the river",   cat: "dining",      cost: 28, tip: "Arashiyama is famed for yudofu — the set lunches are light and surprisingly filling." },
        { time: "4:00 PM",  title: "Monkey Park Iwatayama",     cat: "adventure",   cost: 6,  tip: "A 20-min uphill hike rewards you with a city panorama and free-roaming macaques.", kids: true },
      ]},
      { day: 3, title: "Fushimi & sake", items: [
        { time: "7:30 AM",  title: "Fushimi Inari summit",      cat: "adventure",   cost: 0,  tip: "The full 10,000-gate loop takes ~2 hrs — go at dawn and you'll have torii to yourself." },
        { time: "12:00 PM", title: "Street food at the base",   cat: "dining",      cost: 14, tip: "Grilled quail and inari sushi are the local specialties right by the shrine." },
        { time: "3:00 PM",  title: "Sake district tasting",     cat: "relaxing",    cost: 22, tip: "Fushimi's soft water makes a delicate sake — flights run small, so pace yourself." },
      ]},
      { day: 4, title: "Golden temples", items: [
        { time: "9:00 AM",  title: "Kinkaku-ji golden pavilion",cat: "sightseeing", cost: 5,  tip: "The gold leaf is brightest under a clear morning sky reflected in the mirror pond." },
        { time: "12:00 PM", title: "Zen lunch in Kitayama",     cat: "dining",      cost: 24, tip: "Shojin-ryori is the Buddhist vegetarian cuisine the monks here actually eat." },
        { time: "2:30 PM",  title: "Ryoan-ji rock garden",      cat: "relaxing",    cost: 5,  tip: "Fifteen stones, but you can only ever see fourteen at once — find your angle." },
      ]},
      { day: 5, title: "Tea & farewell", items: [
        { time: "10:00 AM", title: "Matcha workshop in Uji",    cat: "relaxing",    cost: 40, tip: "Whisk your own bowl where Japanese tea culture began — the bitterness mellows fast.", kids: true },
        { time: "1:00 PM",  title: "Nishiki Market crawl",      cat: "dining",      cost: 30, tip: "'Kyoto's kitchen' is five blocks of samples — go hungry and graze slowly." },
        { time: "4:00 PM",  title: "Kamo River sunset walk",    cat: "relaxing",    cost: 0,  tip: "Locals line the banks at dusk, evenly spaced — join them and watch the herons." },
      ]},
    ],
  },
  {
    id: "lisbon", city: "Lisbon", country: "Portugal", cover: COVERS.Lisbon,
    persona: "Foodie", days: 2, tagline: "Tiles, tram 28 & custard tarts",
    omitted: [
      { time: "Evening",   title: "Fado dinner in Alfama",  cat: "dining",      cost: 55, tip: "The mournful guitar is best in a tiny tavern, not a tourist hall — ask your host." },
      { time: "Morning",   title: "LX Factory market",      cat: "sightseeing", cost: 0,  tip: "A converted industrial complex of bookshops and brunch under the bridge." },
      { time: "Afternoon", title: "Time Out Market tasting",cat: "dining",      cost: 40, tip: "Thirty of the city's best chefs under one roof — split plates to try more." },
    ],
    plan: [
      { day: 1, title: "Alfama & the river", items: [
        { time: "9:00 AM",  title: "Ride tram 28 uphill",        cat: "sightseeing", cost: 3,  tip: "Board at Martim Moniz before crowds for a seat — it's a rolling tour of the old city.", kids: true },
        { time: "11:00 AM", title: "São Jorge Castle views",      cat: "sightseeing", cost: 12, tip: "The ramparts give the best panorama of the red rooftops tumbling to the Tagus." },
        { time: "1:30 PM",  title: "Seafood at Cais do Sodré",   cat: "dining",      cost: 35, tip: "Grilled sardines are the icon, but the clams à bulhão pato steal the meal." },
        { time: "5:00 PM",  title: "Tagus sunset cruise",        cat: "cruise",      cost: 38, tip: "A 2-hr sailboat under the 25 de Abril bridge — golden hour hits the tiles just right.", kids: true },
      ]},
      { day: 2, title: "Belém & pastries", items: [
        { time: "9:30 AM",  title: "Pastéis de Belém, warm",     cat: "dining",      cost: 6,  tip: "Get them dusted with cinnamon and eaten on the spot — the line moves fast." },
        { time: "11:00 AM", title: "Jerónimos Monastery",        cat: "sightseeing", cost: 14, tip: "The Manueline cloister carvings reward a slow lap — look for ropes and sea monsters." },
        { time: "2:00 PM",  title: "Belém Tower riverside",      cat: "relaxing",    cost: 8,  tip: "Skip the cramped interior climb; the waterfront lawn is the real photo spot." },
      ]},
    ],
  },
  {
    id: "reykjavik", city: "Reykjavík", country: "Iceland", cover: COVERS.Reykjavik,
    persona: "Adventure", days: 4, tagline: "Waterfalls, geysers & northern lights",
    omitted: [
      { time: "Night",     title: "Northern lights chase",    cat: "adventure",   cost: 95,  tip: "Aurora needs dark, clear skies — guides track the forecast and drive you to the gap in the clouds." },
      { time: "Morning",   title: "Snæfellsnes peninsula",    cat: "sightseeing", cost: 120, tip: "'Iceland in miniature' — a long but jaw-dropping day of coast, craters and cliffs." },
      { time: "Afternoon", title: "Whale watching, Faxaflói", cat: "cruise",      cost: 90,  tip: "Minke and humpback sightings peak in summer — dress one layer warmer than you think.", kids: true },
    ],
    plan: [
      { day: 1, title: "Reykjavík arrival", items: [
        { time: "11:00 AM", title: "Hallgrímskirkja tower",      cat: "sightseeing", cost: 9,  tip: "The basalt-column church elevator gives a candy-colored rooftop panorama." },
        { time: "1:00 PM",  title: "Harbour lobster soup",       cat: "dining",      cost: 22, tip: "The little red shack by the docks does the city's best bowl — order extra bread." },
        { time: "4:00 PM",  title: "Blue Lagoon soak",           cat: "relaxing",    cost: 75, tip: "Pre-book a slot; the silica mud mask is included and the swim-up bar is cash-free." },
      ]},
      { day: 2, title: "The Golden Circle", items: [
        { time: "9:00 AM",  title: "Þingvellir rift valley",     cat: "sightseeing", cost: 0,  tip: "Walk between two tectonic plates — the boardwalk path is stroller-friendly.", kids: true },
        { time: "12:00 PM", title: "Geysir eruptions",           cat: "adventure",   cost: 0,  tip: "Strokkur blows every 6–10 min — stand upwind and have the camera ready.", kids: true },
        { time: "2:30 PM",  title: "Gullfoss waterfall",         cat: "sightseeing", cost: 0,  tip: "The two-tiered falls roar loudest in summer melt — the upper path stays drier." },
        { time: "7:00 PM",  title: "Lamb stew supper",           cat: "dining",      cost: 32, tip: "Icelandic lamb is free-roaming and herb-fed — the slow-cooked kjötsúpa is comfort itself." },
      ]},
      { day: 3, title: "South coast", items: [
        { time: "8:30 AM",  title: "Seljalandsfoss walk-behind", cat: "adventure",   cost: 0,   tip: "You can circle behind the curtain of water — you will get wet, so pack a shell." },
        { time: "11:30 AM", title: "Reynisfjara black sand",     cat: "sightseeing", cost: 0,   tip: "Stunning basalt stacks, but never turn your back on the sneaker waves." },
        { time: "3:00 PM",  title: "Sólheimajökull glacier hike",cat: "adventure",   cost: 110, tip: "Crampons and guide provided; the blue ice and ash layers tell a climate story." },
      ]},
      { day: 4, title: "Slow morning", items: [
        { time: "10:00 AM", title: "Sky Lagoon infinity edge",   cat: "relaxing",    cost: 70, tip: "The seven-step ritual ends with a sauna facing the ocean — go before the airport run." },
        { time: "1:00 PM",  title: "Bistro brunch downtown",     cat: "dining",      cost: 28, tip: "Laugavegur's cafés do excellent skyr bowls and cardamom buns for the road." },
      ]},
    ],
  },
  {
    id: "bali", city: "Bali", country: "Indonesia", cover: COVERS.Bali,
    persona: "Relaxing", days: 5, tagline: "Rice terraces, reef & beach clubs",
    omitted: [
      { time: "Morning",   title: "Sunrise Mt Batur trek",  cat: "adventure", cost: 65, tip: "A pre-dawn volcano summit with breakfast cooked in the steam vents — start at 3am." },
      { time: "Afternoon", title: "Nusa Penida day boat",   cat: "cruise",    cost: 85, tip: "Kelingking cliff is the postcard; the crossing is choppy, so take a tablet beforehand." },
      { time: "Evening",   title: "Jimbaran seafood grill", cat: "dining",    cost: 45, tip: "Tables on the sand, fish picked from ice — go at sunset for the full effect." },
    ],
    plan: [
      { day: 1, title: "Ubud calm", items: [
        { time: "9:00 AM",  title: "Tegalalang rice terraces",   cat: "sightseeing", cost: 5,  tip: "Go early before the jungle-swing crowds; the morning haze over the paddies is magic." },
        { time: "12:30 PM", title: "Warung organic lunch",       cat: "dining",      cost: 12, tip: "Nasi campur lets you point at a dozen dishes — the tempeh here is house-fermented." },
        { time: "4:00 PM",  title: "Spa & flower bath",          cat: "relaxing",    cost: 35, tip: "Two-hour Balinese massages cost a fraction of home — book a couples room by the river." },
      ]},
      { day: 2, title: "Water temples", items: [
        { time: "8:30 AM",  title: "Tirta Empul purification",   cat: "relaxing",    cost: 8,  tip: "Bring a sarong and follow the spring sequence left to right — locals will guide you." },
        { time: "11:30 AM", title: "Monkey Forest sanctuary",    cat: "adventure",   cost: 7,  tip: "Keep sunglasses and snacks zipped away — the macaques are quick and unbothered.", kids: true },
        { time: "6:30 PM",  title: "Sunset at Tanah Lot",        cat: "sightseeing", cost: 6,  tip: "The sea temple sits on a rock cut off at high tide — arrive 90 min before dusk." },
      ]},
      { day: 3, title: "Reef day", items: [
        { time: "8:00 AM",  title: "Snorkel at Blue Lagoon",     cat: "cruise",      cost: 55, tip: "Calm, shallow and full of clownfish — the gentlest intro to Bali's reefs for kids.", kids: true },
        { time: "1:00 PM",  title: "Beachfront grilled fish",    cat: "dining",      cost: 20, tip: "Padang Bai's warungs serve the morning catch — the sambal matah is the star." },
        { time: "4:30 PM",  title: "Tidal-pool float",           cat: "relaxing",    cost: 0,  tip: "Natural rock pools warm up by afternoon — a safe, calm swim away from the surf." },
      ]},
      { day: 4, title: "Seaside Canggu", items: [
        { time: "9:30 AM",  title: "Surf lesson, Batu Bolong",   cat: "adventure",   cost: 40, tip: "The mellow beach break is forgiving for beginners — book the dawn session for glassy water." },
        { time: "1:00 PM",  title: "Café brunch crawl",          cat: "dining",      cost: 18, tip: "Canggu invented the smoothie bowl craze — most spots do a great flat white too." },
        { time: "5:00 PM",  title: "Beach club sundowner",       cat: "relaxing",    cost: 30, tip: "Day-beds need a minimum spend; the infinity pool faces straight into the sunset." },
      ]},
      { day: 5, title: "Cliffs & farewell", items: [
        { time: "10:00 AM", title: "Uluwatu clifftop temple",    cat: "sightseeing", cost: 7,  tip: "Hold your bag tight near the monkeys; the Kecak fire dance at dusk is unforgettable." },
        { time: "1:30 PM",  title: "Padang Padang beach",        cat: "relaxing",    cost: 2,  tip: "Squeeze through the rock crevice to a tiny cove — go at low tide for the most sand." },
      ]},
    ],
  },
  {
    id: "marrakech", city: "Marrakech", country: "Morocco", cover: COVERS.Marrakech,
    persona: "Budget", days: 3, tagline: "Souks, riads & desert gateways",
    omitted: [
      { time: "Full day", title: "Atlas Mountains & Berber villages", cat: "adventure", cost: 60, tip: "A day trip to Imlil trades the city heat for mountain air and mint tea with a view." },
      { time: "Evening",  title: "Rooftop tagine dinner",             cat: "dining",    cost: 22, tip: "Many riads serve on the roof at sunset — the call to prayer echoing across the medina is unreal." },
      { time: "Morning",  title: "Hammam & scrub ritual",             cat: "relaxing",  cost: 25, tip: "The traditional steam-and-scrub leaves you glowing — go local for a tenth of the spa price." },
    ],
    plan: [
      { day: 1, title: "Into the medina", items: [
        { time: "10:00 AM", title: "Jemaa el-Fnaa square",        cat: "sightseeing", cost: 0,  tip: "By day it's juice stalls and snake charmers; come back after dark for the food-stall chaos.", kids: true },
        { time: "1:00 PM",  title: "Souk bargaining lunch",       cat: "dining",      cost: 9,  tip: "Start your counter-offer at a third of the asking price, and always with a smile." },
        { time: "4:00 PM",  title: "Bahia Palace courtyards",     cat: "sightseeing", cost: 7,  tip: "The zellij tilework and painted cedar ceilings are the city's finest — go late for soft light." },
      ]},
      { day: 2, title: "Gardens & color", items: [
        { time: "9:00 AM",  title: "Jardin Majorelle blues",      cat: "relaxing",    cost: 16, tip: "Buy timed tickets online; the cobalt villa and cactus garden are calmest right at opening." },
        { time: "12:30 PM", title: "Street msemen & tea",         cat: "dining",      cost: 5,  tip: "The flaky griddle bread with honey is a 50-cent breakfast that beats any café." },
        { time: "3:30 PM",  title: "Tanneries & leather souk",   cat: "sightseeing", cost: 4,  tip: "Vendors hand you mint to mask the smell — a small tip is expected for the rooftop view." },
      ]},
      { day: 3, title: "Desert edge", items: [
        { time: "8:00 AM",  title: "Agafay desert camel ride",    cat: "adventure",   cost: 35, tip: "The rocky 'mini-Sahara' is an hour out — sunrise rides skip the heat and the crowds.", kids: true },
        { time: "1:00 PM",  title: "Lunch under the tents",       cat: "dining",      cost: 18, tip: "Camp lunches come with live gnawa music — the slow-cooked lamb mechoui is the order." },
      ]},
    ],
  },
];

// ───────────── Mock activity pool (fallback when no API key) ─────────────
const ACTIVITY_POOL = {
  Budget:     [
    { time: "9:00 AM",  title: "Free walking tour of the old town", cat: "sightseeing", cost: 5,  tip: "Tip-based tours cover the history in 2 hrs — a cheap way to map the city on day one." },
    { time: "1:00 PM",  title: "Street-food market crawl",          cat: "dining",      cost: 10, tip: "Eat where the lunchtime queue is locals, not menus in five languages." },
    { time: "4:00 PM",  title: "Public park & viewpoint",           cat: "relaxing",    cost: 0,  tip: "Most cities hide a free hilltop lookout — best an hour before sunset." },
    { time: "7:00 PM",  title: "Neighbourhood night market",        cat: "sightseeing", cost: 8,  tip: "Markets buzz after dark — graze on small plates instead of one big meal." },
  ],
  "Mid-range":[
    { time: "9:30 AM",  title: "Signature museum & galleries",      cat: "sightseeing", cost: 18, tip: "Book the first entry slot to have the headline rooms briefly to yourself." },
    { time: "1:00 PM",  title: "Bistro lunch in the centre",        cat: "dining",      cost: 28, tip: "The fixed-price lunch menu is the best value a good kitchen offers all day." },
    { time: "3:30 PM",  title: "Guided river cruise",               cat: "cruise",      cost: 35, tip: "An hour on the water reframes the whole city — sit up top if the weather holds.", kids: true },
    { time: "8:00 PM",  title: "Rooftop dinner with a view",        cat: "dining",      cost: 45, tip: "Reserve a table timed to sunset — the skyline does half the work." },
  ],
  Luxurious:  [
    { time: "10:00 AM", title: "Private guided heritage tour",      cat: "sightseeing", cost: 120,tip: "A private guide skips every line and tailors the route to what you actually love." },
    { time: "1:30 PM",  title: "Tasting menu at a top table",       cat: "dining",      cost: 160,tip: "Book weeks ahead and mention any allergies — the pairing flight is worth it." },
    { time: "4:00 PM",  title: "Spa & thermal circuit",             cat: "relaxing",    cost: 90, tip: "Arrive early to use the pools before your treatment — it's included, most skip it." },
    { time: "7:30 PM",  title: "Sunset champagne sail",             cat: "cruise",      cost: 140,tip: "Charter the small boat for golden hour — far calmer than the big party catamarans." },
  ],
  Adventure:  [
    { time: "7:30 AM",  title: "Sunrise summit hike",               cat: "adventure",   cost: 25, tip: "Start before dawn with a headlamp — you'll beat the heat and earn the view." },
    { time: "12:00 PM", title: "Trailhead picnic lunch",            cat: "dining",      cost: 14, tip: "Pack high-energy snacks; mountain cafés are scarce and pricey." },
    { time: "2:30 PM",  title: "Kayak or canyoning session",        cat: "adventure",   cost: 60, tip: "Guides supply gear — wear quick-dry layers and clip your phone to a leash.", kids: true },
    { time: "6:00 PM",  title: "Riverside camp dinner",             cat: "dining",      cost: 22, tip: "Eat where the day's effort earns it — simple food tastes incredible outdoors." },
  ],
};

// ── Local mock (no API key set) ───────────────────────────────────
function _mockItinerary(form) {
  const cityName = (form.destination || "Your City").split(",")[0].trim();
  const persona  = form.persona || "Mid-range";
  const pool     = ACTIVITY_POOL[persona] || ACTIVITY_POOL["Mid-range"];
  const hasKids  = (form.kids || 0) > 0;
  const titles   = ["Arrival & first taste","City highlights","Hidden corners","Nature & escape","Markets & farewell","Slow exploring","Final adventures"];
  const nDays    = Math.max(1, Math.min(form.days || 3, 7));
  const plan     = [];
  for (let d = 0; d < nDays; d++) {
    const rotated = pool.map((_, i) => pool[(i + d) % pool.length]);
    const items   = rotated.map(a => ({ ...a, kids: hasKids ? a.kids : false }));
    plan.push({ day: d + 1, title: titles[d] || `Day ${d + 1}`, items });
  }
  return {
    id: "custom", city: cityName,
    country: form.destination?.includes(",") ? form.destination.split(",")[1].trim() : "",
    cover: COVERS[cityName] || COVERS.Generic,
    persona, days: nDays,
    tagline: `${persona} trip · preview mode (add a Gemini key to get real AI plans)`,
    plan,
    omitted: [
      { time: "Evening",   title: `Live music night in ${cityName}`, cat: "relaxing",  cost: 20, tip: "Ask your host for the bar locals actually go to, not the one on the flyer." },
      { time: "Morning",   title: "Day trip to the nearby coast",    cat: "adventure", cost: 45, tip: "Trains leave hourly — go early and you'll have the beach before the crowds." },
      { time: "Afternoon", title: "Local cooking class",              cat: "dining",    cost: 55, tip: "You shop the market first, then cook — the recipes travel home with you.", kids: hasKids },
    ],
  };
}

// ── Claude AI — via built-in window.claude.complete ──────────────
// No API key needed. Called once per day to stay within token limits,
// then assembled into a full trip object.
const CLAUDE_SYSTEM = `You are an expert travel planner. Return ONLY a valid JSON object — no markdown fences, no prose, no comments.

For each day return EXACTLY:
{
  "day": <integer>,
  "title": "<poetic day title>",
  "items": [
    {
      "time": "<e.g. 9:00 AM>",
      "title": "<activity using real place names>",
      "cat": "<dining|cruise|adventure|relaxing|sightseeing>",
      "cost": <integer USD per person, 0 if free>,
      "tip": "<one specific insider sentence>",
      "kids": <true|false>
    }
  ]
}
Rules: exactly 3 items, vary categories, real place names, non-obvious tips.
Persona: Budget=cheap, Mid-range=comfortable, Luxurious=premium, Adventure=active.`;

function _sanitiseDay(day, dayNum) {
  const validCats = new Set(["dining","cruise","adventure","relaxing","sightseeing"]);
  return {
    day: dayNum,
    title: day.title || `Day ${dayNum}`,
    items: (day.items || []).map(it => ({
      ...it,
      cat:  validCats.has(it.cat) ? it.cat : "sightseeing",
      cost: typeof it.cost  === "number"  ? it.cost  : 0,
      kids: typeof it.kids  === "boolean" ? it.kids  : false,
      tip:  it.tip || "A wonderful experience.",
    })),
  };
}

async function generateItinerary(form) {
  // If claude helper not available, fall back to mock
  if (typeof window.claude === "undefined" || typeof window.claude.complete !== "function") {
    await new Promise(r => setTimeout(r, 600));
    return _mockItinerary(form);
  }

  const dest    = form.destination || "Paris";
  const days    = Math.max(1, Math.min(form.days || 3, 7));
  const persona = form.persona || "Mid-range";
  const adults  = (form.adults_m || 0) + (form.adults_f || 0) || 2;
  const kids    = form.kids || 0;
  const start   = form.startDate instanceof Date ? form.startDate.toISOString().slice(0,10) : (form.startDate || "flexible");
  const end     = form.endDate   instanceof Date ? form.endDate.toISOString().slice(0,10)   : (form.endDate   || "flexible");
  const must    = form.mustHave || "none specified";
  const context = `${persona} trip to ${dest}. Group: ${adults} adult(s), ${kids} kid(s). Dates: ${start}–${end}. Must-haves: ${must}.`;

  // Call Claude once per day (stays well within 1024-token output cap)
  const dayTitles = ["Arrival & first taste","City highlights","Hidden corners","Nature & escape","Markets & farewell","Slow exploring","Final adventures"];
  const planDays = [];
  for (let d = 1; d <= days; d++) {
    const prompt = `${CLAUDE_SYSTEM}\n\nContext: ${context}\nGenerate day ${d} of ${days} (${dayTitles[d-1] || "Day "+d}).`;
    let raw;
    try {
      raw = await window.claude.complete(prompt);
    } catch(e) {
      throw new Error("Claude request failed: " + (e.message || e));
    }
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/^```json\s*/i,"").replace(/```\s*$/i,"").trim());
    } catch(e) {
      // Claude returned bad JSON — use a fallback day
      parsed = { day: d, title: dayTitles[d-1] || "Day "+d, items: [
        { time: "9:00 AM",  title: "Morning exploration", cat: "sightseeing", cost: 0,  tip: "Start early to beat the crowds.", kids: false },
        { time: "1:00 PM",  title: "Local lunch",         cat: "dining",      cost: 20, tip: "Try the dish locals order, not the tourist menu.", kids: true },
        { time: "4:00 PM",  title: "Afternoon activity",  cat: "relaxing",    cost: 15, tip: "Take it slow — the best finds are unplanned.", kids: false },
      ]};
    }
    planDays.push(_sanitiseDay(parsed, d));
  }

  // One more call for metadata + omitted items
  const metaPrompt = `You are a travel planner. Return ONLY this JSON (no markdown):
{
  "city": "<city name from '${dest}'>",
  "country": "<country>",
  "tagline": "<one evocative sentence about a ${persona} trip to ${dest}>",
  "omitted": [
    {"time":"Evening","title":"<great activity that didn't fit>","cat":"relaxing","cost":25,"tip":"<one tip>"},
    {"time":"Morning","title":"<another backup activity>","cat":"sightseeing","cost":15,"tip":"<one tip>"},
    {"time":"Afternoon","title":"<third backup activity>","cat":"dining","cost":30,"tip":"<one tip>"}
  ]
}`;

  let meta = { city: dest.split(",")[0].trim(), country: "", tagline: `A ${persona} trip to ${dest}`, omitted: [] };
  try {
    const metaRaw = await window.claude.complete(metaPrompt);
    const metaParsed = JSON.parse(metaRaw.replace(/^```json\s*/i,"").replace(/```\s*$/i,"").trim());
    meta = { ...meta, ...metaParsed };
  } catch(e) { /* use defaults */ }

  const validCats = new Set(["dining","cruise","adventure","relaxing","sightseeing"]);
  while ((meta.omitted||[]).length < 3) {
    meta.omitted.push({ time: "Evening", title: "Local evening activity", cat: "relaxing", cost: 15, tip: "Ask locals for the best spot." });
  }
  meta.omitted = meta.omitted.map(it => ({
    ...it, cat: validCats.has(it.cat) ? it.cat : "sightseeing",
    cost: typeof it.cost === "number" ? it.cost : 0,
  }));

  const cityName = (meta.city || dest).split(",")[0].trim();
  return {
    id: "custom",
    city: meta.city || cityName,
    country: meta.country || "",
    persona,
    days,
    tagline: meta.tagline,
    cover: COVERS[cityName] || COVERS.Generic,
    plan: planDays,
    omitted: meta.omitted,
  };
}

// ───────────── Packing logic ─────────────
function buildPacking(form) {
  const start  = form.startDate ? new Date(form.startDate) : new Date();
  const month  = start.getMonth();
  const cold   = [10,11,0,1,2].includes(month);
  const kids   = (form.kids || 0) > 0;
  const dest   = (form.destination || "").toLowerCase();
  const beachy = /bali|santorini|lisbon|barcelona/.test(dest);

  const seasonal = cold
    ? { heading: "Cold-weather layers", icon: "snow", items: ["Insulated jacket + packable down","Thermal base layers (2)","Beanie, gloves & wool socks","Waterproof boots"] }
    : { heading: "Warm-weather kit",    icon: "sun",  items: ["Breathable light clothing","SPF 50 sunscreen + after-sun","Sunglasses & wide-brim hat", beachy ? "Swimwear & quick-dry towel" : "Refillable water bottle"] };

  const childcare = kids ? { heading: "Travelling with kids", icon: "kids", items: [
    "Each child's passport + copies","Consent / custody documentation","Snacks, wipes & entertainment","Child meds & first-aid basics",
  ]} : null;

  const essentials = { heading: "Always-on essentials", icon: "shield", items: [
    "Passport valid 6+ months","Travel insurance documents","Terminal & transit maps offline","Cards + a little local cash",
  ]};

  return [seasonal, childcare, essentials].filter(Boolean);
}

Object.assign(window, {
  CATEGORIES, KIDS, CURRENCIES, money, PLACES, COVERS, TRIPS,
  generateItinerary, buildPacking,
});
