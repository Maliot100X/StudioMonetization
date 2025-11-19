import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Video, Comment } from "../types";

// Safe Initialization of Gemini Client for Browser Environments
const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env) ? (process.env.API_KEY || '') : '';
  } catch {
    return '';
  }
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

// --- Text Generation ---

export const generateVideoRecommendations = async (query: string = "general"): Promise<Video[]> => {
  if (!apiKey) return getFallbackVideos();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a list of 8 realistic YouTube-style video recommendations based on the theme: "${query}". 
      They should be catchy, viral-style titles. 
      The channel names should sound like real YouTubers.
      The description should be a short sentence.
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              channelName: { type: Type.STRING },
              views: { type: Type.STRING },
              postedAt: { type: Type.STRING },
              duration: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["id", "title", "channelName", "views", "postedAt", "duration", "description", "category"]
          }
        }
      }
    });

    const rawVideos = JSON.parse(response.text || '[]');
    
    const sampleVideos = [
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
    ];

    return rawVideos.map((v: any, index: number) => ({
      ...v,
      id: `gen-${Date.now()}-${index}`,
      thumbnailUrl: `https://picsum.photos/seed/${v.id}${query}/640/360`,
      channelAvatar: `https://picsum.photos/seed/${v.channelName}/100/100`,
      videoUrl: sampleVideos[index % sampleVideos.length],
      channelId: `ch-${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Gemini generation failed", error);
    return getFallbackVideos();
  }
};

export const generateComments = async (videoTitle: string): Promise<Comment[]> => {
  if (!apiKey) return getFallbackComments();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 5 realistic YouTube comments for a video titled "${videoTitle}". 
      Include a mix of funny, supportive, and questioning comments.`,
       config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              author: { type: Type.STRING },
              text: { type: Type.STRING },
              likes: { type: Type.INTEGER },
              timeAgo: { type: Type.STRING },
            },
             required: ["id", "author", "text", "likes", "timeAgo"]
          }
        }
      }
    });
     const rawComments = JSON.parse(response.text || '[]');
     return rawComments.map((c: any, i: number) => ({
         ...c,
         avatar: `https://picsum.photos/seed/${c.author}/50/50`
     }));

  } catch (e) {
      return getFallbackComments();
  }
}

// --- Video Generation (Veo) ---

export const generateVeoVideo = async (prompt: string): Promise<string> => {
  const freshAi = new GoogleGenAI({ apiKey: getApiKey() });
  try {
    let operation = await freshAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p', 
        aspectRatio: '9:16'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await freshAi.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI returned");

    const fetchUrl = `${videoUri}&key=${getApiKey()}`;
    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error("Failed to download generated video");
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Veo generation error:", error);
    throw error;
  }
};

// --- Image Generation (Imagen 3) ---

export const generateThumbnail = async (prompt: string): Promise<string> => {
  const freshAi = new GoogleGenAI({ apiKey: getApiKey() });
  try {
    const response = await freshAi.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt + " , youtube thumbnail, high quality, 4k, catchy",
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) throw new Error("No image generated");
    
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Imagen error:", error);
    throw error;
  }
};

// --- Audio Generation (TTS) ---

export const generateVoiceover = async (text: string): Promise<string> => {
  const freshAi = new GoogleGenAI({ apiKey: getApiKey() });
  try {
    const response = await freshAi.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if(!base64Audio) throw new Error("No audio generated");

    // Convert base64 to blob for playback
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/mp3' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};

// --- Fallbacks ---

const getFallbackVideos = (): Video[] => [
  {
    id: '1',
    title: 'Big Buck Bunny - The Full Movie',
    thumbnailUrl: 'https://picsum.photos/seed/bunny/640/360',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    channelName: 'Blender Foundation',
    channelId: 'blender-foundation',
    channelAvatar: 'https://picsum.photos/seed/blender/100/100',
    views: '12M',
    postedAt: '10 years ago',
    duration: '9:56',
    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
    category: 'Animation'
  },
  {
    id: '2',
    title: 'Elephant Dream - Sci Fi Short',
    thumbnailUrl: 'https://picsum.photos/seed/elephant/640/360',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    channelName: 'Open Movie Project',
    channelId: 'open-movie-project',
    channelAvatar: 'https://picsum.photos/seed/open/100/100',
    views: '8.4M',
    postedAt: '12 years ago',
    duration: '10:53',
    description: 'The world\'s first open movie, made entirely with open source graphics software.',
    category: 'Sci-Fi'
  },
  {
    id: '3',
    title: 'Nature Landscapes 4K',
    thumbnailUrl: 'https://picsum.photos/seed/nature/640/360',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    channelName: 'Earth Views',
    channelId: 'earth-views',
    channelAvatar: 'https://picsum.photos/seed/earth/100/100',
    views: '2M',
    postedAt: '1 year ago',
    duration: '3:15',
    description: 'Relaxing nature views.',
    category: 'Nature'
  }
];

const getFallbackComments = (): Comment[] => [
    { id: '1', author: 'User123', text: 'First!', likes: 12, timeAgo: '1 hour ago', avatar: 'https://picsum.photos/50' },
    { id: '2', author: 'CoolDev', text: 'Great video, loved the editing.', likes: 89, timeAgo: '2 hours ago', avatar: 'https://picsum.photos/51' },
];