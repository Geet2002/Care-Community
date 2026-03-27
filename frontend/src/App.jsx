import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { HeartPulse, PlusCircle, AlertCircle, Home, User, LogOut, Users, Bell } from 'lucide-react';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Communities from './pages/Communities';
import CreateCommunity from './pages/CreateCommunity';
import CommunityDetail from './pages/CommunityDetail';
import Notifications from './pages/Notifications';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      axios.get(`${API_URL}/notifications`).then(res => {
        const unread = res.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }).catch(console.error);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary-100 p-2 rounded-lg group-hover:bg-primary-200 transition-colors">
              <HeartPulse className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-primary-600 bg-gradient-to-r from-primary-600 to-teal-600">
              CareCommunity
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Feed">
              <Home className="w-5 h-5" />
            </Link>

            {user ? (
              <>
                <Link to="/communities" className="text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Communities">
                  <Users className="w-5 h-5" />
                </Link>
                
                <Link to="/notifications" className="relative text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Notifications">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Link to="/create?type=query" className="btn-primary hidden sm:flex items-center space-x-2 ml-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>Ask</span>
                </Link>
                <Link to="/create?type=emergency" className="btn-emergency hidden md:flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Emergency</span>
                </Link>
                
                <div className="pl-4 border-l border-gray-200 flex items-center space-x-4 ml-4">
                  <span className="hidden sm:flex items-center text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 mr-1.5 text-gray-400" />
                    {user.username}
                  </span>
                  <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors p-1" title="Log Out">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="pl-4 border-l border-gray-200 flex items-center space-x-3 ml-2">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">Sign In</Link>
                <Link to="/signup" className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-800 transition-colors">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />

          <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
              <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
              <Route path="/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
              
              <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
              <Route path="/communities/create" element={<ProtectedRoute><CreateCommunity /></ProtectedRoute>} />
              <Route path="/communities/:id" element={<ProtectedRoute><CommunityDetail /></ProtectedRoute>} />
              
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
