"use strict";

/* ==========================================================================
   Field Shift: front-end prototype with dashboard-style results
   ========================================================================== */

/* ---------- 1) What farmers can prioritise ---------- */
const CRITERIA = [
  { key: "water", label: "Save water", hint: "Lower irrigation needs" },
  { key: "soil", label: "Improve soil", hint: "Nitrogen, organic matter, less erosion" },
  { key: "income", label: "Extra income", hint: "Market and forage value" },
  { key: "resilience", label: "Weather resilience", hint: "Copes with heat, frost and dry spells" },
];

/* Ratings run from 1 (weak) to 5 (strong) for each criterion. */
const ROTATIONS = [
  {
    id: "mono",
    name: "Maize \u2192 Maize",
    summary: "The same cereal every season.",
    scores: { water: 2, soil: 1, income: 3, resilience: 2 },
    benefits: ["Familiar practices and equipment", "A steady, known market"],
    data: ["MODIS NDVI", "NASA POWER"],
    gaps: ["Soil nutrient levels after repeated maize", "Local pest and disease history"],
    risks: [
      "Repeated cereal cropping can deplete nutrients and build up pests and disease",
      "Soil can stay bare between seasons, which raises erosion risk",
    ],
  },
  {
    id: "beans",
    name: "Maize \u2192 Common beans",
    summary: "A legume follows the cereal.",
    scores: { water: 3, soil: 4, income: 4, resilience: 3 },
    benefits: [
      "Beans fix nitrogen, which can lower fertilizer needs for the next cereal",
      "Adds a second marketable crop",
      "Breaks some cereal pest and disease cycles",
    ],
    data: ["NASA POWER", "SMAP soil moisture"],
    gaps: ["Bean variety suited to the local season", "Local bean prices and buyers"],
    risks: [
      "Beans are sensitive to heat and water stress during flowering",
      "Varieties, planting dates and prices need a local check",
    ],
  },
  {
    id: "sorghum",
    name: "Maize \u2192 Sorghum",
    summary: "A drought-tolerant grain follows maize.",
    scores: { water: 4, soil: 3, income: 3, resilience: 4 },
    benefits: [
      "Sorghum generally tolerates drought better than maize",
      "Extensive roots can reach deeper moisture and help water soak in",
      "Can be used as grain or forage",
    ],
    data: ["GPM rainfall", "ECOSTRESS heat stress", "NASA POWER"],
    gaps: ["Nearby buyers or forage demand for sorghum", "Frost dates and season length at the field"],
    risks: [
      "The local market for sorghum may be small or lower value",
      "Only fits if the growing season and frost dates allow it",
    ],
  },
  {
    id: "cover",
    name: "Maize \u2192 Oats and vetch cover crop",
    summary: "A soil-building cover crop between maize crops.",
    scores: { water: 3, soil: 5, income: 2, resilience: 3 },
    benefits: [
      "Keeps soil covered, which reduces erosion",
      "Adds organic matter, and vetch adds nitrogen",
      "Can provide forage",
    ],
    data: ["MODIS and Landsat NDVI (bare-field periods)", "SMAP soil moisture"],
    gaps: ["Seed cost and sowing window", "Whether livestock could use the forage"],
    risks: [
      "Little direct income unless it is used as forage",
      "Cover crops use water, so timing matters in dry seasons",
    ],
  },
  {
    id: "fallow",
    name: "Wheat \u2192 Bare fallow",
    summary: "A rest season with no crop.",
    scores: { water: 2, soil: 1, income: 2, resilience: 2 },
    benefits: [
      "Simple to manage",
      "Can store some moisture for the next crop in dry regions",
    ],
    data: ["Landsat and MODIS NDVI", "SRTM elevation (slope and erosion)"],
    gaps: ["Slope and erosion history of the field", "How much moisture the fallow actually stores"],
    risks: [
      "Bare soil is exposed to erosion and heat",
      "A season without production means a season without income",
    ],
  },
  {
    id: "chickpea",
    name: "Maize \u2192 Chickpea",
    summary: "A dry-season legume follows maize.",
    scores: { water: 4, soil: 4, income: 3, resilience: 4 },
    benefits: [
      "Chickpea is a legume that fixes nitrogen",
      "Often grown on stored soil moisture, so it needs less irrigation",
      "Diversifies income",
    ],
    data: ["SMAP soil moisture", "GPM rainfall", "NASA POWER"],
    gaps: ["Disease pressure in the area", "Sowing window against local rainfall"],
    risks: [
      "Sensitive to excess moisture and some diseases",
      "Suitability and market access need a local check",
    ],
  },
];

