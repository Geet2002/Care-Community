import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, HelpCircle, MessageCircle, MapPin, Clock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if(!window.confirm('Delete this post?')) return;
    try {
      await axios.delete(`${API_URL}/posts/${id}`);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      alert('Error deleting post');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-300 rounded-full blur-3xl opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-200 rounded-full blur-3xl opacity-20 -ml-20 -mb-20 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Community Feed</h1>
          <p className="text-gray-500 mt-2 text-lg">Discover queries and assist with health emergencies.</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
          <HelpCircle className="mx-auto h-12 w-12 text-primary-200" />
          <h3 className="mt-4 text-lg font-bold text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by asking a question or reporting an emergency!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="group block outline-none">
              <div className={`
                bg-white border sm:flex rounded-3xl overflow-hidden transition-all duration-300
                ${post.type === 'emergency' 
                  ? 'border-emergency-200 bg-emergency-50/30 hover:bg-emergency-50 animate-pulse-slow shadow-md hover:shadow-xl shadow-emergency-100/50 hover:shadow-emergency-200/50' 
                  : 'border-gray-100 hover:border-primary-200 hover:shadow-xl shadow-sm hover:shadow-primary-100/60 transform hover:-translate-y-1'}
              `}>
                <div className="p-6 sm:p-8 flex-1 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {post.type === 'emergency' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-emergency-100 text-emergency-700 uppercase">
                          <AlertTriangle className="w-4 h-4 mr-1.5" />
                          Emergency
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-primary-50 text-primary-700 uppercase border border-primary-100">
                          <HelpCircle className="w-4 h-4 mr-1.5" />
                          Query
                        </span>
                      )}
                      <span className="text-sm text-gray-400 flex items-center font-medium">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {user && post.author_id === user.id && (
                      <button 
                        onClick={(e) => handleDeletePost(e, post.id)} 
                        className="p-2 text-gray-300 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <h2 className={`text-2xl font-bold mb-3 transition-colors ${post.type === 'emergency' ? 'text-emergency-700 group-hover:text-emergency-800' : 'text-gray-900 group-hover:text-primary-700'}`}>
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 line-clamp-2 mb-6 leading-relaxed text-base">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-50">
                    <div className="flex items-center text-sm text-gray-500 flex-wrap gap-3">
                      <span className="font-semibold text-gray-900">{post.author_name || 'Anonymous User'}</span>
                      {post.community_name && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-50 text-gray-600 border border-gray-100">
                          {post.community_name}
                        </span>
                      )}
                      {post.location && (
                        <span className="flex flex-wrap items-center text-gray-500 before:content-['•'] before:mx-2 before:text-gray-300">
                          <MapPin className="w-4 h-4 mr-1 text-primary-500" />
                          {post.location}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-400 group-hover:text-primary-600 transition-colors font-bold bg-gray-50 group-hover:bg-primary-50 px-3 py-1.5 rounded-full">
                      <MessageCircle className="w-4 h-4 mr-1.5" />
                      {post.comment_count || 0} Responses
                    </div>
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
