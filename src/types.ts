export interface Program {
  id: string;
  time: string;
  title: string;
  host: string;
  description: string;
  imageUrl: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string; // Will map to Lucide icons in component
}
