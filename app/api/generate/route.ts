import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { location, preferences, mode } = await req.json();

    if (!location) {
      return Response.json({ error: "Missing location" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
Create a ${mode} travel itinerary for ${location}.

User preferences: ${preferences || "none"}

Return ONLY valid JSON in this exact format:

{
  "days": [
    [
      { "name": "Activity", "description": "Short description" },
      { "name": "Activity", "description": "Short description" },
      { "name": "Activity", "description": "Short description" }
    ]
  ],
  "hotels": [
    {
      "name": "Real Hotel Name",
      "description": "Short luxury description",
      "price": "$ - $$$$",
      "link": "https://www.booking.com/searchresults.html?ss=${location}"
    }
  ]
}

Rules:
- Create 3 days of itinerary
- Each day = 3-5 activities
- Make activities realistic and desirable
- Recommend 3 REAL hotels in ${location}
- Match style: ${mode}
- Keep everything concise and premium
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let text = completion.choices[0].message.content || "";

    // 🧠 Clean response (in case AI adds text)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return Response.json(
        { error: "AI response parsing failed", raw: text },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to generate trip" },
      { status: 500 }
    );
  }
}