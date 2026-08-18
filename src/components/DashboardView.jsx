import React from 'react';

const DAY_ORDER = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
const SORTED_DAYS = Object.keys(DAY_ORDER).sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]);

export default function DashboardView({ tasks, setTasks, activeWeek, setActiveWeek, calculateDailyScore }) {
  const filteredTasks = tasks.filter(t => t.week === activeWeek);
  const tasksByDay = filteredTasks.reduce((acc, task) => {
    if (!acc[task.day]) acc[task.day] = [];
    acc[task.day].push(task);
    return acc;
  }, {});

  const updateTask = (id, field, value) => setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 w-fit transition-colors">
        <button onClick={() => setActiveWeek(Math.max(1, activeWeek - 1))} className="px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 font-bold">&larr;</button>
        <span className="font-bold text-sm min-w-[4rem] text-center">Week {activeWeek}</span>
        <button onClick={() => setActiveWeek(activeWeek + 1)} className="px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 font-bold">&rarr;</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {SORTED_DAYS.map(day => {
          const dayTasks = tasksByDay[day] || [];
          const score = calculateDailyScore(dayTasks);
          
          if (dayTasks.length === 0) return null;

          return (
            <section key={day} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-300">{day}</h2>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${score >= 80 ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : score >= 50 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                    Score: {score}%
                  </span>
                </div>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-grow transition-colors"></div>
              </div>
              
              <div className="grid gap-4">
                {dayTasks.map(task => (
                  <div key={task.id} className="group relative bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-300 dark:border-zinc-700 transition-colors">
                    <button onClick={() => deleteTask(task.id)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 transition-colors">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    
                    <div className="pr-8 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{task.category}</span>
                      <h3 className={`text-base font-medium mt-3 ${task.progress === 100 ? 'text-zinc-400 line-through' : ''}`}>{task.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1">{task.allocatedHours} hrs allocated</p>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <input type="range" min="0" max="100" step="5" value={task.progress} onChange={(e) => updateTask(task.id, 'progress', parseInt(e.target.value))} className="flex-grow h-1 bg-zinc-200 dark:bg-zinc-800 rounded appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-300" />
                      <span className="text-sm font-bold w-10 text-right">{task.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}