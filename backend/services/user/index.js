const express = require('express');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/user');
const Token = require('./models/token');

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des données d'entrée
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Créer un nouvel utilisateur
    const user = new User({ email, password });
    await user.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Données d\'inscription invalides' });
    }
    res.status(500).json({ error: 'Erreur lors de l\'inscription. Veuillez réessayer.' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer un token
    const tokenString = uuidv4();
    const token = new Token({
      userId: user._id,
      token: tokenString
    });
    await token.save();

    res.json({ token: tokenString });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Déconnexion
router.post('/logout', async (req, res) => {
  try {
    const tokenString = req.headers.authorization?.split(' ')[1];
    if (!tokenString) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const result = await Token.deleteOne({ token: tokenString });
    if (result.deletedCount === 0) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
});

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization?.split(' ')[1];
    if (!tokenString) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const tokenData = await Token.findOne({ token: tokenString });
    if (!tokenData) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    req.userId = tokenData.userId;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

module.exports = { router, authenticateToken };