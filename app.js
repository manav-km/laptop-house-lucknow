/**
 * Laptop House — Interactive Hardware Lab Application
 * Includes Strict 25-Kilometer Geofencing Engine for Local Ordering & Pickup
 */

// 1. Business Geographical Anchor: Naza Market, Sangam Tower, Lucknow
const NAZA_MARKET_COORDS = {
  lat: 26.8485,
  lng: 80.9425,
  name: "Naza Market, Lalbagh, Lucknow",
  maxRadiusKm: 25.0
};

// Known regional pincodes with verified coordinates / distances
const PINCODE_DB = {
  "226001": { name: "Hazratganj / Lalbagh", lat: 26.8500, lng: 80.9400, distanceKm: 0.2 },
  "226010": { name: "Gomti Nagar", lat: 26.8530, lng: 81.0120, distanceKm: 7.5 },
  "226016": { name: "Indira Nagar", lat: 26.8850, lng: 80.9950, distanceKm: 8.2 },
  "226024": { name: "Aliganj", lat: 26.8920, lng: 80.9450, distanceKm: 6.4 },
  "226004": { name: "Charbagh / Railway Station", lat: 26.8300, lng: 80.9200, distanceKm: 2.8 },
  "226005": { name: "Alambagh", lat: 26.8150, lng: 80.9050, distanceKm: 6.1 },
  "226021": { name: "Jankipuram", lat: 26.9320, lng: 80.9380, distanceKm: 11.4 },
  "226028": { name: "Chinhat", lat: 26.8780, lng: 81.0500, distanceKm: 14.2 },
  "226301": { name: "Mohanlalganj", lat: 26.6800, lng: 80.9850, distanceKm: 23.8 },
  "225001": { name: "Barabanki City", lat: 26.9280, lng: 81.1850, distanceKm: 31.5 },
  "209801": { name: "Unnao Outer", lat: 26.5400, lng: 80.4900, distanceKm: 48.0 }
};

// Application State
let appState = {
  currentDistanceKm: 0.2, // Default: assumes local Naza area until tested
  isLocationVerified: false,
  isEligibleForDelivery: true, // within 25km
  locationDescription: "Hazratganj, Lucknow (Default Lab Proximity)",
  selectedLaptopForOrder: null,
  currentEstimate: null
};

// Certified Refurbished Inventory
const LAPTOP_INVENTORY = [
  {
    id: "LP-THINKPAD-T480",
    brand: "Lenovo ThinkPad",
    model: "T480 Business Ultrabook",
    specs: [
      "Intel Core i5-8350U (Quad Core, 8 Threads)",
      "16GB DDR4 Dual Channel RAM",
      "512GB NVMe M.2 High-Speed SSD",
      "14.0\" FHD (1920x1080) Matte IPS Display",
      "Dual Hot-Swap Bridge Battery (6-8 Hr Backup)",
      "Spill-Resistant Backlit Keyboard & TrackPoint"
    ],
    price: 19500,
    warranty: "90-Day Written Hardware Replacement",
    condition: "Grade A+ (MNC Corporate Ex-Lease)",
    stock: 4
  },
  {
    id: "LP-DELL-LATITUDE-7490",
    brand: "Dell Latitude",
    model: "7490 Carbon Edition",
    specs: [
      "Intel Core i7-8650U vPro (Turbo to 4.2GHz)",
      "16GB DDR4 High-Frequency RAM",
      "512GB PCIe NVMe Solid State Drive",
      "14.0\" Full HD Anti-Glare Gorilla Glass IPS",
      "Thunderbolt 3 USB-C + HDMI 2.0",
      "Precision Glass Touchpad & Fingerprint Sensor"
    ],
    price: 22000,
    warranty: "90-Day Written Hardware Replacement",
    condition: "Grade A (Clean Magnesium Chassis)",
    stock: 2
  },
  {
    id: "LP-HP-ELITEBOOK-840G6",
    brand: "HP EliteBook",
    model: "840 G6 Aluminum Unibody",
    specs: [
      "Intel Core i5-8265U Quad Core Processor",
      "16GB DDR4 Expandable System Memory",
      "256GB Turbo Drive NVMe SSD",
      "14.0\" Ultra-Slim Anti-Glare IPS 400 Nits",
      "Bang & Olufsen Premium Tuned Audio",
      "IR Facial Recognition Camera for Windows Hello"
    ],
    price: 21500,
    warranty: "90-Day Written Hardware Replacement",
    condition: "Grade A+ (CNC Machined Aluminum)",
    stock: 3
  },
  {
    id: "LP-APPLE-MACBOOK-RETINA",
    brand: "Apple",
    model: "MacBook Pro 13\" Retina",
    specs: [
      "Intel Core i5 Dual-Core 2.3GHz (Turbo 3.6GHz)",
      "8GB 2133MHz LPDDR3 Onboard Memory",
      "256GB Apple Blazing NVMe Storage",
      "13.3\" Retina Display with True Tone (2560x1600)",
      "Cycle Count: 142 (94% Original Health)",
      "Thunderbolt 3 Ports & Force Touch Trackpad"
    ],
    price: 31000,
    warranty: "90-Day Dedicated Hardware Support",
    condition: "Grade A (Space Grey, Pristine)",
    stock: 1
  }
];

