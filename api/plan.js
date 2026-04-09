export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, city, temperature, condition, aqi, question } = req.body;

  // Support both generic prompt and structured fields
  const finalPrompt =
    prompt ||
    `
You are a smart travel assistant helping plan a trip to ${city}.
Weather: ${temperature}, ${condition}, AQI: ${aqi}/5.
User question: ${question}
Give helpful, concise travel advice considering the weather and air quality.
  `;

  try {
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: finalPrompt }],
          max_tokens: 600,
        }),
      },
    );

    const data = await openaiRes.json();

    if (!data.choices || data.choices.length === 0) {
      return res
        .status(500)
        .json({ error: "No response from OpenAI", raw: data });
    }

    return res.status(200).json({ result: data.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
