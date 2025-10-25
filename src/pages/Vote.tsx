import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

interface FoodItem {
  id: string;
  category_id: string;
  food_name: string;
  restaurant_name: string;
  taste_rating: number | null;
  look_rating: number | null;
  category_name?: string;
}

function Vote() {
  const { user } = useAuth();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState({ taste: 0, look: 0 });

  useEffect(() => {
    if (user) loadFoodItems();
  }, [user]);

  async function loadFoodItems() {
    const { data } = await supabase
      .from('tier_food_items')
      .select('*, tier_categories(name)');
    if (data) {
      const items = data.map(item => ({
        ...item,
        category_name: (item.tier_categories as any)?.name
      }));
      setFoodItems(items);
      if (items.length > 0) {
        setRatings({ 
          taste: items[0].taste_rating ?? 5, 
          look: items[0].look_rating ?? 5 
        });
      }
    }
  }

  async function saveRating() {
    if (foodItems.length === 0) return;
    const current = foodItems[currentIndex];
    await supabase
      .from('tier_food_items')
      .update({
        taste_rating: ratings.taste,
        look_rating: ratings.look
      })
      .eq('id', current.id);

    if (currentIndex < foodItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setRatings({ 
        taste: foodItems[nextIndex].taste_rating ?? 5, 
        look: foodItems[nextIndex].look_rating ?? 5 
      });
    } else {
      alert('All foods rated!');
      loadFoodItems();
      setCurrentIndex(0);
    }
  }

  function skip() {
    if (currentIndex < foodItems.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setRatings({ 
        taste: foodItems[nextIndex].taste_rating ?? 5, 
        look: foodItems[nextIndex].look_rating ?? 5 
      });
    }
  }

  if (foodItems.length === 0) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1>Vote on Foods</h1>
        <p>No food items to vote on. Add some in the Tier List page!</p>
        <Link to="/tierlist" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px', display: 'inline-block', marginTop: '20px' }}>
          Go to Tier List
        </Link>
      </div>
    );
  }

  const current = foodItems[currentIndex];

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Vote on Foods</h1>
        <Link to="/tierlist" style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
          Back to List
        </Link>
      </div>

      <div style={{ background: '#6c757d', color: '#fff', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>
        <strong>Progress:</strong> {currentIndex + 1} / {foodItems.length}
      </div>

      <div style={{ background: '#fff', border: '2px solid #007bff', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
        <div style={{ background: '#007bff', color: '#fff', padding: '8px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
          {current.category_name}
        </div>
        <h2 style={{ color: '#000', marginBottom: '10px' }}>{current.food_name}</h2>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>{current.restaurant_name}</p>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
            Taste Rating: {ratings.taste}/10
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
            Look Rating: {ratings.look}/10
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={ratings.look}
            onChange={(e) => setRatings({ ...ratings, look: parseInt(e.target.value) })}
            style={{ width: '100%', height: '30px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '5px' }}>
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={skip} style={{ flex: 1, padding: '15px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
            Skip
          </button>
          <button onClick={saveRating} style={{ flex: 2, padding: '15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
            Save & Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Vote;
