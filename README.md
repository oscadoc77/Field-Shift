# Field Shift: crop-rotation explorer

**NASA Space Apps Challenge 2026, Guadalajara. Challenge: "Field Shift: Adapting Farms with NASA Data".**
Team: Picateclas Systems (Los Picateclas), software students at Universidad de Guadalajara.

**Live demo:** TODO add the public link (GitHub Pages) here.

Field Shift helps a farmer compare their current crop rotation with two alternatives for a specific field, using NASA climate data for that location. It is a decision-support tool: it shows reasons, evidence, information gaps and risks, and it asks the farmer to check every option locally before changing anything.

## How to use it

1. Click the map to place a marker on your field (or use "Use my location").
2. Choose what you grow today and how much each goal matters (save water, improve soil, extra income, weather resilience), plus how much water is available.
3. Select **Compare rotations**. You see your current rotation next to the two best-fitting alternatives, each with:
   - a fit score and why it was suggested,
   - ratings for the four goals,
   - benefits, NASA data that would back it up, information gaps and risks to review locally.

The page works in English and Spanish and has a light and a dark theme.

To run it locally, put `index.html`, `app.js` and `styles.css` in one folder and open `index.html`. An internet connection is needed (NASA data, map tiles, Leaflet, Chart.js).

## NASA data used

| Data | Used for | How it is used |
| --- | --- | --- |
| **NASA POWER** climatology (agroclimatology community): `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `GWETROOT` | Temperature, rainfall, monthly risk calendar, root-zone soil wetness | Requested live for the clicked point. Drives the charts, the risky-month calendar and the ratings of each rotation. |
| **NASA GIBS** layer *MODIS Terra NDVI 8-day* (`MODIS_Terra_NDVI_8Day`) | Vegetation greenness map overlay | Visual context only. Does not change any score. |
| **NASA GIBS** layer *SMAP L4 Analyzed Root Zone Soil Moisture* (`SMAP_L4_Analyzed_Root_Zone_Soil_Moisture`) | Soil moisture map overlay | Visual context only. Does not change any score. |
| **NASA GIBS** layer *GPM IMERG Precipitation Rate* (`IMERG_Precipitation_Rate`) | Rainfall map overlay | Visual context only. Does not change any score. |

The overlays show imagery from 2026-09-15. Layer ids, zoom limits and valid dates were read from the GIBS capabilities file.

Other software and data: OpenStreetMap tiles for the base map (not NASA), Leaflet and Chart.js (open-source libraries).

The cards under "NASA data that would back this up" in each comparison list datasets (for example SRTM, ECOSTRESS, Landsat) that would strengthen that option. They are **not** loaded by this prototype.

## How the result is calculated

1. **Monthly climate.** From NASA POWER we read 12 monthly values: rain (mm/day converted to mm per month), average, maximum and minimum temperature.
2. **Risky months.** A month is flagged *dry* below 40 mm of rain, *cold* when the average night minimum is below 5 °C (frost possible), and *hot* when the average daytime maximum is above 33 °C. These thresholds are screening rules of thumb written by the team, not agronomic standards, and are easy to change (`RISK` in `app.js`).
3. **Stress indexes (0 to 1).** Water stress combines the number of dry months and annual rainfall. Frost and heat stress come from the number of cold and hot months.
4. **Ratings adjusted to the field.** Each rotation has base ratings (1 to 5) for water, soil, income and resilience, plus how sensitive it is to water shortage, heat and frost. The field's stress indexes shift the water and resilience ratings by up to about one point, and the tool explains the shift in plain language ("Needs more water than this field's 7 dry months may provide").
5. **Fit score (0 to 100).** `100 × Σ(rating × weight) / (5 × Σ weight)`, where the weights are the farmer's sliders (0 to 5). The water slider counts 1.5× when water is limited and 0.8× when it is plentiful.

## Limitations (please read)

- **Crop ratings are illustrative.** They were drafted by the team with AI assistance and have **not** been reviewed by an agronomist. The interface says so. They should be replaced with locally validated values before real use.
- **Climate, not forecasts.** NASA POWER gives long-term averages on a coarse grid (roughly 50 km). It describes the region, not one field, and says nothing about this season's weather.
- **Soil wetness** comes from a model (MERRA-2 through NASA POWER), not from a satellite measurement. If POWER does not return it, the tool shows a clearly labelled climate-based estimate instead.
- **Vegetation greenness (NDVI) in the "Conditions" card is a rough estimate** derived from rainfall and temperature. It is not a satellite NDVI measurement. The real NDVI is the map overlay.
- **If NASA POWER cannot be reached,** the tool shows clearly labelled demo values instead of failing silently.
- **Not included yet:** soil type, slope, local prices and markets, irrigation infrastructure, disease pressure, farmer experience.

## Supports the farmer, does not replace them

Every result carries a notice that the tool supports the decision and does not replace the farmer's judgment or local agricultural advice. Each option lists its information gaps and the risks to review locally, so the farmer knows what to check with neighbours, extension services or an agronomist.

## Roadmap

- Agronomist review of every rating, with cited sources (for example FAO GAEZ suitability data).
- Terrain: SRTM elevation and slope to flag erosion risk.
- Field-level stress: ECOSTRESS evapotranspiration and land-surface temperature; Landsat and Sentinel-2 vegetation indexes.
- Rainfall reliability and extreme storms from GPM IMERG time series.
- Local soil and market data (for example SSURGO and USDA market news for US fields).

## Quality checks

The interface was exercised in a real browser with simulated NASA responses: both languages and themes, switching them with results open, POWER returning errors or missing values, missing map or chart libraries, three screen widths, and checks that map overlays only request zoom levels and dates that exist. Calls to the live NASA services were verified by hand in a browser.

## AI use disclosure

- **Where AI was used:** Claude (Anthropic) helped draft and review the front-end code, wrote automated browser tests, helped polish the English text of the team introduction, and helped draft the illustrative crop ratings and interface text. The team also used Antigravity. TODO: add in a few words what it was used for (for example, writing or editing code in the IDE).
- **What the team did:** TODO describe in your own words who decided the design, ran and tested the app, and reviewed the AI output.
- **AI in the product:** none. The deployed app does not call any AI model. Recommendations come from the rule-based scoring above, applied to NASA POWER data and hand-written ratings.
- **Review status:** AI-drafted agronomic content has not been reviewed by an agronomist (see Limitations).