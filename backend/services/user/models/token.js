const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  token: { 
    type: String, 
    required: true,
    unique: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 24 * 60 * 60 // Le token expire après 24 heures
  }
});

module.exports = mongoose.model('Token', tokenSchema);