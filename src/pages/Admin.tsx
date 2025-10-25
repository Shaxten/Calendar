import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

function Admin() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newFood, setNewFood] = useState({ name: '', restaurant: '' });

  useEffect(() => {
    if (!user || profile?.display_name !== 'Joey') {
      navigate('/');
      return;
    }
    loadCategories();
  }, [user, profile, navigate]);

  async function loadCategories() {
    const { data } = await supabase
      .from('tier_categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    await supabase.from('tier_categories').insert({
      user_id: user?.id,
      name: newCategory
    });
    setNewCategory('');
    loadCategories();
  }

  async function addFood() {
    if (!selectedCategory || !newFood.name || !newFood.restaurant) {
      alert('Le nom de l\'aliment et le restaurant sont requis');
      return;
    }
    await supabase.from('tier_food_items').insert({
      user_id: user?.id,
      category_id: selectedCategory,
      food_name: newFood.name,
      restaurant_name: newFood.restaurant,
      taste_rating: null,
      look_rating: null
    });
    setNewFood({ name: '', restaurant: '' });
    alert('Aliment ajouté avec succès!');
  }

  async function deleteCategory(id: string) {
    await supabase.from('tier_categories').delete().eq('id', id);
    loadCategories();
  }

  if (profile?.display_name !== 'Joey') {
    return null;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Panneau Admin</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Accessible uniquement par Joey</p>

      <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ color: '#000' }}>Ajouter Catégorie</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nom de catégorie (ex: Hamburger, Pizza)"
            style={{ flex: 1, padding: '10px', fontSize: '16px' }}
          />
          <button onClick={addCategory} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Ajouter Catégorie
          </button>
        </div>
      </div>

      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ color: '#000' }}>Ajouter Aliment</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '10px', fontSize: '16px' }}
          >
            <option value="">Sélectionner catégorie...</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={newFood.name}
            onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
            placeholder="Nom de l'aliment (ex: Big Mac, Margherita)"
            style={{ padding: '10px', fontSize: '16px' }}
          />
          <input
            type="text"
            value={newFood.restaurant}
            onChange={(e) => setNewFood({ ...newFood, restaurant: e.target.value })}
            placeholder="Nom du restaurant (ex: McDonald's, Pizza Hut)"
            style={{ padding: '10px', fontSize: '16px' }}
          />
          <button onClick={addFood} style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Ajouter Aliment
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
        <h3 style={{ color: '#000' }}>Gérer Catégories</h3>
        {categories.length === 0 ? (
          <p style={{ color: '#999' }}>Aucune catégorie encore</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                <strong style={{ color: '#000' }}>{cat.name}</strong>
                <button onClick={() => deleteCategory(cat.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
