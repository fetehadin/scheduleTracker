import React, { useState } from 'react';

const DAY_ORDER = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
const SORTED_DAYS = Object.keys(DAY_ORDER).sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]);

export default function PlannerView({ tasks, setTasks, activeWeek, setActiveWeek, setCurrentView }) {
  const [newTask, setNewTask] = useState({ title: '', category: '', week: activeWeek, day: 'Monday', hours: 1 });

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setTasks([...tasks, { id: Date.now(), ...newTask, hours: parseFloat(newTask.hours), allocatedHours: parseFloat(newTask.hours), progress: 0, note: '' }]);
    setCurrentView('dashboard');
    setActiveWeek(parseInt(newTask.week));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-bold mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">Schedule a New Task</h2>
      <form onSubmit={handleAddTask} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Task Title</label>
          <input type="text" autoFocus required value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Category</label>
            <input type="text" list="categories" required placeholder="e.g. Coding" value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500" />
            <datalist id="categories"><option value="Coding" /><option value="Reading" /><option value="Hustle" /><option value="Habit" /></datalist>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Hours</label>
            <input type="number" min="0.5" step="0.5" required value={newTask.hours} onChange={(e) => setNewTask({...newTask, hours: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Week Number</label>
            <input type="number" min="1" required value={newTask.week} onChange={(e) => setNewTask({...newTask, week: parseInt(e.target.value)})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Day</label>
            <select value={newTask.day} onChange={(e) => setNewTask({...newTask, day: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500">
              {SORTED_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" className="w-full mt-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-300">Add to Schedule</button>
      </form>
    </div>
  );
}