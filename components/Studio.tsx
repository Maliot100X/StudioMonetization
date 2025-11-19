import React, { useState, useEffect } from 'react';
import { User, Video } from '../types';
import { Button } from './Button';
import { LayoutDashboard, DollarSign, Video as VideoIcon, Image as ImageIcon, Mic, Sparkles, ArrowLeft, Loader2, CheckCircle, BarChart3, UploadCloud, TrendingUp, HelpCircle, MoreHorizontal } from 'lucide-react';
import { generateVeoVideo, generateThumbnail, generateVoiceover } from '../services/geminiService';

interface StudioProps {
  user: User;
  onExit: () => void;
  onUploadComplete: (video: Video) => void;
}

type StudioTab = 'dashboard' | 'earn' | 'create_video' | 'create_thumb' | 'create_audio';

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

  const resetGen = () => {
    setPrompt('');
    setGeneratedContent(null);
    setLoading(false);
    setStatusMsg('');
  };

  const handleGenerate = async (type: 'video' | 'thumb' | 'audio') => {
    if (!prompt.trim()) return;
    
    // API Key Check
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
      <div className="w-64 bg-[#0f0f0f] border-r border-[#3f3f3f] flex flex-col">
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
        <div className="p-8 max-w-6xl mx-auto">
          
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-slide-up">
              <h1 className="text-2xl font-bold">Channel Dashboard</h1>
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
              
              <div className="bg-[#282828] rounded-xl border border-[#3f3f3f] overflow-hidden">
                <div className="p-4 border-b border-[#3f3f3f] font-bold">Latest Video Performance</div>
                <div className="p-6 flex gap-4">
                   <div className="w-40 aspect-video bg-black rounded-lg relative overflow-hidden">
                     <img src="https://picsum.photos/seed/perf/300/200" className="object-cover w-full h-full opacity-50" />
                     <div className="absolute inset-0 flex items-center justify-center">
                       <BarChart3 className="w-8 h-8 text-gray-400" />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <h4 className="font-bold">Analyzing data...</h4>
                     <p className="text-sm text-gray-400">Ranking by views: 1 of 10</p>
                     <p className="text-sm text-gray-400">Impressions click-through rate: 5.4%</p>
                   </div>
                </div>
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

                        <div className="bg-[#282828] p-6 rounded-xl border border-[#3f3f3f] relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-gray-400 text-sm font-medium">RPM</h3>
                                <HelpCircle className="w-3 h-3 text-gray-500" />
                            </div>
                            <div className="text-3xl font-bold text-white">$3.42</div>
                            <p className="text-xs text-gray-400 mt-2">Revenue per 1K views</p>
                        </div>

                        <div className="bg-[#282828] p-6 rounded-xl border border-[#3f3f3f] relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-gray-400 text-sm font-medium">Playback-based CPM</h3>
                                <HelpCircle className="w-3 h-3 text-gray-500" />
                            </div>
                            <div className="text-3xl font-bold text-white">$8.15</div>
                            <p className="text-xs text-gray-400 mt-2">Cost for advertisers per 1K views</p>
                        </div>
                    </div>

                    {/* Main Chart */}
                    <div className="bg-[#282828] p-6 rounded-xl border border-[#3f3f3f]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Monthly Revenue</h3>
                            <div className="flex gap-2">
                                <Button variant="secondary" className="text-xs py-1 h-8">Last 28 days</Button>
                            </div>
                        </div>
                        
                        <div className="flex items-end gap-1 h-48 mt-4 px-2">
                            {Array.from({length: 28}).map((_, i) => {
                                const height = Math.floor(Math.random() * 60) + 20;
                                return (
                                <div 
                                    key={i} 
                                    className="flex-1 bg-[#3ea6ff] opacity-80 hover:opacity-100 transition-opacity rounded-t-sm min-w-[4px] relative group cursor-pointer" 
                                    style={{height: `${height}%`}} 
                                >
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1f1f1f] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none border border-[#3f3f3f]">
                                        ${(height * 0.4).toFixed(2)}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                        <div className="border-t border-[#3f3f3f] mt-2 pt-2 flex justify-between text-xs text-gray-500">
                            <span>Aug 1, 2024</span>
                            <span>Aug 15, 2024</span>
                            <span>Aug 29, 2024</span>
                        </div>
                    </div>

                    {/* Breakdown Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Revenue Sources */}
                        <div className="bg-[#282828] p-6 rounded-xl border border-[#3f3f3f]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold">Revenue Sources</h3>
                                <Button variant="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                            </div>
                            
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-300">Skippable Video Ads</span>
                                        <span className="text-sm font-bold">45%</span>
                                    </div>
                                    <div className="w-full bg-[#121212] h-2 rounded-full overflow-hidden">
                                        <div className="bg-[#3ea6ff] h-2 rounded-full" style={{width: '45%'}}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-300">Display Ads</span>
                                        <span className="text-sm font-bold">30%</span>
                                    </div>
                                    <div className="w-full bg-[#121212] h-2 rounded-full overflow-hidden">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '30%'}}></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-300">YouTube Premium</span>
                                        <span className="text-sm font-bold">15%</span>
                                    </div>
                                    <div className="w-full bg-[#121212] h-2 rounded-full overflow-hidden">
                                        <div className="bg-red-500 h-2 rounded-full" style={{width: '15%'}}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-gray-300">Bumper Ads</span>
                                        <span className="text-sm font-bold">10%</span>
                                    </div>
                                    <div className="w-full bg-[#121212] h-2 rounded-full overflow-hidden">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '10%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Earning Videos */}
                        <div className="bg-[#282828] p-6 rounded-xl border border-[#3f3f3f]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold">Top Earning Content</h3>
                                <span className="text-xs text-gray-400">Last 28 days</span>
                            </div>
                            <div className="space-y-4">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="flex gap-3 items-center group cursor-pointer">
                                        <div className="w-16 h-9 bg-black rounded flex-shrink-0 overflow-hidden relative">
                                            <img src={`https://picsum.photos/seed/${i+100}/160/90`} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate group-hover:text-[#3ea6ff] transition-colors">
                                                {i === 1 ? 'Building a YouTube Clone in 10 Mins' : 
                                                 i === 2 ? 'Gemini AI Integration Tutorial' : 
                                                 i === 3 ? 'React 19 Features Explained' : 
                                                 'How to monetize your app'}
                                            </div>
                                            <div className="text-xs text-gray-400">Uploaded Aug {i}</div>
                                        </div>
                                        <div className="text-sm font-bold text-green-400">
                                            +${(Math.random() * 50 + 10).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="secondary" className="w-full mt-6 text-xs">See All</Button>
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
                      {user.subscribers >= 1000 && <div className="flex items-center gap-1 text-green-500 text-xs mt-1"><CheckCircle className="w-3 h-3"/> Requirement met</div>}
                    </div>

                    {/* Watch Hours Requirement */}
                    <div className="mb-8">
                      <div className="flex justify-between text-sm mb-2">
                         <span>Reach 4,000 public watch hours</span>
                         <span className="text-gray-400">{user.watchHours} / 4,000</span>
                      </div>
                       <div className="w-full bg-[#1f1f1f] rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min((user.watchHours / 4000) * 100, 100)}%` }}
                        ></div>
                      </div>
                      {user.watchHours >= 4000 && <div className="flex items-center gap-1 text-green-500 text-xs mt-1"><CheckCircle className="w-3 h-3"/> Requirement met</div>}
                    </div>

                    {/* Action Area */}
                    <div className="pt-6 border-t border-[#3f3f3f] flex flex-col items-center">
                      {appStatus === 'pending' ? (
                         <div className="flex items-center gap-2 text-blue-400">
                           <Loader2 className="w-5 h-5 animate-spin" />
                           <span>Reviewing your channel...</span>
                         </div>
                      ) : (
                         user.subscribers >= 1000 && user.watchHours >= 4000 ? (
                          <Button onClick={handleApplyMonetization} className="w-full py-3 text-base">
                            Apply Now
                          </Button>
                         ) : (
                           <Button disabled className="bg-[#3f3f3f] text-gray-500 cursor-not-allowed w-full py-3 text-base">
                             Email me when eligible
                           </Button>
                         )
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
                        placeholder={
                          activeTab === 'create_video' ? "A cyberpunk city with neon lights..." :
                          activeTab === 'create_thumb' ? "A shocked gamer face with red arrows pointing to..." :
                          "Welcome back to another video! Today we are talking about..."
                        }
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
                           <Button variant="secondary" onClick={() => {
                             // In a real app, this would push to a "Publish" flow
                             alert("Asset saved to library!");
                             setGeneratedContent(null);
                           }}>
                             Save to Library
                           </Button>
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