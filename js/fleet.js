// ── CONFIGURATION ──
const OWM_KEY = "34a053cb6f5ccdfc1337e3141786b9de";

// ── SIMULATED FLEET DATA ──
const fleetData = [
  {
    id: "EV-01",
    battery: 84,
    status: "active",
    lat: 12.9716,
    lon: 77.5946,
    driver: "Rajan K",
    range: 210,
    location: "Koramangala",
  },
  {
    id: "EV-02",
    battery: 45,
    status: "active",
    lat: 12.9352,
    lon: 77.6245,
    driver: "Priya M",
    range: 112,
    location: "HSR Layout",
  },
  {
    id: "EV-03",
    battery: 23,
    status: "alert",
    lat: 13.0358,
    lon: 77.597,
    driver: "Suresh B",
    range: 57,
    location: "Hebbal",
  },
  {
    id: "EV-04",
    battery: 91,
    status: "active",
    lat: 12.9082,
    lon: 77.6476,
    driver: "Anita R",
    range: 227,
    location: "Electronic City",
  },
  {
    id: "EV-05",
    battery: 12,
    status: "alert",
    lat: 12.9698,
    lon: 77.7499,
    driver: "Vikram S",
    range: 30,
    location: "Whitefield",
  },
  {
    id: "EV-06",
    battery: 67,
    status: "active",
    lat: 13.01,
    lon: 77.55,
    driver: "Meena T",
    range: 167,
    location: "Yeshwanthpur",
  },
  {
    id: "EV-07",
    battery: 38,
    status: "charging",
    lat: 12.925,
    lon: 77.5,
    driver: "Arjun P",
    range: 95,
    location: "Banashankari",
  },
  {
    id: "EV-08",
    battery: 55,
    status: "active",
    lat: 13.055,
    lon: 77.64,
    driver: "Deepa N",
    range: 137,
    location: "Thanisandra",
  },
  {
    id: "EV-09",
    battery: 78,
    status: "active",
    lat: 12.98,
    lon: 77.47,
    driver: "Kiran L",
    range: 195,
    location: "Rajajinagar",
  },
  {
    id: "EV-10",
    battery: 92,
    status: "active",
    lat: 12.945,
    lon: 77.69,
    driver: "Sonal V",
    range: 230,
    location: "Bellandur",
  },
  {
    id: "EV-11",
    battery: 61,
    status: "idle",
    lat: 12.96,
    lon: 77.61,
    driver: "Rahul D",
    range: 152,
    location: "Indiranagar",
  },
  {
    id: "EV-12",
    battery: 44,
    status: "charging",
    lat: 12.99,
    lon: 77.57,
    driver: "Pooja S",
    range: 110,
    location: "Sadashivanagar",
  },
];

// ── TAB NAVIGATION ──
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-panel")
      .forEach((p) => p.classList.remove("active"));
    this.classList.add("active");
    document.getElementById(`tab-${this.dataset.tab}`).classList.add("active");

    // Resize maps when tab switches
    setTimeout(() => {
      if (fleetMap) fleetMap.invalidateSize();
    }, 100);
  });
});

// ── FLEET MAP ──
const fleetMap = L.map("fleetMap").setView([12.9716, 77.5946], 11);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(fleetMap);

// Custom marker colours
function getMarkerColor(status) {
  if (status === "active") return "#00e676";
  if (status === "charging") return "#00d4ff";
  if (status === "alert") return "#ef5350";
  return "#4a5568";
}

function createVehicleMarker(vehicle) {
  const color = getMarkerColor(vehicle.status);
  const icon = L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      width:12px;height:12px;
      border-radius:50%;
      border:2px solid #0a0e1a;
      box-shadow:0 0 6px ${color};
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  return L.marker([vehicle.lat, vehicle.lon], { icon }).addTo(fleetMap)
    .bindPopup(`
      <div style="font-family:Segoe UI;min-width:140px">
        <strong>${vehicle.id}</strong><br/>
        Driver: ${vehicle.driver}<br/>
        Battery: ${vehicle.battery}%<br/>
        Range: ${vehicle.range} km<br/>
        Location: ${vehicle.location}
      </div>
    `);
}

// Plot all vehicles on map
fleetData.forEach(createVehicleMarker);

// ── VEHICLE LIST ──
function getBatteryColor(battery) {
  if (battery > 60) return "#00e676";
  if (battery > 25) return "#ffa726";
  return "#ef5350";
}

function renderVehicleList() {
  const list = document.getElementById("vehicleList");
  list.innerHTML = "";

  fleetData.forEach((v) => {
    const color = getBatteryColor(v.battery);
    const statusClass = `status-${v.status}`;
    const statusLabel = v.status.charAt(0).toUpperCase() + v.status.slice(1);

    list.innerHTML += `
      <div class="vehicle-item">
        <div class="vehicle-header">
          <span class="vehicle-id">${v.id} — ${v.driver}</span>
          <span class="vehicle-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="battery-bar-bg">
          <div class="battery-bar" style="width:${v.battery}%;background:${color}"></div>
        </div>
        <div class="vehicle-meta">
          <span>📍 ${v.location}</span>
          <span>🔋 ${v.battery}% · ${v.range} km</span>
        </div>
      </div>
    `;
  });
}

renderVehicleList();

// ── ALERTS ──
function renderAlerts() {
  const alertVehicles = fleetData.filter(
    (v) => v.status === "alert" || v.battery < 20,
  );
  const list = document.getElementById("alertsList");
  list.innerHTML = "";

  alertVehicles.forEach((v) => {
    const isCritical = v.battery < 20;
    list.innerHTML += `
      <div class="alert-item ${isCritical ? "alert-critical" : "alert-warning"}">
        <span>${isCritical ? "🔴" : "🟡"}</span>
        <span><strong>${v.id}</strong> — ${v.driver} · ${v.location} · Battery: ${v.battery}% · Range: ${v.range} km · ${isCritical ? "CRITICAL: Immediate charging required" : "WARNING: Low battery, plan charging stop"}</span>
      </div>
    `;
  });
}

renderAlerts();

// ── REFRESH BUTTON ──
document.getElementById("refreshFleet").addEventListener("click", function () {
  this.textContent = "↻ Refreshing...";
  setTimeout(() => {
    renderVehicleList();
    renderAlerts();
    this.textContent = "↻ Refresh";
  }, 800);
});
