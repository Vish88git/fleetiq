// ── CONFIGURATION ──
const ORS_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjRhYzBmODQxOWYxNDQ5YWU5OWQxNTAzOTdlYmZkN2NlIiwiaCI6Im11cm11cjY0In0=";
const OCM_KEY = "751ad13b-3ed7-448e-9a4e-143a1126ae5b";

// ── EV SPECIFICATIONS ──
const EV_RANGE_KM = 250;
const EV_CONSUMPTION_KWH_PER_KM = 0.2;

// ── JOURNEY MAP ──
let journeyMap = null;
let routeLayer = null;

function initJourneyMap() {
  if (journeyMap) return;
  journeyMap = L.map("journeyMap").setView([12.9716, 77.5946], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(journeyMap);
}

// Initialise journey map when tab is clicked
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    if (this.dataset.tab === "journey") {
      setTimeout(() => {
        initJourneyMap();
        if (journeyMap) journeyMap.invalidateSize();
      }, 150);
    }
  });
});

// ── GEOCODE CITY TO COORDINATES ──
async function geocodeCity(city) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(city)}&size=1`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.features || data.features.length === 0) {
    throw new Error(`City not found: ${city}`);
  }
  const [lon, lat] = data.features[0].geometry.coordinates;
  return { lat, lon, name: data.features[0].properties.label };
}

// ── GET ROUTE FROM ORS ──
async function getRoute(fromCoords, toCoords) {
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_KEY}&start=${fromCoords.lon},${fromCoords.lat}&end=${toCoords.lon},${toCoords.lat}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// ── GET CHARGING STATIONS ──
async function getChargingStations(lat, lon, radius = 50000) {
  const url = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lon}&distance=50&distanceunit=KM&maxresults=5&key=${OCM_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// ── GET WEATHER FOR ROUTE ──
async function getRouteWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// ── CALCULATE WEATHER ADJUSTED RANGE ──
function calculateAdjustedRange(baseRange, weatherData) {
  const temp = weatherData.main.temp;
  const windSpeed = weatherData.wind.speed;
  let adjustment = 1.0;

  if (temp < 5) adjustment -= 0.25;
  else if (temp < 15) adjustment -= 0.1;
  else if (temp > 35) adjustment -= 0.08;

  if (windSpeed > 10) adjustment -= 0.05;

  return Math.round(baseRange * adjustment);
}

// ── PLAN JOURNEY ──
document
  .getElementById("planJourney")
  .addEventListener("click", async function () {
    const fromCity = document.getElementById("fromCity").value.trim();
    const toCity = document.getElementById("toCity").value.trim();
    const battery = parseInt(document.getElementById("batteryLevel").value);
    const planDiv = document.getElementById("journeyPlan");

    if (!fromCity || !toCity) {
      planDiv.innerHTML =
        '<p class="placeholder-text">Please enter both origin and destination.</p>';
      return;
    }

    this.textContent = "⚡ Planning...";
    this.disabled = true;
    planDiv.innerHTML =
      '<p class="placeholder-text">Calculating optimal route...</p>';

    try {
      initJourneyMap();

      // Step 1: Geocode both cities
      const [fromCoords, toCoords] = await Promise.all([
        geocodeCity(fromCity),
        geocodeCity(toCity),
      ]);

      // Step 2: Get route
      const routeData = await getRoute(fromCoords, toCoords);
      const distanceKm = Math.round(
        routeData.features[0].properties.segments[0].distance / 1000,
      );
      const durationHrs = (
        routeData.features[0].properties.segments[0].duration / 3600
      ).toFixed(1);

      // Step 3: Draw route on map
      if (routeLayer) journeyMap.removeLayer(routeLayer);
      const coords = routeData.features[0].geometry.coordinates.map(
        ([lon, lat]) => [lat, lon],
      );
      routeLayer = L.polyline(coords, {
        color: "#00d4ff",
        weight: 4,
        opacity: 0.8,
      }).addTo(journeyMap);
      journeyMap.fitBounds(routeLayer.getBounds(), { padding: [20, 20] });

      // Add start and end markers
      L.marker([fromCoords.lat, fromCoords.lon])
        .addTo(journeyMap)
        .bindPopup(`<strong>START</strong><br/>${fromCoords.name}`)
        .openPopup();
      L.marker([toCoords.lat, toCoords.lon])
        .addTo(journeyMap)
        .bindPopup(`<strong>END</strong><br/>${toCoords.name}`);

      // Step 4: Get weather at midpoint
      const midLat = (fromCoords.lat + toCoords.lat) / 2;
      const midLon = (fromCoords.lon + toCoords.lon) / 2;
      const weather = await getRouteWeather(midLat, midLon);
      const adjustedRange = calculateAdjustedRange(
        (battery / 100) * EV_RANGE_KM,
        weather,
      );

      // Step 5: Get charging stations at midpoint
      const stations = await getChargingStations(midLat, midLon);
      stations.slice(0, 3).forEach((station) => {
        const lat = station.AddressInfo.Latitude;
        const lon = station.AddressInfo.Longitude;
        const name = station.AddressInfo.Title;
        const chargingIcon = L.divIcon({
          className: "",
          html: `<div style="background:#00d4ff;color:#000;font-size:10px;padding:2px 5px;border-radius:4px;font-weight:bold;">⚡</div>`,
          iconSize: [20, 20],
        });
        L.marker([lat, lon], { icon: chargingIcon })
          .addTo(journeyMap)
          .bindPopup(`<strong>⚡ ${name}</strong>`);
      });

      // Step 6: Generate AI drive plan
      const needsCharging = distanceKm > adjustedRange;
      const aiPrompt = `
You are an EV fleet management AI assistant.

Journey Details:
- From: ${fromCoords.name}
- To: ${toCoords.name}
- Distance: ${distanceKm} km
- Estimated duration: ${durationHrs} hours
- Vehicle battery: ${battery}%
- Adjusted range (weather-corrected): ${adjustedRange} km
- Charging stop needed: ${needsCharging ? "YES" : "NO"}
- Weather: ${weather.main.temp}°C, ${weather.weather[0].description}
- Wind: ${weather.wind.speed} m/s

Generate a professional EV drive plan with:
1. Journey summary
2. Weather impact on range
3. Recommended charging stops if needed
4. Estimated arrival time
5. Driver advisory notes

Keep it concise and professional.
    `;

      const aiRes = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const aiData = await aiRes.json();
      planDiv.textContent = aiData.result || "AI plan unavailable.";
    } catch (error) {
      planDiv.innerHTML = `<p class="placeholder-text">Error: ${error.message}</p>`;
    }

    this.textContent = "⚡ Plan Journey";
    this.disabled = false;
  });
