import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, CheckCircle2 } from 'lucide-react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="flex bg-white shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full mx-auto my-12 min-h-[500px]">
      <div className="w-1/2 bg-gradient-to-br from-primary-600 to-teal-800 text-white p-12 flex flex-col justify-center hidden sm:flex">
        <HeartPulse className="w-16 h-16 mb-6 text-primary-100" />
        <h2 className="text-4xl font-extrabold mb-4">Join CareCommunity</h2>
        <p className="text-lg text-primary-100 mb-8">Empowering communities to make healthier choices and respond rapidly during emergencies.</p>
        <ul className="space-y-4">
          <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-3 text-teal-300" /> Discover top hospitals & doctors</li>
          <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-3 text-teal-300" /> Create and join health groups</li>
          <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-3 text-teal-300" /> Get instant emergency help</li>
        </ul>
      </div>

      <div className="w-full sm:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-gray-50">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create an Account</h2>
          <p className="text-sm text-gray-500 mt-2">Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link></p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 border border-red-200 text-sm">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:border-transparent focus:ring-primary-500 bg-white"
              placeholder="e.g. HealthHero99"
              value={username} onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:border-transparent focus:ring-primary-500 bg-white"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button type="submit" className="w-full mt-4 btn-primary py-3 rounded-xl shadow-md text-base shadow-primary-500/30">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
