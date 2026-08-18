import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuthView({ setSession }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Can be username or email during login
  const [email, setEmail] = useState('');       // Explicitly for sign up
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
        // --- SIGN UP FLOW (Requires Email Verification) ---
        const { error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { username: username.trim() }
          }
        });
        
        if (authError) throw authError;
        alert('Success! Check your email for the verification link before logging in.');
        setIsSignUp(false); // Switch back to login mode after successful registration
      } else {
        // --- LOG IN FLOW (Username or Email + Password) ---
        let targetEmail = identifier.trim();

        // If user enters a username (no '@' symbol), fetch their email securely via our SQL function
        if (!targetEmail.includes('@')) {
          const { data: fetchedEmail, error: rpcError } = await supabase.rpc('get_email_by_username', { 
            lookup_username: targetEmail 
          });

          if (rpcError || !fetchedEmail) {
            throw new Error('Username not found. Please check your handle or use your email.');
          }
          targetEmail = fetchedEmail;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password,
        });
        
        if (error) throw error;
        setSession(data.session);
      }
    } catch (error) {
      if (error.message.includes('rate limit')) {
        setErrorMsg('Email rate limit reached. Please wait a moment or use a unique email address to test.');
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors shadow-sm">
      <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
        {isSignUp ? 'Initialize Protocol' : 'Access Protocol'}
      </h2>
      <p className="text-sm text-zinc-500 mb-6">
        {isSignUp 
          ? 'Sign up with your email to receive a verification link.' 
          : 'Log in using your Username or Email.'}
      </p>

      {errorMsg && (
        <div className="mb-4 p-3 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium border border-rose-500/20 leading-relaxed">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Username</label>
              <input 
                type="text" 
                required
                placeholder="e.g. fetebuilds"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Email (Verification Required)</label>
              <input 
                type="email" 
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </>
        )}

        {!isSignUp && (
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Username or Email</label>
            <input 
              type="text" 
              required
              placeholder="Enter your username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Password</label>
          <input 
            type="password" 
            required
            placeholder="••••••••"
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
          type="button"
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