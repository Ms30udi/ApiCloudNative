const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  spotifyId: { type: String, required: true },
  image: { type: String },
  previewUrl: { type: String }
});

const playlistSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String,
    default: ''
  },
  songs: [songSchema]
}, { timestamps: true });

// Index pour améliorer les performances des recherches
playlistSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Playlist', playlistSchema);