import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';

interface FoodEntry {
  id: string;
  date: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface CustomFood {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function FoodTracker() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [selectedFood, setSelectedFood] = useState('');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  useEffect(() => {
    if (user) {
      loadEntries();
      loadCustomFoods();
    }
  }, [user, selectedDate, viewMode]);

  async function loadEntries() {
    let query = supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', user?.id);
    
    if (viewMode === 'single') {
      query = query.eq('date', selectedDate);
    }
    
    const { data } = await query.order('date', { ascending: false }).order('created_at', { ascending: false });
    if (data) setEntries(data);
  }

  async function loadCustomFoods() {
    const { data } = await supabase
      .from('custom_foods')
      .select('*')
      .eq('user_id', user?.id)
      .order('food_name');
    if (data) setCustomFoods(data);
  }

  async function addFromLibrary() {
    if (!selectedFood) return;
    const food = customFoods.find(f => f.id === selectedFood);
    if (!food) return;

    const entry = {
      user_id: user?.id,
      date: selectedDate,
      food_name: food.food_name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    };

    await supabase.from('food_entries').insert(entry);
    loadEntries();
    setSelectedFood('');
  }

  async function addCustomFood() {
    if (!customFood.name || !customFood.calories) {
      alert('Name and calories are required');
      return;
    }

    const entry = {
      user_id: user?.id,
      date: selectedDate,
      food_name: customFood.name,
      calories: parseInt(customFood.calories),
      protein: parseInt(customFood.protein) || 0,
      carbs: parseInt(customFood.carbs) || 0,
      fat: parseInt(customFood.fat) || 0,
    };

    const { data } = await supabase.from('custom_foods').insert({
      user_id: user?.id,
      food_name: customFood.name,
      calories: parseInt(customFood.calories),
      protein: parseInt(customFood.protein) || 0,
      carbs: parseInt(customFood.carbs) || 0,
      fat: parseInt(customFood.fat) || 0,
    }).select().single();

    if (data) {
      await supabase.from('food_entries').insert(entry);
      loadEntries();
      loadCustomFoods();
      setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
      setShowCustomForm(false);
    }
  }

  async function deleteEntry(id: string) {
    await supabase.from('food_entries').delete().eq('id', id);
    loadEntries();
  }

  const totals = (viewMode === 'single' ? entries : entries.filter(e => e.date === selectedDate)).reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const groupedByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  const proteinCals = totals.protein * 4;
  const carbsCals = totals.carbs * 4;
  const fatCals = totals.fat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;
  
  const proteinPercent = totalMacroCals > 0 ? Math.round((proteinCals / totalMacroCals) * 100) : 0;
  const carbsPercent = totalMacroCals > 0 ? Math.round((carbsCals / totalMacroCals) * 100) : 0;
  const fatPercent = totalMacroCals > 0 ? Math.round((fatCals / totalMacroCals) * 100) : 0;

  const getDietType = () => {
    if (totalMacroCals === 0) return '';
    if (fatPercent >= 60 && carbsPercent <= 10) return 'Ketogenic Diet';
    if (fatPercent >= 50 && carbsPercent <= 20) return 'Low-Carb High-Fat';
    if (proteinPercent >= 35) return 'High-Protein Diet';
    if (carbsPercent >= 55) return 'High-Carb Diet';
    if (proteinPercent >= 25 && proteinPercent <= 35 && carbsPercent >= 40 && carbsPercent <= 50 && fatPercent >= 20 && fatPercent <= 35) return 'Balanced Diet';
    return 'Mixed Diet';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Food Tracker</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '8px', fontSize: '16px' }}
        />
        <button
          onClick={() => setViewMode(viewMode === 'single' ? 'all' : 'single')}
          style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {viewMode === 'single' ? 'View All Days' : 'View Single Day'}
        </button>
      </div>

      <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#000' }}>{viewMode === 'single' ? 'Daily Totals' : `Totals for ${selectedDate}`}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', color: '#000' }}>
          <div><strong>Calories:</strong> {totals.calories}</div>
          <div><strong>Protein:</strong> {totals.protein}g</div>
          <div><strong>Carbs:</strong> {totals.carbs}g</div>
          <div><strong>Fat:</strong> {totals.fat}g</div>
        </div>
        
