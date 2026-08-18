import React from 'react';

export default function Header({ isDarkMode, setIsDarkMode, currentView, setCurrentView, debtHours, handleResetDebt, session }) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors shadow-sm">
      <div className="w-full md:w-auto text-center md:text-left flex flex-col items-center md:items-start">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Discipline Protocol</h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-400">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div className="flex gap-4 mt-4 justify-center md:justify-start">
          {['dashboard', 'planner', 'braindump', 'account'].map((view) => (
            <button 
              key={view}
              onClick={() => setCurrentView(view)}
              className={`text-sm font-medium pb-1 border-b-2 capitalize transition-colors ${currentView === view ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              {view === 'braindump' ? 'Brain Dump' : view === 'account' && session ? 'Cloud (Active)' : view}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-6 md:mt-0 flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg min-w-[200px] justify-center transition-colors">
        <div className="text-right w-full">
          <div className="flex justify-end items-center gap-2 mb-1">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Weekly Debt</p>
            {/* Reset Button */}
            {debtHours > 0 && (
              <button 
                onClick={handleResetDebt} 
                className="text-[10px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded hover:bg-rose-500/20 transition-colors font-bold"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-bold text-rose-500">{debtHours}</span>
            <span className="text-sm text-zinc-500 font-medium">hrs</span>
          </div>
        </div>
      </div>
    </header>
  );
}