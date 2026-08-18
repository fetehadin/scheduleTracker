import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import PlannerView from './components/PlannerView';
import BrainDumpView from './components/BrainDumpView';
import AuthView from './components/AuthView';
import ConnectionsView from './components/ConnectionsView';

export default function App() {
  const [session, setSession] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('protocol_theme');
    return savedTheme !== null ? JSON.parse(savedTheme) : true; 
  });

  // Start with whatever is in local storage (Local Mode)
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

  const [forgivenDebt, setForgivenDebt] = useState(() => {
    const saved = localStorage.getItem('protocol_forgiven_prod');
    return saved ? JSON.parse(saved) : {};
  });

  const [viewingFriend, setViewingFriend] = useState(null); 
  const [friendTasks, setFriendTasks] = useState([]);

  // --- AUTHENTICATION & DATA SYNC ENGINE ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setCurrentView('dashboard');
        syncCloudTasks(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- FETCH FRIEND'S READ-ONLY DASHBOARD ---
  useEffect(() => {
    const fetchFriendTasks = async () => {
      if (!viewingFriend) return;
      // Because we set up Row-Level Security, Supabase will automatically
      // reject this if we aren't friends, and only return is_shareable = true.
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', viewingFriend.id);
        
      if (!error && data) {
        setFriendTasks(data.map(t => ({
          id: t.id,
          title: t.title,
          category: t.category,
          allocatedHours: t.allocated_hours,
          progress: t.progress,
          week: t.week,
          day: t.day,
          note: t.note
        })));
      }
    };
    fetchFriendTasks();
  }, [viewingFriend]);

  const syncCloudTasks = async (userId) => {
    // 1. The Migration: Move local tasks to cloud
    const localTasks = JSON.parse(localStorage.getItem('protocol_tasks_prod') || '[]');
    if (localTasks.length > 0) {
      const formattedTasks = localTasks.map(t => ({
        user_id: userId,
        title: t.title,
        category: t.category,
        allocated_hours: t.allocatedHours,
        progress: t.progress,
        week: t.week,
        day: t.day,
        note: t.note || '',
        is_shareable: t.is_shareable !== undefined ? t.is_shareable : true
      }));
      
      await supabase.from('tasks').insert(formattedTasks);
      localStorage.removeItem('protocol_tasks_prod'); // Wipe local trace
    }

    // 2. The Fetch: Pull master data from cloud
    const { data, error } = await supabase.from('tasks').select('*');
    if (!error && data) {
      const mappedTasks = data.map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        allocatedHours: t.allocated_hours, // Convert snake_case to camelCase for React
        progress: t.progress,
        week: t.week,
        day: t.day,
        note: t.note,
        is_shareable: t.is_shareable
      }));
      setTasks(mappedTasks);
    }
  };

  // --- HYBRID DATA MUTATORS ---
  const addTask = async (taskData) => {
    if (session) {
      const dbTask = {
        user_id: session.user.id,
        title: taskData.title,
        category: taskData.category,
        allocated_hours: parseFloat(taskData.hours),
        week: parseInt(taskData.week),
        day: taskData.day,
        is_shareable: taskData.is_shareable,
        progress: 0,
        note: ''
      };
      const { data, error } = await supabase.from('tasks').insert([dbTask]).select();
      if (!error && data) {
        setTasks(prev => [...prev, { ...taskData, id: data[0].id, allocatedHours: data[0].allocated_hours, progress: 0, note: '' }]);
      }
    } else {
      setTasks(prev => [...prev, { ...taskData, id: Date.now(), allocatedHours: parseFloat(taskData.hours), progress: 0, note: '' }]);
    }
  };

  const updateTask = async (id, field, value) => {
    // Optimistic UI Update (instant feel for the user)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));

    if (session) {
      const dbField = field === 'allocatedHours' ? 'allocated_hours' : field;
      await supabase.from('tasks').update({ [dbField]: value }).eq('id', id);
    }
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (session) {
      await supabase.from('tasks').delete().eq('id', id);
    }
  };

  // --- LOCAL PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('protocol_theme', JSON.stringify(isDarkMode));
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Only write to localStorage if we are offline
  useEffect(() => { if (!session) localStorage.setItem('protocol_tasks_prod', JSON.stringify(tasks)); }, [tasks, session]);
  useEffect(() => { localStorage.setItem('protocol_dumps_prod', JSON.stringify(brainDumps)); }, [brainDumps]);
  useEffect(() => { localStorage.setItem('protocol_forgiven_prod', JSON.stringify(forgivenDebt)); }, [forgivenDebt]);

  // --- ENGINE CALCULATIONS ---
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
          session={session}
        />

        {currentView === 'dashboard' && <DashboardView tasks={tasks} updateTask={updateTask} deleteTask={deleteTask} activeWeek={activeWeek} setActiveWeek={setActiveWeek} calculateDailyScore={calculateDailyScore} />}
        {currentView === 'planner' && <PlannerView addTask={addTask} activeWeek={activeWeek} setActiveWeek={setActiveWeek} setCurrentView={setCurrentView} />}
        {currentView === 'braindump' && <BrainDumpView brainDumps={brainDumps} setBrainDumps={setBrainDumps} />}
        {currentView === 'account' && (
          session ? (
            <div className="max-w-md mx-auto text-center mt-12 space-y-4">
              <h2 className="text-2xl font-bold">Cloud Sync Active</h2>
              <p className="text-zinc-500">You are securely connected to the protocol grid.</p>
              <button 
                onClick={() => supabase.auth.signOut()} 
                className="px-6 py-2 bg-rose-500/10 text-rose-500 font-bold rounded-lg hover:bg-rose-500/20 transition-colors"
              >
                Disconnect (Log Out)
              </button>
            </div>
          ) : (
            <AuthView setSession={setSession} />
          )
        )}
        {currentView === 'network' && (
           session ? <ConnectionsView session={session} /> : (
             <div className="text-center mt-20 text-zinc-500">Sign in to access the network grid.</div>
           )
        )}

        {currentView === 'dashboard' && (
          <DashboardView 
            tasks={viewingFriend ? friendTasks : tasks} // Swap data source
            updateTask={updateTask} 
            deleteTask={deleteTask} 
            activeWeek={activeWeek} 
            setActiveWeek={setActiveWeek} 
            calculateDailyScore={calculateDailyScore}
            readOnly={!!viewingFriend} // Pass readOnly flag
            friendName={viewingFriend?.username}
            exitFriendView={() => setViewingFriend(null)} // Close button
          />
        )}
        {currentView === 'planner' && <PlannerView addTask={addTask} activeWeek={activeWeek} setActiveWeek={setActiveWeek} setCurrentView={setCurrentView} />}
        {currentView === 'braindump' && <BrainDumpView brainDumps={brainDumps} setBrainDumps={setBrainDumps} />}
        {currentView === 'network' && (
           session ? <ConnectionsView session={session} setViewingFriend={setViewingFriend} setCurrentView={setCurrentView} /> : (
             <div className="text-center mt-20 text-zinc-500">Sign in to access the network grid.</div>
           )
        )}
        
      </div>
    </div>
  );
}