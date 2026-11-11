# Field Shift 🌾🛰️
**Crop-Rotation Decision-Support Explorer Powered by NASA Earth Data**

![Field Shift Banner](https://img.shields.io/badge/NASA%20Earth%20Data-Integrated-blue)
![Platform](https://img.shields.io/badge/Platform-Web%20(Vanilla%20JS%20%7C%20Leaflet)-green)
![Status](https://img.shields.io/badge/Status-Prototype-orange)

## 📌 Background & Challenge Overview
Farmers face increasingly complex decisions as temperatures shift, rainfall patterns become volatile, and soil health degrades across diverse agricultural regions. Selecting new crops to introduce into a rotation cycle is critical yet challenging: an ill-chosen crop might deplete scarce water reserves, harbor pest cycles, or fail under erratic seasonal transitions.

**Field Shift** combines NASA Earth observations with farmer-driven priorities to help producers explore resilient, soil-improving crop rotation strategies without substituting local agronomic expertise.

---

## 🚀 Key Features

- **Field Geolocation & Interactive Map**: Locate fields anywhere globally using Leaflet.js with interactive NASA GIBS layers (MODIS NDVI for vegetation health and SMAP for soil moisture).
- **Farmer-Centered Priority Weighting**: Interactive sliders allow farmers to prioritize:
  - 💧 **Water Conservation** (scaled according to irrigation limits)
  - 🌱 **Soil Health** (organic matter accumulation, nitrogen fixation, erosion control)
  - 💰 **Supplemental Income & Forage Value** (crop commercialization and livestock feed)
  - 🛡️ **Weather Resilience** (tolerance to heat waves, dry spells, and frost risk)
- **Live NASA POWER Climatology Integration**: Real-time retrieval of multi-year temperature (`T2M`), precipitation (`PRECTOTCORR`), and relative humidity (`RH2M`) directly from the NASA POWER API.
- **Side-by-Side 3-Strategy Comparison**: Compares the farmer's current baseline rotation directly against the top two viable alternative strategies. Each strategy breaks down:
  1. **Why it was recommended** based on field-level weights.
  2. **Agronomic & satellite evidence** supporting the strategy (e.g., SMAP, ECOSTRESS, GPM, MODIS).
  3. **Concrete benefits** (pest disruption, nitrogen fixation, deep root moisture access).
  4. **Information gaps** requiring local inquiry.
  5. **Risks to review locally** with agronomists before transitioning.

---

## 🛰️ NASA Datasets & Technologies Used

| Dataset / Tool | Role in Field Shift |
| :--- | :--- |
| **NASA POWER** | Climatological temperature, precipitation, and frost indicators. |
| **NASA GIBS** | Real-time global satellite tile overlays (MODIS NDVI & SMAP Soil Moisture). |
| **SMAP** | Surface and root-zone soil moisture indicators. |
| **MODIS & Landsat** | Normalized Difference Vegetation Index (NDVI) & bare-field period detection. |
| **GPM** | Historical precipitation anomalies and extreme rainfall patterns. |
| **ECOSTRESS** | Evapotranspiration dynamics and crop heat stress indicators. |

---

## 🛠️ How to Run Locally

No build tools or server dependencies required:
1. Clone this repository:
   ```bash
   git clone https://github.com/oscadoc77/Field-Shift.git
   ```
2. Navigate into the folder:
   ```bash
   cd Field-Shift
   ```
3. Open `index.html` in any modern web browser.

---

## 🧑‍🌾 Ethical Disclaimer
*Field Shift is an assistive decision-support tool. It is designed to illuminate patterns and opportunities from satellite data, but does not replace local agronomic expertise, soil laboratory tests, or farmer judgment.*
