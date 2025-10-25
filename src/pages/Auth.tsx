import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(username, password);
      } else {
        await signIn(username, password);
      }
      navigate('/calendar');
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div className="container">
      <h1>{isSignUp ? 'Inscription' : 'Connexion'}</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '0.75rem' }}>
          {isSignUp ? 'S\'inscrire' : 'Se connecter'}
        </button>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          {isSignUp ? 'Vous avez déjà un compte?' : "Vous n'avez pas de compte?"}{' '}
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#4a9eff', cursor: 'pointer', textDecoration: 'underline' }}>
            {isSignUp ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </p>
      </form>
    </div>
  );
}

export default Auth;
