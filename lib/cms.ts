"use server";
import { promises as fs } from 'fs';
import path from 'path';
import { PortfolioData, Project } from './types';

const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');

export async function getPortfolioData(): Promise<PortfolioData> {
  try {
    const fileContents = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading portfolio data:', error);
    throw new Error('Failed to load portfolio data');
  }
}

export async function savePortfolioData(data: PortfolioData): Promise<void> {
  try {
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving portfolio data:', error);
    throw new Error('Failed to save portfolio data');
  }
}

export async function getProjects(): Promise<Project[]> {
  const data = await getPortfolioData();
  return data.projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find(p => p.id === id) || null;
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
  const data = await getPortfolioData();
  const newProject: Project = {
    ...project,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  
  data.projects.push(newProject);
  await savePortfolioData(data);
  return newProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const data = await getPortfolioData();
  const projectIndex = data.projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    return null;
  }
  
  data.projects[projectIndex] = { ...data.projects[projectIndex], ...updates };
  await savePortfolioData(data);
  return data.projects[projectIndex];
}

export async function deleteProject(id: string): Promise<boolean> {
  const data = await getPortfolioData();
  const projectIndex = data.projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    return false;
  }
  
  data.projects.splice(projectIndex, 1);
  await savePortfolioData(data);
  return true;
}

function generateId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}