'use client';
import { create } from 'zustand';
import { Project } from './types';

interface PortfolioStore {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  filter: string;
  cameraTarget: [number, number, number];
  
  setProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
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
  
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  setTheme: (theme) => set({ theme }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  togglePerformanceMode: () => set((state) => ({ performanceMode: !state.performanceMode })),
}));