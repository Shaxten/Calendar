import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { profile, updateUsername } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.username || '');

  async function handleUpdate() {
    await updateUsername(newName);
    setEditing(false);
  }

  return (
    <div className="container">
      <h1>Profil</h1>
      <div style={{ marginTop: '2rem' }}>
        <p><strong>Nom d'utilisateur:</strong></p>
        {editing ? (
          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ padding: '0.5rem', marginRight: '1rem' }}
            />
            <button onClick={handleUpdate}>Enregistrer</button>
            <button onClick={() => setEditing(false)} style={{ marginLeft: '0.5rem', background: '#666' }}>
              Annuler
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{profile?.username}</span>
            <button onClick={() => setEditing(true)} style={{ marginLeft: '1rem' }}>
              Modifier
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
