import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(localStorage.getItem('registrationSuccess') || '');
  const navigate = useNavigate();

  // Effacer le message de succès après l'avoir affiché
  React.useEffect(() => {
    if (successMessage) {
      localStorage.removeItem('registrationSuccess');
    }
  }, [successMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2 className="login-title">Connexion</h2>
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="submit-button"
          >
            Se connecter
          </button>
        </form>
        <p className="register-link">
          Vous n'avez pas de compte ? <Link to="/register" className="link">Inscrivez-vous</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;