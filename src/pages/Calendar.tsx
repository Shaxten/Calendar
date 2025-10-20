import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

interface Note {
  id: number;
  user_id: string;
  date: string;
  note: string;
}

function Calendar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [noteText, setNoteText] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadNotes();
  }, [user, navigate]);

  async function loadNotes() {
    const { data } = await supabase
      .from('calendar_notes')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: true });
    if (data) setNotes(data);
  }

  async function addNote() {
    if (!selectedDate || !noteText) return;
    await supabase.from('calendar_notes').insert({
      user_id: user?.id,
      date: selectedDate,
      note: noteText
    });
    setNoteText('');
    setSelectedDate('');
    loadNotes();
  }

  async function deleteNote(id: number) {
    await supabase.from('calendar_notes').delete().eq('id', id);
    loadNotes();
  }

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  }

  function renderCalendar() {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayNotes = notes.filter(n => n.date === dateStr);
      
      days.push(
        <div key={day} className="calendar-day" onClick={() => setSelectedDate(dateStr)}>
          <div className="day-number">{day}</div>
          {dayNotes.length > 0 && <div className="note-indicator">{dayNotes.length}</div>}
        </div>
      );
    }
    
    return days;
  }

  function changeMonth(offset: number) {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="container">
      <h1>Calendar</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
        <button onClick={() => changeMonth(-1)}>← Previous</button>
        <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
        <button onClick={() => changeMonth(1)}>Next →</button>
      </div>

      <div className="calendar-grid" style={{ marginTop: '2rem' }}>
        <div className="calendar-header">Sun</div>
        <div className="calendar-header">Mon</div>
        <div className="calendar-header">Tue</div>
        <div className="calendar-header">Wed</div>
        <div className="calendar-header">Thu</div>
        <div className="calendar-header">Fri</div>
        <div className="calendar-header">Sat</div>
        {renderCalendar()}
      </div>

      {selectedDate && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#2a2a2a', borderRadius: '8px' }}>
          <h3>Notes for {selectedDate}</h3>
          <div style={{ marginTop: '1rem' }}>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
            />
            <button onClick={addNote} style={{ marginTop: '0.5rem' }}>Add Note</button>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            {notes.filter(n => n.date === selectedDate).map(note => (
              <div key={note.id} style={{ background: '#333', padding: '1rem', marginBottom: '0.5rem', borderRadius: '4px' }}>
                <p>{note.note}</p>
                <button onClick={() => deleteNote(note.id)} style={{ marginTop: '0.5rem', background: '#ff4a4a' }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
