import React, { useState } from 'react';
import { Menu, Search, Mic, Video, Bell, User as UserIcon, ArrowLeft, PlusSquare, Settings, LogOut, UserCircle } from 'lucide-react';
import { Button } from './Button';
import { User, ViewState } from '../types';

interface HeaderProps {
  onSearch: (query: string) => void;
  toggleSidebar: () => void;
  isMobileSearchOpen: boolean;
  setMobileSearchOpen: (open: boolean) => void;
  currentUser: User | null;
  onAuthClick: () => void;
  onUploadClick: () => void;
  viewState: ViewState;
  onBack: () => void;
  onLogout?: () => void;
  onMyChannel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  toggleSidebar, 
  isMobileSearchOpen, 
  setMobileSearchOpen,
  currentUser,
  onAuthClick,
  onUploadClick,
  viewState,
  onBack,
  onLogout,
  onMyChannel
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setMobileSearchOpen(false);
    }
  };

  // Mobile Search View
  if (isMobileSearchOpen) {
    return (
      <div className="sticky top-0 z-50 bg-yt-base flex items-center p-2 gap-2 border-b border-yt-border">
        <Button variant="icon" onClick={() => setMobileSearchOpen(false)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center bg-[#272727] rounded-full px-4 py-1.5">
           <input 
            type="text" 
            placeholder="Search YouTube" 
            className="bg-transparent border-none outline-none text-white flex-1 placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </form>
        <Button variant="icon" className="bg-[#121212]">
            <Mic className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  // Default Header View
  return (
    <header className="sticky top-0 z-50 bg-yt-base/95 backdrop-blur-sm flex justify-between items-center px-4 h-14 md:h-16 border-b border-transparent md:border-yt-border/50">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button variant="icon" className="hidden md:block" onClick={toggleSidebar}>
          <Menu className="w-6 h-6" />
        </Button>
        
        {/* Mobile Back Button (Only when watching) */}
        {viewState === ViewState.WATCH && (
           <Button variant="icon" className="md:hidden" onClick={onBack}>
              <ArrowLeft className="w-6 h-6" />
           </Button>
        )}

        <div className="flex items-center gap-1 cursor-pointer" onClick={viewState === ViewState.WATCH ? onBack : () => window.scrollTo(0,0)}>
          <div className="bg-red-600 text-white p-1 rounded-lg">
            <Video className="w-5 h-5 fill-current" />
          </div>
          <span className="text-white font-bold text-lg md:text-xl tracking-tight">StreamTube</span>
        </div>
      </div>

      {/* Center Section (Search) */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-2xl ml-12">
        <form onSubmit={handleSearchSubmit} className="flex items-center flex-1">
          <div className="flex items-center flex-1 bg-[#121212] border border-[#303030] rounded-l-full px-4 py-2 focus-within:border-blue-500 ml-8">
            <Search className="w-5 h-5 text-gray-400 hidden md:block mr-2" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none outline-none text-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-[#222222] border border-l-0 border-[#303030] px-5 py-2 rounded-r-full hover:bg-[#272727]">
            <Search className="w-5 h-5 text-white" />
          </button>
        </form>
        <div className="bg-[#121212] p-2.5 rounded-full hover:bg-[#272727] cursor-pointer">
          <Mic className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 md:gap-3 relative">
        <Button variant="icon" className="md:hidden" onClick={() => setMobileSearchOpen(true)}>
          <Search className="w-6 h-6" />
        </Button>
        
        {currentUser ? (
          <>
            <Button variant="icon" onClick={onUploadClick} className="hidden md:flex" title="Create">
              <PlusSquare className="w-6 h-6" />
            </Button>
            <Button variant="icon" className="hidden md:flex">
              <Bell className="w-6 h-6" />
            </Button>
            
            {/* User Avatar */}
            <div className="relative">
              <div 
                className="w-8 h-8 rounded-full overflow-hidden ml-2 cursor-pointer border border-transparent hover:border-gray-400"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
              </div>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-10 w-72 bg-[#282828] rounded-xl shadow-2xl border border-[#3f3f3f] overflow-hidden animate-fade-in">
                  <div className="p-4 border-b border-[#3f3f3f] flex gap-3 items-center">
                    <img src={currentUser.avatar} className="w-10 h-10 rounded-full" alt="" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm truncate">{currentUser.name}</p>
                      <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                      <p className="text-xs text-blue-400 mt-1 cursor-pointer hover:underline" onClick={() => { setShowUserMenu(false); onMyChannel?.(); }}>View your channel</p>
                    </div>
                  </div>
                  <div className="py-2">
                    <div 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#3f3f3f] cursor-pointer"
                      onClick={() => { setShowUserMenu(false); onUploadClick(); }}
                    >
                      <Settings className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">YouTube Studio</span>
                    </div>
                    <div 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#3f3f3f] cursor-pointer"
                      onClick={() => { setShowUserMenu(false); onMyChannel?.(); }}
                    >
                      <UserCircle className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">Your Channel</span>
                    </div>
                    <div 
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#3f3f3f] cursor-pointer"
                      onClick={() => { setShowUserMenu(false); onLogout?.(); }}
                    >
                       <LogOut className="w-5 h-5 text-gray-400" />
                       <span className="text-sm">Sign out</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
             <div className="hidden md:block">
               <Button variant="icon">
                <MoreVerticalIcon />
               </Button>
             </div>
             <button 
              onClick={onAuthClick}
              className="flex items-center gap-2 text-blue-400 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-blue-400/10 transition-colors ml-2"
             >
               <UserIcon className="w-5 h-5" />
               <span className="hidden md:inline">Sign in</span>
             </button>
          </>
        )}
      </div>
    </header>
  );
};

const MoreVerticalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
);