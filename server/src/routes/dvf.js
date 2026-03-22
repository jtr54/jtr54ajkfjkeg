const express = require('express');
const router = express.Router();
const { searchNearby, computeStats, estimateValue } = require('../services/dvfService');

// GET /api/dvf/transactions?lat=...&lon=...&radius=...&type_local=...
router.get('/transactions', async (req, res) => {
  try {
    const { lat, lon, radius = 1000, type_local, date_min, date_max, page = 1 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Les paramètres lat et lon sont requis' });
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ error: 'Coordonnées invalides' });
    }

    if (latNum < 41 || latNum > 51 || lonNum < -5 || lonNum > 10) {
      return res.status(400).json({ error: 'Coordonnées hors de France métropolitaine' });
    }

    const data = await searchNearby({
      lat: latNum,
      lon: lonNum,
      radius: Math.min(parseInt(radius) || 1000, 5000),
      type_local,
      date_min,
      date_max,
      page: parseInt(page) || 1,
    });

    res.json(data);
  } catch (error) {
    console.error('Erreur DVF transactions:', error.message);
    res.status(502).json({ error: 'Impossible de récupérer les données DVF' });
  }
});

// POST /api/dvf/estimate
router.post('/estimate', async (req, res) => {
  try {
    const { lat, lon, surface, type_local, radius = 2000 } = req.body;

    if (!lat || !lon || !surface || !type_local) {
      return res.status(400).json({
        error: 'Les champs lat, lon, surface et type_local sont requis',
      });
    }

    const surfaceNum = parseFloat(surface);
    if (isNaN(surfaceNum) || surfaceNum <= 0 || surfaceNum > 10000) {
      return res.status(400).json({ error: 'Surface invalide (entre 1 et 10000 m²)' });
    }

    // Récupérer les 2 dernières années de transactions
    const dateMin = new Date();
    dateMin.setFullYear(dateMin.getFullYear() - 2);
    const dateMinStr = dateMin.toISOString().split('T')[0];

    const data = await searchNearby({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      radius: Math.min(parseInt(radius) || 2000, 5000),
      type_local,
      date_min: dateMinStr,
    });

    const mutations = data.results || [];
    const stats = computeStats(mutations, type_local);
    const estimation = estimateValue({ surface: surfaceNum, type_local, mutations });

    res.json({
      estimation,
      stats,
      nb_transactions_zone: mutations.length,
      rayon_recherche: radius,
      periode: `${dateMinStr} à aujourd'hui`,
    });
  } catch (error) {
    console.error('Erreur estimation:', error.message);
    res.status(502).json({ error: 'Impossible de calculer l\'estimation' });
  }
});

// GET /api/dvf/stats?lat=...&lon=...&radius=...&type_local=...
router.get('/stats', async (req, res) => {
  try {
    const { lat, lon, radius = 2000, type_local } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Les paramètres lat et lon sont requis' });
    }

    const dateMin = new Date();
    dateMin.setFullYear(dateMin.getFullYear() - 2);
    const dateMinStr = dateMin.toISOString().split('T')[0];

    const data = await searchNearby({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      radius: Math.min(parseInt(radius) || 2000, 5000),
      type_local,
      date_min: dateMinStr,
    });

    const mutations = data.results || [];
    const stats = computeStats(mutations, type_local);

    res.json({
      stats,
      count: mutations.length,
      periode: `${dateMinStr} à aujourd'hui`,
    });
  } catch (error) {
    console.error('Erreur stats:', error.message);
    res.status(502).json({ error: 'Impossible de récupérer les statistiques' });
  }
});

module.exports = router;
