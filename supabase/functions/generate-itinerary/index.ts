import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  destination: string;
  start_date: string;
  end_date: string;
  persona: string;
  must_haves?: string;
  adults_male?: number;
  adults_female?: number;
  kids?: number;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]!);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

const ACTIVITY_TEMPLATES: Record<string, Array<{ title: string; type: string; time: string; desc: string }>> = {
  budget: [
    { title: "Morning walk through the old city", type: "sightseeing", time: "08:00", desc: "Explore the historic streets before the crowds arrive." },
    { title: "Local street food breakfast", type: "dining", time: "09:30", desc: "Try authentic local flavors at a street market." },
    { title: "Free museum visit", type: "sightseeing", time: "11:00", desc: "Many local museums offer free entry in the mornings." },
    { title: "Picnic lunch in a park", type: "dining", time: "13:00", desc: "Grab fresh ingredients from the market and relax outdoors." },
    { title: "Neighborhood exploration", type: "sightseeing", time: "15:00", desc: "Wander and discover hidden gems off the tourist trail." },
    { title: "Sunset viewpoint", type: "relaxing", time: "18:00", desc: "Find the best vantage point to watch the sun go down." },
  ],
  midrange: [
    { title: "Guided walking tour", type: "sightseeing", time: "09:00", desc: "Join a small group tour to learn the city's history." },
    { title: "Brunch at a popular café", type: "dining", time: "11:00", desc: "Enjoy a leisurely brunch at a well-reviewed local spot." },
    { title: "Main landmark visit", type: "sightseeing", time: "13:30", desc: "Visit the destination's iconic landmark." },
    { title: "Afternoon spa or wellness", type: "relaxing", time: "16:00", desc: "Recharge with a relaxing wellness experience." },
    { title: "Dinner at a recommended restaurant", type: "dining", time: "19:30", desc: "Savor the local cuisine at a curated restaurant." },
  ],
  luxurious: [
    { title: "Private sunrise tour", type: "sightseeing", time: "06:30", desc: "Exclusive access to key sites before they open to the public." },
    { title: "Gourmet breakfast at the hotel", type: "dining", time: "09:00", desc: "Indulge in a full gourmet spread at your luxury hotel." },
    { title: "Private guide city tour", type: "sightseeing", time: "10:30", desc: "A dedicated guide takes you through the highlights." },
    { title: "Fine dining lunch", type: "dining", time: "13:00", desc: "A Michelin-starred or top-rated restaurant experience." },
    { title: "Helicopter or boat experience", type: "adventure", time: "15:30", desc: "See the destination from a unique perspective." },
    { title: "Sunset rooftop cocktails", type: "relaxing", time: "18:30", desc: "Enjoy bespoke cocktails at an exclusive rooftop bar." },
    { title: "Private chef dinner", type: "dining", time: "20:30", desc: "A private dining experience curated for your group." },
  ],
  adventure: [
    { title: "Early morning hike", type: "adventure", time: "06:00", desc: "Hit the trails before the heat of the day." },
    { title: "Fuel-up breakfast", type: "dining", time: "09:00", desc: "A hearty meal to power through the day's activities." },
    { title: "Water sports or climbing", type: "adventure", time: "10:30", desc: "Kayaking, rafting, rock climbing, or similar activity." },
    { title: "Packed lunch on the trail", type: "dining", time: "13:00", desc: "Eat surrounded by nature with a packed lunch." },
    { title: "Wildlife or nature tour", type: "sightseeing", time: "15:00", desc: "Explore the natural surroundings with a local guide." },
    { title: "Campfire or local dinner", type: "dining", time: "19:00", desc: "Wind down with a communal meal after the day's adventures." },
  ],
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { destination, start_date, end_date, persona, must_haves } = body;

    if (!destination || !start_date || !end_date || !persona) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (openaiKey) {
      // Use real OpenAI if key is available
      const dates = getDatesInRange(start_date, end_date);
      const prompt = `Create a detailed day-by-day travel itinerary for ${destination}.
Trip details:
- Duration: ${dates.length} days (${start_date} to ${end_date})
- Travel persona: ${persona}
- Group: ${body.adults_male || 1} male adult(s), ${body.adults_female || 0} female adult(s), ${body.kids || 0} kids
${must_haves ? `- Must-haves: ${must_haves}` : ""}

Return a JSON object with this exact structure:
{
  "days": [
    {
      "day_number": 1,
      "activities": [
        {
          "title": "Activity name",
          "type": "sightseeing|dining|adventure|cruise|relaxing|kids|other",
          "start_time": "HH:MM",
          "location": "Location name",
          "description": "Brief description",
          "latitude": null_or_number,
          "longitude": null_or_number
        }
      ]
    }
  ]
}
Only return valid JSON, no markdown or extra text.`;

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content;
        if (content) {
          const itinerary = JSON.parse(content);
          return new Response(
            JSON.stringify({ itinerary }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Fallback: generate a template-based itinerary
    const dates = getDatesInRange(start_date, end_date);
    const templates = ACTIVITY_TEMPLATES[persona] || ACTIVITY_TEMPLATES["midrange"]!;

    const days = dates.map((_, index) => {
      const dayNum = index + 1;
      // Rotate through templates to vary each day slightly
      const rotated = [...templates.slice(dayNum % 2), ...templates.slice(0, dayNum % 2)];
      const activities = rotated.map((act) => ({
        title: act.title,
        type: act.type,
        start_time: act.time,
        location: destination,
        description: act.desc,
        latitude: null,
        longitude: null,
      }));

      // Inject must-haves hint into first day's first activity if provided
      if (must_haves && dayNum === 1 && activities.length > 0) {
        activities[0]!.description = `${activities[0]!.description} Note: ${must_haves}`;
      }

      return { day_number: dayNum, activities };
    });

    return new Response(
      JSON.stringify({ itinerary: { days } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
