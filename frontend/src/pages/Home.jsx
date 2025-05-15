import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaPlay, FaPause, FaPlus } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [audio, setAudio] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    if (searchQuery) {
      searchTracks();
    } else {
      fetchPopularTracks();
    }
  }, [searchQuery]);

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

  // Gestion du bouton + pour ajouter à une playlist
  const handleAddToPlaylist = async (track) => {
    try {
      console.log('Adding track to playlist:', track);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Requête pour récupérer les playlists de l'utilisateur
      const response = await fetch('http://localhost:3000/api/playlists', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseData = await response.json();
      console.log('Playlists Data:', responseData); // Affichage des playlists

      if (response.ok && Array.isArray(responseData) && responseData.length > 0) {
        setPlaylists(responseData); // Mise à jour des playlists
        setSelectedTrack(track); // Définir la chanson sélectionnée
        setShowPlaylistModal(true); // Afficher la modale
        setError('');
      } else {
        setError('Aucune playlist disponible. Veuillez en créer une d\'abord.');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de la récupération des playlists');
    }
  };

  // Ajouter la chanson à la playlist choisie
  const handleAddSongToPlaylist = async (playlistId) => {
    try {
      setLoadingMessage('Ajout du morceau...');
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedTrack.title,
          artist: selectedTrack.artist,
          spotifyId: selectedTrack.id,
          image: selectedTrack.image,
          previewUrl: selectedTrack.preview,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Morceau ajouté avec succès à la playlist');
        setTimeout(() => {
          setSuccessMessage('');
          setShowPlaylistModal(false); // Fermer la modale après l'ajout
        }, 2000); // Message de succès visible pendant 2 secondes
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du morceau');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Erreur lors de l\'ajout du morceau');
    } finally {
      setLoadingMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 md:mb-0">
            {searchQuery ? 'Résultats de recherche' : 'Morceaux Populaires'}
          </h1>
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Rechercher des morceaux..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <div key={track.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {track.image && (
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{track.title}</h3>
                  <p className="text-gray-600 mb-4">{track.artist}</p>
                  <div className="flex justify-between items-center">
                    {track.preview && (
                      <button
                        onClick={() => {
                          if (playingTrackId === track.id) {
                            audio.pause();
                            setPlayingTrackId(null);
                            setAudio(null);
                          } else {
                            if (audio) {
                              audio.pause();
                            }
                            const newAudio = new Audio(track.preview);
                            newAudio.play();
                            setPlayingTrackId(track.id);
                            setAudio(newAudio);
                            newAudio.addEventListener('ended', () => {
                              setPlayingTrackId(null);
                              setAudio(null);
                            });
                          }
                        }}
                        className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                      >
                        {playingTrackId === track.id ? <FaPause /> : <FaPlay />}
                      </button>
                    )}
                    {localStorage.getItem('token') && (
                      <button
                        onClick={() => handleAddToPlaylist(track)} // Handle adding to playlist
                        className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
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

        {/* Modal for adding song to playlist */}
        {showPlaylistModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Ajouter à une playlist</h2>
              {playlists.length > 0 ? (
                <div className="space-y-2">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist._id}
                      onClick={() => handleAddSongToPlaylist(playlist._id)} // Handle adding song to the playlist
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      {playlist.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Aucune playlist disponible</p>
              )}
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
