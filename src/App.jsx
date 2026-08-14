import React, { useState, useEffect } from 'react';

const initialTasks = [
  { id: 1, week: 1, day: 'Friday', category: 'Reading', title: 'Read ~19 pages of Show Your Work! (Morning)', allocatedHours: 0.5, progress: 0, note: '' },
  { id: 2, week: 1, day: 'Friday', category: 'Coding', title: 'React Core: Virtual DOM, JSX, props, useState', allocatedHours: 4, progress: 0, note: '' },
  { id: 3, week: 1, day: 'Friday', category: 'Habit', title: 'Batch Cook (Meals for Fri & Sat)', allocatedHours: 1, progress: 0, note: '' },
  { id: 4, week: 1, day: 'Friday', category: 'Hustle', title: '1 X post (React concept) & Draft Upwork template', allocatedHours: 2.5, progress: 0, note: '' }
];

export default function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('protocol_theme');
    if (savedTheme !== null) return JSON.parse(savedTheme);
    // Default to dark mode for the brutalist feel
    return true; 
  });

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('protocol_tasks_v3');
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  });

  const [globalNotes, setGlobalNotes] = useState(() => {
    return localStorage.getItem('protocol_notes_v3') || '';
  });

  const [activeWeek, setActiveWeek] = useState(1);
  const [debtHours, setDebtHours] = useState(0);
  const [currentView, setCurrentView] = useState('dashboard'); 

  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Coding',
    week: 1,
    day: 'Monday',
    hours: 1
  });

  // Theme Persistence & DOM update
  useEffect(() => {
    localStorage.setItem('protocol_theme', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Data Persistence
  useEffect(() => {
    localStorage.setItem('protocol_tasks_v3', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('protocol_notes_v3', globalNotes);
  }, [globalNotes]);

  // Debt Engine
  useEffect(() => {
    const totalDebt = tasks.reduce((sum, task) => {
      const missedPercentage = (100 - task.progress) / 100;
      return sum + (task.allocatedHours * missedPercentage);
    }, 0);
    setDebtHours(totalDebt.toFixed(1));
  }, [tasks]);

  const updateTask = (id, field, value) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const markDone = (id) => {
    updateTask(id, 'progress', 100);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const taskToAdd = {
      id: Date.now(),
      week: parseInt(newTask.week),
      day: newTask.day,
      category: newTask.category,
      title: newTask.title,
      allocatedHours: parseFloat(newTask.hours),
      progress: 0,
      note: ''
    };

    setTasks([...tasks, taskToAdd]);
    setNewTask({ ...newTask, title: '' }); 
    setCurrentView('dashboard'); 
    setActiveWeek(parseInt(newTask.week));
  };

  const filteredTasks = tasks.filter(t => t.week === activeWeek);
  const tasksByDay = filteredTasks.reduce((acc, task) => {
    if (!acc[task.day]) acc[task.day] = [];
    acc[task.day].push(task);
    return acc;
  }, {});

  const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
  const sortedDays = Object.keys(tasksByDay).sort((a, b) => dayOrder[a] - dayOrder[b]);

  return (
    <div className="min-h-screen transition-colors duration-200 bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 p-4 md:p-8 font-sans selection:bg-zinc-300 dark:selection:bg-zinc-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
          <div className="w-full md:w-auto text-center md:text-left flex flex-col items-center md:items-start">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold tracking-tight">
                Discipline Protocol
              </h1>
              {/* THEME TOGGLE BUTTON */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-400"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                )}
              </button>
            </div>
            
            <div className="flex gap-4 mt-4 justify-center md:justify-start">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${currentView === 'dashboard' ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('planner')}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${currentView === 'planner' ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                Task Planner
              </button>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg min-w-[200px] justify-center transition-colors">
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Sunday Debt</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{debtHours}</span>
                <span className="text-sm text-zinc-500 font-medium">hrs</span>
              </div>
            </div>
          </div>
        </header>

        {currentView === 'planner' ? (
          /* PLANNER VIEW */
          <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
            <h2 className="text-xl font-bold mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">Schedule a New Task</h2>
            <form onSubmit={handleAddTask} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Task Title</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="e.g. Build API endpoints for mobile app"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Category</label>
                  <select 
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                  >
                    <option>Coding</option>
                    <option>Reading</option>
                    <option>Hustle</option>
                    <option>Habit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Allocated Hours</label>
                  <input 
                    type="number" 
                    min="0.5" step="0.5"
                    required
                    value={newTask.hours}
                    onChange={(e) => setNewTask({...newTask, hours: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Week</label>
                  <select 
                    value={newTask.week}
                    onChange={(e) => setNewTask({...newTask, week: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                  >
                    {[1, 2, 3, 4].map(w => <option key={w} value={w}>Week {w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Day</label>
                  <select 
                    value={newTask.day}
                    onChange={(e) => setNewTask({...newTask, day: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full mt-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-colors">
                Add to Schedule
              </button>
            </form>
          </div>
        ) : (
          /* DASHBOARD VIEW */
          <>
            <div className="flex space-x-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 w-fit transition-colors">
              {[1, 2, 3, 4].map(week => (
                <button
                  key={week}
                  onClick={() => setActiveWeek(week)}
                  className={`px-5 py-2 rounded text-sm font-medium transition-colors ${
                    activeWeek === week 
                      ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100' 
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Week {week}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                {sortedDays.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl transition-colors">
                    Schedule is empty for Week {activeWeek}. Use the Task Planner to set up your week.
                  </div>
                ) : (
                  sortedDays.map(day => (
                    <section key={day} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-300">{day}</h2>
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-grow transition-colors"></div>
                      </div>
                      
                      <div className="grid gap-4">
                        {tasksByDay[day].map(task => (
                          <div 
                            key={task.id} 
                            className={`group bg-white dark:bg-zinc-900 p-5 rounded-xl border transition-colors ${
                              task.progress === 100 ? 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50' : 'border-zinc-300 dark:border-zinc-700'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-5">
                              <div className="pr-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded transition-colors">
                                  {task.category}
                                </span>
                                <h3 className={`text-base font-medium mt-3 transition-colors ${task.progress === 100 ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                  {task.title}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                  {task.allocatedHours} hrs allocated
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xl font-bold">
                                  {task.progress}%
                                </span>
                                {task.progress < 100 && (
                                  <button 
                                    onClick={() => markDone(task.id)}
                                    className="text-[10px] font-bold text-white bg-zinc-900 hover:bg-zinc-800 dark:text-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2 py-1 rounded transition-colors"
                                  >
                                    Mark Done
                                  </button>
                                )}
                              </div>
                            </div>

                            <input 
                              type="range" 
                              min="0" max="100" step="5"
                              value={task.progress}
                              onChange={(e) => updateTask(task.id, 'progress', parseInt(e.target.value))}
                              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-300 mb-4 transition-colors"
                            />

                            <textarea
                              placeholder="Execution notes..."
                              value={task.note}
                              onChange={(e) => updateTask(task.id, 'note', e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-950 text-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 resize-none h-12 focus:h-24 transition-all duration-200"
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </div>

              <div className="xl:col-span-1">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 sticky top-8 flex flex-col h-[calc(100vh-4rem)] min-h-[500px] transition-colors">
                  <h2 className="text-lg font-bold mb-2">Brain Dump</h2>
                  <p className="text-xs text-zinc-500 mb-4">
                    Auto-saving scratchpad for ideas.
                  </p>
                  <textarea
                    value={globalNotes}
                    onChange={(e) => setGlobalNotes(e.target.value)}
                    placeholder="Start typing..."
                    className="flex-grow w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 resize-none leading-relaxed text-sm transition-colors"
                  />
                </div>
              </div>
              
            </div>
          </>
        )}
      </div>
    </div>
  );
}