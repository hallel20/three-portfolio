'use client';
import { create } from 'zustand';
import { Project } from './types';

interface PortfolioStore {
  projects: Project[];
  selectedProject: Project | null;
  selectedCategory: string;
  isLoading: boolean;
  filter: string;
  cameraTarget: [number, number, number];
  
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setSelectedCategory: (category: string) => void;
  setIsLoading: (loading: boolean) => void;
  setFilter: (filter: string) => void;
  setCameraTarget: (target: [number, number, number]) => void;
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  projects: [],
  selectedProject: null,
  isLoading: true,
  filter: 'all',
  cameraTarget: [0, 0, 0],
  selectedCategory: 'all',


  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setFilter: (filter) => set({ filter }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
}));

interface UIStore {
  isMenuOpen: boolean;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  performanceMode: boolean;
  aboutOpen: boolean;
  contactOpen: boolean;
  projectsOpen: boolean;
  
  setProjectsOpen: (isOpen: boolean) => void;
  setAboutOpen: (isOpen: boolean) => void;
  setContactOpen: (isOpen: boolean) => void;
  
  toggleMenu: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSound: () => void;
  togglePerformanceMode: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMenuOpen: false,
  theme: 'dark',
  soundEnabled: false,
  performanceMode: false,
  aboutOpen: false,
  contactOpen: false,
  projectsOpen: false,
  setAboutOpen: (isOpen) => set({ aboutOpen: isOpen }),
  setContactOpen: (isOpen) => set({ contactOpen: isOpen }),
  setProjectsOpen: (isOpen) => set({ projectsOpen: isOpen }),
  
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  setTheme: (theme) => set({ theme }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  togglePerformanceMode: () => set((state) => ({ performanceMode: !state.performanceMode })),
}));