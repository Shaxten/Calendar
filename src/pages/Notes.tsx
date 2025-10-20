import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';

interface Note {
  id: string;
  content: string;
  color: string;
  position_x: number;
  position_y: number;
}

const COLORS = ['#ffd97d', '#ff9b9b', '#c9e4de', '#c4b5fd', '#ffc6ff'];

function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [savedNotes, setSavedNotes] = useState<{ [key: string]: boolean }>({});
  const saveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) loadNotes();
  }, [user]);

  async function loadNotes() {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) setNotes(data);
  }

  async function addNote() {
    const newNote = {
      user_id: user?.id,
      content: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      position_x: Math.random() * 300,
      position_y: Math.random() * 200,
    };
    const { data } = await supabase.from('notes').insert(newNote).select().single();
    if (data) setNotes([data, ...notes]);
  }

  function updateNote(id: string, updates: Partial<Note>) {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
    setSavedNotes(prev => ({ ...prev, [id]: false }));
    
    if (saveTimeoutRef.current[id]) {
      clearTimeout(saveTimeoutRef.current[id]);
    }
    
    saveTimeoutRef.current[id] = setTimeout(() => {
      supabase.from('notes').update(updates).eq('id', id);
      delete saveTimeoutRef.current[id];
    }, 500);
  }

  async function saveNote(id: string) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    if (saveTimeoutRef.current[id]) {
      clearTimeout(saveTimeoutRef.current[id]);
      delete saveTimeoutRef.current[id];
    }
    
    await supabase.from('notes').update({ content: note.content }).eq('id', id);
    setSavedNotes(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setSavedNotes(prev => ({ ...prev, [id]: false })), 2000);
  }

  async function deleteNote(id: string) {
    await supabase.from('notes').delete().eq('id', id);
    setNotes(notes.filter(n => n.id !== id));
  }

  function handleMouseDown(e: React.MouseEvent, noteId: string) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    setDraggedNote(noteId);
    setOffset({
      x: e.clientX - note.position_x,
      y: e.clientY - note.position_y,
    });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!draggedNote) return;
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    setNotes(notes.map(n => 
      n.id === draggedNote ? { ...n, position_x: newX, position_y: newY } : n
    ));
  }

  async function handleMouseUp() {
    if (draggedNote) {
      const note = notes.find(n => n.id === draggedNote);
      if (note) {
        await supabase.from('notes').update({ 
          position_x: note.position_x, 
          position_y: note.position_y 
        }).eq('id', draggedNote);
      }
      setDraggedNote(null);
    }
  }

  if (isMobile) {
    return (
      <div style={{ 
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}>
        <button 
          onClick={addNote}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '16px',
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          + New Note
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notes.map(note => (
            <div
              key={note.id}
              style={{
                background: note.color,
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => deleteNote(note.id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ×
              </button>
              <textarea
                value={note.content}
                onChange={(e) => updateNote(note.id, { content: e.target.value })}
                placeholder="Write your note..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'vertical',
                  fontSize: '16px',
                  color: '#333',
                  marginBottom: '10px',
                }}
              />
              <button
                onClick={() => saveNote(note.id)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: savedNotes[note.id] ? '#4caf50' : 'rgba(0,0,0,0.2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {savedNotes[note.id] ? '✓ Saved' : 'Save'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        height: 'calc(100vh - 80px)', 
        position: 'relative', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <button 
        onClick={addNote}
        style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          padding: '12px 24px',
          fontSize: '16px',
          background: '#fff',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
        }}
      >
        + New Note
      </button>

      {notes.map(note => (
        <div
          key={note.id}
          style={{
            position: 'absolute',
            left: `${note.position_x}px`,
            top: `${note.position_y}px`,
            width: '200px',
            minHeight: '200px',
            background: note.color,
            padding: '20px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            cursor: draggedNote === note.id ? 'grabbing' : 'grab',
            transform: 'rotate(-2deg)',
            transition: draggedNote === note.id ? 'none' : 'transform 0.2s',
            fontFamily: "'Indie Flower', cursive",
            fontSize: '16px',
          }}
          onMouseDown={(e) => handleMouseDown(e, note.id)}
        >
          <button
            onClick={() => deleteNote(note.id)}
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ×
          </button>
          <textarea
            value={note.content}
            onChange={(e) => updateNote(note.id, { content: e.target.value })}
            placeholder="Write your note..."
            style={{
              width: '100%',
              minHeight: '120px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              color: '#333',
              marginBottom: '8px',
            }}
          />
          <button
            onClick={() => saveNote(note.id)}
            style={{
              width: '100%',
              padding: '6px',
              background: savedNotes[note.id] ? '#4caf50' : 'rgba(0,0,0,0.2)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {savedNotes[note.id] ? '✓ Saved' : 'Save'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Notes;
