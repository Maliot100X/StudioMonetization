import React from 'react';
import { Video } from '../types';
import { MoreVertical } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div 
      className="flex flex-col gap-2 cursor-pointer group active:scale-[0.98] transition-transform duration-100" 
      onClick={() => onClick(video)}
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#272727]">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
          {video.duration}
        </div>
      </div>

      {/* Info Container */}
      <div className="flex gap-3 pr-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img 
            src={video.channelAvatar} 
            alt={video.channelName} 
            className="w-9 h-9 rounded-full object-cover bg-[#272727]"
          />
        </div>

        {/* Text Info */}
        <div className="flex flex-col flex-1">
          <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 leading-snug">
            {video.title}
          </h3>
          <div className="text-yt-secondary text-xs md:text-sm mt-1">
            <p>{video.channelName}</p>
            <p>{video.views} views • {video.postedAt}</p>
          </div>
        </div>

        {/* Options Icon */}
        <button className="opacity-0 group-hover:opacity-100 transition-opacity self-start p-1">
          <MoreVertical className="text-yt-text w-4 h-4" />
        </button>
      </div>
    </div>
  );
};