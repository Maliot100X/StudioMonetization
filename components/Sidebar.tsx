import React from 'react';
import { Home, Compass, PlaySquare, Clock, ThumbsUp, Film, Gamepad2, Flame, Music2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
}

const SidebarItem: React.FC<{ icon: React.ElementType, label: string, active?: boolean, compact?: boolean }> = ({ icon: Icon, label, active, compact }) => (
  <div className={`flex ${compact ? 'flex-col items-center gap-1 py-4' : 'flex-row items-center gap-5 px-3 py-2.5'} rounded-lg cursor-pointer ${active ? 'bg-[#272727] font-medium' : 'hover:bg-[#272727]'}`}>
    <Icon className={`${compact ? 'w-6 h-6' : 'w-6 h-6'} ${active ? 'text-white fill-current' : 'text-white'}`} />
    <span className={`text-xs ${compact ? '' : 'text-sm'} ${active ? '' : 'text-[#f1f1f1]'}`}>{label}</span>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile }) => {
  // If mobile, we usually hide sidebar or show bottom nav. For this simplified clone, we'll hide it on mobile.
  if (isMobile && !isOpen) return null;

  // Mobile Overlay
  if (isMobile && isOpen) {
    return (
      <div className="fixed inset-0 z-40 bg-black/50">
        <div className="w-64 h-full bg-yt-base p-3 overflow-y-auto animate-slide-in">
             <div className="border-b border-[#3f3f3f] pb-4 mb-2">
                <SidebarItem icon={Home} label="Home" active />
                <SidebarItem icon={Flame} label="Shorts" />
                <SidebarItem icon={PlaySquare} label="Subscriptions" />
            </div>
            <div className="border-b border-[#3f3f3f] pb-4 mb-2 pt-2">
                <h3 className="px-3 py-2 font-bold text-lg">Explore</h3>
                <SidebarItem icon={Flame} label="Trending" />
                <SidebarItem icon={Music2} label="Music" />
                <SidebarItem icon={Gamepad2} label="Gaming" />
                <SidebarItem icon={Film} label="Movies" />
            </div>
        </div>
      </div>
    );
  }

  // Desktop Compact/Full
  return (
    <div className={`hidden md:flex flex-col sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-1 ${isOpen ? 'w-60 px-3' : 'w-20 items-center'}`}>
      <div className="space-y-1 w-full">
        <SidebarItem icon={Home} label="Home" active compact={!isOpen} />
        <SidebarItem icon={Compass} label="Shorts" compact={!isOpen} />
        <SidebarItem icon={PlaySquare} label="Subscriptions" compact={!isOpen} />
      </div>
      {isOpen && <div className="my-3 border-t border-[#3f3f3f] w-full" />}
       <div className="space-y-1 w-full">
        <SidebarItem icon={Clock} label="History" compact={!isOpen} />
        <SidebarItem icon={ThumbsUp} label="Liked" compact={!isOpen} />
      </div>
    </div>
  );
};