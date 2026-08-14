import React, { useState, useEffect } from 'react';

const initialTasks = [
  { id: 1, week: 1, day: 'Friday', category: 'Reading', title: 'Read ~19 pages of Show Your Work! (Morning)', allocatedHours: 0.5, progress: 0, note: '' },
  { id: 2, week: 1, day: 'Friday', category: 'Coding', title: 'React Core: Virtual DOM, JSX, props, useState', allocatedHours: 4, progress: 0, note: '' },
  { id: 3, week: 1, day: 'Friday', category: 'Habit', title: 'Batch Cook (Meals for Fri & Sat)', allocatedHours: 1, progress: 0, note: '' },
  { id: 4, week: 1, day: 'Friday', category: 'Hustle', title: '1 X post (React concept) & Draft Upwork template', allocatedHours: 2.5, progress: 0, note: '' }
];

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('protocol_tasks_v3');
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  });

  const [globalNotes, setGlobalNotes] = useState(() => {
    return localStorage.getItem('protocol_notes_v3') || '';
  });

  const [activeWeek, setActiveWeek] = useState(1);
  const [debtHours, setDebtHours] = useState(0);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'planner'

  // Form State for New Tasks
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Coding',
    week: 1,
    day: 'Monday',
    hours: 1
  });

  // Persistence
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
    setNewTask({ ...newTask, title: '' }); // Reset title but keep day/week context
    setCurrentView('dashboard'); // Auto-switch back to see the new task
    setActiveWeek(parseInt(newTask.week));
  };

  // Filter and Group
  const filteredTasks = tasks.filter(t => t.week === activeWeek);
  const tasksByDay = filteredTasks.reduce((acc, task) => {
    if (!acc[task.day]) acc[task.day] = [];
    acc[task.day].push(task);
    return acc;
  }, {});

  const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
  const sortedDays = Object.keys(tasksByDay).sort((a, b) => dayOrder[a] - dayOrder[b]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans selection:bg-zinc-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-zinc-900 p-8 rounded-xl border border-zinc-800">
          <div className="w-full md:w-auto text-center md:text-left">
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
              Discipline Protocol
            </h1>
            <div className="flex gap-4 mt-4 justify-center md:justify-start">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${currentView === 'dashboard' ? 'border-zinc-100 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('planner')}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${currentView === 'planner' ? 'border-zinc-100 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                Task Planner
              </button>
            </div>
          </div>
          
          <div className="mt-6 md:mt-0 flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-4 rounded-lg min-w-[200px] justify-center">
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Sunday Debt</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-zinc-100">{debtHours}</span>
                <span className="text-sm text-zinc-500 font-medium">hrs</span>
              </div>
            </div>
          </div>
        </header>

        {currentView === 'planner' ? (
          /* PLANNER VIEW */
          <div className="max-w-2xl mx-auto bg-zinc-900 p-8 rounded-xl border border-zinc-800">
            <h2 className="text-xl font-bold mb-6 border-b border-zinc-800 pb-4">Schedule a New Task</h2>
            <form onSubmit={handleAddTask} className="space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Task Title</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="e.g. Build API endpoints for mobile app"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Category</label>
                  <select 
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500"
                  >
                    <option>Coding</option>
                    <option>Reading</option>
                    <option>Hustle</option>
                    <option>Habit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Allocated Hours</label>
                  <input 
                    type="number" 
                    min="0.5" step="0.5"
                    required
                    value={newTask.hours}
                    onChange={(e) => setNewTask({...newTask, hours: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Week</label>
                  <select 
                    value={newTask.week}
                    onChange={(e) => setNewTask({...newTask, week: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500"
                  >
                    {[1, 2, 3, 4].map(w => <option key={w} value={w}>Week {w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Day</label>
                  <select 
                    value={newTask.day}
                    onChange={(e) => setNewTask({...newTask, day: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full mt-4 bg-zinc-100 text-zinc-950 font-bold py-3 rounded-lg hover:bg-zinc-300 transition-colors">
                Add to Schedule
              </button>
            </form>
          </div>
        ) : (
          /* DASHBOARD VIEW */
          <>
            <div className="flex space-x-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800 w-fit">
              {[1, 2, 3, 4].map(week => (
                <button
                  key={week}
                  onClick={() => setActiveWeek(week)}
                  className={`px-5 py-2 rounded text-sm font-medium transition-colors ${
                    activeWeek === week 
                      ? 'bg-zinc-800 text-zinc-100' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Week {week}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                {sortedDays.length === 0 ? (
                  <div className="text-center py-20 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                    Schedule is empty for Week {activeWeek}. Use the Task Planner to set up your week.
                  </div>
                ) : (
                  sortedDays.map(day => (
                    <section key={day} className="space-y-4">
                      <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-zinc-300">{day}</h2>
                        <div className="h-px bg-zinc-800 flex-grow"></div>
                      </div>
                      
                      <div className="grid gap-4">
                        {tasksByDay[day].map(task => (
                          <div 
                            key={task.id} 
                            className={`group bg-zinc-900 p-5 rounded-xl border transition-colors ${
                              task.progress === 100 ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-700'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-5">
                              <div className="pr-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                                  {task.category}
                                </span>
                                <h3 className={`text-base font-medium mt-3 ${task.progress === 100 ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                                  {task.title}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                  {task.allocatedHours} hrs allocated
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xl font-bold text-zinc-300">
                                  {task.progress}%
                                </span>
                                {task.progress < 100 && (
                                  <button 
                                    onClick={() => markDone(task.id)}
                                    className="text-[10px] font-bold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition-colors"
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
                              className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-300 mb-4"
                            />

                            <textarea
                              placeholder="Execution notes..."
                              value={task.note}
                              onChange={(e) => updateTask(task.id, 'note', e.target.value)}
                              className="w-full bg-zinc-950 text-sm text-zinc-300 border border-zinc-800 rounded-lg p-3 focus:outline-none focus:border-zinc-500 resize-none h-12 focus:h-24 transition-all duration-200"
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </div>

              <div className="xl:col-span-1">
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 sticky top-8 flex flex-col h-[calc(100vh-4rem)] min-h-[500px]">
                  <h2 className="text-lg font-bold text-zinc-200 mb-2">Brain Dump</h2>
                  <p className="text-xs text-zinc-500 mb-4">
                    Auto-saving scratchpad for ideas.
                  </p>
                  <textarea
                    value={globalNotes}
                    onChange={(e) => setGlobalNotes(e.target.value)}
                    placeholder="Start typing..."
                    className="flex-grow w-full bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-lg p-4 focus:outline-none focus:border-zinc-600 resize-none leading-relaxed text-sm"
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