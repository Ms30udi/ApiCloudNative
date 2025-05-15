import React, { useState } from 'react';
import axios from 'axios';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);

  const searchTracks = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter');
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/spotify/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setTracks(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de la recherche');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Rechercher des morceaux</h1>
      
      <form onSubmit={searchTracks} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un morceau..."
            className="flex-1 p-2 border rounded"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Rechercher
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map(track => (
          <div key={track.id} className="bg-white p-4 rounded shadow">
            {track.image && (
              <img src={track.image} alt={track.title} className="w-full h-48 object-cover mb-4 rounded" />
            )}
            <h3 className="font-semibold text-lg">{track.title}</h3>
            <p className="text-gray-600">{track.artist}</p>
            {track.preview && (
              <audio controls className="w-full mt-4">
                <source src={track.preview} type="audio/mpeg" />
                Votre navigateur ne supporte pas l'élément audio.
              </audio>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;