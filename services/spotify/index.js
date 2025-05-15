const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configuration Spotify
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
let spotifyToken = null;

// Fonction pour obtenir un token Spotify
async function getSpotifyToken() {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      spotifyToken = response.data.access_token;
      console.log('Spotify Token:', spotifyToken);  // Ajoutez cette ligne pour voir le token généré
      return spotifyToken;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token Spotify:', error);
      throw error;
    }
  }
  

// Middleware pour vérifier/renouveler le token Spotify
async function checkSpotifyToken(req, res, next) {
  if (!spotifyToken) {
    try {
      await getSpotifyToken();
    } catch (error) {
      return res.status(500).json({ error: 'Erreur de connexion à Spotify' });
    }
  }
  next();
}

// Recherche de morceaux
router.get('/search', checkSpotifyToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Le paramètre de recherche est requis' });
    }

    const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
      headers: {
        'Authorization': `Bearer ${spotifyToken}`
      },
      params: {
        q,
        type: 'track',
        limit: 10
      }
    });

    const tracks = response.data.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      image: track.album.images[0]?.url,
      preview: track.preview_url
    }));

    res.json(tracks);
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expiré, on le renouvelle
      spotifyToken = null;
      try {
        await getSpotifyToken();
        // On réessaie la requête
        return router.handle(req, res);
      } catch (tokenError) {
        return res.status(500).json({ error: 'Erreur de connexion à Spotify' });
      }
    }
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

module.exports = router;