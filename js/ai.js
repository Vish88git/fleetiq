// ── FLEET CONTEXT FOR AI ──
function getFleetContext() {
  const total = fleetData.length;
  const active = fleetData.filter((v) => v.status === "active").length;
  const charging = fleetData.filter((v) => v.status === "charging").length;
  const alerts = fleetData.filter((v) => v.status === "alert").length;
  const avgBattery = Math.round(
    fleetData.reduce((sum, v) => sum + v.battery, 0) / total,
  );
  const lowest = fleetData.reduce((min, v) =>
    v.battery < min.battery ? v : min,
  );
  const highest = fleetData.reduce((max, v) =>
    v.battery > max.battery ? v : max,
  );

  return `
Fleet Summary:
- Total vehicles: ${total}
- Active (en route): ${active}
- Charging: ${charging}
- Alerts: ${alerts}
- Average battery: ${avgBattery}%
- Lowest battery: ${lowest.id} (${lowest.battery}%) — ${lowest.driver} at ${lowest.location}
- Highest battery: ${highest.id} (${highest.battery}%) — ${highest.driver} at ${highest.location}

Vehicle Details:
${fleetData.map((v) => `${v.id}: ${v.battery}% battery, ${v.range}km range, ${v.status}, ${v.driver}, ${v.location}`).join("\n")}
  `;
}

// ── CHAT FUNCTION ──
async function sendMessage(question) {
  const chat = document.getElementById("aiChat");

  // Add user message
  chat.innerHTML += `
    <div class="ai-message" style="flex-direction:row-reverse">
      <div class="ai-avatar user-avatar">👤</div>
      <div class="ai-bubble" style="background:rgba(0,212,255,0.05);border-color:rgba(0,212,255,0.2)">${question}</div>
    </div>
  `;

  // Add loading message
  const loadingId = "loading-" + Date.now();
  chat.innerHTML += `
    <div class="ai-message" id="${loadingId}">
      <div class="ai-avatar">⚡</div>
      <div class="ai-bubble ai-loading">Analysing fleet data...</div>
    </div>
  `;
  chat.scrollTop = chat.scrollHeight;

  try {
    const prompt = `
You are FleetIQ, an intelligent EV fleet management AI assistant.
You have access to real-time fleet data.

${getFleetContext()}

User question: ${question}

Give a concise, professional, data-driven response.
Reference specific vehicles, drivers, or metrics from the fleet data above.
    `;

    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    const answer = data.result || "Unable to process request.";

    // Replace loading with answer
    document.getElementById(loadingId).outerHTML = `
      <div class="ai-message">
        <div class="ai-avatar">⚡</div>
        <div class="ai-bubble">${answer}</div>
      </div>
    `;
  } catch (error) {
    document.getElementById(loadingId).outerHTML = `
      <div class="ai-message">
        <div class="ai-avatar">⚡</div>
        <div class="ai-bubble" style="color:#ef5350">Error: ${error.message}</div>
      </div>
    `;
  }

  chat.scrollTop = chat.scrollHeight;
}

// ── SEND BUTTON ──
document.getElementById("aiSend").addEventListener("click", function () {
  const input = document.getElementById("aiInput");
  const question = input.value.trim();
  if (!question) return;
  input.value = "";
  sendMessage(question);
});

// ── ENTER KEY ──
document.getElementById("aiInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") document.getElementById("aiSend").click();
});

// ── SUGGESTION BUTTONS ──
document.querySelectorAll(".suggestion-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    sendMessage(this.textContent);
  });
});
