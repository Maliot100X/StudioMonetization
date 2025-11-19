export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  channelName: string;
  channelAvatar: string;
  views: string;
  postedAt: string;
  duration: string;
  description: string;
  category: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  likes: number;
  timeAgo: string;
  avatar: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  subscribers: number;
  watchHours: number;
  isMonetized: boolean;
  estimatedRevenue: number;
}

export enum ViewState {
  HOME = 'HOME',
  WATCH = 'WATCH',
  SEARCH = 'SEARCH',
  STUDIO = 'STUDIO'
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}