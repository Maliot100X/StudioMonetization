import React, { useState } from 'react';
import { X, Mail, User as UserIcon, Lock, Facebook } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      const name = email.split('@')[0] || 'User';
      const mockUser: User = {
        id: 'u-' + Date.now(),
        name: name,
        email: email,
        avatar: `https://picsum.photos/seed/${email}/100/100`,
        subscribers: 0,
        watchHours: 0,
        isMonetized: false,
        estimatedRevenue: 0,
        handle: '@' + name.toLowerCase(),
        banner: `https://picsum.photos/seed/${email}-banner/1200/200`,
        joinedDate: new Date().toLocaleDateString(),
      };
      onLogin(mockUser);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#212121] w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-[#3f3f3f] animate-slide-up">
        <div className="p-4 border-b border-[#3f3f3f] flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{isLogin ? 'Sign in' : 'Register'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#3f3f3f] rounded-full text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-4 mb-6">
            <button className="flex items-center justify-center gap-3 bg-white text-black py-2.5 rounded-full font-medium hover:bg-gray-200 transition-colors">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Continue with Google
            </button>
            <button className="flex items-center justify-center gap-3 bg-[#1877F2] text-white py-2.5 rounded-full font-medium hover:bg-[#166fe5] transition-colors">
              <Facebook className="w-5 h-5 fill-current" />
              Continue with Facebook
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#3f3f3f]"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#212121] text-gray-400">Or</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm text-gray-300 ml-1">Full Name</label>
                <div className="flex items-center bg-[#121212] border border-[#3f3f3f] rounded-lg px-3 py-2 focus-within:border-blue-500">
                  <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                  <input type="text" className="bg-transparent border-none outline-none text-white w-full" placeholder="John Doe" required />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm text-gray-300 ml-1">Email</label>
              <div className="flex items-center bg-[#121212] border border-[#3f3f3f] rounded-lg px-3 py-2 focus-within:border-blue-500">
                <Mail className="w-5 h-5 text-gray-400 mr-2" />
                <input 
                  type="email" 
                  className="bg-transparent border-none outline-none text-white w-full" 
                  placeholder="email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-300 ml-1">Password</label>
              <div className="flex items-center bg-[#121212] border border-[#3f3f3f] rounded-lg px-3 py-2 focus-within:border-blue-500">
                <Lock className="w-5 h-5 text-gray-400 mr-2" />
                <input 
                  type="password" 
                  className="bg-transparent border-none outline-none text-white w-full" 
                  placeholder="••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-full transition-colors mt-2">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                className="text-blue-400 font-medium ml-2 hover:underline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Register' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};