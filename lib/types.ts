export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  category: 'web-development' | 'mobile-app' | 'backend-api' | 'open-source';
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  position: { x: number; y: number; z: number };
  color: string;
  createdAt: string;
}

export interface Skill {
  name: string;
  level: number;
  color: string;
}

export interface About {
  bio: string;
  skills: Skill[];
  experience: string;
}

export interface Settings {
  name: string;
  title: string;
  email: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface PortfolioData {
  projects: Project[];
  about: About;
  settings: Settings;
}