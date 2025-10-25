import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

interface FoodItem {
  id: string;
  category_id: string;
  food_name: string;
  restaurant_name: string;
  category_name?: string;
}

interface UserVote {
  food_item_id: string;
  taste_rating: number;
  price_rating: number;
}

function Vote() {
  const { user } = useAuth();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState({ taste: 5, price: 5 });

  useEffect(() => {
    if (user) loadFoodItems();
  }, [user]);

  async function loadFoodItems() {
    const { data: items } = await supabase
      .from('tier_food_items')
      .select('*, tier_categories(name)');
    
    const { data: votes } = await supabase
      .from('user_votes')
      .select('*')
      .eq('user_id', user?.id);
    
    if (items) {
      const foodList = items.map(item => ({
        ...item,
        category_name: (item.tier_categories as any)?.name
      }));
      setFoodItems(foodList);
      
      if (votes) {
        setUserVotes(votes);
      }
      
      if (foodList.length > 0) {
        const currentVote = votes?.find(v => v.food_item_id === foodList[0].id);
        setRatings({ 
          taste: currentVote?.taste_rating ?? 5, 
          price: currentVote?.price_rating ?? 5 
        });
      }
    }
  }

  async function saveRating() {
    if (foodItems.length === 0) return;
    const current = foodItems[currentIndex];
    
    const existingVote = userVotes.find(v => v.food_item_id === current.id);
    
    if (existingVote) {
      await supabase
        .from('user_votes')
        .update({
          taste_rating: ratings.taste,
          price_rating: ratings.price
        })
        .eq('user_id', user?.id)
        .eq('food_item_id', current.id);
    } else {
      await supabase
        .from('user_votes')
        .insert({
          user_id: user?.id,
          food_item_id: current.id,
          taste_rating: ratings.taste,
          price_rating: ratings.price
        });
    }

    if (currentIndex < foodItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextVote = userVotes.find(v => v.food_item_id === foodItems[nextIndex].id);
      setRatings({ 
        taste: nextVote?.taste_rating ?? 5, 
        price: nextVote?.price_rating ?? 5 
      });
    } else {
      alert('Tous les aliments notés!');
      loadFoodItems();
      setCurrentIndex(0);
    }
  }

  function skip() {
    if (currentIndex < foodItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextVote = userVotes.find(v => v.food_item_id === foodItems[nextIndex].id);
      setRatings({ 
        taste: nextVote?.taste_rating ?? 5, 
        price: nextVote?.price_rating ?? 5 
      });
    }
  }

  if (foodItems.length === 0) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Voter sur la Nourriture</h1>
        <p>Aucun aliment à voter. Ajoutez-en dans la page Classement!</p>
        <Link to="/tierlist" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px', display: 'inline-block', marginTop: '20px' }}>
          Aller au Classement
        </Link>
      </div>
    );
  }

  const current = foodItems[currentIndex];
  const currentVote = userVotes.find(v => v.food_item_id === current.id);
  const hasVoted = !!currentVote;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Voter sur la Nourriture</h1>
        <Link to="/tierlist" style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
          Retour au Classement
        </Link>
      </div>

      <div style={{ background: '#6c757d', color: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>
        <strong>Progrès:</strong> {currentIndex + 1} / {foodItems.length}
      </div>

      <div style={{ background: '#fff', border: '2px solid #007bff', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
        <div style={{ background: '#007bff', color: '#fff', padding: '8px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
          {current.category_name}
        </div>
        <h2 style={{ color: '#000', marginBottom: '10px' }}>{current.food_name}</h2>
        <p style={{ color: '#666', marginBottom: '10px', fontSize: '16px' }}>{current.restaurant_name}</p>
        {hasVoted && (
          <p style={{ color: '#28a745', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
            ✓ Vous avez déjà voté pour cet article
          </p>
        )}

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
            Note de Goût: {ratings.taste}/10
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={ratings.taste}
            onChange={(e) => setRatings({ ...ratings, taste: parseInt(e.target.value) })}
            style={{ width: '100%', height: '30px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px' }}>
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
            Note de Prix: {ratings.price}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={ratings.price}
            onChange={(e) => setRatings({ ...ratings, price: parseInt(e.target.value) })}
            style={{ width: '100%', height: '30px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px' }}>
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={skip} style={{ flex: 1, padding: '15px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
            Passer
          </button>
          <button onClick={saveRating} style={{ flex: 2, padding: '15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
            Enregistrer & Suivant
          </button>
        </div>
      </div>
    </div>
  );
}

export default Vote;
