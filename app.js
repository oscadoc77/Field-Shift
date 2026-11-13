"use strict";

/* ==========================================================================
   Field Shift: front-end prototype

   File map
     1) Preferences ...... theme and language, saved in the browser
     2) I18N ............. every interface string, in English and Spanish
     3) CRITERIA/ROTATIONS  illustrative agronomic content (not yet reviewed
                            by local agronomists; replace before real use)
     4) getConditions() .. live NASA POWER request with a labelled demo fallback
     5) Controls, map, scoring, rendering

   To add a language: add its code to LANGS, add a block to I18N, and add the
   same key to every { en, es } object in CRITERIA and ROTATIONS.
   ========================================================================== */

/* ---------- 1) Preferences ---------- */
const LANGS = ["en", "es"];

/* localStorage throws in some private modes; never let that break the page. */
const store = {
  get(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* preference lasts this visit only */ }
  },
};

const darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

function initialTheme() {
  const saved = store.get("fs-theme");
  if (saved === "light" || saved === "dark") return saved;
  return darkQuery && darkQuery.matches ? "dark" : "light";
}

function initialLang() {
  const saved = store.get("fs-lang");
  if (LANGS.includes(saved)) return saved;
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return LANGS.includes(browser) ? browser : "en";
}

const prefs = { theme: initialTheme(), lang: initialLang() };

/* This file loads in <head>, so these two lines run before the first paint
   and the page never flashes the wrong theme. */
document.documentElement.dataset.theme = prefs.theme;
document.documentElement.lang = prefs.lang;