const WATER_FACTOR = { low: 1.5, medium: 1, high: 0.8 };

/* ---------- 2) Field conditions (live NASA POWER + estimates) ---------- */
async function getConditions(lat, lon) {
  try {
    const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,PRECTOTCORR,RH2M,T2M_MAX,T2M_MIN&community=AG&latitude=${lat}&longitude=${lon}&format=JSON`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`NASA POWER request failed ${resp.status}`);
    const json = await resp.json();
    const params = json?.properties?.parameter;
    const annual = (obj) => Number(obj?.['Annual Average'] ?? obj?.['Mean'] ?? obj?.[Object.keys(obj)[0]]);
    const rainMm = annual(params.PRECTOTCORR);
    const tempC = annual(params.T2M);
    const soilMoisture = Math.min(0.45, Math.max(0.05, (rainMm / 2500) * (1 - (tempC - 10) / 60)));
    const ndvi = Math.min(0.85, Math.max(0.1, (rainMm / 1800) * (1 - Math.abs(tempC - 22) / 40)));
    return { demo: false, tempC, rainMm, soilMoisture: +soilMoisture.toFixed(2), ndvi: +ndvi.toFixed(2) };
  } catch (e) {
    console.warn('Failed to fetch NASA POWER data, using demo values', e);
    return { demo: true, tempC: 21.4, rainMm: 640, soilMoisture: 0.24, ndvi: 0.52 };
  }
}

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const state = { latlng: null, charts: [] };

function scrollBehavior() {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduce ? "auto" : "smooth";
}

function joinList(items) {
  if (items.length < 2) return items.join("");
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

function dots(n) {
  return "\u25CF".repeat(n) + "\u25CB".repeat(5 - n);
}

/* ---------- Controls ---------- */
function buildControls() {
  $("current").innerHTML = ROTATIONS.map((r) => `<option value="${r.id}">${r.name}</option>`).join("");
  $("current").value = "mono";

  $("priorities").innerHTML = CRITERIA.map(
    (c) => `
    <div class="slider">
      <div class="slider-head">
        <label for="p-${c.key}">${c.label}</label>
        <output id="o-${c.key}" for="p-${c.key}">3</output>
      </div>
      <input id="p-${c.key}" type="range" min="0" max="5" step="1" value="3" data-key="${c.key}">
      <p class="hint">${c.hint}</p>
    </div>`
  ).join("");

  document.querySelectorAll("#priorities input[type=range]").forEach((input) => {
    input.addEventListener("input", () => {
      $("o-" + input.dataset.key).textContent = input.value;
    });
  });
}

/* ---------- Map ---------- */
function initMap() {
  const map = L.map("map", { scrollWheelZoom: false }).setView([23.6, -102.5], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const ndviLayer = L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day_500m/default/2022-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg', {
    attribution: 'NASA GIBS MODIS NDVI',
    opacity: 0.5,
  });
  const smapLayer = L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/SMAP_L3_SM_P_Grid_9km/default/2022-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg', {
    attribution: 'NASA GIBS SMAP Soil Moisture',
    opacity: 0.5,
  });
  L.control.layers(null, {
    'NDVI (8\u2011day)': ndviLayer,
    'Soil Moisture (SMAP)': smapLayer,
  }, { collapsed: false }).addTo(map);

  let marker = null;
  function setLocation(latlng) {
    state.latlng = latlng;
    if (marker) marker.setLatLng(latlng);
    else marker = L.marker(latlng).addTo(map);
    $("coords").textContent = `Field selected: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
    $("formError").textContent = "";
  }

  map.on("click", (e) => setLocation(e.latlng));

  $("locate").addEventListener("click", () => {
    if (!navigator.geolocation) {
      $("formError").textContent = "Location is not available in this browser. Click the map to place your field.";
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = L.latLng(pos.coords.latitude, pos.coords.longitude);
        setLocation(here);
        map.setView(here, 12);
      },
      () => {
        $("formError").textContent = "Couldn't get your location. Click the map to place your field instead.";
      }
    );
  });
}

