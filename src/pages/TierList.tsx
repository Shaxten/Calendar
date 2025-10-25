import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

interface FoodItem {
  id: string;
  category_id: string;
  food_name: string;
  restaurant_name: string;
  taste_rating: number | null;
  look_rating: number | null;
  category_name?: string;
}

function TierList() {
  const { user, profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filterRestaurant, setFilterRestaurant] = useState('');

  useEffect(() => {
    if (user) {
      loadCategories();
      loadFoodItems();
    }
  }, [user]);

  async function loadCategories() {
    const { data } = await supabase
      .from('tier_categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  }

  async function loadFoodItems() {
    const { data } = await supabase
      .from('tier_food_items')
      .select('*, tier_categories(name)')
      .order('taste_rating', { ascending: false });
    if (data) {
      const items = data.map(item => ({
        ...item,
        category_name: (item.tier_categories as any)?.name
      }));
      setFoodItems(items);
    }
  }

  async function deleteFood(id: string) {
    await supabase.from('tier_food_items').delete().eq('id', id);
    loadFoodItems();
  }

  const getTier = (avg: number | null) => {
    if (avg === null) return { tier: '?', color: '#cccccc' };
    if (avg >= 9) return { tier: 'S', color: '#ff7f7f' };
    if (avg >= 7) return { tier: 'A', color: '#ffbf7f' };
    if (avg >= 5) return { tier: 'B', color: '#ffff7f' };
    if (avg >= 3) return { tier: 'C', color: '#7fbfff' };
    return { tier: 'D', color: '#bf7fff' };
  };

  const restaurants = Array.from(new Set(foodItems.map(item => item.restaurant_name))).sort();

  const filteredItems = filterRestaurant 
    ? foodItems.filter(item => item.restaurant_name === filterRestaurant)
    : foodItems;

  const groupedByCategory = categories.map(cat => ({
    category: cat,
    items: filteredItems.filter(item => item.category_id === cat.id)
  }));

  const bestByRestaurant = restaurants.map(restaurant => {
    const restaurantItems = foodItems.filter(item => 
      item.restaurant_name === restaurant && 
      item.taste_rating !== null && 
      item.look_rating !== null
    );
    if (restaurantItems.length === 0) return null;
    
    const best = restaurantItems.reduce((prev, current) => {
      const prevAvg = (prev.taste_rating! + prev.look_rating!) / 2;
      const currentAvg = (current.taste_rating! + current.look_rating!) / 2;
      return currentAvg > prevAvg ? current : prev;
    });
    
    return { restaurant, item: best };
  }).filter(Boolean);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Food Tier List</h1>

      <div style={{ background: '#fff', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, color: '#000' }}>Filter by Restaurant</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={filterRestaurant}
            onChange={(e) => setFilterRestaurant(e.target.value)}
            style={{ flex: 1, padding: '10px', fontSize: '16px' }}
          >
            <option value="">All Restaurants</option>
            {restaurants.map(restaurant => (
              <option key={restaurant} value={restaurant}>{restaurant}</option>
            ))}
          </select>
          {filterRestaurant && (
            <button onClick={() => setFilterRestaurant('')} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {!filterRestaurant && bestByRestaurant.length > 0 && (
        <div style={{ background: '#fff3cd', border: '2px solid #ffc107', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, color: '#000' }}>🏆 Best Rated by Restaurant</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {bestByRestaurant.map(({ restaurant, item }: any) => {
              const avg = (item.taste_rating + item.look_rating) / 2;
              const { tier, color } = getTier(avg);
              return (
                <div key={restaurant} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', background: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
                  <div style={{ width: '40px', height: '40px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '20px', fontWeight: 'bold', color: '#000' }}>
                    {tier}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#000' }}>{item.food_name}</strong>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {restaurant} - {item.category_name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      Taste: {item.taste_rating}/10 | Look: {item.look_rating}/10 | Avg: {avg.toFixed(1)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h2>Categories</h2>
      {groupedByCategory.map(({ category, items }) => (
        <div key={category.id} style={{ background: '#fff', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, marginBottom: '10px', color: '#000' }}>{category.name}</h3>
          {items.length === 0 ? (
            <p style={{ color: '#999' }}>No items in this category</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map(item => {
                const avg = item.taste_rating !== null && item.look_rating !== null 
                  ? (item.taste_rating + item.look_rating) / 2 
                  : null;
                const { tier, color } = getTier(avg);
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                    <div style={{ width: '50px', height: '50px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
                      {tier}
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#000' }}>{item.food_name}</strong>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {item.restaurant_name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        {avg !== null 
                          ? `Taste: ${item.taste_rating}/10 | Look: ${item.look_rating}/10 | Avg: ${avg.toFixed(1)}`
                          : 'Not rated yet'}
                      </div>
                    </div>
                    {profile?.display_name === 'Joey' && (
                      <button onClick={() => deleteFood(item.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TierList;