/* ---------- 2) Interface strings ---------- */
const I18N = {
  en: {
    title: "Field Shift: crop-rotation explorer",
    tagline: "Explore crop rotations with NASA Earth data",
    demoFlag: "Prototype",
    langGroup: "Language",
    darkMode: "Dark mode",
    controlsLabel: "Your field and priorities",
    mapLabel: "Map for choosing your field",
    resultsLabel: "Rotation comparison",
    step1: "Pick your field",
    step1Hint: "Click the map to place a marker on your field.",
    useLocation: "Use my location",
    step2: "Your current rotation",
    currentLabel: "What do you grow today?",
    step3: "What matters most?",
    step3Hint: "0 means it doesn't matter, 5 means it matters most.",
    waterLabel: "Water available for the field",
    waterLow: "Limited",
    waterMedium: "Moderate",
    waterHigh: "Plenty",
    compare: "Compare rotations",
    comparing: "Comparing…",
    empty: "Choose your field on the map, set what matters most to you, then select Compare rotations. You will see your current rotation next to two alternatives.",
    footer: "Field Shift supports your decisions and does not replace your own judgment or local agricultural advice. Crop ratings are illustrative. Field conditions come from NASA POWER when it responds; otherwise demo values are shown and labelled.",
    noField: "No field selected yet.",
    fieldAt: "Field",
    west: "W",
    errNoGeo: "Location is not available in this browser. Click the map to place your field.",
    errGeoFail: "Couldn't get your location. Click the map to place your field instead.",
    errNoField: "Click the map to place a marker on your field, then compare again.",
    errCompare: "The comparison didn't load. Check your connection and select Compare rotations again.",
    errMap: "The map didn't load. Check your connection and reload the page.",
    layersTitle: "NASA satellite layers",
    layersNote: "Images from {date}. For visual context only; they do not change the score.",
    layerNdvi: "Vegetation greenness (NDVI, 8-day)",
    layerSmap: "Root-zone soil moisture (SMAP L4)",
    layerRain: "Rainfall (GPM IMERG)",
    bestCurrent: "Your current rotation scores best for these priorities.",
    bestOther: "Best fit for your priorities: {name}",
    notice: "This tool supports your decision and does not replace your own judgment or local agricultural advice. Check every option with local farmers or an agronomist before changing your rotation.",
    conditionsTitle: "Conditions at your field",
    demoPill: "Demo values",
    livePill: "NASA POWER, long-term average",
    comparisonTitle: "Rotation comparison",
    tagCurrent: "Your current rotation",
    tagSuggestion: "Suggestion {n}",
    tagBest: "Best fit",
    outOf100: "out of 100",
    fitAria: "Fit score {score} out of 100",
    rateAria: "{n} out of 5",
    poorFit: "Poor fit",
    strongFit: "Strong fit",
    why: "Why",
    rates: "How it rates",
    benefits: "Benefits",
    nasaData: "NASA data that would back this up",
    gaps: "Information gaps",
    risks: "Risks to review locally",
    whyBaseline: "Baseline for the comparison.",
    whyStrong: "Strong on what matters most to you: {list}.",
    whyWeak: "Weaker on {list}.",
    whyMiddle: "A middle-of-the-road option for your priorities.",
    condTemp: "Average temperature",
    condTempDesc: "Yearly average air temperature.",
    condRain: "Annual rainfall",
    condRainDesc: "Total rain in a typical year.",
    condSoil: "Root-zone soil wetness",
    condSoilDesc: "How wet the soil is where roots grow: 0% is dry, 100% is saturated. This is a model estimate, not a satellite measurement.",
    condSoilSrc: "NASA POWER (MERRA-2 model)",
    condNdvi: "Vegetation greenness (NDVI)",
    condNdviDesc: "A rough estimate derived from rainfall and temperature, not a satellite measurement.",
    condNdviNone: "No estimate is available for this field.",
    noData: "Not available",
    demoSrc: "demo value",
    fieldDetails: "Field details",
    latitude: "Latitude",
    longitude: "Longitude",
    waterAvailable: "Water available",
    bestFitLabel: "Best fit",
    fitScoreTitle: "Fit scores",
    currentShort: "Current",
    criteriaChart: "Criteria comparison (radar)",
    scoreChart: "Fit score comparison",
    climateChart: "Monthly climate and risk periods",
    chartRain: "Rain (mm per month)",
    chartMaxTemp: "Maximum temperature (°C)",
    chartAvgTemp: "Average temperature (°C)",
    chartMinTemp: "Minimum temperature (°C)",
    chartTemp: "Temperature (°C)",
    dryFlag: "Dry",
    coldFlag: "Cold",
    hotFlag: "Hot",
    okayFlag: "OK",
    riskNote: "Screening thresholds: rainfall below {dry} mm/month, average minimum temperature below {cold} °C, and average maximum temperature above {hot} °C. These are long-term NASA POWER indicators, not local forecasts. This field has {dryMonths} dry, {coldMonths} cold, and {hotMonths} hot months.",
    riskUnavailable: "Monthly risk analysis is unavailable for this location.",
    chartUnavailable: "Charts could not be loaded. Check that Chart.js is included before app.js.",
    needsMoreWater: "Needs more water than this field's {months} dry months may provide.",
    lowWaterFit: "Lower water needs may suit this field's {months} dry months.",
    frostSensitive: "Frost sensitivity matters because {months} months here have cold average minimums.",
    heatSensitive: "Heat sensitivity matters because {months} months here have high average maximums.",
    soilEstimateSrc: "Climate-based estimate",
    ndviEstimateSrc: "Climate-based estimate",
    soilEstimateDesc: "Estimated from long-term rainfall and temperature; it is not a direct soil measurement.",
    ndviEstimateDesc: "A rough estimate derived from rainfall and temperature, not a satellite NDVI measurement.",
    ndviEstimateUnavailable: "No estimate is available for this field.",
  },
  es: {
    title: "Field Shift: explorador de rotación de cultivos",
    tagline: "Explora rotaciones de cultivos con datos de la Tierra de la NASA",
    demoFlag: "Prototipo",
    langGroup: "Idioma",
    darkMode: "Modo oscuro",
    controlsLabel: "Tu parcela y tus prioridades",
    mapLabel: "Mapa para elegir tu parcela",
    resultsLabel: "Comparación de rotaciones",
    step1: "Elige tu parcela",
    step1Hint: "Haz clic en el mapa para colocar un marcador en tu parcela.",
    useLocation: "Usar mi ubicación",
    step2: "Tu rotación actual",
    currentLabel: "¿Qué siembras hoy?",
    step3: "¿Qué te importa más?",
    step3Hint: "0 significa que no importa; 5, que es lo que más importa.",
    waterLabel: "Agua disponible para la parcela",
    waterLow: "Limitada",
    waterMedium: "Moderada",
    waterHigh: "Abundante",
    compare: "Comparar rotaciones",
    comparing: "Comparando…",
    empty: "Elige tu parcela en el mapa, indica qué te importa más y selecciona Comparar rotaciones. Verás tu rotación actual junto a dos alternativas.",
    footer: "Field Shift apoya tus decisiones y no sustituye tu propio criterio ni la asesoría agrícola local. Las calificaciones de los cultivos son ilustrativas. Las condiciones de la parcela vienen de NASA POWER cuando responde; si no, se muestran valores de demostración y se indican como tales.",
    noField: "Aún no has elegido una parcela.",
    fieldAt: "Parcela",
    west: "O",
    errNoGeo: "Este navegador no ofrece la ubicación. Haz clic en el mapa para colocar tu parcela.",
    errGeoFail: "No se pudo obtener tu ubicación. Haz clic en el mapa para colocar tu parcela.",
    errNoField: "Haz clic en el mapa para colocar un marcador en tu parcela y vuelve a comparar.",
    errCompare: "La comparación no cargó. Revisa tu conexión y selecciona Comparar rotaciones otra vez.",
    errMap: "El mapa no cargó. Revisa tu conexión y recarga la página.",
    layersTitle: "Capas satelitales de la NASA",
    layersNote: "Imágenes del {date}. Solo dan contexto visual; no cambian el puntaje.",
    layerNdvi: "Verdor de la vegetación (NDVI, 8 días)",
    layerSmap: "Humedad del suelo en zona de raíces (SMAP L4)",
    layerRain: "Lluvia (GPM IMERG)",
    bestCurrent: "Tu rotación actual obtiene el mejor puntaje para estas prioridades.",
    bestOther: "La que mejor se ajusta a tus prioridades: {name}",
    notice: "Esta herramienta apoya tu decisión y no sustituye tu propio criterio ni la asesoría agrícola local. Revisa cada opción con agricultores de tu zona o con un agrónomo antes de cambiar tu rotación.",
    conditionsTitle: "Condiciones en tu parcela",
    demoPill: "Valores de demostración",
    livePill: "NASA POWER, promedio de largo plazo",
    comparisonTitle: "Comparación de rotaciones",
    tagCurrent: "Tu rotación actual",
    tagSuggestion: "Sugerencia {n}",
    tagBest: "Mejor ajuste",
    outOf100: "de 100",
    fitAria: "Puntaje de ajuste: {score} de 100",
    rateAria: "{n} de 5",
    poorFit: "Poco ajuste",
    strongFit: "Buen ajuste",
    why: "Por qué",
    rates: "Cómo califica",
    benefits: "Beneficios",
    nasaData: "Datos de la NASA que lo respaldarían",
    gaps: "Información que falta",
    risks: "Riesgos que revisar en tu zona",
    whyBaseline: "Punto de partida de la comparación.",
    whyStrong: "Fuerte en lo que más te importa: {list}.",
    whyWeak: "Más débil en {list}.",
    whyMiddle: "Una opción intermedia para tus prioridades.",
    condTemp: "Temperatura promedio",
    condTempDesc: "Temperatura promedio del aire en el año.",
    condRain: "Lluvia anual",
    condRainDesc: "Lluvia total en un año típico.",
    condSoil: "Humedad del suelo en la zona de raíces",
    condSoilDesc: "Qué tan húmedo está el suelo donde crecen las raíces: 0% es seco y 100% es saturado. Es una estimación de un modelo, no una medición satelital.",
    condSoilSrc: "NASA POWER (modelo MERRA-2)",
    condNdvi: "Verdor de la vegetación (NDVI)",
    condNdviDesc: "Estimación aproximada derivada de la lluvia y la temperatura; no es una medición satelital.",
    condNdviNone: "No hay una estimación disponible para esta parcela.",
    noData: "No disponible",
    demoSrc: "valor de demostración",
    fieldDetails: "Detalles de la parcela",
    latitude: "Latitud",
    longitude: "Longitud",
    waterAvailable: "Agua disponible",
    bestFitLabel: "Mejor ajuste",
    fitScoreTitle: "Puntajes de ajuste",
    currentShort: "Actual",
    criteriaChart: "Comparación de criterios (radar)",
    scoreChart: "Comparación de puntajes de ajuste",
    climateChart: "Clima mensual y periodos de riesgo",
    chartRain: "Lluvia (mm por mes)",
    chartMaxTemp: "Temperatura máxima (°C)",
    chartAvgTemp: "Temperatura promedio (°C)",
    chartMinTemp: "Temperatura mínima (°C)",
    chartTemp: "Temperatura (°C)",
    dryFlag: "Seco",
    coldFlag: "Frío",
    hotFlag: "Calor",
    okayFlag: "OK",
    riskNote: "Umbrales orientativos: lluvia menor a {dry} mm/mes, temperatura mínima promedio menor a {cold} °C y temperatura máxima promedio mayor a {hot} °C. Son indicadores de largo plazo de NASA POWER, no pronósticos locales. Esta parcela tiene {dryMonths} meses secos, {coldMonths} fríos y {hotMonths} calurosos.",
    riskUnavailable: "No está disponible el análisis de riesgos mensuales para esta ubicación.",
    chartUnavailable: "No se pudieron cargar las gráficas. Comprueba que Chart.js esté incluido antes de app.js.",
    needsMoreWater: "Puede necesitar más agua de la que ofrecen los {months} meses secos de esta parcela.",
    lowWaterFit: "Sus menores necesidades de agua pueden adaptarse a los {months} meses secos de esta parcela.",
    frostSensitive: "La sensibilidad a las heladas importa porque aquí hay {months} meses con temperaturas mínimas promedio bajas.",
    heatSensitive: "La sensibilidad al calor importa porque aquí hay {months} meses con temperaturas máximas promedio altas.",
    soilEstimateSrc: "Estimación basada en el clima",
    ndviEstimateSrc: "Estimación basada en el clima",
    soilEstimateDesc: "Estimación basada en la lluvia y temperatura de largo plazo; no es una medición directa del suelo.",
    ndviEstimateDesc: "Estimación aproximada derivada de la lluvia y la temperatura; no es una medición satelital de NDVI.",
    ndviEstimateUnavailable: "No hay una estimación disponible para esta parcela.",
  },
};