/* ---------- Scoring ---------- */
function getWeights() {
  const w = {};
  CRITERIA.forEach((c) => {
    w[c.key] = Number($("p-" + c.key).value);
  });
  w.water *= WATER_FACTOR[$("water").value];
  return w;
}

function scoreOf(rot, w) {
  const total = CRITERIA.reduce((sum, c) => sum + w[c.key], 0);
  if (total === 0) {
    const flat = CRITERIA.reduce((sum, c) => sum + rot.scores[c.key], 0);
    return Math.round((flat / (5 * CRITERIA.length)) * 100);
  }
  const weighted = CRITERIA.reduce((sum, c) => sum + rot.scores[c.key] * w[c.key], 0);
  return Math.round((weighted / (5 * total)) * 100);
}

function whyText(rot, w, isCurrent) {
  const maxW = Math.max(...CRITERIA.map((c) => w[c.key]));
  const top = maxW > 0 ? CRITERIA.filter((c) => w[c.key] >= maxW * 0.8) : [];
  const strong = top.filter((c) => rot.scores[c.key] >= 4).map((c) => c.label.toLowerCase());
  const weak = top.filter((c) => rot.scores[c.key] <= 2).map((c) => c.label.toLowerCase());

  const parts = [];
  if (isCurrent) parts.push("Baseline for the comparison.");
  if (strong.length) parts.push(`Strong on what matters most to you: ${joinList(strong)}.`);
  if (weak.length) parts.push(`Weaker on ${joinList(weak)}.`);
  if (!strong.length && !weak.length) parts.push("A middle-of-the-road option for your priorities.");
  return parts.join(" ");
}

/* ---------- SVG Ring ---------- */
function ringSVG(score, cssClass) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return `
    <div class="ring-wrap">
      <svg viewBox="0 0 90 90">
        <circle class="ring-bg" cx="45" cy="45" r="${r}"/>
        <circle class="ring-fg ${cssClass}" cx="45" cy="45" r="${r}"
          stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="ring-number">${score}</div>
    </div>`;
}

/* ---------- Rendering ---------- */
function columnHTML(item, index, w) {
  const { rot, score, isCurrent } = item;
  const tag = isCurrent ? "Your current rotation" : `Suggestion ${index}`;
  const pin = Math.min(98, Math.max(2, score));
  const list = (arr) => arr.map((t) => `<li>${t}</li>`).join("");
  const ratings = CRITERIA.map(
    (c) => `<li><span>${c.label}</span><span class="dots" role="img" aria-label="${rot.scores[c.key]} out of 5">${dots(rot.scores[c.key])}</span></li>`
  ).join("");

  return `
  <article class="col ${isCurrent ? "is-current" : ""}">
    <div class="cell head">
      <span class="tag">${tag}</span>
      <h3>${rot.name}</h3>
      <p>${rot.summary}</p>
    </div>
    <div class="cell meter" role="img" aria-label="Fit score ${score} out of 100">
      <div class="meter-top"><strong>${score}</strong><span>out of 100</span></div>
      <div class="track" aria-hidden="true"><i style="left:${pin}%"></i></div>
      <div class="scale" aria-hidden="true"><span>Poor fit</span><span>Strong fit</span></div>
    </div>
    <div class="cell"><h4>Why</h4><p>${whyText(rot, w, isCurrent)}</p></div>
    <div class="cell"><h4>How it rates</h4><ul class="rates">${ratings}</ul></div>
    <div class="cell"><h4>Benefits</h4><ul>${list(rot.benefits)}</ul></div>
    <div class="cell"><h4>NASA data that would back this up</h4><ul class="chips">${list(rot.data)}</ul></div>
    <div class="cell"><h4>Information gaps</h4><ul>${list(rot.gaps)}</ul></div>
    <div class="cell risk"><h4>Risks to review locally</h4><ul>${list(rot.risks)}</ul></div>
  </article>`;
}

