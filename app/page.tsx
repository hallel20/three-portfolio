"use client";

import { useEffect } from "react";
import { Navigation3D } from "@/components/layout/Navigation3D";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { usePortfolioStore } from "@/lib/store";
import dynamic from "next/dynamic";

// Dynamically import the Scene component with no SSR
const Scene = dynamic(
  () => import("../components/3d/Scene"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-6"></div>
          <div className="text-blue-400 text-xl font-medium">
            Loading 3D Portfolio...
          </div>
          <div className="text-gray-400 text-sm mt-2">
            Preparing immersive experience
          </div>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const { selectedProject, setSelectedProject, setProjects, setIsLoading } =
    usePortfolioStore();

  useEffect(() => {
    // Load portfolio data
    const loadData = async () => {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const projects = await response.json();
        setProjects(projects);
      } catch (error) {
        console.error("Failed to load projects:", error);
        // Set some default/mock data if API fails
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setProjects, setIsLoading]);

  return (
    <main className="w-full h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden relative">
      {/* 3D Scene */}
      <Scene className="absolute inset-0" />

      {/* UI Overlays */}
      <Navigation3D />

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Welcome Text Overlay */}
      <div className="absolute bottom-8 left-8 text-white/80 max-w-md z-10">
        <p className="text-sm backdrop-blur-sm bg-black/20 p-3 rounded-lg border border-white/10">
          Navigate the 3D space to explore projects. Click on objects for
          details. Use mouse/touch to orbit, zoom, and pan.
        </p>
      </div>

      {/* Performance indicator */}
      <div className="absolute top-4 right-4 text-xs text-white/60 z-10">
        <div className="backdrop-blur-sm bg-black/20 px-2 py-1 rounded border border-white/10">
          3D Portfolio • Interactive Mode
        </div>
      </div>
    </main>
  );
}
