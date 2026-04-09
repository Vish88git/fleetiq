export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city } = req.query;

  try {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${process.env.ORS_KEY}&text=${encodeURIComponent(city)}&size=1`;
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
