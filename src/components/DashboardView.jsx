import React, { useState } from 'react';

const DAY_ORDER = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
const SORTED_DAYS = Object.keys(DAY_ORDER).sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]);

export default function DashboardView({ 
  tasks, updateTask, deleteTask, activeWeek, setActiveWeek, 
  calculateDailyScore, readOnly, friendName, exitFriendView,
  feedbacks = [], submitFeedback 
}) {
  const [selectedDay, setSelectedDay] = useState('All');
  const [feedbackInputs, setFeedbackInputs] = useState({});

  const filteredTasks = tasks.filter(t => t.week === activeWeek);
  const tasksByDay = filteredTasks.reduce((acc, task) => {
    if (!acc[task.day]) acc[task.day] = [];
    acc[task.day].push(task);
    return acc;
  }, {});

  // Determine which days to render based on the dropdown
  const daysToRender = selectedDay === 'All' ? SORTED_DAYS : [selectedDay];

  // Dynamically generate week options based on tasks, defaulting to at least 5 weeks
  const maxWeek = Math.max(5, activeWeek, ...tasks.map(t => t.week || 1));
  const weekOptions = Array.from({ length: maxWeek }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* Read-Only Banner */}
      {readOnly && (
        <div className="bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 p-4 rounded-xl flex justify-between items-center">
          <span className="font-bold">👀 Viewing @{friendName}'s Dashboard</span>
          <button onClick={exitFriendView} className="text-xs font-bold bg-teal-500/20 px-3 py-1.5 rounded hover:bg-teal-500/30 transition-colors">
            Return to My Dashboard
          </button>
        </div>
      )}

      {/* Week & Day Pagination Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        
        {/* NEW Week Dropdown */}
        <div className="flex items-center space-x-2 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 w-fit transition-colors">
          <span className="text-xs font-bold text-zinc-500 uppercase ml-2">Week:</span>
          <select 
            value={activeWeek} 
            onChange={(e) => setActiveWeek(parseInt(e.target.value))}
            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer pr-2 text-zinc-900 dark:text-zinc-100"
          >
            {weekOptions.map(w => (
              <option key={w} value={w}>Week {w}</option>
            ))}
          </select>
        </div>

        {/* Day Dropdown */}
        <div className="flex items-center space-x-2 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 w-fit transition-colors">
          <span className="text-xs font-bold text-zinc-500 uppercase ml-2">Filter Day:</span>
          <select 
            value={selectedDay} 
            onChange={(e) => setSelectedDay(e.target.value)}
            className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer pr-2 text-zinc-900 dark:text-zinc-100"
          >
            <option value="All">All Days</option>
            {SORTED_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {daysToRender.map(day => {
          const dayTasks = tasksByDay[day] || [];
          const score = calculateDailyScore(dayTasks);
          const dayFeedbacks = feedbacks.filter(f => f.day === day && f.week === activeWeek);
          
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
                    
                    {/* Only show delete button if NOT readOnly */}
                    {!readOnly && (
                      <button onClick={() => deleteTask(task.id)} className="absolute top-4 right-4 text-zinc-400 hover:text-rose-500 transition-colors">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    )}
                    
                    <div className="pr-8 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{task.category}</span>
                      <h3 className={`text-base font-medium mt-3 ${task.progress === 100 ? 'text-zinc-400 line-through' : ''}`}>{task.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1">{task.allocatedHours} hrs allocated</p>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <input 
                        type="range" min="0" max="100" step="5" 
                        value={task.progress} 
                        onChange={(e) => !readOnly && updateTask(task.id, 'progress', parseInt(e.target.value))} 
                        disabled={readOnly}
                        className={`flex-grow h-1 bg-zinc-200 dark:bg-zinc-800 rounded appearance-none accent-zinc-900 dark:accent-zinc-300 ${readOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`} 
                      />
                      <span className="text-sm font-bold w-10 text-right">{task.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mentorship Engine / Feedback UI */}
              <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase mb-3 text-zinc-500">Mentorship & Feedback</h4>
                
                {dayFeedbacks.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {dayFeedbacks.map(f => (
                      <div key={f.id} className="text-sm p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        <span className="font-bold text-teal-600 dark:text-teal-400">@{f.sender_username}: </span>
                        <span className="text-zinc-700 dark:text-zinc-300">{f.message}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 mb-4 italic">No feedback for this day yet.</p>
                )}
                
                {readOnly && (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={`Leave feedback for @${friendName}...`}
                      value={feedbackInputs[day] || ''}
                      onChange={e => setFeedbackInputs({...feedbackInputs, [day]: e.target.value})}
                      className="flex-grow bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:border-zinc-500"
                    />
                    <button 
                      onClick={() => {
                        submitFeedback(day, feedbackInputs[day] || '');
                        setFeedbackInputs({...feedbackInputs, [day]: ''});
                      }} 
                      className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-300 text-sm transition-colors"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}