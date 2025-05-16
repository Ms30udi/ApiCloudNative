import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Playlists.css';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/playlists', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      } else {
        throw new Error('Erreur lors de la récupération des playlists');
      }
    } catch (err) {
      setError('Erreur lors de la récupération des playlists');
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newPlaylistName,
          description: newPlaylistDescription,
        }),
      });

      if (response.ok) {
        setNewPlaylistName('');
        setNewPlaylistDescription('');
        fetchPlaylists();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la création de la playlist');
      }
    } catch (err) {
      setError('Erreur lors de la création de la playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPlaylists();
      } else {
        throw new Error('Erreur lors de la suppression de la playlist');
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la playlist');
    }
  };

  const handleRemoveSong = async (playlistId, songId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/playlists/${playlistId}/songs/${songId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPlaylists();
      } else {
        throw new Error('Erreur lors de la suppression du morceau');
      }
    } catch (err) {
      setError('Erreur lors de la suppression du morceau');
    }
  };

  return (
    <div className="playlists-container">
      <Navbar />
      <div className="playlists-content">
        <div className="playlists-header">
          <h1 className="playlists-title">Mes Playlists</h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="create-playlist-form">
          <h2 className="form-title">Créer une nouvelle playlist</h2>
          <form onSubmit={handleCreatePlaylist}>
            <div className="form-group">
              <label htmlFor="playlistName" className="form-label">
                Nom de la playlist
              </label>
              <input
                id="playlistName"
                type="text"
                required
                className="form-input"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="playlistDescription" className="form-label">
                Description
              </label>
              <textarea
                id="playlistDescription"
                className="form-textarea"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="submit-button"
            >
              Créer la playlist
            </button>
          </form>
        </div>

        {playlists.length > 0 ? (
          <div className="playlists-grid">
            {playlists.map((playlist) => (
              <div key={playlist._id} className="playlist-card">
                <div className="playlist-card-content">
                  <h3 className="playlist-title">{playlist.name}</h3>
                  <p className="playlist-description">{playlist.description}</p>
                  <div className="songs-grid">
                    {playlist.songs.slice(0, 4).map((song) => (
                      <div key={song._id} className="song-item">
                        {song.image && (
                          <img src={song.image} alt={song.title} className="song-image" />
                        )}
                        <div className="song-info">
                          <p className="song-title">{song.title}</p>
                          <p className="song-artist">{song.artist}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveSong(playlist._id, song._id)}
                          className="remove-song-button"
                        >
                          Supprimer Morceau
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="playlist-actions">
                    <button
                      onClick={() => handleDeletePlaylist(playlist._id)}
                      className="delete-playlist-button"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Aucune playlist disponible.</p>
        )}
      </div>
    </div>
  );
};

export default Playlists;
