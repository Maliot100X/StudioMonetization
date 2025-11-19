import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VideoCard } from './components/VideoCard';
import { WatchPage } from './components/WatchPage';
import { AuthModal } from './components/AuthModal';
import { Studio } from './components/Studio';
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
      setVideos(newVideos);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleVideoClick = (video: Video) => {
    setCurrentVideo(video);
    setViewState(ViewState.WATCH);
    window.history.pushState({ page: 'watch' }, '', '#watch');
    window.scrollTo(0,0);
  };

  const handleBack = () => {
    window.history.back();
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
    // Initialize with some demo stats for monetization
    const userWithStats: User = {
        ...user,
        subscribers: 850, // Close to threshold
        watchHours: 3200, // Close to threshold
        isMonetized: false,
        estimatedRevenue: 0
    };
    setCurrentUser(userWithStats);
  };

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
    // Could add a toast notification here
  };

  const categories = ['All', 'Gaming', 'Music', 'Live', 'Mixes', 'React Routers', 'Tailwind CSS', 'Computer Programming', 'Lo-fi', 'News', 'Comedy'];

  return (
    <div className="min-h-screen flex flex-col bg-yt-base text-white">
      {/* The Studio is a full screen overlay */}
      {viewState === ViewState.STUDIO && currentUser && (
        <Studio 
          user={currentUser} 
          onExit={() => handleBack()} 
          onUploadComplete={handleUploadComplete}
        />
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
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} isMobile={isMobile} />

        <main className="flex-1 overflow-y-auto relative bg-yt-base no-scrollbar pb-16 md:pb-0">
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
                    <VideoCard key={video.id} video={video} onClick={handleVideoClick} />
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
      {isMobile && !isMobileSearchOpen && viewState !== ViewState.WATCH && viewState !== ViewState.STUDIO && (
        <div className="fixed bottom-0 left-0 right-0 bg-yt-base border-t border-[#3f3f3f] flex justify-around items-center h-12 pb-1 z-50">
           <div className="flex flex-col items-center justify-center w-full h-full text-white" onClick={() => setViewState(ViewState.HOME)}>
              <Home className="w-6 h-6 mb-0.5" />
              <span className="text-[10px]">Home</span>
           </div>
           <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-white">
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
           <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-white">
              <PlaySquare className="w-6 h-6 mb-0.5" />
              <span className="text-[10px]">Subs</span>
           </div>
           <div 
              className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-white"
              onClick={() => currentUser ? handleStudioOpen() : setAuthOpen(true)}
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