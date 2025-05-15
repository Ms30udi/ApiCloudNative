import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Home from './pages/Home';
import Search from './pages/Search';

const App = () => {
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/playlists"
            element={
              <PrivateRoute>
                <Playlists />
              </PrivateRoute>
            }
          />
          <Route
            path="/playlist/:id"
            element={
              <PrivateRoute>
                <PlaylistDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PrivateRoute>
                <Search />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;