import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Users, Lock, Unlock, Plus, Search, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComms();
  }, []);

  const fetchComms = async () => {
    try {
      const res = await axios.get(`${API_URL}/communities`);
      setCommunities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickJoin = async (e, id) => {
    e.preventDefault(); // Prevent navigating to the detail page
    e.stopPropagation(); // Prevent bubbling up to the Link component wrapper
    try {
      const res = await axios.post(`${API_URL}/communities/${id}/join`);
      alert(res.data.message);
      fetchComms(); // Refresh to update user_status
    } catch (err) {
      alert(err.response?.data?.error || 'Error joining');
    }
  };

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Health Communities</h1>
          <p className="text-gray-500 mt-2">Join groups or create your own safe space.</p>
        </div>
        <Link to="/communities/create" className="btn-primary flex items-center justify-center shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Create Community
        </Link>
      </div>

      <div className="relative mb-8">
        <label className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search className="w-5 h-5" />
        </label>
        <input 
          type="search" 
          placeholder="Search for a community by name or description..." 
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 bg-white shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredCommunities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500 text-lg">No communities found matching "{search}"</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map(comm => (
            <Link key={comm.id} to={`/communities/${comm.id}`} className="block group">
              <div className="card p-6 h-full flex flex-col hover:border-primary-300 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${comm.is_private ? 'bg-orange-100 text-orange-600' : 'bg-primary-100 text-primary-600'}`}>
                    {comm.is_private ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-md">
                    {formatDistanceToNow(new Date(comm.created_at))} ago
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2 pr-20">{comm.name}</h3>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-6 flex-grow">{comm.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm font-medium text-gray-500">
                    <Users className="w-4 h-4 mr-1.5" /> {comm.member_count || 1} Member(s)
                  </div>
                  
                  <div className="relative z-10">
                    {!comm.user_status ? (
                      <button 
                        onClick={(e) => handleQuickJoin(e, comm.id)} 
                        className="text-sm font-semibold bg-gray-100 text-primary-700 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Join
                      </button>
                    ) : comm.user_status === 'pending' ? (
                      <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1.5 rounded-lg border border-yellow-200">Pending</span>
                    ) : (
                      <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1.5 rounded-lg flex items-center border border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Joined
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
