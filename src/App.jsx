import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import PlannerView from './components/PlannerView';
import BrainDumpView from './components/BrainDumpView';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('protocol_theme');
    return savedTheme !== null ? JSON.parse(savedTheme) : true; 
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('protocol_tasks_prod');
    return saved ? JSON.parse(saved) : []; 
  });

  const [brainDumps, setBrainDumps] = useState(() => {
    const saved = localStorage.getItem('protocol_dumps_prod');
    return saved ? JSON.parse(saved) : []; 
  });

  const [activeWeek, setActiveWeek] = useState(1);
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [debtHours, setDebtHours] = useState(0);

  // Tracks manually forgiven debt per week
  const [forgivenDebt, setForgivenDebt] = useState(() => {
    const saved = localStorage.getItem('protocol_forgiven_prod');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('protocol_theme', JSON.stringify(isDarkMode));
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => { localStorage.setItem('protocol_tasks_prod', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('protocol_dumps_prod', JSON.stringify(brainDumps)); }, [brainDumps]);
  useEffect(() => { localStorage.setItem('protocol_forgiven_prod', JSON.stringify(forgivenDebt)); }, [forgivenDebt]);

  // WEEKLY Debt Engine Calculation
  useEffect(() => {
    const weeklyTasks = tasks.filter(t => t.week === activeWeek);
    const rawWeeklyDebt = weeklyTasks.reduce((sum, task) => {
      const missedPercentage = (100 - task.progress) / 100;
      return sum + (task.allocatedHours * missedPercentage);
    }, 0);
    
    const offset = forgivenDebt[activeWeek] || 0;
    const finalDebt = Math.max(0, rawWeeklyDebt - offset);
    
    setDebtHours(finalDebt.toFixed(1));
  }, [tasks, activeWeek, forgivenDebt]);

  const handleResetDebt = () => {
    const weeklyTasks = tasks.filter(t => t.week === activeWeek);
    const currentDebt = weeklyTasks.reduce((sum, task) => {
      const missedPercentage = (100 - task.progress) / 100;
      return sum + (task.allocatedHours * missedPercentage);
    }, 0);
    setForgivenDebt({ ...forgivenDebt, [activeWeek]: currentDebt });
  };

  const calculateDailyScore = (dayTasks) => {
    if (!dayTasks || dayTasks.length === 0) return 0;
    const totalHours = dayTasks.reduce((sum, t) => sum + t.allocatedHours, 0);
    const completedHours = dayTasks.reduce((sum, t) => sum + (t.allocatedHours * (t.progress / 100)), 0);
    return totalHours === 0 ? 0 : Math.round((completedHours / totalHours) * 100);
  };

  return (
    <div className="min-h-screen transition-colors duration-200 bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 p-4 md:p-8 font-sans selection:bg-zinc-300 dark:selection:bg-zinc-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <Header 
          isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} 
          currentView={currentView} setCurrentView={setCurrentView} 
          debtHours={debtHours} handleResetDebt={handleResetDebt} 
        />

        {currentView === 'dashboard' && <DashboardView tasks={tasks} setTasks={setTasks} activeWeek={activeWeek} setActiveWeek={setActiveWeek} calculateDailyScore={calculateDailyScore} />}
        {currentView === 'planner' && <PlannerView tasks={tasks} setTasks={setTasks} activeWeek={activeWeek} setActiveWeek={setActiveWeek} setCurrentView={setCurrentView} />}
        {currentView === 'braindump' && <BrainDumpView brainDumps={brainDumps} setBrainDumps={setBrainDumps} />}
        
      </div>
    </div>
  );
}