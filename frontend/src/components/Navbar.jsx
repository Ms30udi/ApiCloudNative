import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token') !== null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="navbar-brand">
              <span className="navbar-title">MyPlaylistMusic</span>
            </Link>
          </div>

          <div className="navbar-links">
            {isAuthenticated ? (
              <>
                <Link
                  to="/playlists"
                  className="nav-link"
                >
                  Mes Playlists
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-link"
                  id="logout-button"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="nav-link-register"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;