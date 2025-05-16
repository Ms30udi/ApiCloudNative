const express = require('express');
const Playlist = require('./models/playlist');

const router = express.Router();

// Créer une playlist
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    // Vérifier si une playlist avec le même nom existe déjà pour cet utilisateur
    const existingPlaylist = await Playlist.findOne({ userId, name });
    if (existingPlaylist) {
      return res.status(400).json({ error: 'Une playlist avec ce nom existe déjà' });
    }

    const playlist = new Playlist({
      userId,
      name,
      description,
      songs: []
    });

    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la playlist' });
  }
});

// Récupérer toutes les playlists d'un utilisateur
router.get('/', async (req, res) => {
  try {
    const userPlaylists = await Playlist.find({ userId: req.userId });
    res.json(userPlaylists);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des playlists' });
  }
});

// Mettre à jour une playlist
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.userId;

    // Vérifier si le nouveau nom n'est pas déjà utilisé
    const existingPlaylist = await Playlist.findOne({
      userId,
      name,
      _id: { $ne: id }
    });
    if (existingPlaylist) {
      return res.status(400).json({ error: 'Une playlist avec ce nom existe déjà' });
    }

    const playlist = await Playlist.findOneAndUpdate(
      { _id: id, userId },
      { name, description },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la playlist' });
  }
});

// Supprimer une playlist
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await Playlist.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la playlist' });
  }
});

// Ajouter un morceau à une playlist
router.post('/:id/songs', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, spotifyId, image, previewUrl } = req.body;
    const userId = req.userId;

    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    // Vérifier si le morceau existe déjà dans la playlist
    if (playlist.songs.some(s => s.spotifyId === spotifyId)) {
      return res.status(400).json({ error: 'Ce morceau est déjà dans la playlist' });
    }

    playlist.songs.push({ title, artist, spotifyId, image, previewUrl });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout du morceau' });
  }
});

// Supprimer un morceau d'une playlist
router.delete('/:id/songs/:songId', async (req, res) => {
  try {
    const { id, songId } = req.params;
    const userId = req.userId;

    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    const songIndex = playlist.songs.findIndex(s => s.spotifyId === songId);
    if (songIndex === -1) {
      return res.status(404).json({ error: 'Morceau non trouvé' });
    }

    playlist.songs.splice(songIndex, 1);
    await playlist.save();
    res.status(204).send();
}

catch (error) {
  res.status(500).json({ error: 'Erreur lors de la suppression du morceau' });
}});

module.exports = router;