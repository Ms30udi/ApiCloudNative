import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Stocker un message de succès dans le localStorage
        localStorage.setItem('registrationSuccess', 'Inscription réussie ! Vous pouvez maintenant vous connecter.');
        navigate('/login');
      } else if (response.status === 400) {
        setError(data.error || 'Email déjà utilisé');
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2 className="register-title">Inscription</h2>
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
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="submit-button"
          >
            S'inscrire
          </button>
        </form>
        <p className="login-link">
          Vous avez déjà un compte ? <Link to="/login" className="link">Connectez-vous</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;