/* t("bestOther", { name: "Maize → Sorghum" }) fills {name} in the string. */
function t(key, vars) {
  const text = I18N[prefs.lang][key] ?? I18N.en[key] ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
}

/* Picks the current language out of an { en, es } object. */
const pick = (obj) => obj[prefs.lang] ?? obj.en;

/* ---------- 3) Content: what farmers can prioritise ---------- */
const CRITERIA = [
  {
    key: "water",
    label: { en: "Save water", es: "Ahorrar agua" },
    hint: { en: "Lower irrigation needs", es: "Menor necesidad de riego" },
  },
  {
    key: "soil",
    label: { en: "Improve soil", es: "Mejorar el suelo" },
    hint: { en: "Nitrogen, organic matter, less erosion", es: "Nitrógeno, materia orgánica, menos erosión" },
  },
  {
    key: "income",
    label: { en: "Extra income", es: "Ingreso adicional" },
    hint: { en: "Market and forage value", es: "Valor de mercado y de forraje" },
  },
  {
    key: "resilience",
    label: { en: "Weather resilience", es: "Resistencia al clima" },
    hint: { en: "Copes with heat, frost and dry spells", es: "Aguanta calor, heladas y periodos secos" },
  },
];

/* Ratings run from 1 (weak) to 5 (strong) for each criterion. */
const ROTATIONS = [
  {
    id: "mono",
    scores: { water: 2, soil: 1, income: 3, resilience: 2 },
    name: { en: "Maize → Maize", es: "Maíz → Maíz" },
    summary: { en: "The same cereal every season.", es: "El mismo cereal en cada ciclo." },
    benefits: {
      en: ["Familiar practices and equipment", "A steady, known market"],
      es: ["Prácticas y equipo que ya conoces", "Un mercado estable y conocido"],
    },
    data: {
      en: ["MODIS NDVI", "NASA POWER"],
      es: ["NDVI de MODIS", "NASA POWER"],
    },
    gaps: {
      en: ["Soil nutrient levels after repeated maize", "Local pest and disease history"],
      es: ["Niveles de nutrientes del suelo tras varios ciclos de maíz", "Historial local de plagas y enfermedades"],
    },
    risks: {
      en: [
        "Repeated cereal cropping can deplete nutrients and build up pests and disease",
        "Soil can stay bare between seasons, which raises erosion risk",
      ],
      es: [
        "Sembrar cereal una y otra vez puede agotar nutrientes y favorecer plagas y enfermedades",
        "El suelo puede quedar descubierto entre ciclos, lo que aumenta el riesgo de erosión",
      ],
    },
  },
  {
    id: "beans",
    scores: { water: 3, soil: 4, income: 4, resilience: 3 },
    name: { en: "Maize → Common beans", es: "Maíz → Frijol" },
    summary: { en: "A legume follows the cereal.", es: "Una leguminosa después del cereal." },
    benefits: {
      en: [
        "Beans fix nitrogen, which can lower fertilizer needs for the next cereal",
        "Adds a second marketable crop",
        "Breaks some cereal pest and disease cycles",
      ],
      es: [
        "El frijol fija nitrógeno, lo que puede reducir el fertilizante que necesita el siguiente cereal",
        "Suma un segundo cultivo que se puede vender",
        "Rompe algunos ciclos de plagas y enfermedades del cereal",
      ],
    },
    data: {
      en: ["NASA POWER", "SMAP soil moisture"],
      es: ["NASA POWER", "Humedad del suelo SMAP"],
    },
    gaps: {
      en: ["Bean variety suited to the local season", "Local bean prices and buyers"],
      es: ["Variedad de frijol adecuada para la temporada local", "Precios y compradores locales de frijol"],
    },
    risks: {
      en: [
        "Beans are sensitive to heat and water stress during flowering",
        "Varieties, planting dates and prices need a local check",
      ],
      es: [
        "El frijol es sensible al calor y a la falta de agua durante la floración",
        "Variedades, fechas de siembra y precios requieren verificación local",
      ],
    },
  },
  {
    id: "sorghum",
    scores: { water: 4, soil: 3, income: 3, resilience: 4 },
    name: { en: "Maize → Sorghum", es: "Maíz → Sorgo" },
    summary: { en: "A drought-tolerant grain follows maize.", es: "Un grano tolerante a la sequía después del maíz." },
    benefits: {
      en: [
        "Sorghum generally tolerates drought better than maize",
        "Extensive roots can reach deeper moisture and help water soak in",
        "Can be used as grain or forage",
      ],
      es: [
        "El sorgo suele tolerar la sequía mejor que el maíz",
        "Sus raíces extensas alcanzan humedad más profunda y ayudan a que el agua se infiltre",
        "Sirve como grano o como forraje",
      ],
    },
    data: {
      en: ["GPM rainfall", "ECOSTRESS heat stress", "NASA POWER"],
      es: ["Lluvia GPM", "Estrés por calor ECOSTRESS", "NASA POWER"],
    },
    gaps: {
      en: ["Nearby buyers or forage demand for sorghum", "Frost dates and season length at the field"],
      es: ["Compradores cercanos o demanda de forraje para el sorgo", "Fechas de heladas y duración del ciclo en la parcela"],
    },
    risks: {
      en: [
        "The local market for sorghum may be small or lower value",
        "Only fits if the growing season and frost dates allow it",
      ],
      es: [
        "El mercado local de sorgo puede ser pequeño o de menor valor",
        "Solo conviene si el ciclo de cultivo y las fechas de heladas lo permiten",
      ],
    },
  },
  {
    id: "cover",
    scores: { water: 3, soil: 5, income: 2, resilience: 3 },
    name: { en: "Maize → Oats and vetch cover crop", es: "Maíz → Cultivo de cobertura de avena y veza" },
    summary: {
      en: "A soil-building cover crop between maize crops.",
      es: "Un cultivo de cobertura que mejora el suelo entre siembras de maíz.",
    },
    benefits: {
      en: [
        "Keeps soil covered, which reduces erosion",
        "Adds organic matter, and vetch adds nitrogen",
        "Can provide forage",
      ],
      es: [
        "Mantiene el suelo cubierto, lo que reduce la erosión",
        "Aporta materia orgánica, y la veza aporta nitrógeno",
        "Puede dar forraje",
      ],
    },
    data: {
      en: ["MODIS and Landsat NDVI (bare-field periods)", "SMAP soil moisture"],
      es: ["NDVI de MODIS y Landsat (periodos con el suelo descubierto)", "Humedad del suelo SMAP"],
    },
    gaps: {
      en: ["Seed cost and sowing window", "Whether livestock could use the forage"],
      es: ["Costo de la semilla y ventana de siembra", "Si hay ganado que pueda aprovechar el forraje"],
    },
    risks: {
      en: [
        "Little direct income unless it is used as forage",
        "Cover crops use water, so timing matters in dry seasons",
      ],
      es: [
        "Poco ingreso directo si no se usa como forraje",
        "Los cultivos de cobertura consumen agua, así que el momento de siembra importa en temporadas secas",
      ],
    },
  },
  {
    id: "fallow",
    scores: { water: 2, soil: 1, income: 2, resilience: 2 },
    name: { en: "Wheat → Bare fallow", es: "Trigo → Barbecho sin cobertura" },
    summary: { en: "A rest season with no crop.", es: "Un ciclo de descanso, sin cultivo." },
    benefits: {
      en: ["Simple to manage", "Can store some moisture for the next crop in dry regions"],
      es: ["Fácil de manejar", "En regiones secas puede guardar algo de humedad para el siguiente cultivo"],
    },
    data: {
      en: ["Landsat and MODIS NDVI", "SRTM elevation (slope and erosion)"],
      es: ["NDVI de Landsat y MODIS", "Elevación SRTM (pendiente y erosión)"],
    },
    gaps: {
      en: ["Slope and erosion history of the field", "How much moisture the fallow actually stores"],
      es: ["Pendiente e historial de erosión de la parcela", "Cuánta humedad guarda realmente el barbecho"],
    },
    risks: {
      en: [
        "Bare soil is exposed to erosion and heat",
        "A season without production means a season without income",
      ],
      es: [
        "El suelo descubierto queda expuesto a la erosión y al calor",
        "Un ciclo sin producción es un ciclo sin ingresos",
      ],
    },
  },
  {
    id: "chickpea",
    scores: { water: 4, soil: 4, income: 3, resilience: 4 },
    name: { en: "Maize → Chickpea", es: "Maíz → Garbanzo" },
    summary: { en: "A dry-season legume follows maize.", es: "Una leguminosa de temporada seca después del maíz." },
    benefits: {
      en: [
        "Chickpea is a legume that fixes nitrogen",
        "Often grown on stored soil moisture, so it needs less irrigation",
        "Diversifies income",
      ],
      es: [
        "El garbanzo es una leguminosa que fija nitrógeno",
        "Suele cultivarse con la humedad guardada en el suelo, así que necesita menos riego",
        "Diversifica los ingresos",
      ],
    },
    data: {
      en: ["SMAP soil moisture", "GPM rainfall", "NASA POWER"],
      es: ["Humedad del suelo SMAP", "Lluvia GPM", "NASA POWER"],
    },
    gaps: {
      en: ["Disease pressure in the area", "Sowing window against local rainfall"],
      es: ["Presión de enfermedades en la zona", "Ventana de siembra según las lluvias locales"],
    },
    risks: {
      en: [
        "Sensitive to excess moisture and some diseases",
        "Suitability and market access need a local check",
      ],
      es: [
        "Sensible al exceso de humedad y a algunas enfermedades",
        "La aptitud y el acceso al mercado requieren verificación local",
      ],
    },
  },
];

