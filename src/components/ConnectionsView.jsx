import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ConnectionsView({ session, setViewingFriend, setCurrentView }) {
  const [searchUsername, setSearchUsername] = useState('');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });

  const myId = session?.user?.id;

  useEffect(() => {
    if (myId) fetchNetwork();
  }, [myId]);

  const fetchNetwork = async () => {
    const { data: pendingData } = await supabase
      .from('connections')
      .select('id, requester_id')
      .eq('receiver_id', myId)
      .eq('status', 'pending');

    if (pendingData && pendingData.length > 0) {
      const requesterIds = pendingData.map(c => c.requester_id);
      const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', requesterIds);
      const enrichedPending = pendingData.map(conn => ({
        ...conn,
        username: profiles?.find(p => p.id === conn.requester_id)?.username || 'Unknown User'
      }));
      setIncomingRequests(enrichedPending);
    } else {
      setIncomingRequests([]);
    }

    const { data: acceptedData } = await supabase
      .from('connections')
      .select('requester_id, receiver_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${myId},receiver_id.eq.${myId}`);

    if (acceptedData && acceptedData.length > 0) {
      const friendIds = acceptedData.map(c => c.requester_id === myId ? c.receiver_id : c.requester_id);
      const { data: friendProfiles } = await supabase.from('profiles').select('id, username').in('id', friendIds);
      setFriends(friendProfiles || []);
    } else {
      setFriends([]);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!searchUsername.trim()) return;

    // FIX 2: Changed .eq() to .ilike() for case-insensitive searching
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', searchUsername.trim()) 
      .maybeSingle(); // maybeSingle prevents a hard error crash if 0 rows are found

    if (profileError || !targetProfile) return setMessage({ text: 'User not found. Check the username.', type: 'error' });
    if (targetProfile.id === myId) return setMessage({ text: 'You cannot connect with yourself.', type: 'error' });

    const { error: insertError } = await supabase.from('connections').insert([{ requester_id: myId, receiver_id: targetProfile.id, status: 'pending' }]);

    if (insertError) {
      setMessage({ text: insertError.code === '23505' ? 'Connection already exists or is pending.' : 'Failed to send request.', type: 'error' });
    } else {
      setMessage({ text: `Request sent to ${searchUsername}!`, type: 'success' });
      setSearchUsername('');
    }
  };

  const handleAccept = async (connectionId) => {
    await supabase.from('connections').update({ status: 'accepted' }).eq('id', connectionId);
    fetchNetwork();
  };

  const handleReject = async (connectionId) => {
    await supabase.from('connections').delete().eq('id', connectionId);
    fetchNetwork();
  };

  const handleViewFriend = (friend) => {
    setViewingFriend(friend);
    setCurrentView('dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
        <h2 className="text-xl font-bold mb-2">Build Your Network</h2>
        <p className="text-sm text-zinc-500 mb-6">Connect with peers to share schedules and accountability.</p>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded text-sm font-bold border ${message.type === 'error' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-teal-500/10 text-teal-600 border-teal-500/20'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSendRequest} className="flex gap-4">
          <input 
            type="text" 
            name="friend-search" 
            autoComplete="off" // FIX 1: Forces the browser to stop autofilling emails
            placeholder="Enter username..." 
            value={searchUsername} 
            onChange={(e) => setSearchUsername(e.target.value)} 
            className="flex-grow bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:border-zinc-500" 
          />
          <button type="submit" className="px-6 py-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-300 transition-colors">Send Request</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
          <h3 className="text-lg font-bold mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Pending Requests</h3>
          {incomingRequests.length === 0 ? <p className="text-sm text-zinc-500">No pending requests.</p> : (
            <div className="space-y-3">
              {incomingRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="font-medium text-sm">@{req.username}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(req.id)} className="text-xs font-bold bg-teal-500/10 text-teal-600 px-3 py-1.5 rounded hover:bg-teal-500/20">Accept</button>
                    <button onClick={() => handleReject(req.id)} className="text-xs font-bold bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded hover:bg-rose-500/20">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
          <h3 className="text-lg font-bold mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">My Grid</h3>
          {friends.length === 0 ? <p className="text-sm text-zinc-500">Your network is empty.</p> : (
            <div className="space-y-3">
              {friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="font-medium text-sm">@{friend.username}</span>
                  <button onClick={() => handleViewFriend(friend)} className="text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
                    View Dashboard
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}