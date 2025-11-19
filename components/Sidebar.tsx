import React from 'react';
import { Home, Compass, PlaySquare, Clock, ThumbsUp, Film, Gamepad2, Flame, Music2, UserSquare2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  activeView: string;
  onViewChange: (view: string) => void;
}

const SidebarItem: React.FC<{ 
  icon: React.ElementType, 
  label: string, 
  active?: boolean, 
  compact?: boolean,
  onClick?: () => void 
}> = ({ icon: Icon, label, active, compact, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex ${compact ? 'flex-col items-center gap-1 py-4' : 'flex-row items-center gap-5 px-3 py-2.5'} rounded-lg cursor-pointer transition-colors ${active ? 'bg-[#272727] font-medium' : 'hover:bg-[#272727]'}`}
  >
    <Icon className={`${compact ? 'w-6 h-6' : 'w-6 h-6'} ${active ? 'text-white fill-current' : 'text-white'}`} />
    <span className={`text-xs ${compact ? '' : 'text-sm'} ${active ? '' : 'text-[#f1f1f1]'}`}>{label}</span>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isMobile, activeView, onViewChange }) => {
  // Mobile Sidebar Overlay
  if (isMobile) {
     if (!isOpen) return null;
     return (
      <div className="fixed inset-0 z-40 bg-black/50" onClick={() => {}}>
        <div className="w-64 h-full bg-yt-base p-3 overflow-y-auto animate-slide-in">
             <div className="border-b border-[#3f3f3f] pb-4 mb-2">
                <SidebarItem icon={Home} label="Home" active={activeView === 'HOME'} onClick={() => onViewChange('HOME')} />
                <SidebarItem icon={Flame} label="Shorts" active={activeView === 'SHORTS'} onClick={() => onViewChange('SHORTS')} />
                <SidebarItem icon={PlaySquare} label="Subscriptions" active={activeView === 'SUBSCRIPTIONS'} onClick={() => onViewChange('SUBSCRIPTIONS')} />
            </div>
            <div className="border-b border-[#3f3f3f] pb-4 mb-2 pt-2">
                <h3 className="px-3 py-2 font-bold text-lg">You</h3>
                <SidebarItem icon={Clock} label="History" active={activeView === 'HISTORY'} onClick={() => onViewChange('HISTORY')} />
                <SidebarItem icon={ThumbsUp} label="Liked Videos" active={activeView === 'LIKED'} onClick={() => onViewChange('LIKED')} />
            </div>
        </div>
      </div>
    );
  }

  // Desktop Compact/Full
  return (
    <div className={`hidden md:flex flex-col sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-1 ${isOpen ? 'w-60 px-3' : 'w-20 items-center'}`}>
      <div className="space-y-1 w-full">
        <SidebarItem icon={Home} label="Home" active={activeView === 'HOME'} compact={!isOpen} onClick={() => onViewChange('HOME')} />
        <SidebarItem icon={Compass} label="Shorts" active={activeView === 'SHORTS'} compact={!isOpen} onClick={() => onViewChange('SHORTS')} />
        <SidebarItem icon={PlaySquare} label="Subscriptions" active={activeView === 'SUBSCRIPTIONS'} compact={!isOpen} onClick={() => onViewChange('SUBSCRIPTIONS')} />
      </div>
      {isOpen && <div className="my-3 border-t border-[#3f3f3f] w-full" />}
       <div className="space-y-1 w-full">
         {isOpen && <h3 className="px-3 py-2 font-bold text-base">You</h3>}
         <SidebarItem icon={Clock} label="History" active={activeView === 'HISTORY'} compact={!isOpen} onClick={() => onViewChange('HISTORY')} />
         <SidebarItem icon={ThumbsUp} label="Liked" active={activeView === 'LIKED'} compact={!isOpen} onClick={() => onViewChange('LIKED')} />
      </div>
    </div>
  );
};