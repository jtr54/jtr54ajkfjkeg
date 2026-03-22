const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400 }); // 24h cache pour les géocodages

// GET /api/geocode/search?q=...
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 3) {
      return res.status(400).json({ error: 'Requête trop courte (minimum 3 caractères)' });
    }

    const cacheKey = `geocode:${q.toLowerCase()}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const response = await axios.get('https://api-adresse.data.gouv.fr/search/', {
      params: { q: q.trim(), limit: Math.min(parseInt(limit) || 5, 10) },
      timeout: 5000,
    });

    const result = response.data;
    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Erreur géocodage:', error.message);
    res.status(502).json({ error: 'Service de géocodage indisponible' });
  }
});

// GET /api/geocode/reverse?lat=...&lon=...
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Les paramètres lat et lon sont requis' });
    }

    const response = await axios.get('https://api-adresse.data.gouv.fr/reverse/', {
      params: { lat, lon },
      timeout: 5000,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Erreur géocodage inverse:', error.message);
    res.status(502).json({ error: 'Service de géocodage indisponible' });
  }
});

module.exports = router;
