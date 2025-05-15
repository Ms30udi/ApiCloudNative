import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      setError('Identifiant de playlist invalide');
      setLoading(false);
      return;
    }
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (!id) {
        setError('Identifiant de playlist invalide');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/playlists/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Playlist non trouvée. Veuillez vérifier l\'identifiant de la playlist.');
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        } else if (response.status === 403) {
          throw new Error('Accès non autorisé à cette playlist');
        }
        const errorData = await response.json().catch(() => ({
          error: 'Erreur lors de la récupération de la playlist',
        }));
        throw new Error(errorData.error);
      }

      let data;
      try {
        data = await response.json();
        if (!data || typeof data !== 'object') {
          throw new Error('Format de réponse invalide');
        }
        if (!data.name || typeof data.name !== 'string') {
          throw new Error('Les données de la playlist sont invalides');
        }
        if (!Array.isArray(data.songs)) {
          data.songs = [];
        }
        data.songs = data.songs.map(song => ({
          ...song,
          title: song.title || 'Titre inconnu',
          artist: song.artist || 'Artiste inconnu'
        }));
      } catch (parseError) {
        console.error('Erreur lors du traitement des données:', parseError);
        throw new Error('Erreur lors du traitement des données de la playlist');
      }

      setPlaylist(data);
      setError('');
    } catch (err) {
      console.error('Erreur lors de la récupération de la playlist:', err);
      setError(err.message || 'Erreur lors de la récupération de la playlist');
      setPlaylist(null);
    } finally {
      setLoading(false);
    }
  };

  const searchSpotify = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/spotify/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tracks.items);
      } else {
        throw new Error('Erreur lors de la recherche sur Spotify');
      }
    } catch (err) {
      setError('Erreur lors de la recherche sur Spotify');
    } finally {
      setSearching(false);
    }
  };

  const addSongToPlaylist = async (track) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/playlists/${id}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: track.name,
          artist: track.artists[0].name,
          spotifyId: track.id,
          image: track.album.images[0]?.url,
          previewUrl: track.preview_url,
        }),
      });

      if (response.ok) {
        fetchPlaylist();
        setSearchResults([]);
        setSearchQuery('');
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de l\'ajout du morceau');
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout du morceau');
    }
  };

  const removeSongFromPlaylist = async (songId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/playlists/${id}/songs/${songId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPlaylist();
      } else {
        throw new Error('Erreur lors de la suppression du morceau');
      }
    } catch (err) {
      setError('Erreur lors de la suppression du morceau');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Playlist non trouvée
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
          <p className="text-gray-600">{playlist.description}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Ajouter des morceaux */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Ajouter des morceaux</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Rechercher un morceau..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={searchSpotify}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Rechercher
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              {searchResults.map((track) => (
                <div key={track.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-4">
                    {track.album.images[0] && (
                      <img
                        src={track.album.images[0].url}
                        alt={track.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{track.name}</h3>
                      <p className="text-gray-600">{track.artists[0].name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => addSongToPlaylist(track)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Ajouter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Morceaux de la playlist */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Morceaux de la playlist</h2>
          <div className="space-y-4">
            {playlist.songs.map((song) => (
              <div key={song._id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-4">
                  {song.image && (
                    <img
                      src={song.image}
                      alt={song.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{song.title}</h3>
                    <p className="text-gray-600">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {song.previewUrl && (
                    <audio controls className="h-8">
                      <source src={song.previewUrl} type="audio/mpeg" />
                    </audio>
                  )}
                  <button
                    onClick={() => removeSongFromPlaylist(song.spotifyId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;
