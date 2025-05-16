import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaPlay, FaPause, FaPlus } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [audio, setAudio] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('');

  useEffect(() => {
    if (searchQuery) {
      searchTracks();
    } else {
      fetchPopularTracks();
    }
  }, [searchQuery]);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/playlists', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la récupération des playlists');
    }
  };

  const searchTracks = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/spotify/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setTracks(data);
          setError('');
        } else {
          setError('Aucun morceau trouvé');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la recherche des morceaux');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la recherche des morceaux');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const fetchPopularTracks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/spotify/search?q=genre:pop', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setTracks(data);
          setError('');
        } else {
          setError('Aucun morceau trouvé');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la récupération des morceaux');
      }
    } catch (err) {
      console.error('Erreur:', err);
      if (err.message === 'Failed to fetch') {
        setError('Erreur de connexion au serveur');
      } else {
        setError('Erreur lors de la récupération des morceaux populaires');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <Navbar />
      <div className="content-container">
        <div className="header-container">
          <h1 className="page-title">{searchQuery ? 'Résultats de recherche' : 'Morceaux Populaires'}</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher des morceaux..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {showAlert && (
          <div className={`alert ${alertType === 'success' ? 'alert-success' : 'alert-error'}`}>
            {alertType === 'success' ? success : error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="tracks-grid">
            {tracks.map((track) => (
              <div key={track.id} className="track-card">
                {track.image && (
                  <img
                    src={track.image}
                    alt={track.title}
                    className="track-image"
                  />
                )}
                <div className="track-info">
                  <h3 className="track-title">{track.title}</h3>
                  <p className="track-artist">{track.artist}</p>
                  <div className="track-controls">
                    {track.preview_url ? (
                      <audio controls>
                        <source src={track.preview_url} type="audio/mpeg" />
                        Votre navigateur ne supporte pas l'élément audio.
                      </audio>
                    ) : (
                      <p>🎵 Aucun extrait audio disponible</p>
                    )}
                    {localStorage.getItem('token') && (
                      <button
                        onClick={() => {
                          setSelectedTrack(track);
                          fetchPlaylists();
                          setShowPlaylistModal(true);
                        }}
                        className="add-button"
                      >
                        <FaPlus />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPlaylistModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Choisir une playlist</h2>
            {playlists.length === 0 ? (
              <p className="text-gray-600 mb-4">Vous n'avez pas encore de playlist. Créez-en une d'abord.</p>
            ) : (
              <div className="playlist-list">
                {playlists.map((playlist) => (
                  <button
                    key={playlist._id}
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`http://localhost:3000/api/playlists/${playlist._id}/songs`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            title: selectedTrack.title,
                            artist: selectedTrack.artist,
                            spotifyId: selectedTrack.id,
                            image: selectedTrack.image,
                            previewUrl: selectedTrack.preview
                          }),
                        });

                        if (response.ok) {
                          setShowPlaylistModal(false);
                          setSuccess('Morceau ajouté avec succès à la playlist');
                          setAlertType('success');
                          setShowAlert(true);
                          setTimeout(() => setShowAlert(false), 3000);
                        } else {
                          const errorData = await response.json();
                          setError(errorData.error || 'Erreur lors de l\'ajout du morceau à la playlist');
                          setAlertType('error');
                          setShowAlert(true);
                          setTimeout(() => setShowAlert(false), 3000);
                        }
                      } catch (err) {
                        console.error('Erreur:', err);
                        setError('Erreur lors de l\'ajout du morceau à la playlist');
                      }
                    }}
                    className="playlist-button"
                  >
                    {playlist.name}
                  </button>
                ))}
              </div>
            )}
            <div className="modal-footer">
              <button
                onClick={() => navigate('/playlists')}
                className="modal-button create-playlist-button"
              >
                Créer une playlist
              </button>
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="modal-button close-button"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
