import React, { useEffect, useState } from 'react';
import { Video, Comment } from '../types';
import { generateComments } from '../services/geminiService';
import { Button } from './Button';
import { ThumbsUp, ThumbsDown, Share2, Scissors, MoreHorizontal } from 'lucide-react';

interface WatchPageProps {
  video: Video;
  recommendedVideos: Video[];
  onVideoSelect: (video: Video) => void;
  onChannelClick?: () => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({ video, recommendedVideos, onVideoSelect, onChannelClick }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Scroll to top when video changes
    window.scrollTo(0, 0);
    
    const fetchComments = async () => {
      setLoadingComments(true);
      const generated = await generateComments(video.title);
      setComments(generated);
      setLoadingComments(false);
    };
    fetchComments();
    setIsSubscribed(false);
  }, [video.id, video.title]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1800px] mx-auto p-4 md:p-6">
      {/* Primary Content (Player + Info) */}
      <div className="flex-1 min-w-0">
        {/* Video Player Wrapper */}
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative group">
          <video 
            key={video.videoUrl} // Force re-render on url change
            className="w-full h-full object-contain"
            controls
            autoPlay
            src={video.videoUrl}
            poster={video.thumbnailUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Title & Actions */}
        <div className="mt-4">
          <h1 className="text-xl md:text-2xl font-bold text-white line-clamp-2">{video.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-3 gap-4">
            {/* Channel Info */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={onChannelClick}>
              <img src={video.channelAvatar} className="w-10 h-10 rounded-full bg-gray-700" alt="" />
              <div>
                <h3 className="font-bold text-white hover:text-gray-300">{video.channelName}</h3>
                <p className="text-xs text-gray-400">1.2M subscribers</p>
              </div>
              <button 
                className={`ml-4 px-4 py-2 rounded-full font-medium text-sm transition-colors ${isSubscribed ? 'bg-[#272727] text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                onClick={(e) => { e.stopPropagation(); setIsSubscribed(!isSubscribed); }}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <div className="flex items-center bg-[#272727] rounded-full">
                <Button variant="ghost" className="rounded-l-full flex gap-2 px-4 border-r border-[#3f3f3f]">
                  <ThumbsUp className="w-5 h-5" />
                  <span>12K</span>
                </Button>
                <Button variant="ghost" className="rounded-r-full px-4">
                  <ThumbsDown className="w-5 h-5" />
                </Button>
              </div>
              <Button variant="secondary" className="flex gap-2 rounded-full">
                <Share2 className="w-5 h-5" /> Share
              </Button>
               <Button variant="secondary" className="flex gap-2 rounded-full hidden md:flex">
                <Scissors className="w-5 h-5" /> Clip
              </Button>
              <Button variant="icon" className="bg-[#272727]">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Description Box */}
        <div className="mt-4 bg-[#272727] p-3 rounded-xl text-sm hover:bg-[#3f3f3f] transition-colors cursor-pointer">
          <div className="flex gap-2 font-bold mb-1">
            <span>{video.views} views</span>
            <span>{video.postedAt}</span>
          </div>
          <p className="text-white whitespace-pre-wrap leading-relaxed">
            {video.description}
            <br/><br/>
            <span className="text-blue-400 hover:underline cursor-pointer">#streamtube</span> <span className="text-blue-400 hover:underline cursor-pointer">#demo</span>
          </p>
        </div>

        {/* Comments Section */}
        <div className="mt-6 hidden md:block">
          <div className="flex items-center gap-8 mb-6">
            <h3 className="text-xl font-bold">{comments.length} Comments</h3>
          </div>
          
          {/* Add Comment Input */}
          <div className="flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">U</div>
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="w-full bg-transparent border-b border-[#3f3f3f] pb-1 focus:border-white outline-none transition-colors"
              />
            </div>
          </div>

          {/* Comment List */}
          <div className="space-y-6">
            {loadingComments ? (
              <p className="text-gray-400">Loading thoughts...</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full bg-gray-700" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">@{comment.author}</span>
                      <span className="text-xs text-gray-400">{comment.timeAgo}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.text}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button variant="icon" className="p-0 hover:bg-transparent">
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <span className="text-xs text-gray-400">{comment.likes}</span>
                       <Button variant="icon" className="p-0 hover:bg-transparent">
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                      <button className="text-xs font-semibold hover:bg-[#272727] px-2 py-1 rounded-full">Reply</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommended Videos Sidebar */}
      <div className="w-full lg:w-[400px] flex-shrink-0">
        <h2 className="font-bold text-lg mb-4 lg:hidden">Up Next</h2>
        <div className="flex flex-col gap-3">
            {recommendedVideos.filter(v => v.id !== video.id).map(recVideo => (
                 <div 
                    key={recVideo.id} 
                    className="flex gap-2 cursor-pointer group" 
                    onClick={() => onVideoSelect(recVideo)}
                 >
                    <div className="relative w-40 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-[#272727]">
                        <img src={recVideo.thumbnailUrl} className="w-full h-full object-cover" loading="lazy" alt=""/>
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{recVideo.duration}</div>
                    </div>
                    <div className="flex flex-col gap-1 pr-2">
                        <h4 className="font-bold text-sm line-clamp-2 leading-tight group-hover:text-white text-gray-100">
                            {recVideo.title}
                        </h4>
                        <div className="text-xs text-[#aaaaaa]">
                            <p>{recVideo.channelName}</p>
                            <p>{recVideo.views} views • {recVideo.postedAt}</p>
                        </div>
                    </div>
                 </div>
            ))}
        </div>
      </div>
    </div>
  );
};