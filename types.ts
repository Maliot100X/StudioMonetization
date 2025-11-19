export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  channelName: string;
  channelId: string; // Link to a channel
  channelAvatar: string;
  views: string;
  postedAt: string;
  duration: string;
  description: string;
  category: string;
  isLocal?: boolean; // To track if it was uploaded by the user
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
  handle: string;
  email: string;
  avatar: string;
  banner: string;
  subscribers: number;
  watchHours: number;
  isMonetized: boolean;
  estimatedRevenue: number;
  joinedDate: string;
}

export enum ViewState {
  HOME = 'HOME',
  WATCH = 'WATCH',
  SEARCH = 'SEARCH',
  STUDIO = 'STUDIO',
  CHANNEL = 'CHANNEL'
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