        {totalMacroCals > 0 && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="70" fill="none" stroke="#e0e0e0" strokeWidth="10" />
              <circle
                cx="75"
                cy="75"
                r="70"
                fill="none"
                stroke="#4caf50"
                strokeWidth="10"
                strokeDasharray={`${(proteinPercent / 100) * 440} 440`}
                strokeDashoffset="0"
                transform="rotate(-90 75 75)"
              />
              <circle
                cx="75"
                cy="75"
                r="70"
                fill="none"
                stroke="#ff9800"
                strokeWidth="10"
                strokeDasharray={`${(carbsPercent / 100) * 440} 440`}
                strokeDashoffset={`-${(proteinPercent / 100) * 440}`}
                transform="rotate(-90 75 75)"
              />
              <circle
                cx="75"
                cy="75"
                r="70"
                fill="none"
                stroke="#f44336"
                strokeWidth="10"
                strokeDasharray={`${(fatPercent / 100) * 440} 440`}
                strokeDashoffset={`-${((proteinPercent + carbsPercent) / 100) * 440}`}
                transform="rotate(-90 75 75)"
              />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#4caf50', borderRadius: '3px' }}></div>
                <span style={{ color: '#000' }}>Protein: {proteinPercent}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#ff9800', borderRadius: '3px' }}></div>
                <span style={{ color: '#000' }}>Carbs: {carbsPercent}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: '#f44336', borderRadius: '3px' }}></div>
                <span style={{ color: '#000' }}>Fat: {fatPercent}%</span>
              </div>
            </div>
          </div>
        )}
        {totalMacroCals > 0 && (
          <div style={{ marginTop: '15px', textAlign: 'center', padding: '10px', background: '#fff', borderRadius: '4px' }}>
            <strong style={{ color: '#000' }}>Diet Type: </strong>
            <span style={{ color: '#2196F3', fontSize: '16px' }}>{getDietType()}</span>
          </div>
        )}
      </div>

      {viewMode === 'single' && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Add Food</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select
            value={selectedFood}
            onChange={(e) => setSelectedFood(e.target.value)}
            style={{ flex: 1, padding: '10px', fontSize: '16px' }}
          >
            <option value="">Select from your food library...</option>
            {customFoods.map((food) => (
              <option key={food.id} value={food.id}>
                {food.food_name} ({food.calories}cal)
              </option>
            ))}
          </select>
          <button onClick={addFromLibrary} disabled={!selectedFood} style={{ padding: '10px 20px' }}>Add</button>
          <button onClick={() => setShowCustomForm(!showCustomForm)} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px' }}>
            + New Food
          </button>
        </div>

        {showCustomForm && (
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '4px', marginTop: '10px' }}>
            <h4>Create New Food</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              <input
                type="text"
                placeholder="Food name"
                value={customFood.name}
                onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                style={{ padding: '8px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="Calories"
                  value={customFood.calories}
                  onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                  style={{ padding: '8px' }}
                />
                <input
                  type="number"
                  placeholder="Protein (g)"
                  value={customFood.protein}
                  onChange={(e) => setCustomFood({ ...customFood, protein: e.target.value })}
                  style={{ padding: '8px' }}
                />
                <input
                  type="number"
                  placeholder="Carbs (g)"
                  value={customFood.carbs}
                  onChange={(e) => setCustomFood({ ...customFood, carbs: e.target.value })}
                  style={{ padding: '8px' }}
                />
                <input
                  type="number"
                  placeholder="Fat (g)"
                  value={customFood.fat}
                  onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                  style={{ padding: '8px' }}
                />
              </div>
              <button onClick={addCustomFood} style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
                Add Custom Food
              </button>
            </div>
          </div>
        )}
        </div>
      )}

      {viewMode === 'single' ? (
        <>
          <h3>Today's Meals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {entries.map((entry) => (
              <div key={entry.id} style={{ background: '#fff', border: '1px solid #ddd', padding: '15px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '18px', color:'black' }}>{entry.food_name}</strong>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                    {entry.calories}cal | Protein: {entry.protein}g | Carbs: {entry.carbs}g | Fat: {entry.fat}g
                  </div>
                </div>
                <button onClick={() => deleteEntry(entry.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            ))}
            {entries.length === 0 && (
              <p style={{ textAlign: 'center', color: '#999' }}>No food entries for this day</p>
            )}
          </div>
        </>
      ) : (
        <>
          <h3>All Days</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a)).map((date) => {
              const dayEntries = groupedByDate[date];
              const dayTotals = dayEntries.reduce(
                (acc, entry) => ({
                  calories: acc.calories + entry.calories,
                  protein: acc.protein + entry.protein,
                  carbs: acc.carbs + entry.carbs,
                  fat: acc.fat + entry.fat,
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0 }
              );
              return (
                <div key={date} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                  <h4 style={{ marginTop: 0, color: '#000' }}>{date}</h4>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    Total: {dayTotals.calories}cal | P: {dayTotals.protein}g | C: {dayTotals.carbs}g | F: {dayTotals.fat}g
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dayEntries.map((entry) => (
                      <div key={entry.id} style={{ background: '#fff', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: '#000' }}>{entry.food_name}</strong>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            {entry.calories}cal | P: {entry.protein}g | C: {entry.carbs}g | F: {entry.fat}g
                          </div>
                        </div>
                        <button onClick={() => deleteEntry(entry.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {Object.keys(groupedByDate).length === 0 && (
              <p style={{ textAlign: 'center', color: '#999' }}>No food entries yet</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FoodTracker;
