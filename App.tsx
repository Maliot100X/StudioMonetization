import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VideoCard } from './components/VideoCard';
import { WatchPage } from './components/WatchPage';
import { AuthModal } from './components/AuthModal';
import { Studio } from './components/Studio';
import { ChannelPage } from './components/ChannelPage';
import { ShortsPage } from './components/ShortsPage';
import { Video, ViewState, User } from './types';
import { generateVideoRecommendations } from './services/geminiService';
import { Button } from './components/Button';
import { Home, Compass, PlaySquare, User as UserIcon, PlusSquare } from 'lucide-react';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMobile, setIsMobile] = useState(false);

  // Auth & User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<User | null>(null);

  // Persistent App State (Liked, History, Subs)
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [subscribedChannelIds, setSubscribedChannelIds] = useState<string[]>([]);

  // Restore session
  useEffect(() => {
     const savedUser = localStorage.getItem('st_user');
     if (savedUser) {
       setCurrentUser(JSON.parse(savedUser));
     }
  }, []);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle Hardware Back Button / Browser History
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.hash === '#watch' && currentVideo) {
        setViewState(ViewState.WATCH);
      } else if (window.location.hash === '#studio') {
        setViewState(ViewState.STUDIO);
      } else if (window.location.hash === '#channel') {
        setViewState(ViewState.CHANNEL);
      } else if (window.location.hash === '#shorts') {
        setViewState(ViewState.SHORTS);
      } else if (window.location.hash === '#subscriptions') {
        setViewState(ViewState.SUBSCRIPTIONS);
      } else if (window.location.hash === '#history') {
        setViewState(ViewState.HISTORY);
      } else if (window.location.hash === '#liked') {
        setViewState(ViewState.LIKED);
      } else {
        setViewState(ViewState.HOME);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentVideo]);

  // Initial Load
  useEffect(() => {
    loadVideos('All');
  }, []);

  const loadVideos = async (query: string) => {
    setLoading(true);
    try {
      const newVideos = await generateVideoRecommendations(query);
      setVideos(prev => {
        const locals = prev.filter(v => v.isLocal);
        // Filter out duplicates
        const uniqueNew = newVideos.filter(nv => !locals.some(lv => lv.id === nv.id));
        return [...locals, ...uniqueNew];
      });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleVideoClick = (video: Video) => {
    setCurrentVideo(video);
    setViewState(ViewState.WATCH);
    // Add to history
    if (!historyIds.includes(video.id)) {
        setHistoryIds(prev => [video.id, ...prev]);
    }
    window.history.pushState({ page: 'watch' }, '', '#watch');
    window.scrollTo(0,0);
  };

  const handleChannelClick = (channel: User) => {
    setCurrentChannel(channel);
    setViewState(ViewState.CHANNEL);
    window.history.pushState({ page: 'channel' }, '', '#channel');
    window.scrollTo(0,0);
  }

  // Helper to construct a User object from just Video info
  const handleChannelClickFromVideo = (video: Video | Partial<User>) => {
    const channelId = 'channelId' in video ? video.channelId : video.id;
    const channelName = 'channelName' in video ? video.channelName : video.name;
    const channelAvatar = 'channelAvatar' in video ? video.channelAvatar : video.avatar;

    // If it's the current user, use their real profile
    if (currentUser && currentUser.id === channelId) {
      handleChannelClick(currentUser);
      return;
    }

    // Otherwise construct a realistic mock profile
    const mockChannel: User = {
      id: channelId || 'unknown',
      name: channelName || 'Unknown',
      handle: '@' + (channelName || 'User').replace(/\s/g, '').toLowerCase(),
      email: 'contact@streamtube.com',
      avatar: channelAvatar || 'https://picsum.photos/100',
      banner: `https://picsum.photos/seed/${channelId}/1200/200`,
      subscribers: Math.floor(Math.random() * 1000000) + 1000,
      watchHours: 0,
      isMonetized: false,
      estimatedRevenue: 0,
      joinedDate: '2023-01-01'
    };
    handleChannelClick(mockChannel);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
       window.history.back();
    } else {
       setViewState(ViewState.HOME);
    }
  };

  const handleSearch = (query: string) => {
    setActiveCategory('Results');
    loadVideos(query);
    if (viewState !== ViewState.HOME) {
        setViewState(ViewState.HOME);
        setCurrentVideo(null);
    }
  };

  const handleLogin = (user: User) => {
    const userWithStats: User = {
        ...user,
        subscribers: 850, 
        watchHours: 3200,
        isMonetized: false,
        estimatedRevenue: 0,
        joinedDate: new Date().toLocaleDateString(),
        banner: `https://picsum.photos/seed/${user.id}/1200/200`,
        handle: '@' + user.name.replace(/\s/g, '').toLowerCase()
    };
    setCurrentUser(userWithStats);
    localStorage.setItem('st_user', JSON.stringify(userWithStats));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('st_user');
    window.location.reload();
  }

  const handleStudioOpen = () => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    setViewState(ViewState.STUDIO);
    window.history.pushState({ page: 'studio' }, '', '#studio');
  };

  const handleUploadComplete = (newVideo: Video) => {
    setVideos(prev => [newVideo, ...prev]);
  };

  const toggleLike = (videoId: string) => {
      if (likedIds.includes(videoId)) {
          setLikedIds(likedIds.filter(id => id !== videoId));
      } else {
          setLikedIds([...likedIds, videoId]);
      }
  };

  const toggleSubscribe = (channelId: string) => {
      if (subscribedChannelIds.includes(channelId)) {
          setSubscribedChannelIds(subscribedChannelIds.filter(id => id !== channelId));
      } else {
          setSubscribedChannelIds([...subscribedChannelIds, channelId]);
      }
  };

  const categories = ['All', 'Gaming', 'Music', 'Live', 'Mixes', 'React Routers', 'Tailwind CSS', 'Computer Programming', 'Lo-fi', 'News', 'Comedy'];

  // Helper to set view from Sidebar
  const handleViewChange = (viewStr: string) => {
      const view = ViewState[viewStr as keyof typeof ViewState];
      setViewState(view);
      if (view === ViewState.HOME) window.history.pushState({}, '', '/');
      else window.history.pushState({}, '', '#' + viewStr.toLowerCase());
      
      // Close mobile menu if open
      if(isMobile) setSidebarOpen(false);
  }

  // Render filtered views
  const renderFilteredView = (title: string, filteredVideos: Video[], emptyMsg: string) => (
      <div className="p-4 md:p-8">
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
          {filteredVideos.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-8 gap-x-4">
                 {filteredVideos.map(video => (
                    <VideoCard 
                      key={video.id} 
                      video={video} 
                      onClick={handleVideoClick} 
                      onChannelClick={() => handleChannelClickFromVideo(video)}
                    />
                 ))}
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                 <div className="w-24 h-24 bg-[#272727] rounded-full mb-4 flex items-center justify-center">
                    {title === 'History' && <div className="text-4xl">🕰️</div>}
                    {title === 'Liked Videos' && <div className="text-4xl">👍</div>}
                    {title === 'Subscriptions' && <div className="text-4xl">📺</div>}
                 </div>
                 <p>{emptyMsg}</p>
             </div>
          )}
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-yt-base text-white">
      {/* Full Screen Overlays */}
      {viewState === ViewState.STUDIO && currentUser && (
        <Studio 
          user={currentUser} 
          onExit={() => handleBack()} 
          onUploadComplete={handleUploadComplete}
        />
      )}
      {viewState === ViewState.SHORTS && (
         <ShortsPage onBack={() => handleViewChange('HOME')} />
      )}

      {/* Normal App Layout */}
      <Header 
        onSearch={handleSearch} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isMobileSearchOpen={isMobileSearchOpen}
        setMobileSearchOpen={setMobileSearchOpen}
        currentUser={currentUser}
        onAuthClick={() => setAuthOpen(true)}
        onUploadClick={handleStudioOpen}
        viewState={viewState}
        onBack={handleBack}
        onLogout={handleLogout}
        onMyChannel={() => currentUser && handleChannelClick(currentUser)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
            isOpen={sidebarOpen} 
            isMobile={isMobile} 
            activeView={viewState} 
            onViewChange={handleViewChange}
        />

        <main className="flex-1 overflow-y-auto relative bg-yt-base no-scrollbar pb-16 md:pb-0">
          
          {viewState === ViewState.CHANNEL && currentChannel && (
            <ChannelPage 
              channel={currentChannel} 
              videos={videos} 
              onVideoSelect={handleVideoClick}
            />
          )}
          
          {viewState === ViewState.HISTORY && renderFilteredView(
              'Watch History', 
              videos.filter(v => historyIds.includes(v.id)), 
              'Videos you watch will appear here.'
          )}

          {viewState === ViewState.LIKED && renderFilteredView(
              'Liked Videos', 
              videos.filter(v => likedIds.includes(v.id)), 
              'Videos you like will appear here.'
          )}

          {viewState === ViewState.SUBSCRIPTIONS && renderFilteredView(
              'Subscriptions', 
              videos.filter(v => subscribedChannelIds.includes(v.channelId)), 
              'Videos from channels you subscribe to will appear here.'
          )}

          {viewState === ViewState.HOME && (
            <div className="flex flex-col">
              {/* Chip Bar */}
              <div className="sticky top-0 z-30 bg-yt-base/95 backdrop-blur-sm py-3 px-4 flex gap-3 overflow-x-auto no-scrollbar border-b border-[#3f3f3f]/30 w-full">
                 {categories.map(cat => (
                   <Button 
                    key={cat} 
                    active={activeCategory === cat} 
                    variant={activeCategory === cat ? 'primary' : 'secondary'}
                    onClick={() => {
                      setActiveCategory(cat);
                      loadVideos(cat);
                    }}
                    className="whitespace-nowrap flex-shrink-0"
                   >
                     {cat}
                   </Button>
                 ))}
              </div>
              
              {/* Video Grid */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-8 gap-x-4 pb-24 md:pb-8">
                {loading ? (
                  // Skeletons
                  Array.from({length: 8}).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2 animate-pulse">
                      <div className="w-full aspect-video bg-[#272727] rounded-xl"></div>
                      <div className="flex gap-2">
                        <div className="w-9 h-9 rounded-full bg-[#272727]"></div>
                        <div className="flex-1 space-y-2">
                           <div className="h-4 bg-[#272727] rounded w-3/4"></div>
                           <div className="h-3 bg-[#272727] rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  videos.map(video => (
                    <VideoCard 
                      key={video.id} 
                      video={video} 
                      onClick={handleVideoClick} 
                      onChannelClick={() => handleChannelClickFromVideo(video)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {viewState === ViewState.WATCH && currentVideo && (
            <WatchPage 
              video={currentVideo} 
              recommendedVideos={videos} 
              onVideoSelect={handleVideoClick}
              onChannelClick={() => handleChannelClickFromVideo(currentVideo)}
              isLiked={likedIds.includes(currentVideo.id)}
              onToggleLike={() => toggleLike(currentVideo.id)}
              isSubscribed={subscribedChannelIds.includes(currentVideo.channelId)}
              onToggleSubscribe={() => toggleSubscribe(currentVideo.channelId)}
            />
          )}
        </main>
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setAuthOpen(false)} 
        onLogin={handleLogin} 
      />

      {/* Mobile Bottom Navigation */}
      {isMobile && !isMobileSearchOpen && viewState !== ViewState.WATCH && viewState !== ViewState.STUDIO && viewState !== ViewState.SHORTS && (
        <div className="fixed bottom-0 left-0 right-0 bg-yt-base border-t border-[#3f3f3f] flex justify-around items-center h-12 pb-1 z-50">
           <div 
               className={`flex flex-col items-center justify-center w-full h-full ${viewState === ViewState.HOME ? 'text-white' : 'text-gray-400'}`} 
               onClick={() => handleViewChange('HOME')}
            >
              <Home className="w-6 h-6 mb-0.5" />
              <span className="text-[10px]">Home</span>
           </div>
           <div 
               className={`flex flex-col items-center justify-center w-full h-full text-gray-400`}
               onClick={() => handleViewChange('SHORTS')}
            >
              <Compass className="w-6 h-6 mb-0.5" />
              <span className="text-[10px]">Shorts</span>
           </div>
           <div 
            className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-white"
            onClick={handleStudioOpen}
           >
              <div className="w-10 h-10 bg-[#272727] hover:bg-[#3f3f3f] rounded-full flex items-center justify-center transition-colors">
                <PlusSquare className="w-6 h-6" />
              </div>
           </div>
           <div 
               className={`flex flex-col items-center justify-center w-full h-full ${viewState === ViewState.SUBSCRIPTIONS ? 'text-white' : 'text-gray-400'}`}
               onClick={() => handleViewChange('SUBSCRIPTIONS')}
           >
              <PlaySquare className="w-6 h-6 mb-0.5" />
              <span className="text-[10px]">Subs</span>
           </div>
           <div 
              className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-white"
              onClick={() => currentUser ? handleChannelClick(currentUser) : setAuthOpen(true)}
           >
              {currentUser ? (
                 <img src={currentUser.avatar} className="w-6 h-6 rounded-full mb-0.5 object-cover" alt="You" />
              ) : (
                 <UserIcon className="w-6 h-6 mb-0.5" />
              )}
              <span className="text-[10px]">You</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;