const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); // 1 heure de cache

const DVF_API_BASE = 'https://api.cquest.org/dvf';

/**
 * Recherche les transactions DVF proches d'un point géographique
 */
async function searchNearby({ lat, lon, radius = 1000, type_local, date_min, date_max, page = 1 }) {
  const cacheKey = `nearby:${lat}:${lon}:${radius}:${type_local || 'all'}:${date_min || ''}:${date_max || ''}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const params = { lat, lon, dist: Math.min(radius, 5000) };
  if (type_local) params.type_local = type_local;

  const response = await axios.get(DVF_API_BASE, { params, timeout: 15000 });
  const data = response.data;

  // L'API retourne du GeoJSON : features[].properties
  let mutations = (data.features || []).map(f => f.properties || f);

  // Filtrage par date côté serveur
  if (date_min) mutations = mutations.filter(m => m.date_mutation && m.date_mutation >= date_min);
  if (date_max) mutations = mutations.filter(m => m.date_mutation && m.date_mutation <= date_max);

  const result = { results: mutations, count: mutations.length };
  cache.set(cacheKey, result);
  return result;
}

/**
 * Calcule les statistiques de prix à partir des transactions
 */
function computeStats(mutations, typeLocal) {
  const filtered = mutations.filter(m => {
    if (!typeLocal) return true;
    return m.type_local === typeLocal;
  });

  const pricesPerM2 = [];
  const prices = [];

  for (const mutation of filtered) {
    const valeur = parseFloat(mutation.valeur_fonciere);
    const surface = parseFloat(mutation.surface_reelle_bati || mutation.surface_terrain);

    if (valeur > 0) {
      prices.push(valeur);
      if (surface > 0) {
        pricesPerM2.push(valeur / surface);
      }
    }
  }

  if (prices.length === 0) return null;

  prices.sort((a, b) => a - b);
  pricesPerM2.sort((a, b) => a - b);

  return {
    count: prices.length,
    prix_median: median(prices),
    prix_moyen: mean(prices),
    prix_min: prices[0],
    prix_max: prices[prices.length - 1],
    prix_m2_median: pricesPerM2.length > 0 ? Math.round(median(pricesPerM2)) : null,
    prix_m2_moyen: pricesPerM2.length > 0 ? Math.round(mean(pricesPerM2)) : null,
    prix_m2_min: pricesPerM2.length > 0 ? Math.round(pricesPerM2[0]) : null,
    prix_m2_max: pricesPerM2.length > 0 ? Math.round(pricesPerM2[pricesPerM2.length - 1]) : null,
  };
}

/**
 * Estime la valeur d'un bien basé sur les transactions comparables
 */
function estimateValue({ surface, type_local, mutations }) {
  if (!surface || surface <= 0) return null;

  const comparable = mutations.filter(m => {
    if (type_local && m.type_local !== type_local) return false;
    const s = parseFloat(m.surface_reelle_bati || m.surface_terrain);
    if (!s || s <= 0) return false;
    const v = parseFloat(m.valeur_fonciere);
    if (!v || v <= 0) return false;
    return s >= surface * 0.5 && s <= surface * 1.5;
  });

  if (comparable.length < 3) {
    const allSameType = mutations.filter(m => {
      if (type_local && m.type_local !== type_local) return false;
      const s = parseFloat(m.surface_reelle_bati || m.surface_terrain);
      const v = parseFloat(m.valeur_fonciere);
      return s > 0 && v > 0;
    });

    if (allSameType.length === 0) return null;

    const pricesPerM2 = allSameType
      .map(m => parseFloat(m.valeur_fonciere) / parseFloat(m.surface_reelle_bati || m.surface_terrain))
      .filter(p => p > 0 && p < 50000);

    if (pricesPerM2.length === 0) return null;

    const medianPricePerM2 = median(pricesPerM2);
    const estimated = Math.round(medianPricePerM2 * surface);

    return {
      valeur_estimee: estimated,
      valeur_min: Math.round(estimated * 0.85),
      valeur_max: Math.round(estimated * 1.15),
      prix_m2_utilise: Math.round(medianPricePerM2),
      nb_transactions: allSameType.length,
      fiabilite: allSameType.length < 5 ? 'faible' : allSameType.length < 15 ? 'moyenne' : 'bonne',
    };
  }

  const pricesPerM2 = comparable
    .map(m => parseFloat(m.valeur_fonciere) / parseFloat(m.surface_reelle_bati || m.surface_terrain))
    .filter(p => p > 0 && p < 50000);

  const medianPricePerM2 = median(pricesPerM2);
  const estimated = Math.round(medianPricePerM2 * surface);

  return {
    valeur_estimee: estimated,
    valeur_min: Math.round(estimated * 0.85),
    valeur_max: Math.round(estimated * 1.15),
    prix_m2_utilise: Math.round(medianPricePerM2),
    nb_transactions: comparable.length,
    fiabilite: comparable.length < 5 ? 'faible' : comparable.length < 15 ? 'moyenne' : 'bonne',
  };
}

function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function mean(arr) {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

module.exports = { searchNearby, computeStats, estimateValue };
