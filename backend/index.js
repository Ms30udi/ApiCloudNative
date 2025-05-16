require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { router: userRouter, authenticateToken } = require('./services/user');
const playlistRouter = require('./services/playlist');
const spotifyRouter = require('./services/spotify');

// Connexion à la base de données
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRouter);
app.use('/api/playlists', authenticateToken, playlistRouter);
app.use('/api/spotify', authenticateToken, spotifyRouter);

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur est survenue' });
});

// Configuration des ports
const BASE_PORT = process.env.PORT || 3000;
const MAX_PORT = 3100; // Augmentation de la plage de ports disponibles

const net = require('net');

const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        server.close();
        resolve(true);
      })
      .listen(port);
  });
};

const findAvailablePort = async (startPort, endPort) => {
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null;
};

const startServer = async (port) => {
  try {
    const availablePort = await findAvailablePort(port, MAX_PORT);
    if (!availablePort) {
      console.error(`Erreur: Impossible de trouver un port disponible entre ${port} et ${MAX_PORT}`);
      process.exit(1);
    }

    app.listen(availablePort, () => {
      console.log(`Serveur démarré sur le port ${availablePort}`);
    });
  } catch (err) {
    console.error('Erreur lors du démarrage du serveur:', err);
    process.exit(1);
  }
};

startServer(BASE_PORT);