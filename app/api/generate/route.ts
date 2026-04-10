import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { location, preferences, mode } = await req.json();

  const prompt = `
  Create a luxury travel itinerary for ${location}.
  Preferences: ${preferences}
  Style: ${mode}

  Return JSON in this format:
  {
    "days": [
      [
        { "name": "Activity", "description": "Details" }
      ]
    ]
  }
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0].message.content || "{}";

  try {
    return Response.json(JSON.parse(text));
  } catch {
    return Response.json({ days: [[]] });
  }
}import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  const { location, preferences } = await req.json();

  const prompt = `
  Create a luxury 3-day travel itinerary for ${location}.
  Preferences: ${preferences}

  Format as JSON:
  {
    "days": [
      [{"name": "...", "description": "..."}]
    ]
  }
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  const text = completion.choices[0].message.content || "{}";

  return Response.json(JSON.parse(text));
}