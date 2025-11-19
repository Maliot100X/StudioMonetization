import React, { useEffect, useState, useRef } from 'react';
import { Video } from '../types';
import { generateShorts } from '../services/geminiService';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Music2, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface ShortsPageProps {
    onBack: () => void;
}

export const ShortsPage: React.FC<ShortsPageProps> = ({ onBack }) => {
    const [shorts, setShorts] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await generateShorts();
            setShorts(data);
            setLoading(false);
        };
        load();
    }, []);

    // Handle Intersection Observer for auto-play/pause
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const options = {
            root: containerRef.current,
            threshold: 0.6
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                if (video) {
                    if (entry.isIntersecting) {
                        video.play().catch(() => {}); // Autoplay might need interaction first
                    } else {
                        video.pause();
                        video.currentTime = 0;
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersection, options);
        const elements = document.querySelectorAll('.short-item');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [shorts]);

    if (loading) return <div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading Shorts...</div>;

    return (
        <div className="fixed inset-0 z-50 bg-black flex justify-center">
            <div 
                ref={containerRef}
                className="w-full max-w-md h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative"
            >
                 <div className="absolute top-4 left-4 z-50 md:hidden">
                     <Button variant="icon" onClick={onBack}>
                         <ArrowLeft className="w-6 h-6 text-white drop-shadow-md" />
                     </Button>
                 </div>

                {shorts.map(short => (
                    <div key={short.id} className="short-item h-full w-full snap-start relative bg-[#1a1a1a]">
                        <video 
                            src={short.videoUrl}
                            className="w-full h-full object-cover"
                            loop
                            muted={false}
                            playsInline
                        />
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />
                        
                        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-6 pointer-events-auto">
                             <div className="flex flex-col items-center gap-1">
                                 <div className="w-12 h-12 bg-[#272727]/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#3f3f3f]">
                                     <ThumbsUp className="w-6 h-6 text-white fill-current" />
                                 </div>
                                 <span className="text-xs font-medium text-white">120K</span>
                             </div>
                             <div className="flex flex-col items-center gap-1">
                                 <div className="w-12 h-12 bg-[#272727]/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#3f3f3f]">
                                     <ThumbsDown className="w-6 h-6 text-white" />
                                 </div>
                                 <span className="text-xs font-medium text-white">Dislike</span>
                             </div>
                             <div className="flex flex-col items-center gap-1">
                                 <div className="w-12 h-12 bg-[#272727]/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#3f3f3f]">
                                     <MessageSquare className="w-6 h-6 text-white fill-white" />
                                 </div>
                                 <span className="text-xs font-medium text-white">1.2K</span>
                             </div>
                             <div className="flex flex-col items-center gap-1">
                                 <div className="w-12 h-12 bg-[#272727]/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#3f3f3f]">
                                     <Share2 className="w-6 h-6 text-white" />
                                 </div>
                                 <span className="text-xs font-medium text-white">Share</span>
                             </div>
                              <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white mt-4">
                                 <img src={short.thumbnailUrl} className="w-full h-full object-cover" alt="sound" />
                             </div>
                        </div>

                        <div className="absolute bottom-4 left-4 right-16 pointer-events-auto">
                             <div className="flex items-center gap-2 mb-3">
                                 <img src={short.channelAvatar} className="w-9 h-9 rounded-full border border-white/20" alt="" />
                                 <span className="font-bold text-white text-sm truncate">@{short.channelName.replace(/\s/g, '')}</span>
                                 <button className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full ml-2">Subscribe</button>
                             </div>
                             <p className="text-white text-sm line-clamp-2 mb-2">{short.title}</p>
                             <div className="flex items-center gap-2 text-white text-xs font-medium">
                                 <Music2 className="w-3 h-3" />
                                 <span className="truncate">Original Sound - {short.channelName}</span>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};