/* Limited water makes "Save water" count more; plenty of water makes it count less. */
const WATER_FACTOR = { low: 1.5, medium: 1, high: 0.8 };

/* ---------- 4) Field conditions ---------- */
const POWER_URL = "https://power.larc.nasa.gov/api/temporal/climatology/point";
const POWER_TIMEOUT_MS = 12000;
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTH_LABELS = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
};
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const RISK = { dryMmPerMonth: 40, coldMinC: 5, hotMaxC: 33 };
const CLIMATE_PARAMETERS = ["T2M", "PRECTOTCORR", "T2M_MAX", "T2M_MIN"];
const DEMO_MONTHLY = {
  tempC: [15, 16.5, 18.5, 20.5, 22, 22, 21, 21, 20.5, 19, 17, 15.5],
  tempMaxC: [24, 26, 28.5, 30.5, 31.5, 29.5, 27, 27, 27, 27, 25.5, 24],
  tempMinC: [6.5, 7, 9, 11.5, 14, 16, 15.5, 15.5, 15.5, 12.5, 9, 7],
  rainMm: [12, 5, 5, 8, 30, 160, 200, 180, 140, 55, 12, 8],
};

async function fetchPower(lat, lon, parameters) {
  const query = new URLSearchParams({
    parameters: parameters.join(","),
    community: "AG",
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    format: "JSON",
  });
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), POWER_TIMEOUT_MS);
  try {
    const resp = await fetch(`${POWER_URL}?${query}`, { signal: abort.signal });
    if (!resp.ok) throw new Error(`NASA POWER responded ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timer);
  }
}

function isValidPowerValue(value) {
  return Number.isFinite(value) && value > -900;
}

function annualValue(series) {
  if (!series) return null;
  const annual = Number(series.ANN);
  if (isValidPowerValue(annual)) return annual;
  const months = MONTHS.map((month) => Number(series[month]));
  return months.length === 12 && months.every(isValidPowerValue)
    ? months.reduce((sum, value) => sum + value, 0) / 12
    : null;
}

function monthlyValues(series) {
  if (!series) return null;
  const values = MONTHS.map((month) => Number(series[month]));
  return values.length === 12 && values.every(isValidPowerValue) ? values : null;
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const sumOf = (values) => values.reduce((sum, value) => sum + value, 0);

function assessRisks(monthly) {
  const months = MONTH_LABELS[prefs.lang].map((label, index) => ({
    label,
    dry: monthly.rainMm[index] < RISK.dryMmPerMonth,
    cold: monthly.tempMinC[index] < RISK.coldMinC,
    hot: monthly.tempMaxC[index] > RISK.hotMaxC,
  }));
  const count = (key) => months.filter((month) => month[key]).length;
  const dryMonths = count("dry");
  const coldMonths = count("cold");
  const hotMonths = count("hot");
  const annualRain = sumOf(monthly.rainMm);
  return {
    months,
    dryMonths,
    coldMonths,
    hotMonths,
    water: (clamp((dryMonths - 3) / 6, 0, 1) + clamp((900 - annualRain) / 700, 0, 1)) / 2,
    frost: clamp(coldMonths / 4, 0, 1),
    heat: clamp(hotMonths / 4, 0, 1),
  };
}

function buildConditions(monthly, demo, modelSoilWetness = null, annual = {}) {
  const avgTemp = monthly ? sumOf(monthly.tempC) / 12 : annual.tempC;
  const annualRain = monthly ? sumOf(monthly.rainMm) : annual.rainMm;
  if (!Number.isFinite(avgTemp) || !Number.isFinite(annualRain)) {
    throw new Error("NASA POWER returned no usable temperature or rainfall values");
  }

  // NASA POWER's GWETROOT is a MERRA-2 model estimate. If absent, the fallback
  // below is explicitly labelled as a climate-derived estimate, not a reading.
  const estimatedSoilWetness = clamp((annualRain / 2500) * (1 - (avgTemp - 10) / 60), 0.05, 0.45);
  const soilWetness = isValidPowerValue(modelSoilWetness)
    ? clamp(modelSoilWetness, 0, 1)
    : estimatedSoilWetness;
  // NDVI is not returned by this POWER request; this value is only a rough proxy.
  const estimatedNdvi = clamp((annualRain / 1800) * (1 - Math.abs(avgTemp - 22) / 40), 0.1, 0.85);

  return {
    demo,
    tempC: +avgTemp.toFixed(1),
    rainMm: Math.round(annualRain),
    soilWetness: +soilWetness.toFixed(2),
    soilEstimated: !isValidPowerValue(modelSoilWetness),
    ndvi: +estimatedNdvi.toFixed(2),
    ndviEstimated: true,
    monthly,
    risks: monthly ? assessRisks(monthly) : null,
  };
}

async function getConditions(lat, lon) {
  try {
    let json;
    try {
      json = await fetchPower(lat, lon, [...CLIMATE_PARAMETERS, "GWETROOT"]);
    } catch (withSoilError) {
      console.warn("NASA POWER request with GWETROOT failed; retrying climate parameters only", withSoilError);
      json = await fetchPower(lat, lon, CLIMATE_PARAMETERS);
    }

    const series = json?.properties?.parameter ?? {};
    const temperature = monthlyValues(series.T2M);
    const maxTemperature = monthlyValues(series.T2M_MAX);
    const minTemperature = monthlyValues(series.T2M_MIN);
    const dailyRain = monthlyValues(series.PRECTOTCORR);
    const rainUnits = String(json?.parameters?.PRECTOTCORR?.units ?? "mm/day");

    let monthly = null;
    if (temperature && maxTemperature && minTemperature && dailyRain) {
      const rainMm = /day/i.test(rainUnits)
        ? dailyRain.map((value, index) => value * DAYS_IN_MONTH[index])
        : dailyRain;
      monthly = { tempC: temperature, tempMaxC: maxTemperature, tempMinC: minTemperature, rainMm };
    }

    const annualTemp = annualValue(series.T2M);
    let annualRain = annualValue(series.PRECTOTCORR);
    if (annualRain !== null && /day/i.test(rainUnits)) annualRain *= 365;
    const tempC = monthly ? sumOf(monthly.tempC) / 12 : annualTemp;
    const rainMm = monthly ? sumOf(monthly.rainMm) : annualRain;
    if (!Number.isFinite(tempC) || !Number.isFinite(rainMm)) {
      throw new Error("NASA POWER returned incomplete temperature or rainfall data");
    }

    return buildConditions(monthly, false, annualValue(series.GWETROOT), { tempC, rainMm });
  } catch (error) {
    console.warn("NASA POWER data unavailable, showing labelled demo values", error);
    return buildConditions(DEMO_MONTHLY, true, null);
  }
}

/* Traits and response rules are illustrative and need local agronomic review. */
const TRAITS = {
  mono: { waterDemand: 2, heat: 1.5, frost: 1.5 },
  beans: { waterDemand: 1, heat: 2, frost: 2 },
  sorghum: { waterDemand: 0.5, heat: 0.5, frost: 2 },
  cover: { waterDemand: 1, heat: 1.5, frost: 0 },
  fallow: { waterDemand: 1, heat: 0, frost: 0 },
  chickpea: { waterDemand: 0.5, heat: 1.5, frost: 1 },
};

function adjustFor(rot, risks) {
  const scores = { ...rot.scores };
  const notes = [];
  if (!risks || !TRAITS[rot.id]) return { scores, notes };

  const traits = TRAITS[rot.id];
  const waterShift = (1 - traits.waterDemand) * risks.water;
  const heatHit = 0.5 * traits.heat * risks.heat;
  const frostHit = 0.5 * traits.frost * risks.frost;
  scores.water = clamp(scores.water + waterShift, 1, 5);
  scores.resilience = clamp(scores.resilience - heatHit - frostHit + 0.5 * waterShift, 1, 5);

  if (waterShift <= -0.15) notes.push({ key: "needsMoreWater", vars: { months: risks.dryMonths } });
  if (waterShift >= 0.15) notes.push({ key: "lowWaterFit", vars: { months: risks.dryMonths } });
  if (frostHit >= 0.15) notes.push({ key: "frostSensitive", vars: { months: risks.coldMonths } });
  if (heatHit >= 0.15) notes.push({ key: "heatSensitive", vars: { months: risks.hotMonths } });
  return { scores, notes };
}

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const state = {
  latlng: null,
  errorKey: null,
  last: null,
  busy: false,
  charts: [],
};

/* Everything inserted with innerHTML passes through here, so text can never
   become markup, even if the content later comes from an API or a user. */
function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}

function scrollBehavior() {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduce ? "auto" : "smooth";
}

function joinList(items) {
  if (typeof Intl !== "undefined" && Intl.ListFormat) {
    return new Intl.ListFormat(prefs.lang, { style: "long", type: "conjunction" }).format(items);
  }
  return items.join(", ");
}

function num(value, digits) {
  return new Intl.NumberFormat(prefs.lang, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

function setError(key) {
  state.errorKey = key;
  $("formError").textContent = key ? t(key) : "";
}

function coordsHTML() {
  if (!state.latlng) return esc(t("noField"));
  const { lat, lng } = state.latlng;
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : t("west");
  return `${esc(t("fieldAt"))} <span class="axis">${Math.abs(lat).toFixed(4)}° ${ns}</span> <span class="axis">${Math.abs(lng).toFixed(4)}° ${ew}</span>`;
}

function renderCoords() {
  $("coords").innerHTML = coordsHTML();
  $("coords").classList.toggle("has-field", Boolean(state.latlng));
}

/* ---------- Theme and language ---------- */
function applyTheme() {
  document.documentElement.dataset.theme = prefs.theme;
  $("theme").setAttribute("aria-checked", String(prefs.theme === "dark"));
  if (state.last) renderResults(state.last.cond, state.last.items, state.last.w);
}

function applyLanguage() {
  document.documentElement.lang = prefs.lang;
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  document.querySelectorAll(".seg button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.lang === prefs.lang));
  });

  buildControls();
  renderCoords();
  if (state.busy) $("compare").textContent = t("comparing");
  if (state.errorKey) $("formError").textContent = t(state.errorKey);
  if (mapApi) mapApi.relabel();
  if (state.last) renderResults(state.last.cond, state.last.items, state.last.w);
}

function initPreferences() {
  $("theme").addEventListener("click", () => {
    prefs.theme = prefs.theme === "dark" ? "light" : "dark";
    store.set("fs-theme", prefs.theme);
    applyTheme();
  });

  document.querySelectorAll(".seg button").forEach((b) => {
    b.addEventListener("click", () => {
      if (b.dataset.lang === prefs.lang) return;
      prefs.lang = b.dataset.lang;
      store.set("fs-lang", prefs.lang);
      applyLanguage();
    });
  });

  // Follow the system theme until the person chooses one here.
  if (darkQuery && darkQuery.addEventListener) {
    darkQuery.addEventListener("change", (e) => {
      if (store.get("fs-theme")) return;
      prefs.theme = e.matches ? "dark" : "light";
      applyTheme();
    });
  }
}

/* ---------- Controls ---------- */
/* Rebuilt on every language switch, so it carries over what was already set. */
function buildControls() {
  const current = $("current").value || "mono";
  const weights = {};
  document.querySelectorAll("#priorities input[type=range]").forEach((input) => {
    weights[input.dataset.key] = input.value;
  });

  $("current").innerHTML = ROTATIONS.map((r) => `<option value="${esc(r.id)}">${esc(pick(r.name))}</option>`).join("");
  $("current").value = current;

  $("priorities").innerHTML = CRITERIA.map((c) => {
    const value = esc(weights[c.key] ?? "3");
    return `
    <div class="slider">
      <div class="slider-head">
        <label for="p-${c.key}">${esc(pick(c.label))}</label>
        <output id="o-${c.key}" for="p-${c.key}">${value}</output>
      </div>
      <input id="p-${c.key}" type="range" min="0" max="5" step="1" value="${value}" data-key="${c.key}">
      <p class="hint">${esc(pick(c.hint))}</p>
    </div>`;
  }).join("");

  document.querySelectorAll("#priorities input[type=range]").forEach((input) => {
    input.addEventListener("input", () => {
      $("o-" + input.dataset.key).textContent = input.value;
    });
  });
}

/* ---------- Map ---------- */
let mapApi = null;

const RETICLE_SVG = `
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true">
  <circle cx="20" cy="20" r="10"/>
  <path d="M20 2v10M20 28v10M2 20h10M28 20h10"/>
  <circle cx="20" cy="20" r="1.5" fill="currentColor" stroke="none"/>
</svg>`;

function initMap() {
  if (typeof L === "undefined") {
    // Leaflet didn't arrive (offline, CDN blocked, or the integrity check failed).
    setError("errMap");
    return null;
  }

  const map = L.map("map", { scrollWheelZoom: false }).setView([23.6, -102.5], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    className: "base-tiles", // lets the dark theme restyle only the street map
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // NASA GIBS overlays: visual context only, they do not enter the score.
  // Layer ids, zoom limits and date ranges were read from the GIBS capabilities file
  // (gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml).
  // Each layer stops at its own native zoom (Level6 -> 6, Level9 -> 9) and only has
  // images inside its date range, so GIBS_DATE must fall inside all three.
  const GIBS_DATE = "2026-09-15";
  const gibs = (layer, level, attribution, opacity) =>
    L.tileLayer(`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${GIBS_DATE}/GoogleMapsCompatible_Level${level}/{z}/{y}/{x}.png`, {
      attribution,
      opacity,
      maxNativeZoom: level, // beyond this zoom Leaflet stretches the last real tiles
    });
  const ndviLayer = gibs("MODIS_Terra_NDVI_8Day", 9, "NASA GIBS MODIS Terra NDVI", 0.55);
  const smapLayer = gibs("SMAP_L4_Analyzed_Root_Zone_Soil_Moisture", 6, "NASA GIBS SMAP L4 root-zone soil moisture", 0.6);
  const rainLayer = gibs("IMERG_Precipitation_Rate", 6, "NASA GIBS GPM IMERG precipitation rate", 0.65);

  // The layer picker holds translated labels, so it is rebuilt per language.
  let layerControl = null;
  function relabel() {
    if (layerControl) layerControl.remove();
    layerControl = L.control.layers(null, {
      [t("layerNdvi")]: ndviLayer,
      [t("layerSmap")]: smapLayer,
      [t("layerRain")]: rainLayer,
    }, { collapsed: false }).addTo(map);

    const list = layerControl.getContainer().querySelector(".leaflet-control-layers-list");
    const title = document.createElement("p");
    title.className = "layers-title";
    title.textContent = t("layersTitle");
    const note = document.createElement("p");
    note.className = "layers-note";
    note.textContent = t("layersNote", { date: GIBS_DATE });
    list.prepend(title);
    list.append(note);
  }
  relabel();

  const reticle = L.divIcon({ className: "reticle", html: RETICLE_SVG, iconSize: [40, 40], iconAnchor: [20, 20] });
  let marker = null;
  function setLocation(latlng) {
    state.latlng = latlng;
    if (marker) marker.setLatLng(latlng);
    else marker = L.marker(latlng, { icon: reticle, keyboard: false }).addTo(map);
    renderCoords();
    setError(null);
  }

  map.on("click", (e) => setLocation(e.latlng));

  $("locate").addEventListener("click", () => {
    if (!navigator.geolocation) {
      setError("errNoGeo");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = L.latLng(pos.coords.latitude, pos.coords.longitude);
        setLocation(here);
        map.setView(here, 12);
      },
      () => setError("errGeoFail")
    );
  });

  return { relabel };
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
    // No priorities set: treat every criterion equally.
    const flat = CRITERIA.reduce((sum, c) => sum + rot.scores[c.key], 0);
    return Math.round((flat / (5 * CRITERIA.length)) * 100);
  }
  const weighted = CRITERIA.reduce((sum, c) => sum + rot.scores[c.key] * w[c.key], 0);
  return Math.round((weighted / (5 * total)) * 100);
}

function whyText(rot, w, isCurrent) {
  const maxW = Math.max(...CRITERIA.map((c) => w[c.key]));
  const top = maxW > 0 ? CRITERIA.filter((c) => w[c.key] >= maxW * 0.8) : [];
  const lower = (c) => pick(c.label).toLocaleLowerCase(prefs.lang);
  const strong = top.filter((c) => rot.scores[c.key] >= 4).map(lower);
  const weak = top.filter((c) => rot.scores[c.key] <= 2).map(lower);

  const parts = [];
  if (isCurrent) parts.push(t("whyBaseline"));
  if (strong.length) parts.push(t("whyStrong", { list: joinList(strong) }));
  if (weak.length) parts.push(t("whyWeak", { list: joinList(weak) }));
  if (!strong.length && !weak.length) parts.push(t("whyMiddle"));
  (rot.notes || []).forEach((note) => parts.push(t(note.key, note.vars)));
  return parts.join(" ");
}

/* ---------- Rendering ---------- */
function conditionsHTML(c) {
  const src = (name) => (c.demo ? t("demoPill") : name);
  const soilSource = c.soilEstimated ? t("soilEstimateSrc") : t("condSoilSrc");
  const tiles = [
    { k: t("condTemp"), v: `${num(c.tempC, 1)} °C`, src: src("NASA POWER"), d: t("condTempDesc") },
    { k: t("condRain"), v: `${num(c.rainMm, 0)} mm`, src: src("NASA POWER"), d: t("condRainDesc") },
    {
      k: t("condSoil"),
      v: Number.isFinite(c.soilWetness) ? `${num(c.soilWetness * 100, 0)}%` : null,
      src: src(soilSource),
      d: c.soilEstimated ? t("soilEstimateDesc") : t("condSoilDesc"),
    },
    {
      k: t("condNdvi"),
      v: Number.isFinite(c.ndvi) ? num(c.ndvi, 2) : null,
      src: src(t("ndviEstimateSrc")),
      d: Number.isFinite(c.ndvi) ? t("ndviEstimateDesc") : t("ndviEstimateUnavailable"),
    },
  ];
  return tiles.map((tile) => `
    <div class="cond">
      <div class="k">${esc(tile.k)}</div>
      ${tile.v === null
        ? `<div class="v none">${esc(t("noData"))}</div>`
        : `<div class="v">${esc(tile.v)}</div>`}
      <div class="src">${esc(tile.src)}</div>
      <p class="d">${esc(tile.d)}</p>
    </div>`).join("");
}

function barsHTML(value) {
  const n = Math.round(value); // ratings are fractional after the climate adjustment
  let segments = "";
  for (let i = 1; i <= 5; i += 1) segments += `<i${i <= n ? ' class="on"' : ""}></i>`;
  return `<span class="bars" role="img" aria-label="${esc(t("rateAria", { n }))}">${segments}</span>`;
}

function columnHTML(item, index, w, isBest) {
  const { rot, score, isCurrent } = item;
  const tag = isCurrent ? t("tagCurrent") : t("tagSuggestion", { n: index });
  const bestTag = isBest && !isCurrent ? `<span class="tag best">${esc(t("tagBest"))}</span>` : "";
  const pin = Math.min(98, Math.max(2, score));
  const list = (arr) => arr.map((text) => `<li>${esc(text)}</li>`).join("");
  const ratings = CRITERIA.map(
    (c) => `<li><span>${esc(pick(c.label))}</span>${barsHTML(rot.scores[c.key])}</li>`
  ).join("");

  return `
  <article class="col ${isCurrent ? "is-current" : ""}">
    <div class="cell head">
      <div class="tags"><span class="tag">${esc(tag)}</span>${bestTag}</div>
      <h3>${esc(pick(rot.name))}</h3>
      <p>${esc(pick(rot.summary))}</p>
    </div>
    <div class="cell meter" role="img" aria-label="${esc(t("fitAria", { score }))}">
      <div class="meter-top"><strong>${score}</strong><span>${esc(t("outOf100"))}</span></div>
      <div class="track" aria-hidden="true"><i style="left:${pin}%"></i></div>
      <div class="scale" aria-hidden="true"><span>${esc(t("poorFit"))}</span><span>${esc(t("strongFit"))}</span></div>
    </div>
    <div class="cell"><h4>${esc(t("why"))}</h4><p>${esc(whyText(rot, w, isCurrent))}</p></div>
    <div class="cell"><h4>${esc(t("rates"))}</h4><ul class="rates">${ratings}</ul></div>
    <div class="cell"><h4>${esc(t("benefits"))}</h4><ul>${list(pick(rot.benefits))}</ul></div>
    <div class="cell"><h4>${esc(t("nasaData"))}</h4><ul class="chips">${list(pick(rot.data))}</ul></div>
    <div class="cell"><h4>${esc(t("gaps"))}</h4><ul>${list(pick(rot.gaps))}</ul></div>
    <div class="cell risk"><h4>${esc(t("risks"))}</h4><ul>${list(pick(rot.risks))}</ul></div>
  </article>`;
}

function ringSVG(score, cssClass) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return `
    <div class="ring-wrap" role="img" aria-label="${esc(t("fitAria", { score }))}">
      <svg viewBox="0 0 90 90" aria-hidden="true">
        <circle class="ring-bg" cx="45" cy="45" r="${radius}"/>
        <circle class="ring-fg ${cssClass}" cx="45" cy="45" r="${radius}"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="ring-number">${score}</div>
    </div>`;
}

function riskStripHTML(risks) {
  if (!risks) return `<p class="risk-note">${esc(t("riskUnavailable"))}</p>`;
  const cells = risks.months.map((month, index) => {
    const monthLabel = MONTH_LABELS[prefs.lang][index] || month.label;
    const flags = [
      month.dry ? `<span class="flag flag-dry">${esc(t("dryFlag"))}</span>` : "",
      month.cold ? `<span class="flag flag-cold">${esc(t("coldFlag"))}</span>` : "",
      month.hot ? `<span class="flag flag-hot">${esc(t("hotFlag"))}</span>` : "",
    ].join("");
    return `<li class="risk-cell"><span class="risk-month">${esc(monthLabel)}</span><span class="risk-flags">${flags || `<span class="flag-ok">${esc(t("okayFlag"))}</span>`}</span></li>`;
  }).join("");
  return `
    <ul class="risk-strip">${cells}</ul>
    <p class="risk-note">${esc(t("riskNote", {
      dry: RISK.dryMmPerMonth,
      cold: RISK.coldMinC,
      hot: RISK.hotMaxC,
      dryMonths: risks.dryMonths,
      coldMonths: risks.coldMonths,
      hotMonths: risks.hotMonths,
    }))}</p>`;
}

function destroyCharts() {
  state.charts.forEach((chart) => {
    try { chart.destroy(); } catch (error) { console.warn("Could not destroy a previous chart", error); }
  });
  state.charts = [];
}

function renderResults(cond, items, w) {
  destroyCharts();
  const best = items.reduce((a, b) => (b.score > a.score ? b : a));
  const headline = best.isCurrent ? t("bestCurrent") : t("bestOther", { name: pick(best.rot.name) });
  const pill = cond.demo
    ? `<span class="pill">${esc(t("demoPill"))}</span>`
    : `<span class="pill live">${esc(t("livePill"))}</span>`;
  const lat = state.latlng ? state.latlng.lat.toFixed(4) : t("noData");
  const lng = state.latlng ? state.latlng.lng.toFixed(4) : t("noData");
  const waterLabels = { low: t("waterLow"), medium: t("waterMedium"), high: t("waterHigh") };

  $("results").innerHTML = `
    <h2 class="headline">${esc(headline)}</h2>
    <p class="notice">${esc(t("notice"))}</p>

    <div class="dash-grid">
      <section class="dash-card">
        <h3>${esc(t("fieldDetails"))}</h3>
        <div class="detail-row"><span class="detail-label">${esc(t("latitude"))}</span><span class="detail-value">${esc(lat)}</span></div>
        <div class="detail-row"><span class="detail-label">${esc(t("longitude"))}</span><span class="detail-value">${esc(lng)}</span></div>
        <div class="detail-row"><span class="detail-label">${esc(t("currentLabel"))}</span><span class="detail-value">${esc(pick(items[0].rot.name))}</span></div>
        <div class="detail-row"><span class="detail-label">${esc(t("waterAvailable"))}</span><span class="detail-value">${esc(waterLabels[$("water").value] || t("noData"))}</span></div>
        <div class="detail-row"><span class="detail-label">${esc(t("bestFitLabel"))}</span><span class="detail-value best-value">${esc(pick(best.rot.name))}</span></div>
      </section>
      <section class="dash-card">
        <h3>${esc(t("fitScoreTitle"))}</h3>
        <div class="rings-row">
          ${items.map((item, index) => `
            <div class="ring-item">
              ${ringSVG(item.score, index === 0 ? "current" : index === 1 ? "alt1" : "alt2")}
              <span class="ring-label">${esc(item.isCurrent ? t("currentShort") : pick(item.rot.name).split("→").pop().trim())}</span>
            </div>`).join("")}
        </div>
      </section>
    </div>

    <h3 class="section-title">${esc(t("conditionsTitle"))} ${pill}</h3>
    <div class="strip">${conditionsHTML(cond)}</div>

    <div class="charts-row">
      <section class="chart-card">
        <h3>${esc(t("criteriaChart"))}</h3>
        <div class="chart-container"><canvas id="radarChart" role="img" aria-label="${esc(t("criteriaChart"))}"></canvas></div>
      </section>
      <section class="chart-card">
        <h3>${esc(t("scoreChart"))}</h3>
        <div class="chart-container"><canvas id="barChart" role="img" aria-label="${esc(t("scoreChart"))}"></canvas></div>
      </section>
    </div>

    <section class="chart-card wide">
      <h3>${esc(t("climateChart"))}</h3>
      ${cond.monthly ? `<div class="chart-container tall"><canvas id="climateChart" role="img" aria-label="${esc(t("climateChart"))}"></canvas></div>` : `<p class="chart-unavailable">${esc(t("riskUnavailable"))}</p>`}
      ${riskStripHTML(cond.risks)}
    </section>

    <h3 class="section-title">${esc(t("comparisonTitle"))}</h3>
    <div class="compare">${items.map((item, index) => columnHTML(item, index, w, item === best)).join("")}</div>`;

  buildCharts(items, cond);
}

/* Radar point labels wrap onto two lines, so long Spanish labels are not clipped. */
function wrapLabel(text, maxChars = 12) {
  const lines = [];
  let line = "";
  text.split(" ").forEach((word) => {
    if (line && (line + " " + word).length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + " " + word : word;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function buildCharts(items, cond) {
  if (typeof Chart === "undefined") {
    document.querySelectorAll(".chart-card").forEach((card) => {
      if (!card.querySelector(".chart-unavailable")) {
        const note = document.createElement("p");
        note.className = "chart-unavailable";
        note.textContent = t("chartUnavailable");
        card.appendChild(note);
      }
    });
    return;
  }

  const rootStyle = getComputedStyle(document.documentElement);
  const token = (name, fallback) => rootStyle.getPropertyValue(name).trim() || fallback;
  const ink = token("--ink", "#17213b");
  const muted = token("--muted", "#68738b");
  const line = token("--line", "#d7deeb");
  const panel = token("--panel", "#ffffff");
  const colors = ["#b47b45", "#3d9b69", "#4c83c4"];
  const fills = ["rgba(180,123,69,0.16)", "rgba(61,155,105,0.16)", "rgba(76,131,196,0.16)"];
  const fontFamily = getComputedStyle(document.body).fontFamily || "sans-serif";
  const commonLegend = { color: ink, font: { size: 12, family: fontFamily }, usePointStyle: true };
  const commonTooltip = {
    backgroundColor: panel,
    titleColor: ink,
    bodyColor: ink,
    borderColor: line,
    borderWidth: 1,
    padding: 10,
  };

  const radarCanvas = $("radarChart");
  if (radarCanvas) {
    state.charts.push(new Chart(radarCanvas, {
      type: "radar",
      data: {
        labels: CRITERIA.map((criterion) => wrapLabel(pick(criterion.label))),
        datasets: items.map((item, index) => ({
          label: item.isCurrent ? `${t("currentShort")}: ${pick(item.rot.name)}` : pick(item.rot.name),
          data: CRITERIA.map((criterion) => Number(item.rot.scores[criterion.key].toFixed(1))),
          borderColor: colors[index],
          backgroundColor: fills[index],
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: colors[index],
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 8 },
        plugins: { legend: { position: "bottom", labels: commonLegend }, tooltip: commonTooltip },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 5,
            ticks: { stepSize: 1, color: muted, backdropColor: panel, font: { size: 10 } },
            pointLabels: { color: ink, font: { size: 12, family: fontFamily, weight: "600" } },
            grid: { color: line },
            angleLines: { color: line },
          },
        },
      },
    }));
  }

  const barCanvas = $("barChart");
  if (barCanvas) {
    state.charts.push(new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: items.map((item) => item.isCurrent ? t("currentShort") : pick(item.rot.name).split("→").pop().trim()),
        datasets: [{
          label: t("outOf100"),
          data: items.map((item) => item.score),
          backgroundColor: colors,
          borderRadius: 6,
          maxBarThickness: 76,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { ...commonTooltip, callbacks: { label: (context) => ` ${context.parsed.y} / 100` } },
        },
        scales: {
          y: { min: 0, max: 100, ticks: { stepSize: 20, color: muted }, grid: { color: line } },
          x: { grid: { display: false }, ticks: { color: ink, font: { family: fontFamily, weight: "600" } } },
        },
      },
    }));
  }

  const climateCanvas = $("climateChart");
  if (climateCanvas && cond?.monthly) {
    const monthly = cond.monthly;
    const round1 = (value) => Math.round(value * 10) / 10;
    const temperatureLine = (label, data, color, order) => ({
      type: "line",
      label,
      data: data.map(round1),
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.3,
      yAxisID: "yTemp",
      order,
    });

    state.charts.push(new Chart(climateCanvas, {
      type: "bar",
      data: {
        labels: MONTH_LABELS[prefs.lang],
        datasets: [
          { type: "bar", label: t("chartRain"), data: monthly.rainMm.map((value) => Math.round(value)), backgroundColor: "rgba(76,131,196,0.42)", borderRadius: 4, yAxisID: "yRain", order: 4 },
          temperatureLine(t("chartMaxTemp"), monthly.tempMaxC, "#c76558", 1),
          temperatureLine(t("chartAvgTemp"), monthly.tempC, "#c99b39", 2),
          temperatureLine(t("chartMinTemp"), monthly.tempMinC, "#4c83c4", 3),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { position: "bottom", labels: commonLegend }, tooltip: commonTooltip },
        scales: {
          x: { grid: { display: false }, ticks: { color: ink } },
          yRain: { type: "linear", position: "left", beginAtZero: true, title: { display: true, text: t("chartRain"), color: muted }, ticks: { color: muted }, grid: { color: line } },
          yTemp: { type: "linear", position: "right", title: { display: true, text: t("chartTemp"), color: muted }, ticks: { color: muted }, grid: { drawOnChartArea: false } },
        },
      },
    }));
  }
}

/* ---------- Compare ---------- */
async function onCompare() {
  setError(null);

  if (!state.latlng) {
    setError("errNoField");
    $("map").scrollIntoView({ behavior: scrollBehavior(), block: "center" });
    return;
  }

  const button = $("compare");
  state.busy = true;
  button.disabled = true;
  button.textContent = t("comparing");

  try {
    const cond = await getConditions(state.latlng.lat, state.latlng.lng);
    const w = getWeights();

    const applyLocalRisks = (rotation) => {
      const adjusted = adjustFor(rotation, cond.risks);
      return { ...rotation, scores: adjusted.scores, notes: adjusted.notes };
    };
    const current = applyLocalRisks(ROTATIONS.find((rotation) => rotation.id === $("current").value));
    const others = ROTATIONS.filter((rotation) => rotation.id !== current.id)
      .map(applyLocalRisks)
      .map((rotation) => ({ rot: rotation, score: scoreOf(rotation, w), isCurrent: false }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
    const items = [{ rot: current, score: scoreOf(current, w), isCurrent: true }, ...others];

    state.last = { cond, items, w };
    renderResults(cond, items, w);
    $("results").focus({ preventScroll: true });
    $("results").scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  } catch (err) {
    console.error(err);
    setError("errCompare");
  } finally {
    state.busy = false;
    button.disabled = false;
    button.textContent = t("compare");
  }
}

/* ---------- Start ---------- */
/* DOMContentLoaded fires after the page is parsed and after deferred scripts
   (Leaflet) have run, so both the elements and L exist by then. */
document.addEventListener("DOMContentLoaded", () => {
  initPreferences();
  applyTheme();
  mapApi = initMap();
  applyLanguage();
  $("compare").addEventListener("click", onCompare);
});