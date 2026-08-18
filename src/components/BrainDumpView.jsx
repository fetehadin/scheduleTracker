import React, { useState } from 'react';

const DAY_ORDER = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
const SORTED_DAYS = Object.keys(DAY_ORDER).sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]);

export default function BrainDumpView({ brainDumps, setBrainDumps }) {
  const [note, setNote] = useState('');
  
  // Edit States
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAddDump = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setBrainDumps([{ id: Date.now(), text: note, day: currentDay, time: timestamp }, ...brainDumps]);
    setNote('');
  };

  const startEditing = (dump) => {
    setEditingId(dump.id);
    setEditText(dump.text);
  };

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    setBrainDumps(brainDumps.map(dump => 
      dump.id === id ? { ...dump, text: editText } : dump
    ));
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (id) => {
    if(window.confirm('Delete this note?')) {
       setBrainDumps(brainDumps.filter(dump => dump.id !== id));
    }
  };

  const dumpsByDay = brainDumps.reduce((acc, dump) => {
    if (!acc[dump.day]) acc[dump.day] = [];
    acc[dump.day].push(dump);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleAddDump} className="relative">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Log a thought, link, or API to research..." className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 pb-14 text-sm focus:outline-none focus:border-zinc-500 resize-none h-32" />
          <div className="absolute bottom-4 right-4 flex gap-2">
            {brainDumps.length > 0 && (
              <button type="button" onClick={() => { if(window.confirm('Wipe all notes?')) setBrainDumps([]) }} className="px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">Clear All</button>
            )}
            <button type="submit" className="px-6 py-2 text-xs font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-lg hover:bg-zinc-800 transition-colors">Log Note</button>
          </div>
        </form>
      </div>

      <div className="space-y-8">
        {SORTED_DAYS.map(day => {
          if (!dumpsByDay[day]) return null;
          return (
            <div key={day} className="space-y-4">
              <h3 className="text-lg font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2">{day}</h3>
              <div className="grid gap-3">
                {dumpsByDay[day].map(dump => (
                  <div key={dump.id} className="group relative bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors">
                    {editingId === dump.id ? (
                       <div className="flex flex-col gap-2">
                          <textarea 
                            autoFocus
                            value={editText} 
                            onChange={(e) => setEditText(e.target.value)} 
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded p-2 text-sm focus:outline-none focus:border-zinc-500 resize-y min-h-[80px]"
                          />
                          <div className="flex justify-end gap-2 mt-1">
                             <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold transition-colors">Cancel</button>
                             <button onClick={() => handleSaveEdit(dump.id)} className="text-xs px-4 py-1.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 font-bold transition-colors">Save</button>
                          </div>
                       </div>
                    ) : (
                       <>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                             <button onClick={() => startEditing(dump)} className="text-zinc-400 hover:text-blue-500 transition-colors" title="Edit note">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                             </button>
                             <button onClick={() => handleDelete(dump.id)} className="text-zinc-400 hover:text-rose-500 transition-colors" title="Delete note">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                             </button>
                          </div>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap pr-12">{dump.text}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-[10px] text-zinc-500 font-bold">{dump.time}</span>
                          </div>
                       </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}