// Persistent Mock Tickets
const DEFAULT_TICKETS = [
  {
    id: "LH-8021",
    customer: "Vikram Malhotra",
    phone: "+91 94150 11223",
    laptop: "Dell Inspiron 7567 Gaming",
    issue: "Dead short circuit on 19V rail; no power LED",
    stage: 3, // 1: Received, 2: Under Microscope, 3: Parts Replaced & Burn-in, 4: Ready for Delivery
    stageText: "Parts Replaced — Running 32-Bit AIDA64 Thermal Stress Test",
    date: "2026-10-27",
    distanceKm: 4.8
  },
  {
    id: "LH-8045",
    customer: "Priya Tandon",
    phone: "+91 98390 44556",
    laptop: "Lenovo ThinkPad X1 Carbon",
    issue: "Hinge ripped out of carbon bottom shell",
    stage: 2,
    stageText: "Under Microscope — Laser Anchor Threading in Progress",
    date: "2026-10-28",
    distanceKm: 7.2
  }
];

// --- Haversine Distance Calculation ---
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(1));
}

// --- Geofence Notification Renderer ---
function updateGeofenceDisplay() {
  const notice = document.getElementById("geoResultNotice");
  if (!notice) return;

  const isEligible = appState.currentDistanceKm <= NAZA_MARKET_COORDS.maxRadiusKm;
  appState.isEligibleForDelivery = isEligible;

  notice.classList.remove("hidden", "eligible", "ineligible");

  if (isEligible) {
    notice.classList.add("eligible");
    notice.innerHTML = `
      <span>✓ <strong>Within 25km Boundary:</strong> Your location is approx <strong>${appState.currentDistanceKm} km</strong> from Naza Market. You are <strong>fully eligible</strong> for doorstep repair pickup and local refurbished machine delivery!</span>
    `;
  } else {
    notice.classList.add("ineligible");
    notice.innerHTML = `
      <span>⚠️ <strong>Outside 25km Local Radius:</strong> Your location is approx <strong>${appState.currentDistanceKm} km</strong> away. Doorstep service and local laptop deliveries are restricted to 25 km of Naza Market. Please bring your device in person to our Sangam Tower lab or arrange private courier.</span>
    `;
  }
}

// --- GPS Geolocation Trigger ---
function detectUserGPS() {
  const notice = document.getElementById("geoResultNotice");
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser. Please select your Lucknow Pincode from the dropdown.");
    return;
  }

  notice.classList.remove("hidden");
  notice.innerHTML = "<span>Locating your coordinates against Naza Market, Lucknow...</span>";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const uLat = pos.coords.latitude;
      const uLng = pos.coords.longitude;
      const dist = calculateHaversineDistance(NAZA_MARKET_COORDS.lat, NAZA_MARKET_COORDS.lng, uLat, uLng);
      appState.currentDistanceKm = dist;
      appState.isLocationVerified = true;
      appState.locationDescription = `GPS Coordinates (${uLat.toFixed(3)}, ${uLng.toFixed(3)})`;
      updateGeofenceDisplay();
    },
    (err) => {
      notice.classList.add("ineligible");
      notice.innerHTML = `<span>⚠️ GPS location permission denied. Please select your local Lucknow Pincode from the dropdown instead.</span>`;
    },
    { timeout: 8000, enableHighAccuracy: true }
  );
}

