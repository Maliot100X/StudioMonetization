import React, { useState, useRef } from 'react';
import { User, Video } from '../types';
import { Button } from './Button';
import { LayoutDashboard, DollarSign, Video as VideoIcon, Image as ImageIcon, Mic, Sparkles, ArrowLeft, Loader2, CheckCircle, UploadCloud, TrendingUp, HelpCircle, X } from 'lucide-react';
import { generateVeoVideo, generateThumbnail, generateVoiceover } from '../services/geminiService';

interface StudioProps {
  user: User;
  onExit: () => void;
  onUploadComplete: (video: Video) => void;
}

type StudioTab = 'dashboard' | 'earn' | 'create_video' | 'create_thumb' | 'create_audio' | 'upload';

export const Studio: React.FC<StudioProps> = ({ user, onExit, onUploadComplete }) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  // Monetization State
  const [isMonetized, setIsMonetized] = useState(user.isMonetized);
  const [appStatus, setAppStatus] = useState<'none' | 'pending' | 'approved'>('none');

  // AI Generation State
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  // Real Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMeta, setUploadMeta] = useState({ title: '', description: '' });

  const resetGen = () => {
    setPrompt('');
    setGeneratedContent(null);
    setLoading(false);
    setStatusMsg('');
  };

  const handleGenerate = async (type: 'video' | 'thumb' | 'audio') => {
    if (!prompt.trim()) return;
    
    if (window.aistudio?.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    }

    setLoading(true);
    setGeneratedContent(null);

    try {
      let result = '';
      if (type === 'video') {
        setStatusMsg('Directing Veo 3.1...');
        result = await generateVeoVideo(prompt);
      } else if (type === 'thumb') {
        setStatusMsg('Painting with Imagen 3...');
        result = await generateThumbnail(prompt);
      } else if (type === 'audio') {
        setStatusMsg('Recording Voiceover...');
        result = await generateVoiceover(prompt);
      }
      setGeneratedContent(result);
    } catch (e) {
      console.error(e);
      alert("Generation failed. Please check API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMonetization = () => {
    setAppStatus('pending');
    setTimeout(() => {
      setAppStatus('approved');
      setIsMonetized(true);
    }, 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setUploadMeta({ title: file.name.split('.')[0], description: '' });
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const handlePublish = () => {
    if (!uploadFile) return;

    const newVideo: Video = {
      id: `user-${Date.now()}`,
      title: uploadMeta.title || 'Untitled Video',
      description: uploadMeta.description || 'No description provided',
      videoUrl: URL.createObjectURL(uploadFile), // Create local blob URL
      thumbnailUrl: 'https://picsum.photos/seed/' + Date.now() + '/640/360',
      channelName: user.name,
      channelId: user.id,
      channelAvatar: user.avatar,
      views: '0',
      postedAt: 'Just now',
      duration: '0:30', // Placeholder for demo
      category: 'General',
      isLocal: true
    };

    onUploadComplete(newVideo);
    setActiveTab('dashboard');
    setUploadFile(null);
    setUploadProgress(0);
    alert('Video published successfully!');
  };

  const renderSidebarItem = (id: StudioTab, icon: React.ElementType, label: string) => (
    <div 
      onClick={() => { setActiveTab(id); resetGen(); }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${activeTab === id ? 'bg-[#272727] text-yt-red border-l-4 border-yt-red' : 'text-gray-400 hover:bg-[#1f1f1f] hover:text-white'}`}
    >
      <div className={activeTab === id ? '-ml-1' : ''}>
        {React.createElement(icon, { size: 20 })}
      </div>
      <span className="font-medium">{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-[#121212] text-white flex overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f0f0f] border-r border-[#3f3f3f] hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[#3f3f3f] gap-2">
          <Button variant="icon" onClick={onExit}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-bold text-xl tracking-tight">Studio</span>
        </div>
        
        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Channel</div>
          {renderSidebarItem('dashboard', LayoutDashboard, 'Dashboard')}
          {renderSidebarItem('earn', DollarSign, 'Earn')}
          
          <div className="mt-6 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</div>
          <div 
             onClick={() => setActiveTab('upload')}
             className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${activeTab === 'upload' ? 'bg-[#272727] text-yt-red border-l-4 border-yt-red' : 'text-gray-400 hover:bg-[#1f1f1f] hover:text-white'}`}
          >
            <UploadCloud size={20} />
            <span className="font-medium">Upload Video</span>
          </div>

          <div className="mt-6 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">AI Creative Suite</div>
          {renderSidebarItem('create_video', VideoIcon, 'Veo Video Gen')}
          {renderSidebarItem('create_thumb', ImageIcon, 'Imagen Thumbnails')}
          {renderSidebarItem('create_audio', Mic, 'TTS Voiceover')}
        </div>

        <div className="p-4 border-t border-[#3f3f3f]">
          <div className="flex items-center gap-3">
            <img src={user.avatar} className="w-10 h-10 rounded-full" alt="Me" />
            <div>
              <p className="font-medium text-sm line-clamp-1">{user.name}</p>
              <p className="text-xs text-gray-400">{user.subscribers} subscribers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#1f1f1f]">
        {/* Mobile Header for Studio */}
        <div className="md:hidden h-14 border-b border-[#3f3f3f] flex items-center px-4 bg-[#0f0f0f] sticky top-0 z-10">
             <Button variant="icon" onClick={onExit}>
               <ArrowLeft className="w-5 h-5" />
             </Button>
             <span className="font-bold ml-2">Studio Dashboard</span>
        </div>

        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-slide-up">
              <h1 className="text-2xl font-bold hidden md:block">Channel Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#282828] p-6 rounded-xl border border-[#3f3f3f]">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Total Subscribers</h3>
                  <div className="text-3xl font-bold">{user.subscribers.toLocaleString()}</div>
                  <div className="text-green-500 text-sm mt-2 flex items-center gap-1">▲ 12 in last 28 days</div>
                </div>
                <div className="bg-[#282828] p-6 rounded-xl border border-[#3f3f3f]">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Watch Hours</h3>
                  <div className="text-3xl font-bold">{user.watchHours.toLocaleString()}</div>
                  <div className="text-green-500 text-sm mt-2 flex items-center gap-1">▲ 45.2 in last 28 days</div>
                </div>
                <div className="bg-[#282828] p-6 rounded-xl border border-[#3f3f3f]">
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Est. Revenue</h3>
                  <div className="text-3xl font-bold">${user.estimatedRevenue.toFixed(2)}</div>
                  <div className="text-gray-500 text-sm mt-2">Update daily</div>
                </div>
              </div>
              
              {/* Quick Upload Button for Mobile */}
              <div className="md:hidden">
                 <Button 
                   className="w-full py-3 flex items-center justify-center gap-2 bg-[#272727] border border-[#3f3f3f]" 
                   onClick={() => setActiveTab('upload')}
                 >
                   <UploadCloud className="w-5 h-5" />
                   Upload a Video
                 </Button>
              </div>
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="max-w-3xl mx-auto animate-slide-up">
               <div className="bg-[#282828] rounded-xl border border-[#3f3f3f] p-8 text-center">
                  {!uploadFile ? (
                    <div className="flex flex-col items-center py-10">
                      <div className="w-32 h-32 bg-[#1f1f1f] rounded-full flex items-center justify-center mb-6">
                        <UploadCloud className="w-16 h-16 text-gray-400" />
                      </div>
                      <h2 className="text-xl font-bold mb-2">Upload videos</h2>
                      <p className="text-gray-400 text-sm mb-8">Drag and drop video files to upload</p>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        Select Files
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="video/*" 
                        onChange={handleFileSelect}
                      />
                    </div>
                  ) : (
                    <div className="text-left">
                       <div className="flex justify-between items-center mb-6">
                         <h2 className="text-xl font-bold">{uploadMeta.title}</h2>
                         <Button variant="icon" onClick={() => setUploadFile(null)}><X /></Button>
                       </div>
                       
                       {/* Progress */}
                       <div className="mb-8">
                         <div className="flex justify-between text-xs mb-1">
                           <span>{uploadProgress < 100 ? 'Uploading...' : 'Processing complete'}</span>
                           <span>{uploadProgress}%</span>
                         </div>
                         <div className="w-full bg-[#1f1f1f] rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
                         </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <div>
                               <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Title (Required)</label>
                               <input 
                                  type="text" 
                                  className="w-full bg-[#121212] border border-[#3f3f3f] p-3 rounded-lg outline-none focus:border-blue-500"
                                  value={uploadMeta.title}
                                  onChange={(e) => setUploadMeta({...uploadMeta, title: e.target.value})}
                               />
                             </div>
                             <div>
                               <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Description</label>
                               <textarea 
                                  className="w-full bg-[#121212] border border-[#3f3f3f] p-3 rounded-lg outline-none focus:border-blue-500 h-32 resize-none"
                                  value={uploadMeta.description}
                                  onChange={(e) => setUploadMeta({...uploadMeta, description: e.target.value})}
                                  placeholder="Tell viewers about your video"
                               />
                             </div>
                          </div>
                          
                          <div className="bg-[#121212] rounded-lg p-4">
                            <div className="aspect-video bg-black rounded mb-2 flex items-center justify-center">
                               <video src={URL.createObjectURL(uploadFile)} className="w-full h-full object-contain" />
                            </div>
                            <div className="text-xs text-gray-400 break-all">
                               Filename: {uploadFile.name}
                            </div>
                          </div>
                       </div>

                       <div className="mt-8 flex justify-end border-t border-[#3f3f3f] pt-4">
                          <Button onClick={handlePublish} disabled={uploadProgress < 100}>
                             Publish Video
                          </Button>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* EARN / MONETIZATION */}
          {activeTab === 'earn' && (
            <div className="space-y-6 animate-slide-up w-full">
              {isMonetized ? (
                 <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">Channel Analytics</h2>
                            <p className="text-gray-400 text-sm">Your estimated revenue is delayed by 2 days.</p>
                        </div>
                        <div className="bg-[#272727] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 self-start md:self-auto">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Partner Program Active
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#282828] p-6 rounded-xl border border-[#3f3f3f] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <DollarSign className="w-16 h-16 text-green-500" />
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-gray-400 text-sm font-medium">Estimated Revenue</h3>
                                <HelpCircle className="w-3 h-3 text-gray-500" />
                            </div>
                            <div className="text-3xl font-bold text-white">${user.estimatedRevenue.toFixed(2)}</div>
                            <div className="text-green-500 text-xs mt-3 flex items-center gap-1 font-medium">
                                <TrendingUp className="w-3 h-3" />
                                +15% more than usual
                            </div>
                        </div>
                    </div>
                 </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <div className="text-center space-y-2 mb-8">
                    <h1 className="text-2xl font-bold">Earn on StreamTube</h1>
                    <p className="text-gray-400">Apply to the YouTube Partner Program to earn money, get creator support, and more.</p>
                  </div>
                  <div className="bg-[#282828] rounded-xl border border-[#3f3f3f] p-8">
                    <h2 className="font-bold text-lg mb-6">How do I join?</h2>
                    
                    {/* Subs Requirement */}
                    <div className="mb-8">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Reach 1,000 subscribers</span>
                        <span className="text-gray-400">{user.subscribers} / 1,000</span>
                      </div>
                      <div className="w-full bg-[#1f1f1f] rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min((user.subscribers / 1000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="pt-6 border-t border-[#3f3f3f] flex flex-col items-center">
                      {appStatus === 'pending' ? (
                         <div className="flex items-center gap-2 text-blue-400">
                           <Loader2 className="w-5 h-5 animate-spin" />
                           <span>Reviewing your channel...</span>
                         </div>
                      ) : (
                         <Button onClick={handleApplyMonetization} className="w-full py-3 text-base">
                            {user.subscribers > 100 ? 'Apply Now (Demo Bypass)' : 'Apply Now'}
                         </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CREATE: AI SUITE */}
          {(activeTab === 'create_video' || activeTab === 'create_thumb' || activeTab === 'create_audio') && (
             <div className="max-w-2xl mx-auto animate-slide-up h-full flex flex-col">
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold">
                       {activeTab === 'create_video' && 'Veo Video Generator'}
                       {activeTab === 'create_thumb' && 'Imagen Thumbnail Creator'}
                       {activeTab === 'create_audio' && 'TTS Voiceover Studio'}
                     </h2>
                     <p className="text-gray-400 text-sm">Powered by Gemini Models</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  {/* Input Area */}
                   <div className="bg-[#282828] border border-[#3f3f3f] rounded-xl p-4 focus-within:border-purple-500 transition-colors">
                     <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                        {activeTab === 'create_audio' ? 'Script' : 'Prompt'}
                     </label>
                     <textarea 
                        className="w-full bg-transparent text-white outline-none resize-none h-32 placeholder-gray-600"
                        placeholder="Describe what you want to create..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                     />
                     <div className="flex justify-end mt-2">
                        <Button 
                          onClick={() => handleGenerate(activeTab === 'create_video' ? 'video' : activeTab === 'create_thumb' ? 'thumb' : 'audio')}
                          disabled={loading || !prompt.trim()}
                          className={`${loading ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-500'}`}
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> {statusMsg}
                            </div>
                          ) : (
                            'Generate'
                          )}
                        </Button>
                     </div>
                   </div>

                   {/* Result Area */}
                   {generatedContent && (
                     <div className="bg-[#282828] border border-[#3f3f3f] rounded-xl p-4 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="font-bold">Result</h3>
                        </div>
                        
                        <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[200px]">
                           {activeTab === 'create_video' && (
                              <video src={generatedContent} controls autoPlay loop className="w-full max-h-[400px]" />
                           )}
                           {activeTab === 'create_thumb' && (
                              <img src={generatedContent} alt="Generated" className="w-full object-contain" />
                           )}
                           {activeTab === 'create_audio' && (
                              <audio src={generatedContent} controls className="w-full px-4" />
                           )}
                        </div>
                     </div>
                   )}
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};