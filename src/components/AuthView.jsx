import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuthView({ setSession }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // 1. Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        // 2. Create their public profile
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: authData.user.id, username: username }]);
          if (profileError) throw profileError;
        }
        
        alert('Success! Check your email for a confirmation link.');
      } else {
        // Log in the user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSession(data.session);
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
      <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
        {isSignUp ? 'Initialize Protocol' : 'Access Protocol'}
      </h2>
      <p className="text-sm text-zinc-500 mb-6">
        {isSignUp 
          ? 'Create a cloud account to unlock social accountability.' 
          : 'Log in to sync your dashboard and connections.'}
      </p>

      {errorMsg && (
        <div className="mb-4 p-3 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-bold border border-rose-500/20">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Username</label>
            <input 
              type="text" 
              required={isSignUp}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMsg('');
          }} 
          className="text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
        >
          {isSignUp ? 'Already have an account? Log in.' : 'Need a cloud account? Sign up.'}
        </button>
      </div>
    </div>
  );
}