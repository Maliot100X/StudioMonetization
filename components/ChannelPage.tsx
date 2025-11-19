import React, { useState } from 'react';
import { User, Video } from '../types';
import { Button } from './Button';
import { VideoCard } from './VideoCard';
import { Search, MoreVertical, Bell, ChevronDown } from 'lucide-react';

interface ChannelPageProps {
  channel: User | any; // Accepts User or a derived channel object
  videos: Video[]; // All videos, will filter by channel
  onVideoSelect: (video: Video) => void;
}

export const ChannelPage: React.FC<ChannelPageProps> = ({ channel, videos, onVideoSelect }) => {
  const [activeTab, setActiveTab] = useState('Home');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Filter videos for this channel
  const channelVideos = videos.filter(v => v.channelName === channel.name || v.channelId === channel.id);
  
  // Mock tabs
  const tabs = ['Home', 'Videos', 'Shorts', 'Live', 'Playlists', 'Community', 'Search'];

  return (
    <div className="w-full min-h-screen bg-yt-base pb-20 md:pb-0">
      {/* Banner */}
      <div className="w-full aspect-[6/1] md:aspect-[6/1] bg-[#272727] overflow-hidden relative">
        {channel.banner ? (
          <img src={channel.banner} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-900 to-blue-900"></div>
        )}
      </div>

      {/* Header Info */}
      <div className="max-w-[1284px] mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        {/* Avatar */}
        <div className="w-20 h-20 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-[#0f0f0f] flex-shrink-0">
          <img src={channel.avatar} alt={channel.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-2">
          <h1 className="text-2xl md:text-4xl font-bold text-white">{channel.name}</h1>
          <div className="text-gray-400 text-sm md:text-sm flex flex-col md:flex-row gap-1 md:gap-2">
            <span className="font-medium text-white md:text-gray-400">{channel.handle || '@' + channel.name.replace(/\s/g, '')}</span>
            <span className="hidden md:inline">•</span>
            <span>{channel.subscribers?.toLocaleString() || '1.2M'} subscribers</span>
            <span className="hidden md:inline">•</span>
            <span>{channelVideos.length} videos</span>
          </div>
          <div className="text-gray-400 text-sm line-clamp-2 max-w-2xl flex items-center gap-1 cursor-pointer">
            <span className="truncate">Welcome to the official channel! We make videos about tech, coding, and AI.</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          
          {/* Buttons */}
          <div className="flex items-center gap-3 mt-2">
             <button 
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                  isSubscribed 
                    ? 'bg-[#272727] text-white hover:bg-[#3f3f3f] flex items-center gap-2' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
             >
               {isSubscribed ? (
                 <>
                  <Bell className="w-4 h-4 fill-current" />
                  Subscribed
                  <ChevronDown className="w-4 h-4" />
                 </>
               ) : 'Subscribe'}
             </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 md:top-16 z-20 bg-yt-base border-b border-[#3f3f3f] px-4 md:px-6">
        <div className="max-w-[1284px] mx-auto flex gap-6 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 cursor-pointer border-b-2 transition-colors whitespace-nowrap font-medium text-sm uppercase tracking-wide ${
                activeTab === tab ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'Search' ? <Search className="w-5 h-5" /> : tab}
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1284px] mx-auto px-4 md:px-6 py-6">
        {activeTab === 'Home' && (
          <div className="space-y-8">
            {/* Featured / For You */}
            {channelVideos.length > 0 && (
              <div>
                 <h3 className="text-lg font-bold mb-4">For You</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {channelVideos.slice(0, 5).map(video => (
                      <VideoCard key={video.id} video={video} onClick={onVideoSelect} />
                    ))}
                 </div>
              </div>
            )}
            
            {/* Videos Section */}
            <div>
               <h3 className="text-lg font-bold mb-4">Videos</h3>
               {channelVideos.length === 0 ? (
                 <div className="text-center py-20 text-gray-400">
                   <p>This channel has no videos.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {channelVideos.map(video => (
                      <VideoCard key={video.id} video={video} onClick={onVideoSelect} />
                    ))}
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'Videos' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {channelVideos.map(video => (
                  <VideoCard key={video.id} video={video} onClick={onVideoSelect} />
                ))}
             </div>
        )}

        {activeTab === 'Community' && (
          <div className="max-w-2xl mx-auto space-y-6">
             <div className="bg-[#272727] p-4 rounded-xl border border-[#3f3f3f]">
               <div className="flex gap-3">
                 <img src={channel.avatar} className="w-10 h-10 rounded-full" alt="" />
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="font-bold text-sm">{channel.name}</span>
                     <span className="text-xs text-gray-400">2 days ago</span>
                   </div>
                   <p className="text-sm leading-relaxed">
                     Thank you everyone for 1 Million subscribers! New special video coming this Friday! 🚀
                   </p>
                   <div className="flex items-center gap-4 mt-4">
                      <Button variant="icon" className="p-0 hover:bg-transparent"><div className="flex items-center gap-2"><span className="text-sm">12K</span></div></Button>
                      <Button variant="icon" className="p-0 hover:bg-transparent"><div className="flex items-center gap-2"><span className="text-sm">👎</span></div></Button>
                      <Button variant="icon" className="p-0 hover:bg-transparent"><div className="flex items-center gap-2"><span className="text-sm">💬 452</span></div></Button>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};