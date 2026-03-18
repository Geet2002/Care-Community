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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Community Feed</h1>
          <p className="text-gray-500 mt-2">Discover queries and assist with emergencies.</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by asking a question or reporting an emergency!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="group block">
              <div className={`
                card sm:flex rounded-2xl overflow-hidden
                ${post.type === 'emergency' 
                  ? 'border-2 border-emergency-500 bg-emergency-50/50 hover:bg-emergency-50 animate-pulse-slow shadow-lg shadow-emergency-100' 
                  : 'hover:border-primary-300 hover:shadow-lg shadow-primary-100/50'}
              `}>
                <div className="p-6 sm:p-8 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {post.type === 'emergency' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-emergency-100 text-emergency-700 uppercase">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Emergency
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-primary-100 text-primary-700 uppercase">
                          <HelpCircle className="w-4 h-4 mr-1" />
                          Query
                        </span>
                      )}
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {user && post.author_id === user.id && (
                      <button 
                        onClick={(e) => handleDeletePost(e, post.id)} 
                        className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <h2 className={`text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors ${post.type === 'emergency' ? 'text-emergency-700' : 'text-gray-900'}`}>
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/50">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium text-gray-900 mr-2">{post.author_name || 'Anonymous User'}</span>
                      {post.location && (
                        <span className="flex items-center text-gray-500 before:content-['•'] before:mx-2">
                          <MapPin className="w-4 h-4 mr-1 text-emergency-500" />
                          {post.location}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-500 group-hover:text-primary-600 transition-colors font-medium">
                      <MessageCircle className="w-5 h-5 mr-1.5" />
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
