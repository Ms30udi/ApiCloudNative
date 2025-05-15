import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes Playlists</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Créer une nouvelle playlist</h2>
        <form onSubmit={handleCreatePlaylist} className="space-y-4">
          <div>
            <label htmlFor="playlistName" className="block text-sm font-medium text-gray-700">
              Nom de la playlist
            </label>
            <input
              id="playlistName"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="playlistDescription" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="playlistDescription"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={newPlaylistDescription}
              onChange={(e) => setNewPlaylistDescription(e.target.value)}
              rows="3"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Créer la playlist
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => (
          <div key={playlist._id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{playlist.name}</h3>
            <p className="text-gray-600 mb-4">{playlist.description}</p>
            <p className="text-sm text-gray-500 mb-4">{playlist.songs.length} morceaux</p>
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Voir les détails
              </button>
              <button
                onClick={() => handleDeletePlaylist(playlist._id)}
                className="text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlists;