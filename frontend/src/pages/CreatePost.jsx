import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, FileText, MapPin, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function CreatePost() {
  const navigate = useNavigate();
  const loc = useLocation();
  const queryParams = new URLSearchParams(loc.search);
  
  const [type, setType] = useState(queryParams.get('type') || 'query');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Auto-focus location if it's an emergency
  useEffect(() => {
    if (type === 'emergency' && navigator.geolocation && !location) {
      navigator.geolocation.getCurrentPosition((pos) => {
        // Just mocking reverse geocoding for UI purposes
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      }, () => {
        // user denied or error
      });
    }
  }, [type, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/posts`, {
        title,
        content,
        type,
        location: type === 'emergency' ? location : null
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
        {/* Header gradient line */}
        <div className={`h-2 w-full ${type === 'emergency' ? 'bg-gradient-to-r from-emergency-500 to-orange-500' : 'bg-gradient-to-r from-primary-500 to-teal-500'}`}></div>
        
        <div className="p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
            {type === 'emergency' ? 'Report an Emergency' : 'Ask the Community'}
          </h1>
          
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8 space-x-1">
            <button
              type="button"
              className={`flex-1 flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                type === 'query' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setType('query')}
            >
              <FileText className="w-4 h-4 mr-2" />
              General Query
            </button>
            <button
              type="button"
              className={`flex-1 flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                type === 'emergency' ? 'bg-emergency-500 text-white shadow shadow-emergency-500/30' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setType('emergency')}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Emergency Alert
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                {type === 'emergency' ? 'What happened?' : 'What do you need help with?'}
              </label>
              <input
                id="title"
                required
                type="text"
                placeholder={type === 'emergency' ? "e.g., Car accident near highway, need immediate hospital suggestions" : "e.g., Looking for a good pediatrician in downtown"}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:border-transparent focus:ring-primary-500 transition-shadow transition-colors bg-gray-50 focus:bg-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <textarea
                id="content"
                required
                rows={5}
                placeholder="Provide more context..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:border-transparent focus:ring-primary-500 transition-shadow transition-colors bg-gray-50 focus:bg-white resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {type === 'emergency' && (
              <div className="animate-fade-in">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-emergency-500" />
                  Exact Location
                </label>
                <input
                  id="location"
                  required
                  type="text"
                  placeholder="e.g., 5th Avenue crossing Main Street"
                  className="w-full px-4 py-3 rounded-xl border border-emergency-300 focus:ring-2 focus:border-transparent focus:ring-emergency-500 transition-shadow bg-emergency-50 focus:bg-white"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-transparent rounded-lg mr-3 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all ${
                  type === 'emergency' 
                    ? 'bg-emergency-600 hover:bg-emergency-500 text-white focus:ring-emergency-500 focus:ring-offset-emergency-50' 
                    : 'bg-primary-600 hover:bg-primary-500 text-white focus:ring-primary-500 focus:ring-offset-primary-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {loading ? 'Posting...' : 'Post to Community'}
                {!loading && <Send className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