// --- Estimate Calculation Engine ---
function computeEstimate() {
  const brand = document.getElementById("deviceBrand").value;
  const issue = document.getElementById("issueCategory").value;
  const mode = document.getElementById("serviceMode").value;

  const priceDisplay = document.getElementById("estPriceDisplay");
  const turnaround = document.getElementById("estTurnaround");
  const details = document.getElementById("estDetails");

  if (!brand || !issue) {
    priceDisplay.textContent = "Select brand and symptom above";
    turnaround.textContent = "Turnaround: —";
    return;
  }

  let minPrice = 0;
  let maxPrice = 0;
  let eta = "Same-Day";
  let explanation = "";

  switch (issue) {
    case "chip_dead":
      minPrice = brand === "apple" ? 3499 : 1499;
      maxPrice = brand === "apple" ? 5800 : 2899;
      eta = "24–48 Hours (Microscope Trace)";
      explanation = "Includes board cleaning, short-circuit Mosfet isolation, and SIO/PCH power rail testing.";
      break;
    case "screen":
      minPrice = brand === "apple" ? 8500 : 2400;
      maxPrice = brand === "apple" ? 16500 : 4900;
      eta = "30–45 Minutes";
      explanation = "Original grade IPS Full HD matte panel replacement with zero dead-pixel warranty.";
      break;
    case "hinge":
      minPrice = 850;
      maxPrice = 1650;
      eta = "2–4 Hours";
      explanation = "High-tensile brass insert anchoring + laser alignment without replacing the outer case.";
      break;
    case "liquid":
      minPrice = 1200;
      maxPrice = 2400;
      eta = "24 Hours (Ultrasonic Bath)";
      explanation = "40kHz ultrasonic mineral removal bath + 65°C dehydration oven treatment.";
      break;
    case "thermal":
      minPrice = 499;
      maxPrice = 799;
      eta = "45 Minutes";
      explanation = "Blower fan decapping, ultrasonic heatsink de-clog, and authentic Arctic MX-4 thermal paste.";
      break;
    case "battery":
      minPrice = brand === "apple" ? 3800 : 1600;
      maxPrice = brand === "apple" ? 6500 : 3200;
      eta = "1–2 Hours";
      explanation = "OEM Grade high-density lithium polymer battery replacement with 6-month written warranty.";
      break;
  }

  appState.currentEstimate = {
    brand,
    issue,
    mode,
    priceRange: `₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}`,
    eta,
    explanation
  };

  priceDisplay.textContent = `₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}`;
  turnaround.textContent = `Turnaround: ${eta}`;
  details.textContent = `${explanation} Labor and testing included. Final quote confirmed before soldering.`;
}