function renderResults(cond, items, w) {
  // Destroy old charts
  state.charts.forEach(c => c.destroy());
  state.charts = [];

  const best = items.reduce((a, b) => (b.score > a.score ? b : a));
  const headline = best.isCurrent
    ? "Your current rotation scores best for these priorities."
    : `Best fit for your priorities: ${best.rot.name}`;

  const fmt = (v, unit) => (v != null ? `${v} ${unit}` : "N/A");
  const lat = state.latlng.lat.toFixed(4);
  const lng = state.latlng.lng.toFixed(4);

  const statusPill = cond.demo
    ? '<span class="pill-demo">\u26A0 Demo values</span>'
    : '<span class="pill-live">\u2713 Live NASA data</span>';

  $("results").innerHTML = `
    <!-- Dashboard Header -->
    <div class="dash-header">
      <h2>Field Shift Dashboard</h2>
      <div class="dash-status">${statusPill}</div>
    </div>

    <!-- Top Grid: Details | Metrics | Progress Rings -->
    <div class="dash-grid">
      <!-- Details Card -->
      <div class="dash-card">
        <h3>Field Details</h3>
        <div class="detail-row"><span class="detail-label">Latitude</span><span class="detail-value">${lat}</span></div>
        <div class="detail-row"><span class="detail-label">Longitude</span><span class="detail-value">${lng}</span></div>
        <div class="detail-row"><span class="detail-label">Current Rotation</span><span class="detail-value">${items[0].rot.name}</span></div>
        <div class="detail-row"><span class="detail-label">Water Available</span><span class="detail-value">${$("water").value}</span></div>
        <div class="detail-row"><span class="detail-label">Best Fit</span><span class="detail-value" style="color:var(--leaf)">${best.rot.name}</span></div>
      </div>

      <!-- Metrics Card -->
      <div class="dash-card">
        <h3>NASA Metrics</h3>
        <div class="metrics-grid">
          <div class="metric-tile">
            <div class="metric-label">Avg Temperature</div>
            <div class="metric-value">${fmt(cond.tempC, "\u00B0C")}</div>
            <div class="metric-source">NASA POWER</div>
          </div>
          <div class="metric-tile">
            <div class="metric-label">Annual Rainfall</div>
            <div class="metric-value">${fmt(cond.rainMm, "mm")}</div>
            <div class="metric-source">NASA POWER & GPM</div>
          </div>
          <div class="metric-tile">
            <div class="metric-label">Soil Moisture (est.)</div>
            <div class="metric-value">${fmt(cond.soilMoisture, "m\u00B3/m\u00B3")}</div>
            <div class="metric-source">SMAP (estimated)</div>
          </div>
          <div class="metric-tile">
            <div class="metric-label">NDVI (est.)</div>
            <div class="metric-value">${fmt(cond.ndvi, "")}</div>
            <div class="metric-source">MODIS (estimated)</div>
          </div>
        </div>
      </div>

      <!-- Progress Rings Card -->
      <div class="dash-card">
        <h3>Fit Score</h3>
        <div class="progress-section">
          <div class="rings-row">
            ${items.map((item, i) => `
              <div class="ring-item">
                ${ringSVG(item.score, i === 0 ? 'current' : i === 1 ? 'alt1' : 'alt2')}
                <span class="ring-label">${item.isCurrent ? 'Current' : item.rot.name.split('\u2192').pop().trim()}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <div class="chart-card">
        <h3>Criteria Comparison (Radar)</h3>
        <div class="chart-container"><canvas id="radarChart"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>Score Breakdown (Donut)</h3>
        <div class="chart-container"><canvas id="donutChart"></canvas></div>
      </div>
    </div>

    <p class="notice">This tool supports your decision and does not replace your own judgment or local agricultural advice. Check every option with local farmers or an agronomist before changing your rotation.</p>

    <h3 class="section-title">Rotation comparison</h3>
    <div class="compare">${items.map((item, i) => columnHTML(item, i, w)).join("")}</div>
  `;

  // Build Charts
  buildCharts(items);
}

/* ---------- Charts ---------- */
function buildCharts(items) {
  const labels = CRITERIA.map(c => c.label);
  const colors = ['#7a4a22', '#1f7a3d', '#1f5f9e'];
  const bgColors = ['rgba(122,74,34,0.15)', 'rgba(31,122,61,0.15)', 'rgba(31,95,158,0.15)'];

  // Radar Chart
  const radarCtx = document.getElementById('radarChart');
  if (radarCtx) {
    const radarChart = new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: items.map((item, i) => ({
          label: item.isCurrent ? `Current: ${item.rot.name}` : item.rot.name,
          data: CRITERIA.map(c => item.rot.scores[c.key]),
          borderColor: colors[i],
          backgroundColor: bgColors[i],
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: colors[i],
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11, family: 'Public Sans' }, usePointStyle: true } },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 5,
            ticks: { stepSize: 1, font: { size: 10 } },
            pointLabels: { font: { size: 11, family: 'Public Sans', weight: '600' } },
            grid: { color: 'rgba(0,0,0,0.06)' },
          },
        },
      },
    });
    state.charts.push(radarChart);
  }

  // Donut Chart
  const donutCtx = document.getElementById('donutChart');
  if (donutCtx) {
    const donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: items.map(item => item.isCurrent ? `Current` : item.rot.name.split('\u2192').pop().trim()),
        datasets: [{
          data: items.map(item => item.score),
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12, family: 'Public Sans' }, usePointStyle: true, padding: 16 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed} / 100`,
            },
          },
        },
      },
    });
    state.charts.push(donutChart);
  }
}

/* ---------- Compare ---------- */
async function onCompare() {
  const error = $("formError");
  error.textContent = "";

  if (!state.latlng) {
    error.textContent = "Click the map to place a marker on your field, then compare again.";
    $("map").scrollIntoView({ behavior: scrollBehavior(), block: "center" });
    return;
  }

  const button = $("compare");
  button.disabled = true;
  button.textContent = "Comparing\u2026";

  try {
    const cond = await getConditions(state.latlng.lat, state.latlng.lng);
    const w = getWeights();

    const current = ROTATIONS.find((r) => r.id === $("current").value);
    const others = ROTATIONS.filter((r) => r.id !== current.id)
      .map((r) => ({ rot: r, score: scoreOf(r, w), isCurrent: false }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
    const items = [{ rot: current, score: scoreOf(current, w), isCurrent: true }, ...others];

    renderResults(cond, items, w);
    $("results").focus({ preventScroll: true });
    $("results").scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  } catch (err) {
    console.error(err);
    error.textContent = "The comparison didn't load. Check your connection and select Compare rotations again.";
  } finally {
    button.disabled = false;
    button.textContent = "Compare rotations";
  }
}

/* ---------- Start ---------- */
buildControls();
initMap();
$("compare").addEventListener("click", onCompare);