// --- Render Refurbished Inventory ---
function renderInventory() {
  const container = document.getElementById("laptopsCatalog");
  if (!container) return;

  container.innerHTML = LAPTOP_INVENTORY.map(lap => `
    <article class="laptop-card">
      <div>
        <span class="laptop-brand">${lap.brand} • ${lap.condition}</span>
        <h3 class="laptop-name">${lap.model}</h3>
        <ul class="laptop-specs">
          ${lap.specs.map(s => `<li>${s}</li>`).join("")}
        </ul>
      </div>
      <div class="laptop-price-box">
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted); display:block;">CASH / UPI PRICE</span>
          <span class="laptop-price">₹${lap.price.toLocaleString('en-IN')}</span>
        </div>
        <button class="btn btn-primary btn-sm btn-order-laptop" data-id="${lap.id}">
          Order Machine
        </button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".btn-order-laptop").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      openLaptopOrderModal(id);
    });
  });
}

// --- Open Laptop Order Modal (With 25km Geofence Enforcement) ---
function openLaptopOrderModal(laptopId) {
  const laptop = LAPTOP_INVENTORY.find(l => l.id === laptopId);
  if (!laptop) return;

  appState.selectedLaptopForOrder = laptop;
  const modal = document.getElementById("orderModal");
  const detailsBox = document.getElementById("orderItemDetails");
  const alertBox = document.getElementById("orderGeoAlert");
  const confirmBtn = document.getElementById("confirmOrderBtn");

  detailsBox.innerHTML = `
    <strong>${laptop.brand} ${laptop.model}</strong><br>
    Price: <strong>₹${laptop.price.toLocaleString('en-IN')}</strong> (Snapshot at checkout)<br>
    Warranty: ${laptop.warranty}
  `;

  // Enforce 25km Rule
  if (appState.currentDistanceKm > NAZA_MARKET_COORDS.maxRadiusKm) {
    alertBox.classList.remove("hidden");
    alertBox.innerHTML = `
      <strong>⚠️ Delivery Boundary Lock:</strong> Your detected distance is <strong>${appState.currentDistanceKm} km</strong> from Naza Market.
      Local dispatch is strictly restricted to 25 km of Lucknow. Direct order placement is disabled. Please visit our shop to pick up in person.
    `;
    confirmBtn.disabled = true;
    confirmBtn.classList.add("disabled");
  } else {
    alertBox.classList.remove("hidden");
    alertBox.classList.remove("alert-warning");
    alertBox.classList.add("alert-success");
    alertBox.style.borderColor = "var(--status-green)";
    alertBox.style.color = "#34d399";
    alertBox.innerHTML = `
      <strong>✓ Local Delivery Eligible:</strong> You are <strong>${appState.currentDistanceKm} km</strong> from Naza Market. Same-day insured courier / technician delivery is active.
    `;
    confirmBtn.disabled = false;
    confirmBtn.classList.remove("disabled");
  }

  modal.classList.remove("hidden");
}

// --- Live Job Sheet Tracker ---
function trackJobSheet() {
  const input = document.getElementById("ticketInput").value.trim().toUpperCase();
  const display = document.getElementById("trackerStatusDisplay");

  const storedTickets = JSON.parse(localStorage.getItem("lh_tickets") || "[]");
  const allTickets = [...DEFAULT_TICKETS, ...storedTickets];

  const ticket = allTickets.find(t => t.id === input);

  if (!ticket) {
    display.innerHTML = `
      <div style="color:var(--status-red); font-family:var(--font-mono); font-size:0.9rem;">
        ❌ Job Sheet ID "${input}" not found in current laboratory register. Please check your physical receipt or contact +91 75650 01234.
      </div>
    `;
    return;
  }

  display.innerHTML = `
    <div class="tracker-meta-grid">
      <div><span style="color:var(--text-muted)">JOB SHEET:</span> <strong>${ticket.id}</strong></div>
      <div><span style="color:var(--text-muted)">DEVICE:</span> <strong>${ticket.laptop}</strong></div>
      <div><span style="color:var(--text-muted)">DIAGNOSIS:</span> <strong>${ticket.issue}</strong></div>
      <div><span style="color:var(--text-muted)">DATE LOGGED:</span> <strong>${ticket.date}</strong></div>
    </div>
    <div class="step-flow">
      <div class="step-node ${ticket.stage >= 1 ? (ticket.stage > 1 ? 'completed' : 'active') : ''}">
        <div class="step-indicator">1</div>
        <div>Received at Lab</div>
      </div>
      <div class="step-node ${ticket.stage >= 2 ? (ticket.stage > 2 ? 'completed' : 'active') : ''}">
        <div class="step-indicator">2</div>
        <div>Microscope Inspection</div>
      </div>
      <div class="step-node ${ticket.stage >= 3 ? (ticket.stage > 3 ? 'completed' : 'active') : ''}">
        <div class="step-indicator">3</div>
        <div>Parts & Stress Test</div>
      </div>
      <div class="step-node ${ticket.stage >= 4 ? 'active' : ''}">
        <div class="step-indicator">4</div>
        <div>Ready for Pickup / Delivery</div>
      </div>
    </div>
    <div style="margin-top:1.25rem; font-family:var(--font-mono); font-size:0.85rem; background:rgba(255,255,255,0.03); padding:0.75rem 1rem; border-radius:var(--radius-sm);">
      <span style="color:var(--brand-amber)">CURRENT BENCH NOTE:</span> ${ticket.stageText}
    </div>
  `;
}

// --- Initialize Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  renderInventory();
  trackJobSheet();

  // Geofence GPS Button
  const btnGps = document.getElementById("btnCheckGps");
  if (btnGps) btnGps.addEventListener("click", detectUserGPS);

  // Geofence Pincode Dropdown
  const pincodeSelect = document.getElementById("pincodeSelect");
  if (pincodeSelect) {
    pincodeSelect.addEventListener("change", (e) => {
      const pin = e.target.value;
      if (pin && PINCODE_DB[pin]) {
        appState.currentDistanceKm = PINCODE_DB[pin].distanceKm;
        appState.isLocationVerified = true;
        appState.locationDescription = `${PINCODE_DB[pin].name} (${pin})`;
        updateGeofenceDisplay();
      }
    });
  }

  // Estimator Form Input change
  ["deviceBrand", "issueCategory", "serviceMode"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", computeEstimate);
  });

  // Track button
  const btnTrack = document.getElementById("btnTrack");
  if (btnTrack) btnTrack.addEventListener("click", trackJobSheet);

  // Book Service / Doorstep Button
  const btnBook = document.getElementById("btnBookService");
  if (btnBook) {
    btnBook.addEventListener("click", () => {
      if (!appState.currentEstimate) {
        alert("Please select a brand and issue in the estimator first.");
        return;
      }
      const modal = document.getElementById("bookingModal");
      const summary = document.getElementById("serviceSummary");
      const warning = document.getElementById("modalGeoWarning");
      const confirmBtn = document.getElementById("confirmBookingBtn");

      summary.value = `${appState.currentEstimate.brand.toUpperCase()} — ${appState.currentEstimate.issue} (${appState.currentEstimate.priceRange})`;

      if (appState.currentDistanceKm > NAZA_MARKET_COORDS.maxRadiusKm) {
        warning.classList.remove("hidden");
        warning.innerHTML = `⚠️ <strong>25km Boundary Notice:</strong> Your selected area is ${appState.currentDistanceKm} km from Naza Market. Doorstep technician pickup is not supported beyond 25km. Carry-in lab service is welcome!`;
        if (appState.currentEstimate.mode === "doorstep") {
          confirmBtn.disabled = true;
        }
      } else {
        warning.classList.add("hidden");
        confirmBtn.disabled = false;
      }

      modal.classList.remove("hidden");
    });
  }

  // Modal Close buttons
  document.getElementById("closeModalBtn")?.addEventListener("click", () => {
    document.getElementById("bookingModal").classList.add("hidden");
  });
  document.getElementById("cancelBookingBtn")?.addEventListener("click", () => {
    document.getElementById("bookingModal").classList.add("hidden");
  });
  document.getElementById("closeOrderModalBtn")?.addEventListener("click", () => {
    document.getElementById("orderModal").classList.add("hidden");
  });
  document.getElementById("cancelOrderBtn")?.addEventListener("click", () => {
    document.getElementById("orderModal").classList.add("hidden");
  });

  // Service Booking Submit
  document.getElementById("serviceBookingForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("custName").value;
    const phone = document.getElementById("custPhone").value;
    const address = document.getElementById("custAddress").value;
    const newId = `LH-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket = {
      id: newId,
      customer: name,
      phone: phone,
      laptop: appState.currentEstimate ? appState.currentEstimate.brand.toUpperCase() : "Laptop",
      issue: appState.currentEstimate ? appState.currentEstimate.issue : "Hardware Check",
      stage: 1,
      stageText: "Logged into System — Awaiting Bench Drop-off / Dispatch Queue",
      date: new Date().toISOString().split("T")[0],
      distanceKm: appState.currentDistanceKm
    };

    const existing = JSON.parse(localStorage.getItem("lh_tickets") || "[]");
    existing.push(newTicket);
    localStorage.setItem("lh_tickets", JSON.stringify(existing));

    alert(`Service Ticket ${newId} created successfully! Our Naza Market engineer will contact you on ${phone}.`);
    document.getElementById("bookingModal").classList.add("hidden");
    document.getElementById("ticketInput").value = newId;
    trackJobSheet();
  });

  // Order Refurbished Submit
  document.getElementById("laptopOrderForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (appState.currentDistanceKm > NAZA_MARKET_COORDS.maxRadiusKm) {
      alert("Order rejected: Address is outside the 25km local delivery boundary.");
      return;
    }

    const name = document.getElementById("orderName").value;
    const phone = document.getElementById("orderPhone").value;
    const address = document.getElementById("orderAddress").value;
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderRecord = {
      orderId,
      machine: `${appState.selectedLaptopForOrder.brand} ${appState.selectedLaptopForOrder.model}`,
      priceSnapshot: appState.selectedLaptopForOrder.price,
      buyerName: name,
      buyerPhone: phone,
      buyerAddress: address,
      distanceKm: appState.currentDistanceKm,
      status: "Local Dispatch Queued (Same-Day)",
      date: new Date().toISOString()
    };

    const existingOrders = JSON.parse(localStorage.getItem("lh_orders") || "[]");
    existingOrders.push(orderRecord);
    localStorage.setItem("lh_orders", JSON.stringify(existingOrders));

    alert(`Order ${orderId} confirmed! Our delivery executive will dispatch your machine to ${address} (${appState.currentDistanceKm} km from Naza Market).`);
    document.getElementById("orderModal").classList.add("hidden");
  });

  // Staff Portal Admin Login
  document.getElementById("adminBtn")?.addEventListener("click", () => {
    document.getElementById("adminModal").classList.remove("hidden");
  });
  document.getElementById("closeAdminBtn")?.addEventListener("click", () => {
    document.getElementById("adminModal").classList.add("hidden");
  });

  document.getElementById("btnAdminLogin")?.addEventListener("click", () => {
    const pin = document.getElementById("adminPin").value;
    if (pin === "1234") {
      document.getElementById("adminAuthSection").classList.add("hidden");
      document.getElementById("adminDashboard").classList.remove("hidden");
      loadAdminDashboard();
    } else {
      document.getElementById("pinError").classList.remove("hidden");
    }
  });

  // Admin Tab Navigation
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(tc => tc.classList.add("hidden"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-tab");
      document.getElementById(target)?.classList.remove("hidden");
    });
  });
});

function loadAdminDashboard() {
  const storedTickets = JSON.parse(localStorage.getItem("lh_tickets") || "[]");
  const allTickets = [...DEFAULT_TICKETS, ...storedTickets];
  const storedOrders = JSON.parse(localStorage.getItem("lh_orders") || "[]");

  document.getElementById("ticketCount").textContent = allTickets.length;
  document.getElementById("orderCount").textContent = storedOrders.length;

  // Render Tickets
  const ticketRows = document.getElementById("adminTicketRows");
  ticketRows.innerHTML = allTickets.map(t => `
    <tr>
      <td><strong>${t.id}</strong></td>
      <td>${t.customer}<br><span style="color:var(--text-muted)">${t.phone}</span></td>
      <td>${t.laptop} — ${t.issue}</td>
      <td>${t.distanceKm} km</td>
      <td><span class="est-tag">${t.stageText}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="advanceTicketStage('${t.id}')">Advance Stage</button>
      </td>
    </tr>
  `).join("");

  // Render Orders
  const orderRows = document.getElementById("adminOrderRows");
  orderRows.innerHTML = storedOrders.length ? storedOrders.map(o => `
    <tr>
      <td><strong>${o.orderId}</strong></td>
      <td>${o.machine}</td>
      <td>₹${o.priceSnapshot.toLocaleString('en-IN')}</td>
      <td>${o.buyerName} (${o.buyerPhone})</td>
      <td>${o.distanceKm} km</td>
      <td><span style="color:var(--status-green)">${o.status}</span></td>
    </tr>
  `).join("") : `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No customer orders placed yet. Place a test order from the storefront.</td></tr>`;

  // Render Stock
  const stockList = document.getElementById("adminStockList");
  stockList.innerHTML = LAPTOP_INVENTORY.map(lap => `
    <div style="background:var(--bg-core); padding:0.75rem 1rem; border:1px solid var(--border-subtle); margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>${lap.brand} ${lap.model}</strong> — ₹${lap.price.toLocaleString('en-IN')}
      </div>
      <div>
        <span style="font-family:var(--font-mono); color:var(--brand-amber);">In Stock: ${lap.stock} units</span>
      </div>
    </div>
  `).join("");
}

window.advanceTicketStage = function(ticketId) {
  const storedTickets = JSON.parse(localStorage.getItem("lh_tickets") || "[]");
  let t = storedTickets.find(x => x.id === ticketId);
  if (!t) {
    let def = DEFAULT_TICKETS.find(x => x.id === ticketId);
    if (def) {
      t = { ...def };
      storedTickets.push(t);
    }
  }

  if (t) {
    if (t.stage < 4) {
      t.stage += 1;
      const stages = [
        "",
        "Logged into System",
        "Under Microscope Inspection — Board Tracing",
        "Parts Replaced — Running Thermal Stress Test",
        "QC Passed — Ready for Pickup / Delivery"
      ];
      t.stageText = stages[t.stage];
      localStorage.setItem("lh_tickets", JSON.stringify(storedTickets));
      loadAdminDashboard();
      trackJobSheet();
    } else {
      alert("Ticket is already at final QC Completed stage.");
    }
  }
};
